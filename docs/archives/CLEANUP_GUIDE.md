# 🧹 Guide de Nettoyage du Projet Zigzag

## 📋 Analyse des Doublons et Fichiers Inutiles

### ❌ Dossier `game/` - À SUPPRIMER (Ancienne version)

Le dossier `game/` est une **ancienne version** du projet qui n'est plus utilisée. La version active est dans `game-app/`.

**Contenu du dossier `game/` :**
```
game/
├── game/                    ← Fichiers HTML statiques (anciens, non utilisés)
│   ├── game.html
│   ├── game.css
│   ├── game.js
│   ├── matchmaking.html
│   ├── matchmaking.css
│   ├── mode-selection.html
│   ├── mode-selection.css
│   ├── privee.html
│   └── privee.css
├── src/                     ← Code Next.js (ancienne version, doublon)
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── types/
├── node_modules/            ← Dépendances (peuvent être supprimées)
├── package.json             ← Doublon
├── package-lock.json        ← Doublon
├── INTEGRATION_GUIDE.md     ← Documentation obsolète
├── remove_background.js     ← Script non utilisé
├── remove_background.py     ← Script non utilisé
└── zigzag_games.db          ← Base SQLite locale (non utilisée avec Supabase)
```

**✅ Action : Supprimer tout le dossier `game/`**

---

### ⚠️ Fichiers SQL en Double

**Fichiers à garder :**
- ✅ `game-app/src/lib/supabase/schema.sql` ← **Version actuelle et à jour**

**Fichiers à supprimer :**
- ❌ `game/src/lib/supabase/schema.sql` ← Ancienne version (sera supprimé avec le dossier `game/`)

**Fichiers optionnels :**
- ⚠️ `game-app/src/lib/supabase/schema_step_by_step.sql` ← Peut être gardé pour debug, mais pas nécessaire

---

### 📚 Documentation en Double

**Fichiers à garder :**
- ✅ `game-app/README.md` ← Documentation actuelle
- ✅ `game-app/SUPABASE_SETUP.md` ← Guide de setup actuel
- ✅ `HOSTINGER_DEPLOYMENT.md` ← Guide de déploiement
- ✅ `DEPLOYMENT_GUIDE.md` ← Guide général

**Fichiers à supprimer :**
- ❌ `game/INTEGRATION_GUIDE.md` ← Documentation obsolète (sera supprimé avec le dossier `game/`)

---

### 🗑️ Fichiers Potentiellement Inutiles

**Fichiers à vérifier avant suppression :**

1. **`test_supabase_connection.js`** (racine)
   - ⚠️ Fichier de test, probablement plus nécessaire
   - ✅ Peut être supprimé si tout fonctionne

2. **`main.py`** et **`pyproject.toml`** et **`uv.lock`** (racine)
   - ⚠️ Fichiers Python, vérifier s'ils sont utilisés
   - Si non utilisés → ✅ Peut être supprimé

3. **`zigzag_games.db`** (dans `game/`)
   - ❌ Base SQLite locale, non utilisée (on utilise Supabase)
   - ✅ À supprimer

4. **Fichiers dans `attached_assets/`**
   - ⚠️ Fichiers texte avec timestamps (`Pasted--...txt`)
   - ⚠️ Peut-être des fichiers temporaires
   - ✅ Vérifier s'ils sont utilisés, sinon supprimer

---

## ✅ Plan d'Action Recommandé

### Étape 1 : Sauvegarder (Optionnel mais recommandé)

```bash
# Créer une sauvegarde avant suppression
cd /Users/jean-lisek/Downloads/Zig-Zag
cp -r Zig-Zag Zig-Zag-backup-$(date +%Y%m%d)
```

### Étape 2 : Supprimer le dossier `game/` (Ancienne version)

```bash
cd /Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag
rm -rf game/
```

**Ce qui sera supprimé :**
- ✅ Tous les fichiers HTML statiques obsolètes
- ✅ L'ancienne version du code Next.js
- ✅ Les `node_modules/` du dossier `game/`
- ✅ La base SQLite locale
- ✅ Les scripts Python non utilisés
- ✅ La documentation obsolète

### Étape 3 : Nettoyer les fichiers de test (Optionnel)

```bash
# Supprimer le fichier de test
rm test_supabase_connection.js

# Supprimer les fichiers Python si non utilisés
rm main.py pyproject.toml uv.lock
```

### Étape 4 : Nettoyer les assets temporaires (Optionnel)

```bash
# Supprimer les fichiers texte temporaires dans attached_assets/
rm attached_assets/Pasted--*.txt
rm attached_assets/content-*.md  # Si non utilisé
```

---

## 📊 Espace Récupéré (Estimation)

- **Dossier `game/`** : ~50-100 MB (avec `node_modules/`)
- **Fichiers de test** : ~1-5 MB
- **Total estimé** : ~50-105 MB

---

## ✅ Structure Finale Propre

Après nettoyage, votre projet devrait ressembler à :

```
Zig-Zag/
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
├── admin_supabase_schema.sql
├── fix_users_table.sql
├── update_checklist_days.sql
├── attached_assets/          ← Assets utilisés uniquement
├── game-app/                  ← ✅ Version active Next.js
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
└── Documentation/
    ├── DEPLOYMENT_GUIDE.md
    ├── HOSTINGER_DEPLOYMENT.md
    ├── FEATURES_SUMMARY.md
    ├── FIXES_404_ERRORS.md
    ├── GOOGLE_SHEETS_SETUP.md
    ├── IMPLEMENTATION_GUIDE.md
    ├── INTEGRATIONS_GUIDE.md
    ├── QUICK_START_INTEGRATIONS.md
    ├── TEST_MCP.md
    └── URL_REWRITE_GUIDE.md
```

---

## ⚠️ Avant de Supprimer

**Vérifiez :**
1. ✅ Que `game-app/` fonctionne correctement en local
2. ✅ Que vous avez une sauvegarde (optionnel mais recommandé)
3. ✅ Que vous n'avez pas besoin des fichiers dans `game/` pour référence

**Si vous n'êtes pas sûr :**
- Renommez le dossier `game/` en `game-old/` au lieu de le supprimer
- Vous pourrez le supprimer plus tard si tout fonctionne

---

## 🎯 Commandes de Nettoyage (À exécuter manuellement)

```bash
cd /Users/jean-lisek/Downloads/Zig-Zag/Zig-Zag

# 1. Supprimer l'ancienne version (CONFIRMER AVANT)
rm -rf game/

# 2. Supprimer les fichiers de test (optionnel)
rm test_supabase_connection.js

# 3. Supprimer les fichiers Python si non utilisés (optionnel)
# rm main.py pyproject.toml uv.lock

# 4. Nettoyer les assets temporaires (optionnel)
# rm attached_assets/Pasted--*.txt
```

---

**⚠️ IMPORTANT :** Exécutez ces commandes manuellement après avoir vérifié que tout fonctionne avec `game-app/` uniquement.

