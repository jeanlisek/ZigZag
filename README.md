# ZigZag - Le jeu qui déforme vos messages

Projet de jeu multijoueur en ligne où les messages se transforment à travers différentes étapes.

## 🚀 Démarrage Rapide

### Site principal (zig-zag.fun)
- Site statique HTML/CSS/JS
- Page d'authentification : `/jouer`
- Fichiers : dans `/Zig-Zag/`

### Application de jeu (game.zig-zag.fun)
- Application Next.js (export statique)
- Fichiers : dans `/Zig-Zag/game-app/`
- Build : `cd Zig-Zag/game-app && npm run build`

## 📁 Structure du Projet

```
Zig-Zag/
├── README.md                 # Ce fichier
├── docs/                     # 📚 Documentation principale
│   ├── oauth/               # Configuration OAuth Google
│   ├── deploiement/         # Guides de déploiement
│   ├── archives/            # Anciens guides
│   ├── rules-*.md           # Règles du projet
│   └── RULES_CHANGELOG.md   # Historique des règles
├── Zig-Zag/                 # 🌐 Site statique (zig-zag.fun)
│   ├── index.html           # Page d'accueil
│   ├── jouer.html           # Authentification
│   ├── oauth-callback.html  # Callback OAuth intermédiaire
│   ├── .htaccess            # Configuration serveur
│   ├── sql/                 # Schémas SQL Supabase
│   └── game-app/            # 🎮 Application Next.js (game.zig-zag.fun)
│       ├── src/             # Code source
│       ├── public/          # Assets statiques
│       ├── .htaccess        # Config serveur game.zig-zag.fun
│       ├── build-and-deploy.sh  # Script de build
│       └── docs/archives/   # Anciens guides techniques
└── .cursorrules             # Règles Cursor

```

## 📖 Documentation

### Déploiement
- **[Guide Rapide](/docs/deploiement/DEPLOIEMENT_RAPIDE.md)** - Déploiement en 3 étapes
- **[Solution Finale](/docs/deploiement/SOLUTION_FINALE.md)** - Guide complet avec troubleshooting
- **[Déploiement Game](/docs/deploiement/DEPLOIEMENT_GAME_ZIGZAG_FUN.md)** - Déploiement de l'app Next.js

### OAuth Google
- **[Fix Redirection](/docs/oauth/FIX_REDIRECTION_ZIGZAG_HASH.md)** - Résoudre les problèmes de redirection
- **[Solution Redirection](/docs/oauth/SOLUTION_REDIRECTION_OAUTH.md)** - Stratégie de redirection intermédiaire
- **[Actions OAuth](/docs/oauth/ACTIONS_OAUTH_REQUISES.md)** - Configuration Supabase + Google Cloud
- **[Checklist OAuth](/docs/oauth/CHECKLIST_OAUTH_GOOGLE.md)** - Vérification complète

### Règles du Projet
- **[Frontend](/docs/rules-frontend.md)** - Règles frontend (HTML/CSS/JS)
- **[Backend](/docs/rules-backend.md)** - Règles backend (Python)
- **[Supabase](/docs/rules-supabase.md)** - Configuration Supabase + MCP
- **[Sécurité](/docs/rules-security.md)** - Règles de sécurité
- **[Workflow](/docs/rules-workflow.md)** - Workflow de développement

### Archives
- Anciens guides de déploiement : `/docs/archives/`
- Anciens guides techniques game-app : `/Zig-Zag/game-app/docs/archives/`

## 🛠️ Technologies

### Site Principal
- HTML5, CSS3, JavaScript Vanilla
- Supabase Auth (email/password + Google OAuth)
- Service Workers (PWA)

### Application de Jeu
- **Framework** : Next.js 16 (export statique)
- **UI** : React 19, Tailwind CSS 4
- **Auth** : Supabase Auth
- **Base de données** : Supabase (PostgreSQL)
- **Temps réel** : Supabase Realtime

## 🚀 Déploiement

### 1. Build de l'application Next.js

```bash
cd Zig-Zag/game-app
./build-and-deploy.sh
# OU
npm run build
```

### 2. Upload sur les serveurs

**Sur zig-zag.fun (site principal) :**
- Uploader tous les fichiers depuis `/Zig-Zag/`
- Fichiers critiques : `.htaccess`, `jouer.html`, `oauth-callback.html`

**Sur game.zig-zag.fun (application de jeu) :**
- Uploader tout le contenu de `/Zig-Zag/game-app/out/`
- Uploader `/Zig-Zag/game-app/.htaccess` à la racine

### 3. Configuration Supabase

Voir [Actions OAuth Requises](/docs/oauth/ACTIONS_OAUTH_REQUISES.md)

## 📊 Base de Données

Schémas SQL disponibles dans `/Zig-Zag/sql/` :
- `01_complete_schema.sql` - Schéma complet de la base
- Autres migrations numérotées

## 🔒 Sécurité

- Clés privées : **jamais** exposées côté client
- RLS (Row Level Security) : activé sur toutes les tables sensibles
- Session admin : 24h max
- Variables d'environnement : externalisées

## 📝 Orthographe Officielle

- **Projet** : `ZigZag` (Z majuscule, i minuscule, g minuscule, Z majuscule, a minuscule, g minuscule)
- **URLs/code** : `zig-zag` (minuscules avec tiret)

## 🤝 Contribution

Avant toute modification :
1. Consulter les règles dans `/docs/rules-*.md`
2. Documenter les changements dans `/docs/RULES_CHANGELOG.md`
3. Mettre à jour les fichiers SQL si nécessaire

## 📞 Support

- Issues : Créer un issue GitHub
- Documentation : Voir `/docs/`
- Changelog : `/docs/RULES_CHANGELOG.md`

---

© 2025 ZigZag. Tous droits réservés.
