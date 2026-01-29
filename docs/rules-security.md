# Règles Sécurité & Données

## Secrets et clés
- Ne jamais commiter de clés privées (`service_role`, tokens).
- Côté client : clé anon uniquement.
- Utiliser des variables d'environnement (VITE_* pour le front).

## RLS / Accès
- RLS activé sur toutes les tables : ne pas le désactiver sans motif.
- Utiliser le mode read-only quand la consultation suffit (MCP/SQL).
- Limiter les colonnes retournées et paginer les résultats.

## Authentification admin
- Credentials à externaliser, jamais en dur en prod.
- Sessions localStorage 24h max, vérifier l'expiration.
- Demander confirmation avant toute action destructrice (delete, reset).

## Données utilisateur
- Respect RGPD : pas d'exposition de données perso sans consentement.
- Masquer les données sensibles dans les logs/réponses.

## Réseau / poste
- Autoriser `https://mcp.supabase.com/mcp` pour le MCP.
- Navigateur par défaut configuré pour l'auth Supabase (OAuth).

## Changements récents
- Voir `RULES_CHANGELOG.md` pour l'historique complet
