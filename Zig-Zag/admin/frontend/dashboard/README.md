# Zigzag Dashboard

Dashboard d'administration pour le jeu Zigzag, développé avec React, TypeScript, et Tailwind CSS.

## 🚀 Démarrage rapide

### Installation

```bash
npm install
# ou
yarn install
# ou
pnpm install
```

### Développement

```bash
npm run dev
```

Le dashboard sera accessible à `http://localhost:5173`

### Build de production

```bash
npm run build
```

## 🛠️ Technologies utilisées

- **React 18** avec TypeScript
- **Vite** comme bundler
- **Tailwind CSS** pour le styling
- **shadcn/ui** pour les composants UI
- **Recharts** pour les graphiques
- **Supabase** pour la base de données
- **Lucide React** pour les icônes

## 📊 Fonctionnalités

- **Vue d'ensemble** : Statistiques en temps réel
- **Graphiques** : Visualisation de l'activité des 7 derniers jours
- **Parties récentes** : Liste des dernières parties créées
- **Utilisateurs** : Gestion et visualisation des utilisateurs
- **Distribution** : Graphiques circulaires des statuts de parties
- **Tendances** : Courbe de croissance des utilisateurs

## 🎨 Design

Le dashboard utilise un thème sombre avec les couleurs de la marque Zigzag :
- **Cyan** (#06b6d4) - Couleur principale
- **Rose** (#ec4899) - Couleur secondaire  
- **Orange** (#f97316) - Couleur d'accent

## 📁 Structure

```
src/
├── components/
│   ├── ui/              # Composants shadcn/ui
│   └── ZigzagDashboard.tsx  # Composant principal
├── lib/
│   ├── utils.ts         # Utilitaires
│   └── supabase.ts      # Configuration Supabase
├── App.tsx
├── main.tsx
└── index.css
```

## 🔐 Configuration Supabase

Les identifiants Supabase sont configurés dans `src/lib/supabase.ts`. 
Assurez-vous d'utiliser uniquement la clé publique (anon key) côté client.

## 📝 Notes

- Le dashboard récupère les données en temps réel depuis Supabase
- Tous les graphiques sont interactifs
- Le design est responsive (mobile, tablette, desktop)

