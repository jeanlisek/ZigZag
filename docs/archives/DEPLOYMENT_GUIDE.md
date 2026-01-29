# 🚀 Guide de Déploiement - Zigzag

## 🔍 Pourquoi la version locale est différente de la production ?

Votre projet contient **deux parties distinctes** :

1. **Fichiers statiques HTML** (`index.html`, `jouer.html`, `contact.html`, etc.)
   - ✅ Faciles à déployer : copier les fichiers sur le serveur
   - ✅ Fonctionnent directement sur un serveur web classique (Apache/Nginx)

2. **Application Next.js** (`game-app/`)
   - ⚠️ Nécessite une compilation et un serveur Node.js
   - ⚠️ Ne peut pas être déployée comme des fichiers statiques simples

## 📋 Structure du Projet

```
Zig-Zag/
├── index.html          ← Fichiers statiques (déployés sur zig-zag.fun)
├── jouer.html          ← Fichiers statiques
├── contact.html        ← Fichiers statiques
├── admin.html          ← Fichiers statiques
├── style.css           ← Fichiers statiques
├── script.js           ← Fichiers statiques
└── game-app/           ← Application Next.js (NON déployée actuellement)
    ├── src/
    ├── package.json
    └── ...
```

## ❌ Problème Actuel

Quand vous uploadez seulement les fichiers HTML sur `zig-zag.fun`, vous avez :
- ✅ Les pages statiques (index, jouer, contact, admin)
- ❌ **PAS** l'application Next.js (le jeu multijoueur)

C'est pourquoi :
- En local : `npm run dev` lance Next.js → tout fonctionne
- En production : Next.js n'est pas déployé → le jeu ne fonctionne pas

## ✅ Solutions de Déploiement

### Option 1 : Déployer Next.js sur Vercel (RECOMMANDÉ - Gratuit)

Vercel est la plateforme créée par l'équipe Next.js. C'est la solution la plus simple.

#### Étapes :

1. **Créer un compte Vercel** : [https://vercel.com](https://vercel.com)

2. **Installer Vercel CLI** :
   ```bash
   npm install -g vercel
   ```

3. **Se connecter** :
   ```bash
   cd Zig-Zag/game-app
   vercel login
   ```

4. **Déployer** :
   ```bash
   vercel
   ```
   - Suivez les instructions
   - Vercel détectera automatiquement Next.js
   - Vous obtiendrez une URL comme `zigzag-game.vercel.app`

5. **Configurer les variables d'environnement** :
   - Dans le dashboard Vercel, allez dans Settings → Environment Variables
   - Ajoutez :
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

6. **Mettre à jour la redirection dans `jouer.html`** :
   ```javascript
   const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:3000/jeu'
       : 'https://zigzag-game.vercel.app/jeu'; // Votre URL Vercel
   ```

#### Avantages :
- ✅ Gratuit pour les projets personnels
- ✅ Déploiement automatique à chaque push Git
- ✅ HTTPS inclus
- ✅ CDN global
- ✅ Optimisé pour Next.js

---

### Option 2 : Déployer Next.js sur votre serveur Hostinger

Si vous voulez tout sur `zig-zag.fun`, vous devez configurer Node.js sur votre serveur.

#### Prérequis :
- ✅ Accès SSH à votre serveur Hostinger
- ✅ Node.js installé sur le serveur
- ✅ PM2 ou un gestionnaire de processus

#### Étapes :

1. **Compiler l'application en local** :
   ```bash
   cd Zig-Zag/game-app
   npm install
   npm run build
   ```

2. **Créer un fichier `.env.production`** :
   ```env
   NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
   ```

3. **Uploader le dossier `game-app/` sur le serveur** :
   - Via FTP/SFTP dans un dossier comme `/home/username/zigzag-game`

4. **Sur le serveur, installer et lancer** :
   ```bash
   cd /home/username/zigzag-game
   npm install --production
   npm run build
   npm start
   ```

5. **Configurer un reverse proxy** (Nginx/Apache) :
   - Rediriger `/jeu/*` vers `http://localhost:3000/jeu/*`
   - Exemple de configuration Nginx :
   ```nginx
   location /jeu {
       proxy_pass http://localhost:3000;
       proxy_http_version 1.1;
       proxy_set_header Upgrade $http_upgrade;
       proxy_set_header Connection 'upgrade';
       proxy_set_header Host $host;
       proxy_cache_bypass $http_upgrade;
   }
   ```

6. **Utiliser PM2 pour garder le serveur actif** :
   ```bash
   npm install -g pm2
   pm2 start npm --name "zigzag-game" -- start
   pm2 save
   pm2 startup
   ```

#### ⚠️ Limitations Hostinger :
- Certains hébergements partagés ne permettent pas Node.js
- Vérifiez avec le support Hostinger si Node.js est disponible
- Si non disponible, utilisez l'Option 1 (Vercel)

---

### Option 3 : Build statique de Next.js (LIMITÉ)

Next.js peut générer un site statique, mais certaines fonctionnalités ne fonctionneront pas (SSR, API routes).

#### Étapes :

1. **Modifier `next.config.ts`** :
   ```typescript
   import type { NextConfig } from "next";

   const nextConfig: NextConfig = {
     output: 'export',
     trailingSlash: true,
   };

   export default nextConfig;
   ```

2. **Build statique** :
   ```bash
   cd Zig-Zag/game-app
   npm run build
   ```

3. **Uploader le dossier `out/`** :
   - Copiez le contenu de `game-app/out/` dans un sous-dossier sur votre serveur
   - Par exemple : `zig-zag.fun/jeu/`

4. **Mettre à jour la redirection** :
   ```javascript
   const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
       ? 'http://localhost:3000/jeu'
       : `${window.location.protocol}//${window.location.host}/jeu`;
   ```

#### ⚠️ Limitations :
- Pas de Server-Side Rendering
- Pas d'API routes
- Certaines fonctionnalités Next.js ne fonctionneront pas

---

## 🎯 Recommandation

**Utilisez l'Option 1 (Vercel)** car :
- ✅ Le plus simple à configurer
- ✅ Gratuit
- ✅ Optimisé pour Next.js
- ✅ Déploiement automatique
- ✅ HTTPS inclus

## 📝 Checklist de Déploiement

- [ ] Déployer l'application Next.js (Vercel ou serveur)
- [ ] Configurer les variables d'environnement
- [ ] Mettre à jour la redirection dans `jouer.html`
- [ ] Tester la connexion depuis `zig-zag.fun/jouer`
- [ ] Vérifier que le jeu fonctionne en production
- [ ] Tester le matchmaking
- [ ] Tester les parties privées

## 🔧 Mise à jour des Fichiers Statiques

Quand vous modifiez les fichiers HTML/CSS/JS statiques :

1. **Modifiez les fichiers en local**
2. **Testez en local**
3. **Uploadez sur le serveur** (via FTP/SFTP)
4. **Videz le cache du navigateur** (Ctrl+Shift+R)

## 🔄 Mise à jour de l'Application Next.js

Si vous utilisez Vercel :
- Push sur Git → Déploiement automatique
- Ou `vercel --prod` pour déployer manuellement

Si vous utilisez votre serveur :
- Rebuild et redémarrez le serveur Node.js

---

**Besoin d'aide ?** Dites-moi quelle option vous préférez et je vous guide étape par étape !

