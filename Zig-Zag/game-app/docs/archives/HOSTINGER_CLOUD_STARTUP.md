# 🚀 Configuration Hostinger Cloud Startup - ZigZag Game App

## 📋 Informations du Projet

- **Framework** : Next.js 16.0.8
- **Runtime** : Node.js
- **Version Node.js recommandée** : **Node.js 20 LTS** (ou minimum Node.js 18.17+)
- **TypeScript** : Oui
- **Build Command** : `npm run build`
- **Start Command** : `npm start`
- **Port** : 3000 (par défaut, ou celui configuré par Hostinger)

---

## ⚙️ Configuration dans Hostinger Cloud Startup

### 1. Préréglage de Framework

Dans le panneau Hostinger Cloud Startup, sélectionnez :

**Option 1 (Recommandée)** : **Next.js**
- Si Hostinger propose un préréglage "Next.js", utilisez-le
- Il configurera automatiquement les commandes de build et start

**Option 2 (Alternative)** : **Node.js**
- Si Next.js n'est pas disponible, choisissez "Node.js"
- Vous devrez configurer manuellement les commandes (voir ci-dessous)

---

### 2. Version de Node.js

**Recommandation** : **Node.js 20.x LTS** (version stable et recommandée)

**Alternatives acceptables** :
- Node.js 18.17+ (minimum requis pour Next.js 16)
- Node.js 22.x (si disponible, mais 20 LTS est plus stable)

⚠️ **À éviter** : Node.js 16 ou inférieur (non compatible avec Next.js 16)

---

### 3. Commandes de Build et Start

Si vous devez configurer manuellement (Option 2) :

#### Build Command
```bash
npm install && npm run build
```

#### Start Command
```bash
npm start
```

#### Working Directory
```
game-app
```
(ou le chemin relatif vers votre dossier `game-app`)

---

### 4. Variables d'Environnement

Dans le panneau Hostinger, ajoutez ces variables d'environnement :

```env
NEXT_PUBLIC_SUPABASE_URL=https://votre-projet.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=votre_clé_anon_supabase
NODE_ENV=production
```

**Comment trouver ces valeurs** :
- `NEXT_PUBLIC_SUPABASE_URL` : Dans votre dashboard Supabase → Settings → API → Project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` : Dans votre dashboard Supabase → Settings → API → Project API keys → `anon` `public`

---

### 5. Port et URL

- **Port par défaut** : 3000
- **URL de l'application** : Hostinger vous fournira une URL (ex: `votre-app.hostinger.com`)

Si Hostinger utilise un port différent, il sera automatiquement configuré via la variable d'environnement `PORT`.

---

### 6. Structure des Fichiers à Uploader

Uploadez uniquement le contenu du dossier `game-app/` :

```
game-app/
├── src/
├── public/
├── package.json
├── package-lock.json
├── next.config.ts
├── tsconfig.json
├── .env.local (optionnel, utilisez plutôt les variables d'environnement Hostinger)
└── ... (tous les autres fichiers)
```

**Ne pas uploader** :
- `node_modules/` (sera installé via `npm install`)
- `.next/` (sera généré lors du build)
- `.git/`

---

### 7. Checklist de Déploiement

- [ ] Créer l'application dans Hostinger Cloud Startup
- [ ] Sélectionner le préréglage **Next.js** (ou Node.js)
- [ ] Choisir **Node.js 20 LTS** (ou 18.17+)
- [ ] Configurer les variables d'environnement (Supabase)
- [ ] Uploader les fichiers du dossier `game-app/`
- [ ] Vérifier que le build se lance automatiquement
- [ ] Tester l'URL fournie par Hostinger
- [ ] Vérifier que l'application répond sur `/jeu`

---

### 8. Commandes Utiles (SSH - si disponible)

Si vous avez accès SSH :

```bash
# Se connecter au serveur
ssh username@votre-serveur.hostinger.com

# Aller dans le dossier de l'application
cd /chemin/vers/game-app

# Vérifier la version de Node.js
node --version

# Vérifier les logs
pm2 logs zigzag-game  # Si PM2 est utilisé
# ou
tail -f /var/log/app.log  # Selon la configuration Hostinger

# Redémarrer l'application
pm2 restart zigzag-game  # Si PM2 est utilisé
```

---

### 9. Résolution de Problèmes

#### Erreur : "Next.js not found"
- Vérifiez que `package.json` contient `"next": "16.0.8"`
- Exécutez `npm install` manuellement

#### Erreur : "Node.js version incompatible"
- Vérifiez que vous utilisez Node.js 18.17+ ou 20.x
- Changez la version dans les paramètres Hostinger

#### Erreur : "Environment variables not found"
- Vérifiez que les variables `NEXT_PUBLIC_*` sont bien configurées dans Hostinger
- Redémarrez l'application après avoir ajouté les variables

#### L'application ne démarre pas
- Vérifiez les logs dans le panneau Hostinger
- Vérifiez que le port est correctement configuré
- Vérifiez que `npm start` fonctionne en local

---

### 10. Configuration Alternative : Build Statique (si Node.js n'est pas disponible)

Si Hostinger Cloud Startup ne supporte pas Node.js, vous pouvez exporter une version statique :

```bash
# Dans votre environnement local
cd game-app
npm install
npm run build
```

Ensuite, modifiez `next.config.ts` pour activer l'export statique :

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true
  }
};

export default nextConfig;
```

Puis uploadez le dossier `out/` généré sur votre hébergement statique.

⚠️ **Limitation** : L'export statique ne supporte pas les routes dynamiques avec `[game_id]` ou `[room_code]`. Pour le jeu multijoueur, vous avez besoin d'un serveur Node.js.

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs dans le panneau Hostinger
2. Consultez la documentation Hostinger Cloud Startup
3. Contactez le support Hostinger avec les détails de votre configuration

---

**Dernière mise à jour** : Configuration pour Next.js 16.0.8 et Node.js 20 LTS
