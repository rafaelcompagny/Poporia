# Poporia V2.1

## Nouveautés principales
- Réactions en chaîne : une bombe ou une fusée active tout Pop spécial touché.
- Si une explosion touche un prisme, le prisme supprime la couleur normale la plus présente sur la grille.
- Prisme + bombe/fusée : jusqu'à 15 Pops normaux sont transformés en ce boost, sans remplacer les Pops déjà spéciaux, puis tous sont activés.
- Chutes animées case par case.
- Particules renforcées.
- Niveaux spéciaux 5, 15 et 25.
- Boss aux niveaux 10, 20 et 30.
- Récompense unique à la fin de chaque monde.
- Classements Firebase : meilleur score total, plus riche, niveau le plus élevé.
- Les comptes ayant `role: "admin"` sont exclus des classements.

## Firebase
1. Active Authentication > Email/Password.
2. Active Cloud Firestore.
3. Remplace les règles Firestore par le contenu du fichier `firestore.rules`.
4. Publie les règles.
5. Déconnecte-toi/reconnecte-toi dans Poporia.

Une collection publique `leaderboard` est créée automatiquement au fil des connexions.
Elle ne contient que les données nécessaires au classement : pseudo, score total, pièces, niveau, rôle et date de mise à jour.

## Admin
Pour le premier compte admin :
- Firestore > `users` > document de ton utilisateur
- mets `role` à `admin`
- reconnecte-toi

Les comptes admin restent visibles dans le dashboard admin mais sont filtrés du classement public.
