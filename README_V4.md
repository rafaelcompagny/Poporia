# Poporia V4

## Nouveautés

### 🛡️ Clans
- Créer un clan avec nom, description et code.
- Rejoindre un clan avec son code.
- Rôles : chef, officier, membre.
- Le chef peut promouvoir/rétrograder et exclure.
- Score du clan basé sur les scores totaux des membres.
- Le profil conserve `clanId` et `clanRole`.

> La V4 utilise une règle Firestore de clan volontairement simple pour le prototype.
> Avant une publication publique, les promotions/exclusions devraient passer par Cloud Functions.

### ✅ Missions quotidiennes
Trois missions sont générées chaque jour :
- gagner 3 niveaux ;
- créer 6 Pops spéciaux ;
- cumuler 30 000 points.

Chaque mission donne des pièces et se remet à zéro au changement de journée.

### 🎉 Événements temporaires
- Page dédiée aux événements actifs.
- Un événement peut offrir des pièces supplémentaires à chaque victoire.
- Si aucun événement Firebase n'existe, un événement Poporia par défaut est affiché.
- L'admin peut créer, dater, activer et désactiver les événements.

### 👑 Administration V4
Le dashboard admin permet maintenant :
- gestion des joueurs ;
- modification pièces / niveau / vies / rôle ;
- don de boosters au joueur sélectionné ;
- création de codes promos Firebase ;
- création et activation/désactivation d'événements.

### 🎟️ Codes promos Firebase
Les codes historiques V1 / POPORIA / ROCKET restent disponibles.
Les nouveaux codes créés par l'admin sont stockés dans `promoCodes/{CODE}`.

## Installation Firebase V4
1. Ouvre Firebase Console.
2. Firestore Database > Rules.
3. Remplace les règles par `firestore.rules`.
4. Publie.
5. Recharge Poporia avec Ctrl + F5.

Collections V4 :
- `users`
- `leaderboard`
- `clans`
- `events`
- `promoCodes`

## Notes
Les clans de cette V4 sont une première version fonctionnelle destinée au prototype.
Le chat de clan, guerres de clans, invitations et défis hebdomadaires pourront arriver ensuite.
