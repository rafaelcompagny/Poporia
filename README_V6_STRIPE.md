# Poporia V6 — Boutique Stripe

Poporia V6 remplace les faux achats d'argent réel par une intégration **Stripe Checkout** avec un backend **Firebase Cloud Functions**.

## Ce qui est achetable avec Stripe

| Produit | Prix |
|---|---:|
| 1 000 pièces | 0,99 € |
| 5 500 pièces | 4,99 € |
| 12 000 pièces | 9,99 € |
| Pass Premium Saison 1 | 4,99 € |
| Skin Cyber Nexora | 1,99 € |
| Skin Crystal | 2,99 € |
| Skin Founder | 4,99 € |

Les **Price IDs Stripe** sont définis côté serveur dans `functions/index.js`. Le navigateur n'envoie qu'un identifiant de produit. Checkout utilise donc directement les produits/tarifs créés dans ton Dashboard Stripe.

## Architecture de sécurité

1. Le joueur doit être connecté avec Firebase Authentication.
2. `app.js` appelle la Cloud Function `createStripeCheckout`.
3. La Cloud Function crée une session Stripe Checkout.
4. Le joueur paie sur la page hébergée par Stripe.
5. Stripe appelle `stripeWebhook`.
6. Le webhook vérifie la signature Stripe.
7. Le serveur ajoute les pièces / Pass / skin dans Firestore.
8. Un document `stripePurchases/{checkout_session_id}` empêche qu'une même commande soit attribuée deux fois.
9. Au retour dans Poporia, `getStripePurchaseStatus` attend la confirmation du webhook puis recharge la progression.

**Aucune clé secrète Stripe ne doit être placée dans `app.js`, `index.html` ou Firebase Hosting.**

## Prérequis

- Un compte Stripe.
- Firebase Authentication + Firestore déjà configurés.
- Le projet Firebase `poporia-2db62`.
- Node.js 20.
- Firebase CLI.
- Pour déployer Cloud Functions, le projet Firebase doit utiliser le plan Blaze.
- Commence en **mode test Stripe** avec une clé `sk_test_...`.

## 1. Installer les dépendances

Depuis le dossier Poporia V6 :

```bash
cd functions
npm install
cd ..
```

Si Firebase CLI n'est pas installé :

```bash
npm install -g firebase-tools
firebase login
firebase use poporia-2db62
```

## 2. Définir l'URL de retour de Poporia

Pour Live Server en local, crée :

`functions/.env.poporia-2db62`

avec :

```env
POPORIA_APP_URL=http://127.0.0.1:5500
```

Quand Poporia sera hébergé, remplace cette valeur par l'URL publique, par exemple :

```env
POPORIA_APP_URL=https://ton-domaine.fr
```

## 3. Ajouter la clé secrète Stripe

Dans Stripe, active d'abord le mode test et récupère la clé secrète.

Puis :

```bash
firebase functions:secrets:set STRIPE_SECRET_KEY
```

Entre la valeur `sk_test_...` quand Firebase la demande.

Ne publie jamais cette clé.

## 4. Premier déploiement

Le webhook a besoin qu'un secret existe avant le déploiement. Pour le tout premier déploiement, crée temporairement le secret :

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Tu peux mettre temporairement une valeur comme :

```text
whsec_a_remplacer
```

Puis :

```bash
firebase deploy --only functions
```

Le CLI affichera les fonctions déployées.

## 5. Créer le webhook Stripe

Dans Stripe Workbench > Webhooks :

1. Crée un nouvel endpoint HTTPS.
2. Utilise l'URL de la fonction `stripeWebhook` affichée après le déploiement Firebase.
3. Abonne l'endpoint à :
   - `checkout.session.completed`
   - `checkout.session.async_payment_succeeded`
4. Révèle le **Signing secret**, qui commence par `whsec_`.

Remplace ensuite le secret temporaire :

```bash
firebase functions:secrets:set STRIPE_WEBHOOK_SECRET
```

Entre le vrai `whsec_...`, puis redéploie le webhook :

```bash
firebase deploy --only functions:stripeWebhook
```

## 6. Publier les règles Firestore V6

Dans Firebase Console :

`Firestore Database > Rules`

Copie le contenu de `firestore.rules`, puis **Publier**.

La collection `stripePurchases` est en écriture serveur uniquement. Les joueurs peuvent uniquement lire leurs propres reçus, tandis que les admins peuvent les consulter.

## 7. Tester Stripe

Lance Poporia avec Live Server, connecte-toi avec un compte Firebase, puis ouvre la boutique.

Avec Stripe en mode test, utilise une carte de test Stripe depuis leur documentation. Ne passe en mode live qu'après avoir vérifié :

- création de session Checkout ;
- redirection vers Stripe ;
- retour dans Poporia ;
- réception du webhook ;
- ajout des pièces / Pass / skins ;
- impossibilité d'obtenir deux fois la même commande.

## Passage en production

Pour passer en réel :

1. Termine la configuration et la vérification du compte Stripe.
2. Configure les informations publiques de **Nexora Interactive** dans Stripe.
3. Remplace `STRIPE_SECRET_KEY` par la clé live `sk_live_...`.
4. Crée un webhook en mode live et remplace `STRIPE_WEBHOOK_SECRET` par son secret live.
5. Mets `POPORIA_APP_URL` sur l'URL HTTPS publique.
6. Redéploie les fonctions.
7. Effectue un petit achat réel de vérification.

Les secrets de test et de production ainsi que les secrets webhook sont différents.

## Fichiers V6

- `app.js` : interface Stripe côté joueur.
- `functions/index.js` : création Checkout + webhook + attribution.
- `functions/package.json` : dépendances serveur.
- `firebase.json` : configuration Cloud Functions.
- `.firebaserc` : projet Firebase.
- `firestore.rules` : règles incluant les reçus Stripe.
- `functions/.env.example` : exemple d'URL de retour.

## Important

Le webhook est la source de vérité pour les biens numériques. Le fait que le navigateur revienne sur `?stripe=success` ne donne **jamais** directement les pièces ou les skins.

La V6 garde toutes les fonctions de la V5 : 80 niveaux, mode infini, amis, clans, classements, Pass, succès, skins, coffres, événements, notifications, admin et crédits Nexora Interactive.


## ⚠️ Avant une vraie commercialisation publique

Le flux Stripe de la V6 est serveur : une redirection réussie dans le navigateur ne suffit jamais à attribuer un achat.

Cependant, **l'économie historique de Poporia reste en grande partie pilotée côté navigateur** :
les niveaux, récompenses gratuites, boosters et dépenses de pièces existaient avant Stripe et sont encore sauvegardés par `app.js`.

Cela signifie qu'avant de vendre publiquement des packs de pièces à de vrais clients, une étape de sécurisation supplémentaire est recommandée :

- déplacer les gains et dépenses de monnaie vers des Cloud Functions ;
- empêcher les clients de modifier eux-mêmes les champs économiques dans les règles Firestore ;
- conserver un ledger serveur des mouvements de pièces ;
- faire valider les récompenses de niveau côté serveur ;
- réserver les droits Premium à des champs que seul le backend peut modifier.

**La V6 fournit donc un vrai flux Stripe Checkout + webhook, mais le jeu complet doit encore être durci côté serveur avant une commercialisation publique sérieuse.**


## V6.1 — Price IDs Stripe configurés

Cette archive contient déjà les 7 Price IDs Stripe fournis pour Poporia.

Tu n'as donc **plus besoin de créer les prix via `price_data`** : la session Checkout utilise directement :

```js
line_items: [{
  price: product.priceId,
  quantity: 1
}]
```

Si tu modifies un tarif dans Stripe en créant un nouveau Price, pense à remplacer le `priceId` correspondant dans `functions/index.js`.
