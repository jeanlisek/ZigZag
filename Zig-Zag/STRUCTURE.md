# 📁 Structure du Projet ZigZag

Ce document décrit l'organisation complète du projet après réorganisation.

## 🗂️ Organisation des Dossiers

### Racine du projet (`Zig-Zag/`)

```
Zig-Zag/
├── index.html              # Landing page principale
├── jouer.html              # Page de connexion/inscription
├── contact.html            # Page de contact
├── mentions-legales.html   # Mentions légales
├── presse.html             # Page presse
├── oauth-callback.html     # Callback OAuth
├── style.css               # Styles globaux
├── chatbot.css             # Styles du chatbot
├── chatbot.js              # Script du chatbot
├── cookies.css             # Styles des cookies
├── cookies.js              # Script des cookies
├── i18n.js                 # Internationalisation
├── sw.js                   # Service Worker (PWA)
├── manifest.json           # Manifest PWA
├── .htaccess               # Configuration Apache
├── package.json            # Dépendances npm
├── README.md               # Documentation principale
│
├── admin/                  # 📊 Dashboard Admin (React)
│   └── frontend/dashboard/ # Code source React
│
├── admin-dist/             # Build du dashboard (généré)
│
├── docs/                   # 📚 Documentation organisée
│   ├── deploiement/        # Guides de déploiement
│   │   ├── DEPLOIEMENT_EDGE_FUNCTION.md
│   │   └── GUIDE_DEPLOIEMENT_UPLOAD_AVATAR.md
│   ├── upload/             # Guides d'upload
│   │   ├── GUIDE_UPLOAD_AVATAR.md
│   │   ├── GUIDE_UPLOAD_CLAIR.md
│   │   ├── GUIDE_DIAGNOSTIC_AVATAR.md
│   │   ├── GUIDE_DIAGNOSTIC_AVATAR_COMPLET.md
│   │   ├── UPLOAD_READY.md
│   │   ├── UPLOAD_RESET_PASSWORD.md
│   │   ├── README_UPLOAD.md
│   │   └── RESUME_UPLOAD.md
│   ├── configuration/      # Configuration
│   │   └── RESUME_CONFIGURATION_EMAILS.md
│   ├── instructions/       # Instructions diverses
│   │   ├── CE_QUI_EST_UPLOADER.txt
│   │   ├── FICHIERS_A_UPLOADER.txt
│   │   └── INSTRUCTIONS_UPLOAD_SIMPLE.txt
│   ├── audits/             # Audits et corrections
│   │   └── AUDIT_CORRECTIONS_2025-01-24.md
│   └── ...                 # Autres documentations
│
├── sql/                    # 🗄️ Scripts SQL
│   ├── 01_complete_schema.sql
│   ├── 02_fix_users_table.sql
│   ├── 03_update_checklist_days.sql
│   ├── 04_admin_schema.sql
│   ├── 05_sync_policies_and_indexes.sql
│   └── ...                 # Autres migrations
│
├── scripts/                # 🔧 Scripts utilitaires
│   └── build-admin.sh      # Script de build du dashboard
│
├── workflows/              # 🔄 Workflows n8n
│   └── n8n-workflow-email-smtp-direct.json
│
├── templates/              # 📄 Templates HTML
│   └── TEMPLATE_SUPABASE_RESET_PASSWORD_COMPLET.html
│
├── attached_assets/        # 🎨 Assets (images, etc.)
│   ├── generated_images/
│   ├── mascottes/
│   └── ...
│
├── game-app/               # 🎮 Application Next.js (jeu multijoueur)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
└── supabase/               # ☁️ Supabase Functions
    └── functions/
```

### Dossier parent (`Zig-Zag/`)

```
Zig-Zag/
├── .cursorrules            # Règles Cursor
├── .cursor/                # Configuration Cursor
├── README.md               # Documentation du projet
├── STRUCTURE.md            # Ce fichier
│
├── docs/                   # 📚 Documentation globale
│   ├── deploiement/        # Guides de déploiement
│   │   ├── DEPLOIEMENT_FINAL_COMPLET.md
│   │   ├── DEPLOIEMENT_FIX_URGENT.md
│   │   ├── DEPLOIEMENT_INTERFACE_AMELIOREE.md
│   │   ├── DEPLOIEMENT_SYSTEME_TOUR_PAR_TOUR.md
│   │   ├── FIX_DEPLOIEMENT_URGENT.md
│   │   └── GUIDE_DEPLOIEMENT_COMPLET.md
│   ├── recap/              # Récapitulatifs
│   │   ├── RECAP_AMELIORATIONS_COMPLETE.md
│   │   ├── RECAP_AMELIORATIONS_INTERFACE_ATTENTE.md
│   │   ├── RECAP_COLOR_PICKER_AVANCE.md
│   │   └── RECAP_WAITING_SCREEN_INTERACTIVE.md
│   ├── rules-*.md          # Règles du projet
│   ├── RULES_CHANGELOG.md  # Changelog des règles
│   └── ...                 # Autres documentations
│
├── scripts/                # 🔧 Scripts globaux
│   └── deploy.sh           # Script de déploiement
│
└── Zig-Zag/                # Application principale (voir ci-dessus)
```

## 📋 Guide de Navigation

### Pour trouver un fichier spécifique :

1. **Documentation de déploiement** → `docs/deploiement/` (dans les deux niveaux)
2. **Guides d'upload** → `Zig-Zag/docs/upload/`
3. **Scripts SQL** → `Zig-Zag/sql/`
4. **Scripts shell** → `Zig-Zag/scripts/` ou `scripts/` (racine)
5. **Workflows n8n** → `Zig-Zag/workflows/`
6. **Templates HTML** → `Zig-Zag/templates/`
7. **Configuration** → `Zig-Zag/docs/configuration/`
8. **Instructions** → `Zig-Zag/docs/instructions/`
9. **Audits** → `Zig-Zag/docs/audits/`

## 🎯 Principes d'Organisation

1. **Séparation par type** : Documentation, scripts, workflows, templates
2. **Séparation par fonction** : Déploiement, upload, configuration
3. **Chronologie** : Les audits et récapitulatifs sont datés
4. **Accessibilité** : Les fichiers les plus utilisés restent facilement accessibles

## 📝 Notes

- Les fichiers HTML/CSS/JS principaux restent à la racine de `Zig-Zag/` pour faciliter le déploiement
- La documentation est organisée par thème dans des sous-dossiers
- Les scripts sont centralisés dans `scripts/`
- Les workflows n8n sont dans `workflows/`
- Les templates réutilisables sont dans `templates/`

---

**Dernière mise à jour** : 27 janvier 2025 - Réorganisation complète du projet
