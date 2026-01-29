# Règles Workflow & Tests

## Avant de modifier
1) Lire la doc pertinente (`FEATURES_SUMMARY.md`, guides d’intégration).
2) Comprendre les dépendances (front ↔ Supabase, admin ↔ RLS).
3) Vérifier les clés/config locales (Supabase anon, pas de service_role).

## Pendant
- Plan en étapes ; demander confirmation pour actions destructrices.
- Respecter les conventions existantes (lint/format si indiqué).
- Découper en petits changements, commentés seulement si non évidents.

## Après
- Résumer les changements et les fichiers touchés.
- Proposer les prochaines vérifs/tests.
- Ne pas écraser/supprimer sans accord.

## Tests à faire
- Connexion Supabase (`test_supabase_connection.js`).
- Formulaire contact (validation + insertion).
- Dashboard admin : filtres, pagination, exports.
- Auth/inscription (jouer.html).
- Création parties (`zigs`, `steps`, `participants`).
- Responsive (mobile/tablette/desktop) + erreurs console.

## Performance / qualité
- Pagination (20 éléments) et cache (30s) côté admin.
- Éviter `select *`; limiter colonnes ; ajouter index si besoin (SQL).
- Vérifier RLS après migrations.




