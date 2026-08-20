# Poporia V6.5 — Responsive UI Rework

Cette version reprend exactement le projet publié V6/Stripe fourni par le projet et retravaille l'interface sans modifier les données de progression, Firebase ou Stripe.

## Accueil
- Nouvelle hiérarchie visuelle centrée sur le bouton JOUER.
- Statistiques regroupées dans la carte principale.
- Raccourcis horizontaux sur téléphone au lieu d'une grille interminable.
- Navigation mobile fixe : Accueil, Niveaux, Boutique, Social, Profil.
- Menu « Tout Poporia » pour Amis, Clan, Classements, Succès, Skins et Saison.
- Header beaucoup plus compact sur téléphone.

## Écran de jeu
- Conçu pour tenir dans un seul écran de téléphone.
- Header, objectif, score et coups fortement compactés.
- Grille dimensionnée selon la largeur ET la hauteur disponible.
- Les conseils « Pops spéciaux » disparaissent sur téléphone pour donner la priorité au gameplay.
- Les 6 boosters sont rangés dans un tiroir « Boosters » accessible en bas.
- Adaptation supplémentaire aux téléphones très petits / très courts.
- Mode paysage dédié.

## Desktop
- Grande grille centrée.
- Objectifs à gauche, aide à droite.
- Raccourcis secondaires propres sur l'accueil.
- Les fonctionnalités existantes restent accessibles.

## Modales
- Style plus cohérent.
- Sur mobile, elles se comportent davantage comme des bottom sheets afin d'éviter les débordements.

## Important
Aucun changement dans :
- Firebase Authentication
- Firestore
- Stripe Checkout / webhooks
- sauvegardes des joueurs
- progression
- 80 niveaux
- clans, amis, Pass, coffres, succès, admin, etc.

Le ZIP exclut volontairement `.git/` et `node_modules/`.
Après extraction, lance `npm install` dans `functions/` uniquement si tu as besoin de redéployer les Cloud Functions.
