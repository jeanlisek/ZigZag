# 🎮 Zigzag - Jeu Multijoueur

Application web de jeu multijoueur où les joueurs créent une séquence collaborative (dessin, texte, audio).

## 📁 Structure du Projet

```
Zig-Zag/
├── index.html              # Landing page
├── jouer.html              # Page de connexion/inscription
├── contact.html            # Page de contact
├── mentions-legales.html   # Mentions légales
├── presse.html             # Page presse
├── style.css               # Styles globaux
├── script.js               # Scripts principaux
├── scripts/                # 🔧 Scripts utilitaires
│   └── build-admin.sh      # Script de build du dashboard
├── workflows/              # 🔄 Workflows n8n
│   └── n8n-workflow-*.json
├── templates/              # 📄 Templates HTML
│   └── TEMPLATE_*.html
├── .htaccess               # Configuration serveur
│
├── admin/                  # 📊 Dashboard Admin (React)
│   ├── frontend/dashboard/ # Code source React
│   ├── archive/            # Anciens fichiers admin (archivés)
│   └── ...
│
├── admin-dist/             # Build du dashboard (généré)
│
├── docs/                   # 📚 Documentation
│   ├── deploiement/        # Guides de déploiement
│   ├── upload/             # Guides d'upload (avatars, etc.)
│   ├── configuration/      # Configuration (emails, etc.)
│   ├── instructions/       # Instructions diverses
│   ├── audits/             # Audits et corrections
│   └── ...                 # Autres documentations
│
├── sql/                    # 🗄️ Scripts SQL
│   ├── admin_supabase_schema.sql
│   ├── fix_users_table.sql
│   └── update_checklist_days.sql
│
├── attached_assets/        # 🎨 Assets (images, etc.)
│
└── game-app/               # 🎮 Application Next.js (jeu multijoueur)
    ├── src/
    ├── public/
    ├── package.json
    └── ...
```

## 🚀 Démarrage Rapide

### 1. Fichiers Statiques (Landing, Connexion, Admin)

Les fichiers HTML/CSS/JS à la racine sont les pages statiques du site :
- Déployées sur `zig-zag.fun` (Hostinger)
- Fonctionnent directement sans compilation

### 2. Application Next.js (Jeu Multijoueur)

L'application de jeu est dans le dossier `game-app/` :

```bash
cd game-app
npm install
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

**Configuration requise :**
- Créer un fichier `.env.local` avec :
  ```
  NEXT_PUBLIC_SUPABASE_URL=votre_url_supabase
  NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
  ```

**Documentation complète :** Voir `game-app/README.md` et `game-app/SUPABASE_SETUP.md`

## 📚 Documentation

Toute la documentation est dans le dossier `docs/` :

- **Déploiement** : `docs/HOSTINGER_DEPLOYMENT.md`
- **Guide général** : `docs/DEPLOYMENT_GUIDE.md`
- **Nettoyage** : `docs/CLEANUP_GUIDE.md`
- **Fonctionnalités** : `docs/FEATURES_SUMMARY.md`
- **Intégrations** : `docs/INTEGRATIONS_GUIDE.md`

## 🗄️ Base de Données

Les scripts SQL sont dans le dossier `sql/` :

- **Admin** : `sql/admin_supabase_schema.sql`
- **Corrections** : `sql/fix_users_table.sql`, `sql/update_checklist_days.sql`
- **Jeu** : `game-app/src/lib/supabase/schema.sql`

## 🎯 Architecture

### Production

- **Hostinger** (`zig-zag.fun`) → Fichiers statiques (HTML/CSS/JS)
- **Vercel** → Application Next.js (jeu multijoueur)

### Flux Utilisateur

1. Utilisateur visite `zig-zag.fun`
2. Clique sur "Jouer" → `zig-zag.fun/jouer`
3. Se connecte → Redirigé vers l'application Next.js (Vercel)
4. Joue sur l'application Next.js

## 🔧 Technologies

- **Frontend Statique** : HTML, CSS, JavaScript vanilla
- **Application Jeu** : Next.js 16, React 19, TypeScript
- **Backend** : Supabase (Auth, Database, Realtime)
- **Hébergement** : Hostinger (statique) + Vercel (Next.js)

## 📝 Notes

- Le dashboard admin est maintenant un dashboard React dans `admin/frontend/dashboard/`
- Builder le dashboard avec `./build-admin.sh` (génère `admin-dist/`)
- Les anciens fichiers admin ont été archivés dans `admin/archive/`
- Les assets (images, etc.) sont dans `attached_assets/`
- La documentation complète est dans `docs/`

## 🆘 Support

Pour toute question :
1. Consultez la documentation dans `docs/`
2. Vérifiez les guides spécifiques dans `game-app/`
3. Consultez les scripts SQL dans `sql/`

---

**Dernière mise à jour** : Après nettoyage et réorganisation du projet

