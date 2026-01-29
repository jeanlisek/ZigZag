# 🚨 FIX URGENT : Erreur "Failed to load chunk"

## Problème Actuel

```
❌ Error: Failed to load chunk /_next/static/chunks/b3b5886d7d5fae1e.js
❌ MIME type 'text/plain' instead of 'application/javascript'
❌ ColorPicker et fonctionnalités manquantes
```

---

## ✅ SOLUTION EN 5 MINUTES

### Étape 1 : Vérifier l'Upload

Sur votre serveur `game.zig-zag.fun`, vérifiez que ce fichier existe :

```bash
# Via SSH
ls -la /chemin/vers/site/_next/static/chunks/b3b5886d7d5fae1e.js

# Via FTP
Naviguer vers : _next/static/chunks/
Chercher : b3b5886d7d5fae1e.js
```

**Si le fichier manque** :
- ❌ L'upload est incomplet
- 👉 RE-UPLOADER tout le dossier `out/`

---

### Étape 2 : Corriger le .htaccess

**REMPLACER** votre `.htaccess` actuel par celui-ci :

📁 **Fichier prêt** : `game-app/out/.htaccess`

**Contenu critique** :
```apache
<IfModule mod_mime.c>
    RemoveHandler .js .css
    AddType application/javascript .js
    AddType text/css .css
</IfModule>

<IfModule mod_headers.c>
    <FilesMatch "\.js$">
        Header always set Content-Type "application/javascript; charset=utf-8"
    </FilesMatch>
    
    <FilesMatch "\.css$">
        Header always set Content-Type "text/css; charset=utf-8"
    </FilesMatch>
</IfModule>
```

---

### Étape 3 : Vider le Cache

```bash
# Sur le serveur (si Apache)
sudo service apache2 reload

# OU
sudo systemctl reload apache2

# OU si .htaccess seulement
touch .htaccess  # Forcer le rechargement
```

---

### Étape 4 : Tester

1. **Vider le cache navigateur** : `Ctrl + Shift + Delete`
2. **Hard refresh** : `Ctrl + Shift + R`
3. **Aller sur** : https://game.zig-zag.fun/jeu/matchmaking
4. **Ouvrir console (F12)** et vérifier :
   - ✅ Pas d'erreur "Failed to load chunk"
   - ✅ Pas d'erreur MIME type

---

## 🔧 Si Ça Ne Marche Toujours Pas

### Option A : Re-Upload Complet

```bash
# 1. Supprimer TOUT sur le serveur
rm -rf /chemin/vers/site/*

# 2. Copier TOUT depuis out/
cp -r /Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/game-app/out/* /chemin/vers/site/

# 3. Vérifier les permissions
chmod -R 755 /chemin/vers/site/
```

### Option B : Vérifier la Configuration Serveur

Le problème peut venir de la config Apache/Nginx globale qui override le .htaccess.

**Apache** : Vérifier que `AllowOverride All` est activé

```apache
# Dans /etc/apache2/sites-available/game.zig-zag.fun.conf
<Directory /var/www/game.zig-zag.fun>
    AllowOverride All
    Require all granted
</Directory>
```

**Nginx** : Le .htaccess ne fonctionne PAS. Il faut configurer les MIME types dans la config nginx :

```nginx
location ~* \.js$ {
    types { application/javascript js; }
    add_header Content-Type "application/javascript; charset=utf-8";
}

location ~* \.css$ {
    types { text/css css; }
    add_header Content-Type "text/css; charset=utf-8";
}
```

---

## 📊 Checklist de Vérification

### Fichiers sur le Serveur
- [ ] `_next/static/chunks/b3b5886d7d5fae1e.js` existe
- [ ] `.htaccess` est à la racine
- [ ] Tous les chunks JS (22 fichiers) sont présents
- [ ] Les fichiers CSS sont présents

### Configuration
- [ ] `.htaccess` contient les règles MIME type
- [ ] Apache/Nginx permet le .htaccess (AllowOverride All)
- [ ] Permissions correctes (755 pour dossiers, 644 pour fichiers)

### Tests
- [ ] Cache navigateur vidé
- [ ] Console sans erreur "Failed to load chunk"
- [ ] Console sans erreur MIME type
- [ ] ColorPicker s'affiche correctement

---

## 🎯 Commandes Rapides

### Upload Rapide via SCP
```bash
cd /Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag/game-app
scp -r out/* user@game.zig-zag.fun:/var/www/game.zig-zag.fun/
```

### Vérifier les MIME Types en Live
```bash
curl -I https://game.zig-zag.fun/_next/static/chunks/b3b5886d7d5fae1e.js

# Vous devez voir :
# Content-Type: application/javascript
# (PAS text/plain !)
```

### Test Local Avant Upload
```bash
cd game-app/out
python3 -m http.server 8000
# Ouvrir http://localhost:8000/jeu/matchmaking
# Si ça marche en local, le build est OK
```

---

## 💡 Explication du Problème

### Ce qui se passe :
1. Next.js génère des chunks JS avec des noms hash
2. Le serveur les sert avec `Content-Type: text/plain`
3. Le navigateur refuse d'exécuter du JS avec ce type
4. L'application plante

### Pourquoi `text/plain` ?
- Le serveur ne reconnaît pas `.js` comme JavaScript
- Ou une config globale force `text/plain`
- Ou le .htaccess n'est pas lu

### La Solution :
**Forcer explicitement** les MIME types dans .htaccess avec `Header always set`

---

## 🆘 Support

Si le problème persiste après tout ça, envoyez-moi :

1. Le résultat de :
```bash
curl -I https://game.zig-zag.fun/_next/static/chunks/b3b5886d7d5fae1e.js
```

2. Le contenu de votre .htaccess actuel sur le serveur

3. Le type de serveur (Apache/Nginx/autre)

---

**Date** : 2024
**Priorité** : 🔴 URGENT
