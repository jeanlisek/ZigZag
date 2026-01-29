# 🚀 Guide de Démarrage - Zigzag Dashboard

## Installation et Lancement

### 1. Installer les dépendances

Ouvrez un terminal dans le dossier `frontend/dashboard` et exécutez :

```bash
npm install
```

ou si vous utilisez yarn :

```bash
yarn install
```

### 2. Lancer le serveur de développement

```bash
npm run dev
```

Le dashboard sera accessible à l'adresse : **http://localhost:5173**

### 3. Build pour la production

```bash
npm run build
```

Les fichiers de production seront générés dans le dossier `dist/`.

---

## 📊 Fonctionnalités du Dashboard

### Vue d'ensemble

Le dashboard affiche en temps réel :

- **Nombre total d'utilisateurs**
- **Parties actives** en cours
- **Inscrits à la newsletter**
- **Messages de contact** reçus

### Graphiques

1. **Activité des 7 derniers jours** : Histogramme montrant le nombre de parties créées par jour
2. **Distribution des parties** : Graphique circulaire (actifs/complétés/abandonnés)
3. **Croissance des utilisateurs** : Courbe de tendance sur 7 jours

### Listes

- **Parties récentes** : Les 6 dernières parties avec leur statut
- **Utilisateurs récents** : Les 5 derniers utilisateurs inscrits

---

## 🔌 Connexion à Supabase

Le dashboard est **déjà configuré** pour se connecter à votre base Supabase.

### Configuration actuelle

Fichier : `src/lib/supabase.ts`

```typescript
const SUPABASE_URL = "https://tihrltssmpxpreadpzqm.supabase.co"
const SUPABASE_ANON_KEY = "votre_clé_anon"
```

### Tables utilisées

Le dashboard récupère les données des tables suivantes :

1. **users** - Utilisateurs du jeu
   - `id`, `email`, `pseudo`, `created_at`, `last_seen`

2. **zigs** - Parties de jeu
   - `id`, `status`, `created_at`, `completed_at`

3. **newsletter_signups** - Inscrits à la newsletter
   - `id`, `email`, `created_at`

4. **contact_messages** - Messages de contact
   - `id`, `email`, `message`, `created_at`

---

## 🎨 Personnalisation

### Couleurs du thème

Le dashboard utilise les couleurs de Zigzag :

- **Cyan** : `#06b6d4` - Couleur principale
- **Rose** : `#ec4899` - Couleur secondaire
- **Orange** : `#f97316` - Couleur d'accent

Pour modifier les couleurs, éditez le fichier `src/index.css`.

### Composants

Tous les composants UI sont dans `src/components/ui/` et peuvent être personnalisés.

---

## 📱 Responsive

Le dashboard est entièrement responsive et s'adapte à :

- **Mobile** (< 768px)
- **Tablette** (768px - 1024px)
- **Desktop** (> 1024px)

---

## 🐛 Dépannage

### Le dashboard ne charge pas les données

1. Vérifiez que Supabase est accessible
2. Vérifiez les tables dans votre base de données
3. Ouvrez la console du navigateur pour voir les erreurs

### Erreurs d'installation

Si vous avez des erreurs lors de `npm install` :

```bash
# Supprimez node_modules et package-lock.json
rm -rf node_modules package-lock.json

# Réinstallez
npm install
```

### Le serveur ne démarre pas

Vérifiez que le port 5173 n'est pas déjà utilisé :

```bash
# Windows
netstat -ano | findstr :5173

# Mac/Linux
lsof -i :5173
```

---

## 🔐 Sécurité

⚠️ **Important** : 

- Le dashboard utilise uniquement la **clé publique (anon key)** de Supabase
- Ne jamais exposer la `service_role_key` côté client
- Les règles RLS (Row Level Security) de Supabase doivent être configurées

---

## 📚 Documentation

- [React](https://react.dev/)
- [TypeScript](https://www.typescriptlang.org/)
- [Tailwind CSS](https://tailwindcss.com/)
- [shadcn/ui](https://ui.shadcn.com/)
- [Supabase](https://supabase.com/docs)
- [Recharts](https://recharts.org/)

---

## ✨ Prochaines étapes

1. **Filtres** : Ajouter des filtres par date
2. **Export** : Permettre l'export des données en CSV
3. **Notifications** : Alertes en temps réel
4. **Authentification** : Système de login pour les admins

---

Bon développement ! 🎮

