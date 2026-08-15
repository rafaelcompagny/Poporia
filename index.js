const { onCall, onRequest, HttpsError } = require("firebase-functions/v2/https");
const { defineSecret, defineString } = require("firebase-functions/params");
const admin = require("firebase-admin");
const Stripe = require("stripe");

admin.initializeApp();

const db = admin.firestore();
const FieldValue = admin.firestore.FieldValue;

const STRIPE_SECRET_KEY = defineSecret("STRIPE_SECRET_KEY");
const STRIPE_WEBHOOK_SECRET = defineSecret("STRIPE_WEBHOOK_SECRET");
const POPORIA_APP_URL = defineString("POPORIA_APP_URL", {
  default: "http://127.0.0.1:5500",
  description: "URL publique de Poporia, sans slash final.",
});

const REGION = "europe-west1";

const PRODUCTS = {
  coins_1000: {
    name: "Poporia — 1 000 pièces",
    description: "Pack de 1 000 pièces Poporia",
    priceId: "price_1U4pZ808REn5UJ3ZkORexy1s",
    amount: 99,
    grant: { coins: 1000 },
  },
  coins_5500: {
    name: "Poporia — 5 500 pièces",
    description: "Pack de 5 500 pièces Poporia",
    priceId: "price_1U4pb608REn5UJ3ZNzpmyPzp",
    amount: 499,
    grant: { coins: 5500 },
  },
  coins_12000: {
    name: "Poporia — 12 000 pièces",
    description: "Pack de 12 000 pièces Poporia",
    priceId: "price_1U4pfg08REn5UJ3ZiSCKMhTf",
    amount: 999,
    grant: { coins: 12000 },
  },
  season_premium: {
    name: "Poporia — Pass Premium Saison 1",
    description: "Débloque la voie Premium du Pass de Saison 1",
    priceId: "price_1U4pg108REn5UJ3ZNSwz7rP0",
    amount: 499,
    grant: { seasonPremium: true },
  },
  skin_cyber: {
    name: "Poporia — Skin Cyber Nexora",
    description: "Skin premium Cyber Nexora",
    priceId: "price_1U4pgL08REn5UJ3ZpsR2iX9a",
    amount: 199,
    grant: { skin: "cyber" },
  },
  skin_crystal: {
    name: "Poporia — Skin Crystal",
    description: "Skin premium Crystal",
    priceId: "price_1U4pgg08REn5UJ3ZO7rjeiM2",
    amount: 299,
    grant: { skin: "crystal" },
  },
  skin_founder: {
    name: "Poporia — Skin Founder",
    description: "Skin premium Founder",
    priceId: "price_1U4pgx08REn5UJ3ZFp2fNjez",
    amount: 499,
    grant: { skin: "founder" },
  },
};

function cleanAppUrl() {
  return POPORIA_APP_URL.value().replace(/\/+$/, "");
}

exports.createStripeCheckout = onCall(
  { region: REGION, secrets: [STRIPE_SECRET_KEY] },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Connecte-toi avant d'acheter.");
    }

    const productId = String(request.data?.productId || "");
    const product = PRODUCTS[productId];
    if (!product) {
      throw new HttpsError("invalid-argument", "Produit Stripe inconnu.");
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const appUrl = cleanAppUrl();

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      client_reference_id: request.auth.uid,
      customer_email: request.auth.token.email || undefined,
      locale: "fr",
      allow_promotion_codes: true,
      line_items: [
        {
          price: product.priceId,
          quantity: 1,
        },
      ],
      metadata: {
        firebaseUid: request.auth.uid,
        productId,
      },
      payment_intent_data: {
        metadata: {
          firebaseUid: request.auth.uid,
          productId,
        },
      },
      success_url: `${appUrl}?stripe=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}?stripe=cancel`,
    });

    return { url: session.url };
  }
);

exports.getStripePurchaseStatus = onCall(
  { region: REGION },
  async (request) => {
    if (!request.auth) {
      throw new HttpsError("unauthenticated", "Connexion requise.");
    }
    const sessionId = String(request.data?.sessionId || "");
    if (!sessionId.startsWith("cs_")) {
      throw new HttpsError("invalid-argument", "Session Stripe invalide.");
    }

    const snap = await db.collection("stripePurchases").doc(sessionId).get();
    if (!snap.exists) return { fulfilled: false };

    const data = snap.data();
    if (data.uid !== request.auth.uid) {
      throw new HttpsError("permission-denied", "Cette commande ne t'appartient pas.");
    }

    return {
      fulfilled: data.status === "fulfilled",
      productId: data.productId,
      amountTotal: data.amountTotal || 0,
      currency: data.currency || "eur",
    };
  }
);

async function fulfillCheckoutSession(session) {
  if (!session || session.payment_status !== "paid") return;

  const uid = session.metadata?.firebaseUid || session.client_reference_id;
  const productId = session.metadata?.productId;
  const product = PRODUCTS[productId];

  if (!uid || !product) {
    console.error("Checkout metadata missing", { sessionId: session?.id, uid, productId });
    return;
  }

  if (Number(session.amount_total) !== product.amount) {
    throw new Error(`Unexpected Stripe amount for ${productId}: ${session.amount_total}`);
  }

  const receiptRef = db.collection("stripePurchases").doc(session.id);
  const userRef = db.collection("users").doc(uid);

  await db.runTransaction(async (tx) => {
    const [receiptSnap, userSnap] = await Promise.all([
      tx.get(receiptRef),
      tx.get(userRef),
    ]);

    if (receiptSnap.exists) return;
    if (!userSnap.exists) throw new Error(`Poporia user ${uid} not found`);

    const user = userSnap.data();
    const update = { updatedAt: FieldValue.serverTimestamp() };

    if (product.grant.coins) {
      update.coins = Number(user.coins || 0) + product.grant.coins;
    }

    if (product.grant.seasonPremium) {
      update["seasonPass.premium"] = true;
    }

    if (product.grant.skin) {
      const owned = new Set(user.skins?.owned || ["classic"]);
      owned.add(product.grant.skin);
      update["skins.owned"] = [...owned];
      update["skins.active"] = product.grant.skin;
    }

    const notifications = Array.isArray(user.notifications)
      ? [...user.notifications]
      : [];

    notifications.unshift({
      id: `stripe_${session.id}`,
      title: "Achat Stripe validé",
      text: `${product.name} a été ajouté à ton compte.`,
      icon: "💳",
      date: Date.now(),
      read: false,
    });
    update.notifications = notifications.slice(0, 40);

    tx.update(userRef, update);
    tx.create(receiptRef, {
      uid,
      productId,
      amountTotal: session.amount_total,
      currency: session.currency || "eur",
      stripePaymentIntent: session.payment_intent || null,
      status: "fulfilled",
      createdAt: FieldValue.serverTimestamp(),
    });
  });
}

exports.stripeWebhook = onRequest(
  {
    region: REGION,
    secrets: [STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET],
  },
  async (req, res) => {
    if (req.method !== "POST") {
      res.status(405).send("Method Not Allowed");
      return;
    }

    const stripe = new Stripe(STRIPE_SECRET_KEY.value());
    const signature = req.headers["stripe-signature"];

    let event;
    try {
      event = stripe.webhooks.constructEvent(
        req.rawBody,
        signature,
        STRIPE_WEBHOOK_SECRET.value()
      );
    } catch (err) {
      console.error("Stripe webhook signature verification failed:", err.message);
      res.status(400).send("Invalid Stripe signature");
      return;
    }

    try {
      if (event.type === "checkout.session.completed") {
        await fulfillCheckoutSession(event.data.object);
      }

      if (event.type === "checkout.session.async_payment_succeeded") {
        await fulfillCheckoutSession(event.data.object);
      }

      res.json({ received: true });
    } catch (err) {
      console.error("Stripe fulfillment failed:", err);
      res.status(500).send("Fulfillment failed");
    }
  }
);
