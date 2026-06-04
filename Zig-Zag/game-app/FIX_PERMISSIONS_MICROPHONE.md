# 🔧 Fix : Permissions Policy Microphone

**Erreur** : `Permissions policy violation: microphone is not allowed in this document`

**Cause** : La Permissions Policy bloque l'accès au microphone.

---

## ✅ Correction Appliquée

J'ai corrigé le fichier `next.config.js` pour autoriser l'accès au microphone.

**Avant** :
```javascript
value: 'camera=(), microphone=(), geolocation=()'
```

**Après** :
```javascript
value: 'camera=(), microphone=(self), geolocation=()'
```

Le `microphone=(self)` autorise l'accès au microphone sur le même domaine.

---

## 🔄 Rebuild et Redéploiement

**⚠️ IMPORTANT** : Il faut reconstruire l'application pour que le changement prenne effet !

### Étape 1 : Rebuild

```bash
cd /Users/jean-lisek/Desktop/Ancienne\ save/22:12/Zig-Zag/Zig-Zag/game-app

# Rebuild l'application
npm run build
```

### Étape 2 : Redéployer

Une fois le build terminé, uploader le nouveau dossier `out/` sur votre serveur.

**Via FTP/FileZilla** :
1. Se connecter à `game.zig-zag.fun`
2. Supprimer l'ancien dossier `out/` (ou le contenu)
3. Uploader le nouveau dossier `out/` (ou son contenu)

---

## ✅ Vérification

Après redéploiement :

1. **Vider le cache du navigateur** (Cmd+Shift+R ou Ctrl+Shift+R)
2. **Tester** l'enregistrement audio dans le jeu
3. **Le microphone devrait maintenant fonctionner** !

---

## 🔍 Vérification du Header

Pour vérifier que le header est correctement envoyé :

1. **Ouvrir** les outils de développement (F12)
2. **Aller dans** l'onglet "Network" (Réseau)
3. **Recharger** la page
4. **Cliquer sur** une requête (ex: le fichier HTML principal)
5. **Vérifier** dans "Headers" → "Response Headers"
6. **Chercher** "Permissions-Policy"
7. **Devrait contenir** : `microphone=(self)` et non `microphone=()`

---

## 📝 Explication

La **Permissions Policy** (anciennement Feature Policy) contrôle quelles fonctionnalités du navigateur sont autorisées sur votre site.

- `microphone=()` → **Bloque** l'accès au microphone
- `microphone=(self)` → **Autorise** l'accès au microphone sur le même domaine
- `microphone=*` → Autorise l'accès partout (moins sécurisé)

Nous utilisons `microphone=(self)` pour autoriser uniquement sur votre propre domaine.

---

**Rebuild et redéployez, puis testez !** 😊

