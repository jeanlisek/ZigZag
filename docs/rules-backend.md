# Règles Backend (Python)

## Emplacement
- `Zig-Zag_9-12-25/main.py` (template minimal).
- Dépendances gérées par `pyproject.toml` / `uv.lock`.

## Dépendances clés
- `onnxruntime`, `pillow`, `rembg` (traitement d'images).

## Conventions
- Python ≥ 3.11.
- Type hints quand possible.
- Docstrings pour les fonctions.
- Gestion d'erreurs explicite (exceptions claires).
- ASCII par défaut.

## Tests / exécution
- Utiliser `uv run` (ou venv équivalent) pour tester.
- Vérifier les imports manquants avant ajout de nouvelles features.

## Sécurité
- Pas de secrets en dur (utiliser variables d'environnement).
- Si ajout d'API/backends, respecter le RLS Supabase ; pas de désactivation sans motif.

## Changements récents
- Voir `RULES_CHANGELOG.md` pour l'historique complet
