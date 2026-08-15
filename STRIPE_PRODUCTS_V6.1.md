# Produits Stripe Poporia V6.1

| Produit Poporia | Stripe Price ID |
|---|---|
| 1 000 pièces | `price_1U4pZ808REn5UJ3ZkORexy1s` |
| 5 500 pièces | `price_1U4pb608REn5UJ3ZNzpmyPzp` |
| 12 000 pièces | `price_1U4pfg08REn5UJ3ZiSCKMhTf` |
| Pass Premium Saison 1 | `price_1U4pg108REn5UJ3ZNSwz7rP0` |
| Skin Cyber Nexora | `price_1U4pgL08REn5UJ3ZpsR2iX9a` |
| Skin Crystal | `price_1U4pgg08REn5UJ3ZO7rjeiM2` |
| Skin Founder | `price_1U4pgx08REn5UJ3ZFp2fNjez` |

La Cloud Function `createStripeCheckout` utilise maintenant directement ces Price IDs.
Les montants attendus sont toujours vérifiés côté webhook avant l'attribution de la récompense.
