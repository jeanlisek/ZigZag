# Règles Supabase & MCP

## Projet
- URL : `https://tihrltssmpxpreadpzqm.supabase.co`
- Project Ref : `tihrltssmpxpreadpzqm`
- Clé côté client : anon uniquement (clé publique).
- Ne jamais exposer `service_role`.

## Tables principales
- `users`, `zigs`, `steps`, `participants`
- `newsletter_signups`, `contact_messages`
- `daily_costs`, `weekly_checklist`
- RLS activé sur toutes les tables.

## Bonnes pratiques SQL
- Pas de `select *` sur données sensibles ; limiter colonnes et paginer.
- Utiliser `gen_random_uuid()` pour les IDs.
- Requêtes paramétrées ; vérifier les indexes (date, user_id, zig_id).
- Tester les migrations dans l’éditeur SQL Supabase (ou branche dev).

## MCP Supabase
- Serveur : `https://mcp.supabase.com/mcp?project_ref=tihrltssmpxpreadpzqm`
- Outils utiles : `list_tables`, `execute_sql`, `get_logs`, `search_docs`.
- Lire et valider chaque appel d’outil ; préférer le mode read-only pour la consultation.
- Éviter les actions destructrices sans confirmation explicite.

## Auth / Admin
- Sessions admin stockées en localStorage (24h).
- Credentials admin à externaliser (env), jamais en dur en prod.
- Vérifier la session avant chaque action sur le dashboard admin.




