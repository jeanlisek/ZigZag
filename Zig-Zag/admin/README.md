# Zigzag - Le jeu qui déforme vos messages

Projet de jeu en ligne où les messages sont déformés à travers le monde en 7 étapes.

## 📁 Structure du projet

```
new_version/
├── docs/                    # Documentation du projet
│   ├── rules-*.md          # Règles de développement
│   └── *.md                # Guides et documentation
├── frontend/               # Code frontend
│   ├── public/             # Pages HTML
│   ├── scripts/            # Fichiers JavaScript
│   ├── styles/             # Fichiers CSS
│   └── assets/             # Images et ressources
│       └── generated_images/
├── backend/                # Code backend Python
│   ├── main.py
│   ├── pyproject.toml
│   └── uv.lock
├── database/               # Scripts SQL
│   └── *.sql
└── workspace.code-workspace
```

## 🚀 Démarrage rapide

### Frontend
Les pages HTML sont dans `frontend/public/`. Ouvrez simplement `index.html` dans un navigateur ou servez-les avec un serveur local.

### Backend
```bash
cd backend
uv run main.py
```

## 📚 Documentation

Consultez les fichiers dans `docs/` pour :
- Règles de développement (frontend, backend, sécurité)
- Guides d'intégration
- Configuration Supabase

## 🔧 Technologies

- **Frontend** : HTML, CSS, JavaScript
- **Backend** : Python
- **Base de données** : Supabase
- **Dépendances** : Voir `backend/pyproject.toml`

## 📝 Notes

- Les clés Supabase sont configurées dans les fichiers HTML (clé anon uniquement)
- Ne jamais exposer la clé `service_role` côté client
- Respecter les règles RLS de Supabase




