# 🎯 Options pour Déployer TOUT sur Hostinger

## 📋 Ce que vous voulez

Mettre **TOUT** sur Hostinger :
- ✅ Site statique (index.html, jouer.html, contact.html, etc.)
- ✅ Application Next.js (le jeu)

---

## ✅ Option 1 : Export Statique (Gratuit) ⭐ RECOMMANDÉ

### Comment ça marche ?

1. **Site statique** : Reste tel quel (fichiers HTML/CSS/JS)
2. **Jeu Next.js** : Converti en fichiers statiques (HTML/CSS/JS)

**Résultat** : Tout est en fichiers statiques, pas besoin de Node.js !

### Structure sur Hostinger

```
public_html/ (zig-zag.fun)
├── index.html          ← Site statique
├── jouer.html          ← Site statique
├── contact.html        ← Site statique
├── admin.html          ← Site statique
├── style.css           ← Site statique
├── script.js           ← Site statique
├── .htaccess           ← Configuration Apache
└── jeu/                ← Jeu Next.js (export statique)
    ├── index.html
    ├── .htaccess
    ├── _next/
    │   └── static/
    └── jeu/
```

### Avantages

- ✅ **Gratuit** (utilise votre hébergement partagé actuel)
- ✅ **Simple** : Juste copier des fichiers
- ✅ **Performant** : Fichiers statiques = très rapide
- ✅ **Pas de maintenance** : Pas de serveur à gérer

### Inconvénients

- ⚠️ Nécessite de configurer `generateStaticParams()` pour les routes dynamiques
- ⚠️ Pas de SSR (mais vous n'en avez pas besoin)

### Coût : **0€/mois**

---

## ✅ Option 2 : Cloud Hostinger avec Node.js (Payant)

### Comment ça marche ?

1. **Site statique** : Reste tel quel (fichiers HTML/CSS/JS)
2. **Jeu Next.js** : Déployé comme application Node.js (avec serveur)

**Résultat** : Le jeu tourne sur un serveur Node.js.

### Structure sur Hostinger Cloud

```
public_html/ (zig-zag.fun)
├── index.html          ← Site statique
├── jouer.html          ← Site statique
├── contact.html        ← Site statique
├── admin.html          ← Site statique
├── style.css           ← Site statique
├── script.js           ← Site statique
└── jeu/                ← Jeu Next.js (Web App Node.js)
    ├── package.json
    ├── .next/
    ├── node_modules/
    └── (fichiers Next.js)
```

### Avantages

- ✅ Support complet Next.js (SSR, API routes si besoin)
- ✅ Pas besoin de configurer `generateStaticParams()`
- ✅ Plus de flexibilité pour l'avenir

### Inconvénients

- ❌ **Payant** (~10-15€/mois pour Cloud Startup)
- ❌ Plus complexe à configurer
- ❌ Maintenance serveur nécessaire

### Coût : **~10-15€/mois**

---

## 🎯 Quelle Option Choisir ?

### Choisissez Option 1 (Export Statique) si :

- ✅ Vous voulez rester gratuit
- ✅ Votre app fonctionne déjà en client-side (ce qui est le cas)
- ✅ Vous n'avez pas besoin de SSR

### Choisissez Option 2 (Cloud Node.js) si :

- ✅ Vous avez besoin de SSR
- ✅ Vous voulez créer des API routes Next.js
- ✅ Vous avez le budget (~10-15€/mois)

---

## 📝 Guide pour Option 1 : Export Statique (Gratuit)

### Étape 1 : Configurer Next.js pour l'Export Statique

Modifiez `next.config.js` :

```javascript
const nextConfig = {
  output: 'export',  // ← Export statique
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // ... reste de la config
};
```

### Étape 2 : Ajouter generateStaticParams() aux Routes Dynamiques

Pour chaque route dynamique (`[game_id]`, `[room_code]`), ajoutez `generateStaticParams()` dans un fichier `layout.tsx`.

### Étape 3 : Build

```bash
cd Zig-Zag/game-app
npm run build
```

Cela crée un dossier `out/` avec tous les fichiers statiques.

### Étape 4 : Uploader sur Hostinger

1. **Site statique** : Uploadez dans `public_html/` de `zig-zag.fun`
2. **Jeu** : Uploadez le contenu de `out/` dans `public_html/jeu/` de `zig-zag.fun`

### Étape 5 : Configurer .htaccess

- `.htaccess` à la racine : Types MIME
- `.htaccess` dans `jeu/` : Routing Next.js

---

## 📝 Guide pour Option 2 : Cloud Hostinger avec Node.js (Payant)

### Étape 1 : Upgrader vers Cloud Startup

1. Allez dans votre panneau Hostinger
2. Upgrader vers **Cloud Startup**
3. Attachez `zig-zag.fun` à ce plan

### Étape 2 : Déployer le Site Statique

1. Uploadez les fichiers statiques dans `public_html/` de `zig-zag.fun`

### Étape 3 : Créer une Web App Node.js pour le Jeu

1. Allez dans **hPanel → Node.js / Web apps**
2. Cliquez sur **Créer une nouvelle app**
3. Configurez :
   - **Nom** : `jeu` ou `zigzag-game`
   - **Version Node.js** : `18.x` ou `20.x`
   - **Script de démarrage** : `npm start`
   - **Dossier** : `/jeu` ou `/game`
4. Uploadez votre code Next.js dans ce dossier

### Étape 4 : Configurer les Variables d'Environnement

Dans la Web App Node.js, ajoutez :
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Étape 5 : Configurer le Routing

Dans `next.config.js`, configurez `basePath` si nécessaire :

```javascript
const nextConfig = {
  basePath: '/jeu',  // Si le jeu est sur /jeu
  // ... reste de la config
};
```

### Étape 6 : Mettre à Jour jouer.html

Modifiez la redirection pour pointer vers la Web App Node.js :

```javascript
const gameUrl = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:3000/jeu'
    : `${window.location.protocol}//${window.location.host}/jeu`;
```

---

## 🔄 Comparaison Visuelle

### Option 1 : Export Statique (Gratuit)

```
┌─────────────────────────────────┐
│   Hostinger Partagé (Gratuit)   │
│                                  │
│  public_html/                   │
│  ├── index.html                 │
│  ├── jouer.html                 │
│  └── jeu/                       │
│      ├── index.html (statique)  │
│      └── _next/ (fichiers JS)   │
└─────────────────────────────────┘
```

### Option 2 : Cloud Node.js (Payant)

```
┌─────────────────────────────────┐
│   Hostinger Cloud (Payant)      │
│                                  │
│  public_html/                   │
│  ├── index.html                 │
│  ├── jouer.html                 │
│  └── jeu/ (Web App Node.js)     │
│      ├── package.json           │
│      ├── .next/                 │
│      └── node_modules/          │
│      └── [Serveur Node.js]      │
└─────────────────────────────────┘
```

---

## 💡 Ma Recommandation

Pour votre cas, je recommande **Option 1 (Export Statique)** car :

1. ✅ **Gratuit** : Utilise votre hébergement actuel
2. ✅ **Suffisant** : Votre app fonctionne déjà en client-side
3. ✅ **Simple** : Juste copier des fichiers
4. ✅ **Performant** : Fichiers statiques = très rapide

**Option 2** n'est nécessaire que si vous avez besoin de SSR ou d'API routes Next.js.

---

## 🚀 Prochaines Étapes

**Si vous choisissez Option 1** (Recommandé) :
1. Je vous aide à configurer l'export statique
2. On build l'application
3. On upload tout sur Hostinger

**Si vous choisissez Option 2** :
1. Upgrader vers Cloud Startup
2. Je vous guide pour créer la Web App Node.js
3. On configure le déploiement

**Quelle option préférez-vous ?**


