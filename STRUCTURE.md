# 📂 Structure du Projet ZigZag

## ✅ Nouvelle Organisation

Tous les fichiers de documentation ont été réorganisés de manière claire et logique.

## 📁 Arborescence Principale

```
Zig-Zag/
├── 📄 README.md                  # Guide principal du projet
├── 📄 .cursorrules               # Règles Cursor
├── 📄 STRUCTURE.md               # Ce fichier
│
├── 📁 docs/                      # 📚 TOUTE LA DOCUMENTATION
│   ├── 📄 README.md             # Index de la documentation
│   │
│   ├── 📁 oauth/                # 🔐 Configuration OAuth
│   │   ├── FIX_REDIRECTION_ZIGZAG_HASH.md
│   │   ├── SOLUTION_REDIRECTION_OAUTH.md
│   │   ├── ACTIONS_OAUTH_REQUISES.md
│   │   ├── CHECKLIST_OAUTH_GOOGLE.md
│   │   ├── PROCEDURE_OAUTH_COMPLETE.md
│   │   ├── FIX_DELETED_CLIENT.md
│   │   ├── FIX_GOOGLE_OAUTH.md
│   │   ├── DEBUG_OAUTH_REDIRECTION.md
│   │   └── GOOGLE_OAUTH_SETUP.md
│   │
│   ├── 📁 deploiement/          # 🚀 Guides de déploiement
│   │   ├── DEPLOIEMENT_RAPIDE.md
│   │   ├── SOLUTION_FINALE.md
│   │   ├── DIAGNOSTIC_COMPLET.md
│   │   └── DEPLOIEMENT_GAME_ZIGZAG_FUN.md
│   │
│   ├── 📁 archives/             # 📦 Anciens guides (référence)
│   │   ├── FIX_MIME_TYPE_HOSTINGER.md
│   │   ├── GUIDE_DEPLACEMENT_JEU.md
│   │   ├── HOSTINGER_DEPLOYMENT.md
│   │   └── ... (21 fichiers)
│   │
│   ├── 📄 rules-frontend.md     # Règles frontend
│   ├── 📄 rules-backend.md      # Règles backend
│   ├── 📄 rules-supabase.md     # Règles Supabase
│   ├── 📄 rules-security.md     # Règles de sécurité
│   ├── 📄 rules-workflow.md     # Workflow de développement
│   ├── 📄 RULES_SYSTEM.md       # Système de gestion des règles
│   ├── 📄 RULES_CHANGELOG.md    # Historique des changements
│   ├── 📄 CHATBOT_DESIGN_OPTIONS.md
│   ├── 📄 COOKIES_RGPD.md
│   └── 📄 MULTILINGUE.md
│
├── 📁 Zig-Zag/                  # 🌐 Site statique (zig-zag.fun)
│   ├── 📄 README.md             # Guide du site statique
│   ├── 📄 .htaccess             # Config serveur
│   ├── 📄 index.html            # Page d'accueil
│   ├── 📄 jouer.html            # Authentification
│   ├── 📄 oauth-callback.html   # Callback OAuth intermédiaire
│   ├── 📄 contact.html
│   ├── 📄 presse.html
│   ├── 📄 mentions-legales.html
│   ├── 📄 admin.html
│   ├── 📄 404.html
│   ├── 📄 500.html
│   ├── 📄 style.css
│   ├── 📄 script.js
│   ├── 📄 cookies.js
│   ├── 📄 i18n.js
│   ├── 📄 manifest.json
│   ├── 📄 sw.js (Service Worker)
│   │
│   ├── 📁 sql/                  # 🗄️ Schémas SQL Supabase
│   │   ├── README.md
│   │   ├── 01_complete_schema.sql
│   │   ├── 02_fix_users_table.sql
│   │   ├── 03_update_checklist_days.sql
│   │   ├── 04_admin_schema.sql
│   │   ├── 05_sync_policies_and_indexes.sql
│   │   ├── 06_add_username_availability_check.sql
│   │   └── 07_add_user_id_to_game_tables.sql
│   │
│   ├── 📁 attached_assets/      # Assets (images, etc.)
│   │
│   └── 📁 game-app/             # 🎮 Application Next.js (game.zig-zag.fun)
│       ├── 📄 README.md         # Guide de l'app Next.js
│       ├── 📄 .htaccess         # Config serveur game.zig-zag.fun
│       ├── 📄 package.json
│       ├── 📄 next.config.js
│       ├── 📄 tsconfig.json
│       ├── 📄 build-and-deploy.sh  # Script de build automatique
│       │
│       ├── 📁 src/              # Code source
│       │   ├── app/            # Pages Next.js
│       │   ├── components/     # Composants React
│       │   ├── lib/            # Bibliothèques (Supabase)
│       │   ├── hooks/          # Hooks React
│       │   ├── utils/          # Utilitaires
│       │   ├── types/          # Types TypeScript
│       │   └── constants/      # Constantes
│       │
│       ├── 📁 public/           # Assets statiques
│       │
│       └── 📁 docs/             # Docs spécifiques à game-app
│           └── 📁 archives/     # Anciens guides techniques
│               ├── AMELIORATIONS_APPLIQUEES.md
│               ├── DIAGNOSTIC_500.md
│               ├── FIX_DEPLOYMENT_CHUNKS.md
│               └── ... (22 fichiers)
│
└── 📁 .cursor/                  # Configuration Cursor
    └── mcp.json
```

## 🎯 Points d'Entrée Principaux

### Pour Commencer
- **[/README.md](README.md)** - Point d'entrée principal du projet

### Documentation
- **[/docs/README.md](docs/README.md)** - Index de toute la documentation

### Site Statique
- **[/Zig-Zag/README.md](Zig-Zag/README.md)** - Guide du site zig-zag.fun

### Application Next.js
- **[/Zig-Zag/game-app/README.md](Zig-Zag/game-app/README.md)** - Guide de l'app game.zig-zag.fun

## 📖 Guide Rapide

### Je veux déployer l'application
→ [docs/deploiement/DEPLOIEMENT_RAPIDE.md](docs/deploiement/DEPLOIEMENT_RAPIDE.md)

### OAuth ne fonctionne pas
→ [docs/oauth/FIX_REDIRECTION_ZIGZAG_HASH.md](docs/oauth/FIX_REDIRECTION_ZIGZAG_HASH.md)

### Je veux comprendre la structure SQL
→ [Zig-Zag/sql/README.md](Zig-Zag/sql/README.md)

### Je veux développer une nouvelle fonctionnalité
→ [docs/rules-frontend.md](docs/rules-frontend.md) et [docs/rules-workflow.md](docs/rules-workflow.md)

## 🧹 Ce Qui a Été Nettoyé

### ✅ Fichiers Déplacés
- **À la racine** : Tous les fichiers MD de debug/déploiement → `/docs/deploiement/`
- **Dans /docs** : Tous les guides OAuth → `/docs/oauth/`
- **Dans /Zig-Zag** : Anciens guides → `/docs/archives/`
- **Dans /game-app** : 22 fichiers MD obsolètes → `/game-app/docs/archives/`

### ✅ Fichiers Supprimés
- `game-app.zip` (fichier obsolète)
- Dossier `/Zig-Zag/docs/` (vidé et supprimé)

### ✅ Fichiers Créés
- `README.md` à la racine (guide principal)
- `README.md` dans `/docs` (index documentation)
- `README.md` dans `/game-app` (guide Next.js)
- `STRUCTURE.md` (ce fichier)

## 📊 Statistiques

- **📁 3 dossiers de documentation** : oauth, deploiement, archives
- **📄 53 fichiers Markdown** organisés
- **🗂️ 34 fichiers archivés** (pour référence)
- **📚 4 README.md** comme points d'entrée

## 🎉 Résultat

Tous vos fichiers sont maintenant **organisés, structurés et faciles à retrouver** !

- Documentation OAuth : `/docs/oauth/`
- Guides de déploiement : `/docs/deploiement/`
- Règles du projet : `/docs/rules-*.md`
- Anciens guides : `/docs/archives/`

Plus de bordel ! 🧹✨

---

**Pro Tip** : Utilisez les fichiers `README.md` comme points d'entrée pour naviguer dans la documentation !
