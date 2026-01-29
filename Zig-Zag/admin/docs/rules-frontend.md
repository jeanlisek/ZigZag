# Règles Frontend (Zigzag)

## Structure
- Dossier : `Zig-Zag_9-12-25/`
- Pages : `index.html`, `jouer.html`, `contact.html`, `admin.html`, `mentions-legales.html`, `presse.html`
- Scripts : `script.js`, `admin.js`, `admin_advanced.js`
- Styles : `style.css`
- Assets : `attached_assets/` (+ `generated_images/`)

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
- `index.html` : landing + newsletter (Supabase).
- `jouer.html` : auth Supabase, création parties (`zigs`, `steps`, `participants`).
- `contact.html` : formulaire -> table `contact_messages`.
- `admin.html` : dashboard (metrics, filtres, exports), dépend de `admin.js` + `admin_advanced.js`.

## Supabase côté client
- URL : `https://tihrltssmpxpreadpzqm.supabase.co`
- Clé : anon seulement ; ne jamais exposer `service_role`.
- Toujours gérer les erreurs et afficher un message utilisateur clair.

## Tests front à faire
- Responsive (mobile/tablette/desktop).
- Flux auth Supabase (jouer.html).
- Formulaire contact (validation + insertion).
- Dashboard admin : chargement, filtres, pagination, exports.




