# Poporia V5 — Social & Live Game

## Campagne
- 80 niveaux.
- Monde 7 : 🌌 Neon Galaxy (61–70).
- Monde 8 : 🏰 Royal Peaks (71–80).
- Boss aux niveaux 70 et 80, niveaux spéciaux 65 et 75.

## ♾️ Mode Infini
- 30 coups.
- Aucun objectif fixe.
- Le but est de faire le meilleur score possible.
- Record personnel sauvegardé dans `infiniteBest`.
- Récompense en coffre à la fin.
- XP de saison selon le score.

## 🥇 Classement saisonnier
Collection Firebase `seasonLeaderboard`.
Classement selon l'XP de la Saison 1.
Les comptes admin sont exclus grâce aux règles Firestore.

## 👤 Profil social & amis
Chaque compte possède un code ami.
La collection `socialProfiles` expose uniquement les informations sociales :
pseudo, bio, avatar, niveau, étoiles, score, clan et code ami.
Les amis sont enregistrés dans `social.friends`.

## 🏅 Succès
8 succès sont inclus dans la V5, avec récompenses en pièces :
première victoire, victoires, étoiles, richesse, niveaux, Mode Infini et amis.

## 🎁 Coffres
Trois raretés :
- Commun
- Rare
- Épique

Les récompenses varient en pièces et boosters.
Les anciens coffres génériques sont automatiquement migrés en coffres communs.

## 🛍️ Boutique tournante
4 offres sont sélectionnées chaque jour à partir d'une rotation déterministe.
Les offres incluent boosters, vies et coffre rare.

## 🎨 Skins de Pops
- Classique
- Néon
- Galaxie
- Royal
- Or

Les skins sont achetés avec les pièces du jeu dans la V5.
Aucun vrai paiement n'est effectué.

## 🔔 Notifications internes
Notifications pour succès, nouveaux skins et futures annonces.
Centre de notifications avec compteur d'éléments non lus.

## 👑 Statistiques globales Admin
Le dashboard affiche notamment :
- joueurs ;
- admins ;
- pièces totales ;
- victoires ;
- clans ;
- événements ;
- niveau maximum ;
- joueurs classés.

## Firebase
Publie le nouveau `firestore.rules`.
Nouvelles collections :
- `socialProfiles`
- `seasonLeaderboard`

Les collections des versions précédentes restent utilisées.

## V6
La V6 prévue sera consacrée à une vraie boutique Stripe.
Les boutons d'achat d'argent réel restent simulés dans la V5.
