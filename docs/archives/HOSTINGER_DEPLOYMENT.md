# 🚀 Déploiement sur Hostinger - Guide Complet

## 📋 Situation Actuelle

Vous avez :
- ✅ **Fichiers statiques** (HTML/CSS/JS) → Déployés sur `zig-zag.fun` ✅
- ❌ **Application Next.js** (`game-app/`) → **NON déployée** ❌

## ⚠️ Problème avec Hostinger

**Hébergement partagé Hostinger** :
- ✅ Supporte les fichiers statiques (HTML, CSS, JS, PHP)
- ❌ **Ne supporte PAS Node.js** par défaut
- ❌ Ne peut pas exécuter une application Next.js directement

## ✅ Solution Recommandée : Vercel (Gratuit) + Hostinger

La meilleure solution est de **séparer** :
- **Hostinger** → Fichiers statiques (landing page, connexion)
- **Vercel** → Application Next.js (jeu multijoueur)

### Pourquoi cette solution ?

1. ✅ **Gratuit** : Vercel est gratuit pour les projets personnels
2. ✅ **Simple** : Déploiement en 5 minutes
3. ✅ **Optimisé** : Vercel est créé par l'équipe Next.js
4. ✅ **HTTPS inclus** : Pas besoin de configurer SSL
5. ✅ **CDN global** : Performance optimale
6. ✅ **Déploiement automatique** : À chaque modification

---

## 🎯 Étape 1 : Déployer Next.js sur Vercel

### 1.1 Créer un compte Vercel

1. Allez sur [https://vercel.com/signup](https://vercel.com/signup)
2. Créez un compte (gratuit) avec GitHub, GitLab ou email

### 1.2 Installer Vercel CLI

```bash
npm install -g vercel
```

### 1.3 Se connecter

```bash
cd Zig-Zag/game-app
vercel login
```

Suivez les instructions dans le terminal.

### 1.4 Déployer l'application

```bash
vercel
```

Répondez aux questions :
- **Set up and deploy?** → `Y`
- **Which scope?** → Choisissez votre compte
- **Link to existing project?** → `N` (première fois)
- **What's your project's name?** → `zigzag-game` (ou autre nom)
- **In which directory is your code located?** → `./` (appuyez sur Entrée)
- **Want to override the settings?** → `N`

Vercel va :
1. Détecter automatiquement Next.js
2. Installer les dépendances
3. Builder l'application
4. La déployer

Vous obtiendrez une URL comme : `https://zigzag-game.vercel.app`

### 1.5 Configurer les variables d'environnement

1. Allez sur [https://vercel.com/dashboard](https://vercel.com/dashboard)
2. Cliquez sur votre projet `zigzag-game`
3. Allez dans **Settings** → **Environment Variables**
4. Ajoutez :
   - **Name** : `NEXT_PUBLIC_SUPABASE_URL`
   - **Value** : Votre URL Supabase (ex: `https://tihrltssmpxpreadpzqm.supabase.co`)
   - **Environment** : Production, Preview, Development (cochez les 3)
   - Cliquez sur **Save**

5. Répétez pour :
   - **Name** : `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **Value** : Votre clé anon Supabase

6. **Redéployez** :
   - Allez dans **Deployments**
   - Cliquez sur les 3 points (⋯) du dernier déploiement
   - Cliquez sur **Redeploy**

### 1.6 Tester

Allez sur `https://zigzag-game.vercel.app/jeu` → Vous devriez voir la page de sélection de mode.

---

## 🔗 Étape 2 : Mettre à jour la redirection dans `jouer.html`

Maintenant, il faut que `jouer.html` redirige vers Vercel en production.

### 2.1 Modifier `jouer.html`

Ouvrez `jouer.html` et trouvez la ligne de redirection (vers la ligne 389) :

```javascript
// REMPLACER CETTE LIGNE :
window.location.href = 'http://localhost:3000/jeu';

// PAR :
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : 'https://zigzag-game.vercel.app/jeu'; // ⬅️ REMPLACEZ par votre URL Vercel
window.location.href = gameUrl;
```

**⚠️ IMPORTANT** : Remplacez `zigzag-game.vercel.app` par **votre vraie URL Vercel**.

### 2.2 Uploader le fichier modifié

1. Uploadez `jouer.html` sur Hostinger (remplacez l'ancien)
2. Testez : Allez sur `zig-zag.fun/jouer` et connectez-vous
3. Vous devriez être redirigé vers Vercel

---

## 🎨 Étape 3 : Optionnel - Sous-domaine personnalisé

Si vous voulez que le jeu soit sur `game.zig-zag.fun` au lieu de `zigzag-game.vercel.app` :

### 3.1 Configurer le sous-domaine dans Hostinger

1. Allez dans votre panneau Hostinger
2. Allez dans **Domaines** → **Sous-domaines**
3. Créez un sous-domaine : `game` → `game.zig-zag.fun`

### 3.2 Configurer dans Vercel

1. Allez dans votre projet Vercel
2. **Settings** → **Domains**
3. Ajoutez : `game.zig-zag.fun`
4. Vercel vous donnera des enregistrements DNS à ajouter

### 3.3 Configurer les DNS dans Hostinger

1. Allez dans **Domaines** → **Zone DNS**
2. Ajoutez les enregistrements fournis par Vercel
3. Attendez quelques minutes (propagation DNS)

### 3.4 Mettre à jour la redirection

Dans `jouer.html`, changez :
```javascript
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : 'https://game.zig-zag.fun/jeu'; // ⬅️ Sous-domaine personnalisé
```

---

## 🔄 Mise à jour Future

### Mettre à jour les fichiers statiques (Hostinger)

1. Modifiez les fichiers en local
2. Testez en local
3. Uploadez via FTP/SFTP sur Hostinger
4. Videz le cache du navigateur (Ctrl+Shift+R)

### Mettre à jour l'application Next.js (Vercel)

**Option 1 : Via Git (Recommandé)**
1. Connectez votre repo Git à Vercel
2. Push sur Git → Déploiement automatique

**Option 2 : Via CLI**
```bash
cd Zig-Zag/game-app
vercel --prod
```

---

## 🐛 Dépannage

### Le jeu ne se charge pas après redirection

1. **Vérifiez l'URL Vercel** : Allez directement sur `https://zigzag-game.vercel.app/jeu`
2. **Vérifiez les variables d'environnement** dans Vercel
3. **Vérifiez la console du navigateur** (F12) pour les erreurs
4. **Vérifiez que Supabase est configuré** : Suivez `SUPABASE_SETUP.md`

### Erreur "Cannot GET /jeu"

- L'application Next.js n'est pas déployée
- Vérifiez que Vercel a bien déployé
- Vérifiez l'URL dans `jouer.html`

### Page blanche sur Vercel

- Vérifiez les variables d'environnement
- Vérifiez les logs dans Vercel (Deployments → Logs)
- Vérifiez que le schéma Supabase est créé

---

## 📝 Checklist de Déploiement

- [ ] Créer un compte Vercel
- [ ] Installer Vercel CLI
- [ ] Déployer l'application Next.js
- [ ] Configurer les variables d'environnement dans Vercel
- [ ] Tester l'URL Vercel directement
- [ ] Mettre à jour la redirection dans `jouer.html`
- [ ] Uploader `jouer.html` sur Hostinger
- [ ] Tester la connexion depuis `zig-zag.fun/jouer`
- [ ] Vérifier que la redirection fonctionne
- [ ] Tester le matchmaking
- [ ] Tester les parties privées

---

## 🎯 Résumé

**Architecture finale** :
```
zig-zag.fun (Hostinger)
├── index.html          ← Landing page
├── jouer.html          ← Connexion → Redirige vers Vercel
├── contact.html        ← Contact
└── admin.html          ← Admin

zigzag-game.vercel.app (Vercel)
└── /jeu                ← Application Next.js (jeu multijoueur)
    ├── /matchmaking
    ├── /privee
    └── /[game_id]
```

**Flux utilisateur** :
1. Utilisateur va sur `zig-zag.fun`
2. Clique sur "Jouer" → `zig-zag.fun/jouer`
3. Se connecte → Redirigé vers `zigzag-game.vercel.app/jeu`
4. Joue sur Vercel

---

**Besoin d'aide ?** Dites-moi à quelle étape vous êtes bloqué !

