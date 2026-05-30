# Déploiement frontend sur Render

Voir le guide complet de l’API : [../k-voice-backend/DEPLOY_RENDER.md](../k-voice-backend/DEPLOY_RENDER.md)

## Service Web Node

- **Root directory** : ce dossier (`ecclesiato`)
- **Build** : `npm ci && npm run build:render`
- **Start** : `npm run start:render`

## Variables obligatoires

| Variable | Exemple |
|----------|---------|
| `NEXT_PUBLIC_API_URL` | `https://kvoice-api.onrender.com` |
| `NEXTAUTH_URL` | `https://ecclesiato.onrender.com` |
| `NEXTAUTH_SECRET` | chaîne aléatoire longue |
| `NEXT_PUBLIC_PAYPAL_CLIENT_ID` | Client ID PayPal (sandbox ou live) |

Ou utiliser `render.yaml` (Blueprint) dans ce dossier.

**PayPal** : le secret reste uniquement sur l’API (`PAYPAL_CLIENT_SECRET`). Après paiement, le bouton appelle `/api/billing/activate` qui valide l’abonnement côté backend.

**Note** : les dépendances sont dans `package.json`, pas dans `requirements.txt` (réservé au backend Python).
