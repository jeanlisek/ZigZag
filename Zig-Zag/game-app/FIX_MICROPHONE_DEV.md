# 🔧 Fix : Microphone en Mode Développement

**Erreur** : `NotAllowedError: Permission denied` en mode développement

---

## 🔍 Causes Possibles

### 1. Permissions du Navigateur

Le navigateur bloque l'accès au microphone. Il faut autoriser manuellement.

**Solution** :
1. **Regarder l'icône du cadenas** 🔒 dans la barre d'adresse du navigateur
2. **Cliquer dessus**
3. **Chercher** "Microphone" dans les permissions
4. **Changer** de "Bloquer" à "Autoriser"
5. **Recharger** la page

### 2. HTTPS Requis (si pas en localhost)

Les navigateurs modernes requièrent **HTTPS** pour accéder au microphone (sauf `localhost`).

**Si vous testez sur un domaine** :
- Utiliser `localhost` ou `127.0.0.1` pour le développement
- OU configurer HTTPS en développement

### 3. Permissions Policy en Mode Dev

Les headers de `next.config.js` peuvent ne pas être appliqués en mode dev. Vérifier si c'est bien le cas.

---

## ✅ Solutions

### Solution 1 : Autoriser dans le Navigateur (Le Plus Simple)

1. **Dans Chrome/Edge** :
   - Cliquer sur l'icône **🔒** (cadenas) dans la barre d'adresse
   - Chercher **"Microphone"**
   - Changer de **"Bloquer"** à **"Autoriser"**
   - Recharger la page

2. **Dans Firefox** :
   - Cliquer sur l'icône **🔒** ou **ℹ️** dans la barre d'adresse
   - Cliquer sur **"Plus d'informations"**
   - Onglet **"Permissions"**
   - Chercher **"Utiliser le microphone"**
   - Changer de **"Bloquer"** à **"Autoriser"**

3. **Dans Safari** :
   - Safari > Paramètres > Sites web > Microphone
   - Autoriser pour votre site

---

### Solution 2 : Utiliser HTTPS en Développement (Si nécessaire)

Si vous testez sur un domaine (pas localhost), configurez HTTPS :

```bash
# Avec Next.js, vous pouvez utiliser mkcert pour un certificat local
npm install -g mkcert
mkcert -install
mkcert localhost 127.0.0.1
```

---

### Solution 3 : Vérifier que le Code est Correct

Le code dans `AudioRecorder.tsx` est correct. Le problème vient des permissions.

---

## 🧪 Test

Après avoir autorisé dans le navigateur :

1. **Recharger** la page (Cmd+R ou Ctrl+R)
2. **Cliquer** sur "Commencer l'enregistrement"
3. **Le navigateur devrait demander** l'autorisation du microphone
4. **Cliquer sur** "Autoriser"

✅ Si ça fonctionne, c'est bon !

---

## 📝 Note

En **production** (après build et déploiement), la Permissions Policy que j'ai corrigée dans `next.config.js` sera appliquée. En mode développement, c'est surtout les permissions du navigateur qui comptent.

---

**Essayez d'abord d'autoriser le microphone dans les paramètres du navigateur, c'est généralement ça le problème !** 😊

