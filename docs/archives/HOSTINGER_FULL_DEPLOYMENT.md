# 🚀 Déploiement Complet sur Hostinger - Guide

## 📋 Options pour Déployer Next.js sur Hostinger

Il y a **3 options principales** pour déployer votre application Next.js sur Hostinger :

### Option 1 : Build Statique (Export Statique) ⭐ RECOMMANDÉ
- ✅ **Le plus simple** pour hébergement partagé
- ✅ Fonctionne sur n'importe quel hébergement
- ⚠️ Limitations : Pas de SSR, pas d'API routes

### Option 2 : VPS Hostinger avec Node.js
- ✅ Support complet Next.js
- ⚠️ Plus cher (VPS)
- ⚠️ Configuration plus complexe

### Option 3 : Vérifier si Node.js est disponible
- Certains plans Hostinger Business/Cloud incluent Node.js
- Vérifier dans votre panneau Hostinger

---

## 🎯 Option 1 : Build Statique (Recommandé pour Hébergement Partagé)

Cette option convertit votre application Next.js en fichiers statiques HTML/CSS/JS.

### Avantages
- ✅ Fonctionne sur n'importe quel hébergement (même partagé)
- ✅ Pas besoin de Node.js sur le serveur
- ✅ Performance excellente (fichiers statiques)
- ✅ Gratuit (utilise votre hébergement existant)

### Limitations
- ⚠️ Pas de Server-Side Rendering (SSR)
- ⚠️ Pas d'API routes Next.js
- ⚠️ Pas de fonctions serveur (`getServerSideProps`, etc.)
- ✅ Mais votre app utilise déjà Supabase côté client, donc ça devrait fonctionner !

### Étapes de Déploiement

#### 1. Modifier `next.config.ts`

Ouvrez `game-app/next.config.ts` et modifiez-le :

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',  // ← Ajoutez cette ligne
  trailingSlash: true,  // ← Recommandé pour les fichiers statiques
  images: {
    unoptimized: true,  // ← Nécessaire pour l'export statique
  },
};

export default nextConfig;
```

#### 2. Build l'Application

```bash
cd Zig-Zag/game-app
npm install
npm run build
```

Cela va créer un dossier `out/` avec tous les fichiers statiques.

#### 3. Vérifier le Build

```bash
# Tester localement le build statique
cd out
# Utilisez un serveur HTTP simple
python3 -m http.server 8000
# Ou avec npx
npx serve out
```

Allez sur `http://localhost:8000` pour vérifier que tout fonctionne.

#### 4. Uploader sur Hostinger

**Option A : Dans un sous-dossier `/jeu`**

1. Connectez-vous à votre FTP/SFTP Hostinger
2. Créez un dossier `jeu/` dans `public_html/`
3. Uploadez **tout le contenu** du dossier `out/` dans `jeu/`
4. Structure finale :
   ```
   public_html/
   ├── index.html
   ├── jouer.html
   ├── contact.html
   ├── admin.html
   └── jeu/              ← Dossier avec l'app Next.js
       ├── index.html
       ├── _next/
       └── ...
   ```

**Option B : À la racine (remplacer les fichiers statiques)**

Si vous voulez que `/jeu` soit directement accessible :
1. Uploadez le contenu de `out/` dans `public_html/jeu/`
2. Mettez à jour `jouer.html` pour rediriger vers `/jeu` au lieu de Vercel

#### 5. Mettre à jour la Redirection dans `jouer.html`

Ouvrez `jouer.html` et modifiez la redirection :

```javascript
// REMPLACER :
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : `${window.location.protocol}//${window.location.host}/jeu`;

// PAR (si déployé dans /jeu) :
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : `${window.location.protocol}//${window.location.host}/jeu`;
// Même chose, mais maintenant ça pointe vers Hostinger !
```

#### 6. Configurer les Variables d'Environnement

Les variables `NEXT_PUBLIC_*` sont intégrées au build, donc :
- ✅ Pas besoin de `.env` sur le serveur
- ✅ Les variables sont déjà dans les fichiers JS compilés

**Important** : Vérifiez que votre `.env.local` contient bien :
```
NEXT_PUBLIC_SUPABASE_URL=https://tihrltssmpxpreadpzqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

#### 7. Tester

1. Allez sur `zig-zag.fun/jeu`
2. Vous devriez voir la page de sélection de mode
3. Testez la connexion depuis `zig-zag.fun/jouer`

---

## 🔧 Option 2 : VPS Hostinger avec Node.js

Si vous avez un VPS Hostinger ou un plan qui supporte Node.js :

### Prérequis
- ✅ Accès SSH
- ✅ Node.js installé (vérifier avec `node --version`)
- ✅ PM2 ou un gestionnaire de processus

### Étapes

#### 1. Uploader l'Application

```bash
# Via SFTP, uploadez le dossier game-app/ dans :
/home/username/zigzag-game/
```

#### 2. Sur le Serveur (SSH)

```bash
# Se connecter en SSH
ssh username@zig-zag.fun

# Aller dans le dossier
cd ~/zigzag-game

# Installer les dépendances
npm install --production

# Créer .env.production
nano .env.production
# Ajoutez :
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...

# Build
npm run build

# Lancer avec PM2
npm install -g pm2
pm2 start npm --name "zigzag-game" -- start
pm2 save
pm2 startup
```

#### 3. Configurer Nginx/Apache (Reverse Proxy)

**Nginx** :
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

**Apache** (`.htaccess` ou config) :
```apache
ProxyPass /jeu http://localhost:3000
ProxyPassReverse /jeu http://localhost:3000
```

---

## 🔍 Option 3 : Vérifier Node.js dans Hostinger

### Comment Vérifier

1. **Connectez-vous à votre panneau Hostinger**
2. **Cherchez "Node.js" ou "Applications"** dans le menu
3. **Vérifiez votre plan** :
   - Plans partagés → Généralement pas de Node.js
   - Plans Business/Cloud → Peut-être Node.js
   - VPS → Node.js disponible

### Si Node.js est Disponible

Suivez l'**Option 2** ci-dessus.

### Si Node.js n'est PAS Disponible

Utilisez l'**Option 1** (Build Statique).

---

## 📊 Comparaison des Options

| Critère | Build Statique | VPS Node.js |
|---------|---------------|-------------|
| **Coût** | ✅ Gratuit (hébergement existant) | ⚠️ VPS (~5-10€/mois) |
| **Complexité** | ✅ Simple | ⚠️ Complexe |
| **Performance** | ✅ Excellente | ✅ Excellente |
| **SSR** | ❌ Non | ✅ Oui |
| **API Routes** | ❌ Non | ✅ Oui |
| **Maintenance** | ✅ Facile | ⚠️ Plus de maintenance |

---

## 🎯 Recommandation pour Votre Cas

**Utilisez l'Option 1 (Build Statique)** car :

1. ✅ Votre app utilise Supabase côté client (pas besoin de SSR)
2. ✅ Pas d'API routes Next.js (tout passe par Supabase)
3. ✅ Gratuit (utilise votre hébergement existant)
4. ✅ Simple à déployer et maintenir
5. ✅ Performance excellente

---

## 🔄 Mise à Jour Future

### Après Modifications du Code

1. **Modifier le code** dans `game-app/`
2. **Rebuild** :
   ```bash
   cd game-app
   npm run build
   ```
3. **Uploader** le nouveau dossier `out/` sur Hostinger
4. **Remplacer** les anciens fichiers

### Automatisation (Optionnel)

Créez un script `deploy.sh` :

```bash
#!/bin/bash
cd game-app
npm run build
# Uploader via FTP/SFTP (utiliser lftp, rsync, ou un client FTP)
# Exemple avec rsync (si SSH disponible) :
# rsync -avz out/ username@zig-zag.fun:/home/username/public_html/jeu/
```

---

## ⚠️ Problèmes Courants

### Erreur 404 sur les Routes

**Problème** : Les routes Next.js ne fonctionnent pas (ex: `/jeu/matchmaking`)

**Solution** : Créer un fichier `.htaccess` dans le dossier `jeu/` :

```apache
RewriteEngine On
RewriteBase /jeu/

# Rediriger toutes les routes vers index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /jeu/index.html [L]
```

### Variables d'Environnement Non Chargées

**Problème** : Erreurs Supabase ou variables manquantes

**Solution** : 
1. Vérifiez que `.env.local` existe dans `game-app/`
2. Rebuild : `npm run build`
3. Les variables `NEXT_PUBLIC_*` sont intégrées au build

### Assets Non Chargés

**Problème** : Images/CSS non chargés

**Solution** :
1. Vérifiez que le dossier `_next/` est bien uploadé
2. Vérifiez les chemins dans `next.config.ts` (trailingSlash)

---

## ✅ Checklist de Déploiement

- [ ] Modifier `next.config.ts` (ajouter `output: 'export'`)
- [ ] Build l'application (`npm run build`)
- [ ] Tester localement le build statique
- [ ] Uploader le dossier `out/` sur Hostinger
- [ ] Configurer `.htaccess` si nécessaire
- [ ] Mettre à jour la redirection dans `jouer.html`
- [ ] Tester `zig-zag.fun/jeu`
- [ ] Tester la connexion depuis `zig-zag.fun/jouer`
- [ ] Tester le matchmaking
- [ ] Tester les parties privées

---

**Besoin d'aide ?** Dites-moi quelle option vous choisissez et je vous guide étape par étape !









