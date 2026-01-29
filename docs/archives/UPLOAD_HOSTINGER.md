# 📤 Guide d'Upload sur Hostinger

## 📋 Fichiers à Uploader sur Hostinger

### ✅ Fichiers Statiques (À Uploader)

Ces fichiers doivent être uploadés dans le dossier `public_html/` (ou `htdocs/`) de votre hébergement Hostinger :

#### 1. Pages HTML
- `index.html`
- `jouer.html`
- `contact.html`
- `admin.html`
- `mentions-legales.html`
- `presse.html`

#### 2. Fichiers CSS et JavaScript
- `style.css`
- `script.js`
- `admin.js`
- `admin_advanced.js`
- `admin_config.example.js`

#### 3. Dossiers
- `attached_assets/` (tout le dossier avec son contenu)

#### 4. Fichiers de Configuration (si nécessaire)
- `.htaccess` (si vous en avez un à la racine)

---

## 🎮 Application Next.js (game-app)

**⚠️ IMPORTANT** : L'application Next.js (`game-app/`) **ne peut PAS** être uploadée directement sur un hébergement partagé Hostinger car elle nécessite Node.js.

### Options pour l'Application Next.js :

1. **Vercel** (Recommandé - Gratuit)
   - Voir `docs/HOSTINGER_DEPLOYMENT.md`
   - Déploiement en 5 minutes
   - Support complet Next.js

2. **VPS Hostinger** (Si vous en avez un)
   - Voir `docs/HOSTINGER_FULL_DEPLOYMENT.md` (Option 2)
   - Nécessite Node.js installé
   - Configuration plus complexe

3. **Attendre** jusqu'à ce que vous ayez un VPS ou décidiez d'utiliser Vercel

---

## 📂 Structure sur Hostinger

Après upload, votre structure devrait ressembler à :

```
public_html/
├── index.html
├── jouer.html
├── contact.html
├── admin.html
├── mentions-legales.html
├── presse.html
├── style.css
├── script.js
├── admin.js
├── admin_advanced.js
├── admin_config.example.js
├── .htaccess (si vous en avez un)
└── attached_assets/
    ├── generated_images/
    ├── image_*.png
    └── ...
```

---

## 🚀 Étapes d'Upload

### Méthode 1 : Via File Manager (Hostinger)

1. **Connectez-vous** à votre panneau Hostinger
2. **Ouvrez File Manager**
3. **Allez dans** `public_html/` (ou `htdocs/`)
4. **Uploadez** tous les fichiers listés ci-dessus
5. **Vérifiez** que les permissions sont correctes (644 pour les fichiers, 755 pour les dossiers)

### Méthode 2 : Via FTP/SFTP

1. **Utilisez un client FTP** (FileZilla, Cyberduck, etc.)
2. **Connectez-vous** avec vos identifiants FTP Hostinger
3. **Allez dans** le dossier `public_html/` (ou `htdocs/`)
4. **Uploadez** tous les fichiers

---

## ✅ Vérification Après Upload

1. **Testez** `zig-zag.fun` → Devrait afficher la landing page
2. **Testez** `zig-zag.fun/jouer` → Devrait afficher la page de connexion
3. **Testez** `zig-zag.fun/contact` → Devrait afficher la page de contact
4. **Testez** `zig-zag.fun/admin` → Devrait afficher le dashboard admin

---

## ⚠️ Notes Importantes

- **L'application Next.js** (`game-app/`) n'est **PAS** incluse dans cet upload
- Pour le moment, la redirection dans `jouer.html` pointe vers Vercel (ou localhost en dev)
- Une fois que vous aurez déployé Next.js (Vercel ou VPS), mettez à jour la redirection dans `jouer.html`

---

## 📝 Checklist d'Upload

- [ ] Uploader `index.html`
- [ ] Uploader `jouer.html`
- [ ] Uploader `contact.html`
- [ ] Uploader `admin.html`
- [ ] Uploader `mentions-legales.html`
- [ ] Uploader `presse.html`
- [ ] Uploader `style.css`
- [ ] Uploader `script.js`
- [ ] Uploader `admin.js`
- [ ] Uploader `admin_advanced.js`
- [ ] Uploader `admin_config.example.js`
- [ ] Uploader le dossier `attached_assets/` (avec tout son contenu)
- [ ] Vérifier que tous les fichiers sont bien uploadés
- [ ] Tester les pages sur `zig-zag.fun`

---

**Besoin d'aide ?** Consultez les autres guides dans `docs/` pour le déploiement de l'application Next.js.









