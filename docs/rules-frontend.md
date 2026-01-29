# Règles Frontend (Zigzag)

## Structure
- Dossier : `Zig-Zag/`
- Pages : `index.html`, `jouer.html`, `contact.html`, `admin.html`, `mentions-legales.html`, `presse.html`, `404.html`, `500.html`
- Scripts : `script.js`, `admin.js`, `admin_advanced.js`, `chatbot.js`, `cookies.js`, `i18n.js`
- Styles : `style.css`, `chatbot.css`, `cookies.css`
- Assets : `attached_assets/` (+ `generated_images/`)
- PWA : `manifest.json`, `sw.js`

## HTML
- `lang="fr"`, meta viewport, structure sémantique.
- Charger Supabase via CDN UMD `@supabase/supabase-js@2`.
- Référencer `supabaseClient` en global.

## CSS
- Mobile-first, classes utilitaires (style Tailwind-like).
- Animations douces ; respecter les variables de couleurs/thèmes.

## JavaScript
- `const`/`let`, pas de `var`.
- Async/await pour Supabase ; try/catch explicite.
- Commenter uniquement les parties complexes (analytics, cohortes).
- Éviter les `select *` en prod ; limiter les colonnes et paginer.
- Respecter le cache (30s) et la pagination (20 items) côté admin.

## Pages clés
- `index.html` : landing + newsletter (Supabase). Navigation interne sans modifier l'URL (ancres gérées via `script.js`).
- `jouer.html` : auth Supabase, création parties (`zigs`, `steps`, `participants`).
- `contact.html` : formulaire -> table `contact_messages`.
- `admin.html` : dashboard (metrics, filtres, exports), dépend de `admin.js` + `admin_advanced.js`.
- `presse.html` : espace presse et partenariats.
- `mentions-legales.html` : mentions légales et RGPD.
- `404.html` : page d'erreur 404 personnalisée (configurée dans `.htaccess`).
- `500.html` : page d'erreur 500 (erreur serveur) personnalisée (configurée dans `.htaccess`).

## Progressive Web App (PWA)
- **Fichiers** : `manifest.json`, `sw.js`
- **Fonctionnalité** : Le site est installable comme une application sur mobile et desktop
- **Installation** :
  - Sur mobile : bannière d'installation ou menu "Ajouter à l'écran d'accueil"
  - Sur desktop : icône d'installation dans la barre d'adresse (Chrome/Edge)
- **Fonctionnalités PWA** :
  - Mode standalone (plein écran sans barre d'adresse)
  - Cache intelligent des pages visitées
  - Fonctionnement hors ligne basique
  - Mise à jour automatique du cache
- **Configuration** :
  - `manifest.json` : métadonnées de l'app (nom, icônes, couleurs, raccourcis)
  - `sw.js` : Service Worker pour le cache et le fonctionnement hors ligne
  - Meta tags PWA dans tous les fichiers HTML
  - Headers HTTP configurés dans `.htaccess`
- **Icônes** : Utilise `attached_assets/image_1763569221576.png` pour les icônes PWA
- **Couleurs** : Theme color `#F54291` (rose), Background color `#40C4D4` (turquoise)

## Navigation
- Les liens de navigation utilisent l'attribut `data-section` au lieu d'ancres dans l'URL.
- Format : `<a href="/" data-section="how-it-works">Comment ça marche</a>`
- Les ancres ne sont jamais visibles dans l'URL, même sur la page d'accueil.
- Le script `script.js` intercepte les clics via `data-section` et gère le scroll sans modifier l'URL.
- Depuis une autre page, redirection vers `/` puis scroll automatique vers la section cible.
- Fonctions utilisées : `isAnchorLink()`, `extractSectionId()`, `handleAnchorClick()`

## Informations de contact
- Email principal : `team@zig-zag.fun`
- Réseaux sociaux :
  - X (Twitter) : `https://x.com/PlayZigZagTeam`
  - Instagram : `https://www.instagram.com/zigzag.fun/`
  - TikTok : `https://www.tiktok.com/@zigzag.fun`
  - Discord : `https://discord.gg/kfk6mnkmJj`

## Supabase côté client
- URL : `https://tihrltssmpxpreadpzqm.supabase.co`
- Clé : anon seulement ; ne jamais exposer `service_role`.
- Toujours gérer les erreurs et afficher un message utilisateur clair.

## Tests front à faire
- Responsive (mobile/tablette/desktop).
- Flux auth Supabase (jouer.html).
- Formulaire contact (validation + insertion).
- Dashboard admin : chargement, filtres, pagination, exports.

## Chatbot/Assistant IA
- **Fichiers** : `chatbot.css`, `chatbot.js`
- **Intégration** : Tous les fichiers HTML incluent `<link rel="stylesheet" href="chatbot.css">` et `<script src="chatbot.js"></script>`
- **Design** : Glassmorphism moderne avec transparence, blur, animations et effets visuels
- **Fonctionnalités** :
  - Bouton toggle en bas à droite avec animation et design glassmorphism
  - Panneau de chat transparent avec effets de profondeur
  - Header avec glassmorphism et barre de gradient animée
  - Indicateur de frappe animé (typing indicator)
  - Questions contextuelles après chaque réponse
  - Liens cliquables automatiques dans les réponses
  - Bouton copier sur chaque message
  - Historique sauvegardé dans localStorage
  - Détection d'intention améliorée avec synonymes
  - Réponses variées pour chaque question
  - Support multilingue (i18n) - FR/EN
  - Export de conversation en fichier texte
  - Feedback utilisateur (utile/pas utile)
  - Accessibilité améliorée (ARIA, navigation clavier)
  - Particules flottantes en arrière-plan (optionnel)
- **8 questions prédéfinies** basées sur `HelloZigZag_agent.yaml`
  - Réponses intelligentes avec détection de mots-clés
  - Badge de notification pour attirer l'attention
- **Style** : Design moderne avec dégradé rose/rouge, animations fluides

## URLs propres
- **Configuration** : `.htaccess` gère la réécriture d'URL
- **Format** : URLs sans extension `.html` (ex: `/contact` au lieu de `/contact.html`)
- **Redirection** : Les anciennes URLs avec `.html` redirigent automatiquement vers les nouvelles (301)
- **Liens internes** : Tous les liens utilisent des URLs sans extension
- **Page d'accueil** : `/` au lieu de `index.html`

## Bannière de consentement aux cookies (RGPD)
- **Fichiers** : `cookies.css`, `cookies.js`
- **Fonctionnalité** : Bannière de consentement conforme RGPD avec panneau de paramètres
- **Catégories** : Cookies nécessaires (toujours activés), analytiques, marketing
- **Stockage** : Préférences sauvegardées dans `localStorage`
- **Conformité** : Consentement explicite, choix granulaire, facilité de retrait
- **Documentation** : Voir `docs/COOKIES_RGPD.md` pour les détails

## Système multilingue (i18n)
- **Fichiers** : `i18n.js`
- **Fonctionnalité** : Détection automatique de la langue et sélecteur de langue
- **Langues supportées** : Français (par défaut), Anglais
- **Utilisation** : Attribut `data-i18n` sur les éléments à traduire
- **Sélecteur** : Boutons fixes en haut à droite pour changer de langue
- **Persistance** : Langue sauvegardée dans `localStorage`
- **Documentation** : Voir `docs/MULTILINGUE.md` pour les détails

## Changements récents
- **2025-01-XX** : Ajout bannière de consentement aux cookies RGPD
- **2025-01-XX** : Ajout système multilingue (FR/EN)
- **2025-01-XX** : Ajout fonctionnalité PWA (Progressive Web App)
- **2025-01-XX** : Ajout chatbot/Assistant IA
- **2025-01-XX** : URLs propres sans extension `.html`
- **2025-01-XX** : Navigation sans ancres visibles dans l'URL
- **2025-01-XX** : Ajout section "Informations de contact" et "Navigation"
- **2025-01-XX** : Correction nom dossier `Zig-Zag/`
- Voir `RULES_CHANGELOG.md` pour l'historique complet

