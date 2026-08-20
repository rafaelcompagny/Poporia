# Poporia V3.1

## Niveau 0 — Tutoriel interactif
Accessible depuis l'accueil via **Niveau Tutoriel**.
Le joueur apprend directement sur une vraie grille :
1. Match-3
2. chute des Pops
3. fusée
4. bombe 2×2
5. prisme
6. combinaisons
7. fin du tutoriel

Le tutoriel ne consomme pas de vie et peut être rejoué.

## Campagne
- 40 niveaux
- Monde 4 : Poporia Beach
- Boss : niveaux 10, 20, 30 et 40
- Niveaux spéciaux : 5, 15, 25 et 35

### Nouveaux objectifs
- Détruire toutes les caisses
- Créer un nombre donné de Pops spéciaux

### Nouveaux obstacles
- Chaînes ⛓️ : disparaissent lorsqu'une case est touchée par un match/effet.
- Gelée 🫧 : doit être nettoyée en faisant disparaître le Pop de sa case.
- Les anciens obstacles (glace, caisses) restent disponibles.

## Profil joueur
Le profil contient désormais :
- photo/avatar importé depuis l'appareil (redimensionné en 160×160)
- pseudo modifiable
- bio courte
- pièces
- étoiles
- niveau
- score total
- victoires
- futur champ `clanId` (inactif pour l'instant)

Le profil est sauvegardé avec le document utilisateur Firestore.

## Firebase
Conserve les règles `firestore.rules` de la version précédente. Les nouveaux champs de profil sont enregistrés dans le document `users/{uid}`.
