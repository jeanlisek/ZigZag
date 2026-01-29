# ⚠️ Problème avec l'Export Statique Next.js

## Le Problème

Next.js avec `output: 'export'` **ne supporte pas les routes dynamiques** (`[game_id]`, `[room_code]`) à moins que toutes les routes possibles soient générées à l'avance via `generateStaticParams()`.

Mais dans votre cas :
- Les `game_id` et `room_code` sont générés dynamiquement
- On ne peut pas pré-générer toutes les routes possibles
- `generateStaticParams()` ne peut pas être dans un composant client (`'use client'`)

## ✅ Solutions Alternatives

### Solution 1 : Utiliser Vercel (Recommandé)

Vercel supporte parfaitement Next.js avec routes dynamiques :
- ✅ Gratuit
- ✅ Déploiement en 5 minutes
- ✅ Support complet des routes dynamiques
- ✅ HTTPS inclus

**Voir** : `docs/HOSTINGER_DEPLOYMENT.md`

### Solution 2 : VPS Hostinger avec Node.js

Si vous avez un VPS Hostinger :
- ✅ Support complet Next.js
- ⚠️ Plus cher (~5-10€/mois)
- ⚠️ Configuration plus complexe

**Voir** : `docs/HOSTINGER_FULL_DEPLOYMENT.md` (Option 2)

### Solution 3 : Refactoriser pour Export Statique

Pour que l'export statique fonctionne, il faudrait :
1. Créer une seule page qui gère tout le routing côté client
2. Utiliser des query params au lieu de routes dynamiques
3. Ou utiliser un hash router

**Complexité** : ⚠️ Refactorisation importante nécessaire

---

## 🎯 Recommandation

**Utilisez Vercel** pour l'application Next.js. C'est la solution la plus simple et la plus adaptée à votre cas.

Vous gardez :
- Hostinger → Fichiers statiques (marketing, connexion)
- Vercel → Application Next.js (jeu multijoueur)

**Guide complet** : `docs/HOSTINGER_DEPLOYMENT.md`









