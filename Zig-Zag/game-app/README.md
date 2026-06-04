# ZigZag Game App - Application Next.js

Application de jeu multijoueur déployée sur `game.zig-zag.fun`.

## 🚀 Démarrage Rapide

### Développement Local

```bash
npm install
npm run dev
```

L'application sera disponible sur `http://localhost:3000`.

### Build pour Production

```bash
# Option 1 : Script automatique avec vérifications
./build-and-deploy.sh

# Option 2 : Build manuel
npm run build

# Option 3 : Build avec copie du .htaccess
npm run build:hostinger
```

Le build génère un dossier `out/` avec tous les fichiers statiques.

## 📁 Structure

```
game-app/
├── src/
│   ├── app/              # Pages Next.js (App Router)
│   │   ├── auth/         # Callback OAuth
│   │   ├── jeu/          # Pages de jeu
│   │   └── layout.tsx    # Layout principal
│   ├── components/       # Composants React
│   │   ├── game/         # Composants de jeu
│   │   ├── ui/           # Composants UI
│   │   └── providers/    # Context providers
│   ├── lib/              # Bibliothèques
│   │   └── supabase/     # Client Supabase
│   ├── hooks/            # Hooks React
│   ├── utils/            # Utilitaires
│   ├── types/            # Types TypeScript
│   └── constants/        # Constantes
├── public/               # Assets statiques
├── .htaccess             # Config Apache (à uploader avec out/)
├── next.config.js        # Configuration Next.js
├── package.json          # Dépendances
└── build-and-deploy.sh   # Script de build automatique
```

## 🛠️ Technologies

- **Framework** : Next.js 16.0.8 (export statique)
- **React** : 19.2.1
- **TypeScript** : 5.x
- **Styling** : Tailwind CSS 4
- **Auth** : Supabase Auth
- **Database** : Supabase (PostgreSQL)
- **Realtime** : Supabase Realtime

## 🚀 Déploiement

### 1. Build

```bash
npm run build
```

Vérifiez que :
- Le dossier `out/` existe
- Le fichier `out/auth/callback/index.html` existe
- Le dossier `out/_next/static/chunks/` contient des fichiers .js

### 2. Upload sur game.zig-zag.fun

Uploadez **tout le contenu** du dossier `out/` sur le serveur :

```
game.zig-zag.fun/
├── _next/               # Chunks Next.js
├── auth/
│   └── callback/        # Page OAuth callback
├── jeu/                 # Pages de jeu
├── index.html
└── .htaccess            # CRITIQUE pour les MIME types
```

**⚠️ N'oubliez pas d'uploader le `.htaccess` !**

### 3. Vérification

Testez ces URLs :
- `https://game.zig-zag.fun/` - Page d'accueil
- `https://game.zig-zag.fun/jeu` - Sélection de mode
- `https://game.zig-zag.fun/auth/callback` - Callback OAuth

## 🔧 Configuration

### Variables d'Environnement

Les variables sont dans `.env.local` (non versionné) :

```bash
NEXT_PUBLIC_SUPABASE_URL=https://tihrltssmpxpreadpzqm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon
```

**Note** : Ces variables sont intégrées au build, pas besoin de les configurer sur le serveur.

### Configuration Next.js

- **Export statique** : `output: 'export'`
- **basePath** : `''` (déployé à la racine de game.zig-zag.fun)
- **assetPrefix** : `''` (chemins absolus)
- **trailingSlash** : `true`

### Configuration Apache (.htaccess)

Le fichier `.htaccess` configure :
- Types MIME pour JS/CSS (CRITIQUE)
- Routing SPA (redirection vers index.html)
- Exclusion des fichiers `_next/` du routing
- Headers de sécurité

## 📖 Pages Principales

- `/` - Page d'accueil (redirection)
- `/jeu` - Sélection de mode (publique, privée, matchmaking)
- `/jeu/compte` - Profil utilisateur
- `/jeu/privee` - Création de partie privée
- `/jeu/matchmaking` - Recherche de partie publique
- `/jeu/room/[room_code]` - Lobby de jeu
- `/jeu/[game_id]` - Partie en cours
- `/jeu/[game_id]/results` - Résultats de partie
- `/auth/callback` - Callback OAuth (reçoit les tokens)

## 🐛 Debugging

### Problème : "Failed to load chunk"

**Cause** : MIME types incorrects ou chunks non uploadés

**Solution** :
1. Vérifiez que le `.htaccess` est uploadé
2. Vérifiez que `_next/static/chunks/` est uploadé
3. Videz le cache (Ctrl+Shift+R)

### Problème : 404 sur /auth/callback

**Cause** : Page non buildée ou non uploadée

**Solution** :
1. Vérifiez que `out/auth/callback/index.html` existe
2. Re-build : `npm run build`
3. Re-upload

### Problème : Page blanche / "Chargement..." infini

**Cause** : Erreur JavaScript ou chunks non chargés

**Solution** :
1. Ouvrez la console (F12)
2. Regardez les erreurs
3. Vérifiez que les chunks se chargent (onglet Network)

## 📚 Documentation Complète

Voir le dossier `/docs/` à la racine du projet :
- [Guide de déploiement rapide](/docs/deploiement/DEPLOIEMENT_RAPIDE.md)
- [Solution complète](/docs/deploiement/SOLUTION_FINALE.md)
- [Configuration OAuth](/docs/oauth/)

## 📝 Scripts

```bash
npm run dev              # Dev local (http://localhost:3000)
npm run build            # Build production (génère out/)
npm run build:hostinger  # Build + copie .htaccess dans out/
npm run start            # Serveur Node.js (non utilisé en prod)
npm run lint             # Linter ESLint
```

## 🔒 Sécurité

- Clé Supabase : utiliser uniquement la clé `anon` (pas `service_role`)
- RLS : toutes les requêtes passent par Row Level Security
- Headers de sécurité : configurés dans `next.config.js` et `.htaccess`
- Session : stockée dans localStorage, auto-refresh activé

## 📞 Support

- Documentation : `/docs/`
- Archives : `/docs/archives/`
- Changelog : `/docs/RULES_CHANGELOG.md`

---

Déployé sur : `https://game.zig-zag.fun`
