# 📚 Documentation ZigZag

Documentation complète du projet ZigZag.

## 📂 Structure de la Documentation

### 🔐 OAuth (`/oauth`)
Configuration et troubleshooting de l'authentification Google OAuth.

- **[FIX_REDIRECTION_ZIGZAG_HASH.md](oauth/FIX_REDIRECTION_ZIGZAG_HASH.md)** - Résoudre les problèmes de redirection vers `zig-zag.fun/#`
- **[SOLUTION_REDIRECTION_OAUTH.md](oauth/SOLUTION_REDIRECTION_OAUTH.md)** - Stratégie de redirection intermédiaire (oauth-callback.html)
- **[ACTIONS_OAUTH_REQUISES.md](oauth/ACTIONS_OAUTH_REQUISES.md)** - Actions manuelles dans Supabase + Google Cloud
- **[CHECKLIST_OAUTH_GOOGLE.md](oauth/CHECKLIST_OAUTH_GOOGLE.md)** - Checklist complète de vérification OAuth
- **[PROCEDURE_OAUTH_COMPLETE.md](oauth/PROCEDURE_OAUTH_COMPLETE.md)** - Procédure OAuth de A à Z
- **[FIX_DELETED_CLIENT.md](oauth/FIX_DELETED_CLIENT.md)** - Résoudre l'erreur "OAuth client deleted"
- **[FIX_GOOGLE_OAUTH.md](oauth/FIX_GOOGLE_OAUTH.md)** - Fix général OAuth Google
- **[DEBUG_OAUTH_REDIRECTION.md](oauth/DEBUG_OAUTH_REDIRECTION.md)** - Debug des redirections OAuth
- **[GOOGLE_OAUTH_SETUP.md](oauth/GOOGLE_OAUTH_SETUP.md)** - Configuration initiale Google OAuth

### 🚀 Déploiement (`/deploiement`)
Guides de déploiement pour zig-zag.fun et game.zig-zag.fun.

- **[DEPLOIEMENT_RAPIDE.md](deploiement/DEPLOIEMENT_RAPIDE.md)** - Guide rapide en 3 étapes
- **[SOLUTION_FINALE.md](deploiement/SOLUTION_FINALE.md)** - Guide complet avec troubleshooting
- **[DIAGNOSTIC_COMPLET.md](deploiement/DIAGNOSTIC_COMPLET.md)** - Diagnostic approfondi des problèmes
- **[DEPLOIEMENT_GAME_ZIGZAG_FUN.md](deploiement/DEPLOIEMENT_GAME_ZIGZAG_FUN.md)** - Déploiement spécifique de l'app Next.js

### 📜 Règles du Projet
Règles et conventions de développement.

- **[rules-frontend.md](rules-frontend.md)** - Règles frontend (HTML/CSS/JS, React)
- **[rules-backend.md](rules-backend.md)** - Règles backend (Python, API)
- **[rules-supabase.md](rules-supabase.md)** - Configuration Supabase + MCP
- **[rules-security.md](rules-security.md)** - Règles de sécurité et données
- **[rules-workflow.md](rules-workflow.md)** - Workflow de développement et tests
- **[RULES_SYSTEM.md](RULES_SYSTEM.md)** - Système de gestion des règles
- **[RULES_CHANGELOG.md](RULES_CHANGELOG.md)** - Historique des modifications des règles

### 🎨 Fonctionnalités
Documentation des fonctionnalités spécifiques.

- **[MULTILINGUE.md](MULTILINGUE.md)** - Gestion du multilingue (i18n)
- **[COOKIES_RGPD.md](COOKIES_RGPD.md)** - Gestion des cookies et RGPD
- **[CHATBOT_DESIGN_OPTIONS.md](CHATBOT_DESIGN_OPTIONS.md)** - Options de design du chatbot

### 📦 Archives (`/archives`)
Anciens guides et documentation obsolète (conservés pour référence).

---

## 🚀 Démarrage Rapide

### 1. Premier Déploiement
Suivez dans l'ordre :
1. [Guide Rapide de Déploiement](deploiement/DEPLOIEMENT_RAPIDE.md)
2. [Actions OAuth Requises](oauth/ACTIONS_OAUTH_REQUISES.md)

### 2. Problèmes OAuth
Si OAuth ne fonctionne pas :
1. [Checklist OAuth](oauth/CHECKLIST_OAUTH_GOOGLE.md)
2. [Fix Redirection](oauth/FIX_REDIRECTION_ZIGZAG_HASH.md)
3. [Diagnostic Complet](deploiement/DIAGNOSTIC_COMPLET.md)

### 3. Problèmes de Déploiement
Si l'application ne se charge pas :
1. [Diagnostic Complet](deploiement/DIAGNOSTIC_COMPLET.md)
2. [Solution Finale](deploiement/SOLUTION_FINALE.md)

---

## 📖 Guides par Thème

### Pour les Développeurs
- [Règles Frontend](rules-frontend.md)
- [Règles Backend](rules-backend.md)
- [Workflow de Développement](rules-workflow.md)

### Pour le Déploiement
- [Déploiement Rapide](deploiement/DEPLOIEMENT_RAPIDE.md)
- [Déploiement Game App](deploiement/DEPLOIEMENT_GAME_ZIGZAG_FUN.md)

### Pour la Sécurité
- [Règles de Sécurité](rules-security.md)
- [Configuration Supabase](rules-supabase.md)

### Pour OAuth
- [Configuration Complète](oauth/PROCEDURE_OAUTH_COMPLETE.md)
- [Troubleshooting](oauth/CHECKLIST_OAUTH_GOOGLE.md)

---

## 🔍 Index des Problèmes Courants

### OAuth redirige vers zig-zag.fun/# au lieu de oauth-callback
→ [FIX_REDIRECTION_ZIGZAG_HASH.md](oauth/FIX_REDIRECTION_ZIGZAG_HASH.md)

### Erreur "OAuth client was deleted"
→ [FIX_DELETED_CLIENT.md](oauth/FIX_DELETED_CLIENT.md)

### Erreur "Failed to load chunk"
→ [DIAGNOSTIC_COMPLET.md](deploiement/DIAGNOSTIC_COMPLET.md)

### Page /auth/callback n'existe pas (404)
→ [SOLUTION_FINALE.md](deploiement/SOLUTION_FINALE.md)

### L'utilisateur n'est pas connecté après OAuth
→ [CHECKLIST_OAUTH_GOOGLE.md](oauth/CHECKLIST_OAUTH_GOOGLE.md)

---

## 🤝 Contribution

Avant toute modification de la documentation :
1. Consultez [RULES_SYSTEM.md](RULES_SYSTEM.md)
2. Documentez vos changements dans [RULES_CHANGELOG.md](RULES_CHANGELOG.md)
3. Mettez à jour cet index si nécessaire

---

© 2025 ZigZag. Tous droits réservés.
