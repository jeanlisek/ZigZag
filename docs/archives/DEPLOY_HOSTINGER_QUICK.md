# ⚡ Déploiement Rapide sur Hostinger - Guide Express

## 🎯 Solution : Export Statique Next.js

Votre application Next.js utilise uniquement du **client-side** (pas de SSR), donc elle peut être convertie en fichiers statiques et déployée sur n'importe quel hébergement !

## ✅ Étapes Rapides

### 1. Modifier la Configuration

Le fichier `next.config.ts` a déjà été modifié pour l'export statique ✅

### 2. Build l'Application

```bash
cd Zig-Zag/game-app
npm install  # Si pas déjà fait
npm run build
```

Cela crée un dossier `out/` avec tous les fichiers statiques.

### 3. Tester Localement (Optionnel)

```bash
cd out
npx serve .
# Ou avec Python
python3 -m http.server 8000
```

Allez sur `http://localhost:8000/jeu` pour vérifier.

### 4. Uploader sur Hostinger

**Via FTP/SFTP :**

1. Connectez-vous à votre FTP Hostinger
2. Créez un dossier `jeu/` dans `public_html/`
3. Uploadez **TOUT le contenu** du dossier `out/` dans `jeu/`

**Structure finale :**
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

### 5. Configurer les Routes (Important !)

Créez un fichier `.htaccess` dans le dossier `jeu/` sur Hostinger :

```apache
RewriteEngine On
RewriteBase /jeu/

# Rediriger toutes les routes vers index.html
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /jeu/index.html [L]
```

**Comment créer le fichier :**
1. Créez un fichier texte nommé `.htaccess`
2. Copiez le contenu ci-dessus
3. Uploadez-le dans le dossier `jeu/` sur Hostinger

### 6. Mettre à Jour la Redirection

Le fichier `jouer.html` redirige déjà vers `/jeu` ✅

Si besoin, vérifiez que la ligne 389-391 dans `jouer.html` est :
```javascript
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : `${window.location.protocol}//${window.location.host}/jeu`;
```

### 7. Tester

1. Allez sur `zig-zag.fun/jeu` → Devrait afficher la page de sélection de mode
2. Allez sur `zig-zag.fun/jouer` → Connectez-vous → Devrait rediriger vers `/jeu`

## 🔄 Mise à Jour Future

Après chaque modification du code :

```bash
cd game-app
npm run build
# Uploader le nouveau dossier out/ sur Hostinger (remplacer l'ancien)
```

## ⚠️ Problèmes Courants

### Erreur 404 sur `/jeu/matchmaking`

**Solution :** Vérifiez que le fichier `.htaccess` est bien dans `jeu/` et contient les règles de réécriture.

### Assets non chargés (CSS/JS)

**Solution :** Vérifiez que le dossier `_next/` est bien uploadé dans `jeu/`.

### Variables d'environnement

Les variables `NEXT_PUBLIC_*` sont intégrées au build. Vérifiez que votre `.env.local` contient :
```
NEXT_PUBLIC_SUPABASE_URL=https://tihrltssmpxpreadpzqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

Puis rebuild : `npm run build`

---

**Guide complet :** Voir `docs/HOSTINGER_FULL_DEPLOYMENT.md`









