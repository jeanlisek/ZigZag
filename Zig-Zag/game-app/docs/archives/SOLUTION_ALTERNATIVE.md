# ⚠️ Solution Alternative : Déploiement sans Export Statique

## Problème

Next.js exige `generateStaticParams()` pour les routes dynamiques lors de l'export statique, mais cette fonction ne peut pas être utilisée avec `'use client'`. Refactoriser toutes les routes dynamiques serait trop complexe.

## Solution Alternative : Déployer sur Vercel

Au lieu d'utiliser l'export statique sur Hostinger, déployez l'application Next.js sur **Vercel** (gratuit) et reliez-la à votre site Hostinger.

### Avantages
- ✅ Pas besoin de refactoriser le code
- ✅ Support complet Next.js (SSR, routes dynamiques, etc.)
- ✅ Déploiement automatique
- ✅ Gratuit pour les projets personnels

### Étapes

1. **Créer un compte Vercel** : https://vercel.com
2. **Installer Vercel CLI** :
   ```bash
   npm install -g vercel
   ```
3. **Déployer** :
   ```bash
   cd Zig-Zag/game-app
   vercel
   ```
4. **Configurer les variables d'environnement** dans Vercel :
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
5. **Mettre à jour `jouer.html`** pour rediriger vers Vercel :
   ```javascript
   const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:3000/jeu'
       : 'https://votre-app.vercel.app/jeu';
   ```

## Guide Complet

Voir `docs/HOSTINGER_DEPLOYMENT.md` pour le guide complet.


