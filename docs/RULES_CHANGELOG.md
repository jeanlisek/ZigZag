# Changelog des Règles du Projet ZigZag

Ce fichier suit tous les changements apportés aux règles du projet.

## Format
- **Date** : Date du changement
- **Type** : `Ajout` | `Modification` | `Correction` | `Suppression`
- **Fichier** : Fichier de règles concerné
- **Description** : Détails du changement

---

## 2025-01-XX

### Nettoyage et réorganisation du dossier SQL
- **Fichiers** : `Zig-Zag/sql/`
- **Description** : 
  - Création de `01_complete_schema.sql` avec toutes les tables (users, newsletter_signups, contact_messages, zigs, participants, games, steps, rooms, players, daily_costs, weekly_checklist)
  - Réorganisation des fichiers avec numérotation (02_fix_users_table.sql, 03_update_checklist_days.sql, 04_admin_schema.sql)
  - Suppression des anciens fichiers dupliqués
  - Création d'un README.md pour expliquer l'organisation
  - Tous les schémas sont maintenant synchronisés avec la base de données Supabase

### Ajout - Informations de contact et réseaux sociaux
- **Fichier** : `rules-frontend.md`
- **Description** : Ajout d'une section "Informations de contact" avec l'email principal `team@zig-zag.fun` et tous les liens de réseaux sociaux (X, Instagram, TikTok, Discord)

### Ajout - Navigation sans modification d'URL
- **Fichier** : `rules-frontend.md`
- **Description** : Documentation de la fonctionnalité de navigation interne qui empêche la modification de l'URL lors des clics sur les ancres (`#how-it-works`, `#features`, `#gallery`)

### Correction - Nom du dossier
- **Fichier** : `rules-frontend.md`
- **Description** : Correction du nom du dossier de `Zig-Zag_9-12-25/` vers `Zig-Zag/`

### Ajout - Système de suivi des changements
- **Fichier** : `RULES_CHANGELOG.md` (nouveau fichier)
- **Description** : Création du système de suivi des changements pour maintenir les règles à jour

### Ajout - Guide du système de règles
- **Fichier** : `RULES_SYSTEM.md` (nouveau fichier)
- **Description** : Création du guide expliquant le fonctionnement du système de gestion des règles

### Modification - Sections "Changements récents"
- **Fichiers** : Tous les fichiers de règles (`rules-*.md`)
- **Description** : Ajout d'une section "Changements récents" dans chaque fichier de règles pointant vers le changelog

### Modification - .cursorrules
- **Fichier** : `.cursorrules`
- **Description** : Ajout d'une section "Système de suivi des règles" avec instructions pour consultation et mise à jour automatique

### Ajout - Règle de synchronisation SQL obligatoire
- **Fichiers** : `.cursorrules`, `rules-supabase.md`, `rules-workflow.md`
- **Description** : 
  - Ajout d'une règle **OBLIGATOIRE** de mise à jour des fichiers SQL dans `Zig-Zag/sql/` après chaque modification de la base de données
  - Mise à jour automatique de `01_complete_schema.sql` lors de changements de schéma
  - Création de fichiers de migration numérotés pour les modifications directes dans Supabase
  - Vérification de synchronisation après chaque modification

### Ajout - Règle d'orthographe du nom du projet
- **Fichiers** : `.cursorrules`
- **Description** : 
  - Ajout d'une règle concernant l'orthographe officielle du projet : **ZigZag** (Z majuscule, i minuscule, g minuscule, Z majuscule, a minuscule, g minuscule)
  - Correction de toutes les occurrences de "Zigzag" (avec z minuscule) dans les fichiers HTML, titres, et textes utilisateur
  - Exception : URLs, noms de dossiers/fichiers, variables de code peuvent utiliser `zigzag` en minuscules

### Correction - Orthographe du nom du projet dans les fichiers HTML
- **Fichiers** : `index.html`, `contact.html`, `presse.html`, `mentions-legales.html`, `jouer.html`, `admin.html`
- **Description** : Correction de toutes les occurrences de "Zigzag" en "ZigZag" dans :
  - Titres de pages (`<title>`)
  - Textes de copyright (`© 2025 ZigZag`)
  - Alt text des images (`alt="ZigZag Logo"`)
  - Textes descriptifs et messages utilisateur

### Ajout - Pages d'erreur personnalisées
- **Fichiers** : `404.html`, `500.html`, `.htaccess`, `rules-frontend.md`
- **Description** : 
  - Page 404 personnalisée (`404.html`) : page introuvable avec design cohérent
  - Page 500 personnalisée (`500.html`) : erreur serveur avec design cohérent
  - Configuration dans `.htaccess` pour rediriger les erreurs 404 et 500 vers ces pages
  - Pages incluent : message d'erreur thématique ZigZag, liens vers les pages principales, navigation et footer complets
  - Documentation ajoutée dans `rules-frontend.md`

### Correction - Bug de navigation depuis les autres pages
- **Fichier** : `script.js`
- **Description** : 
  - Correction du bug de navigation depuis `mentions-legales.html`, `presse.html`, `contact.html`
  - Amélioration de la détection de la page index
  - Utilisation d'un chemin relatif `index.html` au lieu d'un chemin absolu
  - Fonction récursive pour attendre que la section soit disponible avant de scroller
  - Délai initial augmenté à 200ms pour laisser le DOM se charger

### Correction - Rendu des boutons dans les pages d'erreur
- **Fichiers** : `404.html`, `500.html`
- **Description** : 
  - Correction du rendu des boutons en ajoutant la classe `btn` manquante
  - Suppression des styles inline inutiles (`text-decoration: none; display: inline-block;`)
  - Les boutons utilisent maintenant `btn btn-primary` et `btn btn-nav` comme sur le reste du site
  - Rendu cohérent avec le design du site

### Amélioration - Présentation de la section "Que faire maintenant ?" dans 500.html
- **Fichier** : `500.html`
- **Description** : 
  - Simplification de la présentation : liste verticale de boutons avec icônes SVG
  - Chaque bouton utilise les classes `btn btn-primary` ou `btn btn-nav` pour un rendu cohérent
  - Design épuré et élégant, plus facile à parcourir
  - Icônes SVG intégrées dans les boutons pour une meilleure UX
  - Bouton "Réessayez" avec fonctionnalité de rechargement de page

### Amélioration - Présentation de la section "Pages disponibles" dans 404.html
- **Fichier** : `404.html`
- **Description** : 
  - Simplification de la présentation : liste verticale de boutons avec icônes SVG
  - Chaque bouton utilise les classes `btn btn-primary` ou `btn btn-nav` pour un rendu cohérent
  - Design épuré et élégant, plus facile à parcourir
  - Icônes SVG intégrées dans les boutons pour une meilleure UX

### Correction - Navigation depuis presse.html, contact.html, mentions-legales.html
- **Fichiers** : `script.js`, `contact.html`
- **Description** : 
  - Correction du bug où les liens "Comment ça marche", "Expérience unique" et "Galerie" modifiaient encore l'URL depuis certaines pages
  - Ajout de `script.js` manquant dans `contact.html`
  - Refactorisation complète de la gestion des liens d'ancres :
    - Utilisation exclusive de la délégation d'événements en phase de capture pour intercepter AVANT tout autre gestionnaire
    - Fonctions utilitaires `isAnchorLink()` et `extractSectionId()` pour une meilleure maintenabilité
    - Gestion robuste des formats de liens (`/#section`, `#section`, `index.html#section`)
    - Utilisation de `stopImmediatePropagation()` pour empêcher tout autre gestionnaire d'événements
  - Les liens depuis toutes les pages redirigent maintenant correctement vers `index.html` sans modifier l'URL

### Amélioration - Design Glassmorphism pour le Chatbot
- **Fichiers** : `chatbot.css`, `chatbot.js`
- **Description** :
  - Refonte complète du design du chatbot avec style glassmorphism moderne
  - **Caractéristiques** :
    - Panel transparent avec `backdrop-filter: blur(20px)`
    - Bordures élégantes semi-transparentes
    - Animations de gradient en arrière-plan
    - Effet de brillance qui traverse le panel
    - Header avec glassmorphism et barre de gradient animée
    - Avatar avec glow pulsant et effet de halo
    - Bulles de messages avec transparence et blur
    - Questions rapides avec effet shine au survol
    - Zone de saisie avec glassmorphism
    - Scrollbar personnalisée avec gradient ZigZag
    - Particules flottantes en arrière-plan (optionnel)
  - **Effets visuels** :
    - Transparence et profondeur
    - Animations fluides et modernes
    - Cohérence avec l'identité visuelle ZigZag
    - Support du mode sombre
  - **Documentation** : `docs/CHATBOT_DESIGN_OPTIONS.md`
  - **Pages concernées** : Toutes les pages avec le chatbot

### Ajout - Bannière de consentement aux cookies RGPD
- **Fichiers** : `cookies.css`, `cookies.js`, tous les fichiers HTML
- **Description** :
  - Implémentation d'une bannière de consentement aux cookies conforme au RGPD
  - **Fonctionnalités** :
    - Bannière fixe en bas de l'écran avec 3 actions (Accepter tout, Refuser, Paramètres)
    - Panneau de paramètres détaillé avec toggles pour chaque catégorie de cookies
    - Catégories : Cookies nécessaires (toujours activés), analytiques, marketing
    - Stockage des préférences dans `localStorage`
    - Application immédiate des préférences selon les choix de l'utilisateur
  - **Conformité RGPD** :
    - Consentement explicite requis
    - Choix granulaire par catégorie
    - Facilité de modification des préférences
    - Information claire sur chaque catégorie
    - Lien vers les mentions légales
  - **Documentation** : `docs/COOKIES_RGPD.md`
  - **Pages concernées** : Toutes les pages principales

### Ajout - Système multilingue (i18n)
- **Fichiers** : `i18n.js`, tous les fichiers HTML
- **Description** :
  - Système de traduction permettant de basculer entre français et anglais
  - **Fonctionnalités** :
    - Détection automatique de la langue du navigateur
    - Sélecteur de langue fixe en haut à droite
    - Traduction automatique des éléments avec attribut `data-i18n`
    - Sauvegarde de la langue choisie dans `localStorage`
    - Mise à jour dynamique du contenu lors du changement de langue
  - **Utilisation** :
    - Ajouter `data-i18n="clé.traduction"` aux éléments à traduire
    - Les clés suivent une hiérarchie (ex: `nav.how-it-works`, `hero.title`)
    - Support des attributs `data-i18n-alt` et `data-i18n-title`
  - **Langues supportées** : Français (par défaut), Anglais
  - **API globale** : `window.ZigZagI18n` pour utilisation programmatique
  - **Documentation** : `docs/MULTILINGUE.md`
  - **Pages concernées** : `index.html` (partiellement traduit), autres pages à traduire progressivement

### Ajout - Progressive Web App (PWA)
- **Fichiers** : `manifest.json`, `sw.js`, tous les fichiers HTML, `.htaccess`, `script.js`
- **Description** : 
  - Implémentation complète de la fonctionnalité PWA pour permettre l'installation du site sur mobile et desktop
  - **Fichiers créés** :
    - `manifest.json` : Configuration de l'app (nom, description, icônes, couleurs, raccourcis)
    - `sw.js` : Service Worker pour le cache et le fonctionnement hors ligne
  - **Fonctionnalités** :
    - Installation sur mobile (Android/iOS) et desktop (Chrome/Edge)
    - Mode standalone (plein écran sans barre d'adresse)
    - Cache intelligent des pages visitées
    - Fonctionnement hors ligne basique
    - Bannière d'installation personnalisée avec prompt
  - **Intégration** :
    - Meta tags PWA ajoutés dans tous les fichiers HTML
    - Lien vers manifest.json dans tous les `<head>`
    - Icônes Apple Touch pour iOS
    - Enregistrement automatique du Service Worker
    - Headers HTTP configurés dans `.htaccess` pour le Service Worker
  - **Pages concernées** : `index.html`, `contact.html`, `presse.html`, `mentions-legales.html`, `jouer.html`, `404.html`, `500.html`
  - **Avantages** : Installation rapide sans passer par les stores, meilleure rétention utilisateur, expérience app-like

### Amélioration - URLs propres sans extension .html
- **Fichiers** : `.htaccess`, tous les fichiers HTML, `script.js`
- **Description** :
  - Configuration complète pour supprimer les extensions `.html` des URLs
  - Redirection 301 des URLs avec `.html` vers URLs propres (SEO)
  - Réécriture interne : URLs sans extension vers fichiers `.html`
  - Tous les liens internes mis à jour pour utiliser des URLs sans extension
  - Gestion de la page d'accueil : `/` au lieu de `index.html`
  - Pages d'erreur : `/404` et `/500` au lieu de `/404.html` et `/500.html`
  - JavaScript mis à jour pour fonctionner avec les URLs sans extension

### Amélioration - Navigation sans ancres visibles dans l'URL
- **Fichiers** : `script.js`, `index.html`, `contact.html`, `presse.html`, `mentions-legales.html`, `404.html`, `500.html`
- **Description** :
  - Remplacement des liens avec ancres (`/#how-it-works`) par des liens avec attribut `data-section`
  - Les ancres ne sont plus visibles dans l'URL même sur la page d'accueil
  - Utilisation de `data-section="how-it-works"` (ou `features`, `gallery`) au lieu de `href="#how-it-works"`
  - Le script JavaScript intercepte les clics via `data-section` et gère le scroll sans modifier l'URL
  - Expérience utilisateur améliorée : URLs toujours propres

### Ajout - Chatbot/Assistant IA
- **Fichiers** : `chatbot.css`, `chatbot.js`, tous les fichiers HTML
- **Description** :
  - Intégration d'un chatbot/assistant IA sur toutes les pages principales
  - Design moderne avec bouton toggle en bas à droite (même style que référence)
  - Questions prédéfinies cliquables (8 questions basées sur HelloZigZag_agent.yaml)
  - Réponses intelligentes avec détection de mots-clés
  - Réponses génériques pour questions hors-sujet
  - Panneau de chat avec header, messages, questions rapides et champ de saisie
  - Badge de notification pour attirer l'attention

---

## Notes
- Ce changelog est mis à jour automatiquement après chaque modification significative des règles
- Les changements sont documentés immédiatement après leur implémentation
- Consulter ce fichier pour suivre l'évolution des conventions du projet

---

## 2026-01-25

### Ajout - Workflow n8n importable (email Beta)
- **Type** : Ajout
- **Fichiers** : `Zig-Zag/n8n-workflow-email-smtp-direct.json`, `Zig-Zag/RESUME_CONFIGURATION_EMAILS.md`
- **Description** :
  - Création du workflow n8n JSON pour envoyer l'email Beta via SMTP, en récupérant les emails depuis Supabase (`newsletter_signups`)
  - Remplacement des valeurs sensibles en dur par des variables d'environnement (`SUPABASE_ANON_KEY`, `EMAIL_FROM`)
