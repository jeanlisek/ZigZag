# Guide : Upload Avatar Direct lors de l'Inscription

## 🎯 Solution Implémentée

Au lieu de sauvegarder l'avatar temporairement dans localStorage (problématique et peu fiable), l'avatar est maintenant **uploadé directement lors de l'inscription** via une **Edge Function Supabase**.

## ✅ Avantages

- ✅ **Upload immédiat** : L'avatar est uploadé dès l'inscription
- ✅ **Pas de localStorage** : Plus besoin de gérer le stockage temporaire
- ✅ **Plus fiable** : Pas de perte de données entre les sessions
- ✅ **Meilleure performance** : Pas de conversion base64
- ✅ **Sécurisé** : Utilise le service_role uniquement côté serveur

## 📋 Étapes de Configuration

### 1. Déployer l'Edge Function

1. **Installer Supabase CLI** (si pas déjà fait) :
   ```bash
   npm install -g supabase
   ```

2. **Se connecter à Supabase** :
   ```bash
   supabase login
   ```

3. **Lier le projet** :
   ```bash
   supabase link --project-ref tihrltssmpxpreadpzqm
   ```

4. **Déployer la fonction** :
   ```bash
   cd Zig-Zag
   supabase functions deploy upload-avatar
   ```

### 2. Mettre à jour jouer.html

Dans `jouer.html`, ligne ~1395, remplacez la clé anon par votre vraie clé :

```javascript
const supabaseAnonKey = 'VOTRE_CLE_ANON_ICI';
```

**Pour trouver votre clé anon** :
1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **Settings** > **API**
4. Copier la **"anon public"** key

### 3. Vérifier que le bucket existe

1. Aller sur **Storage** dans Supabase Dashboard
2. Vérifier qu'il y a un bucket nommé **`avatars`**
3. Si pas, créer le bucket (voir `sql/README_AVATARS.md`)

### 4. Vérifier les politiques RLS

1. Aller dans **SQL Editor**
2. Exécuter `sql/12_avatars_storage_setup.sql`
3. Vérifier que les politiques sont créées

## 🧪 Test

1. Créer un nouveau compte avec une photo
2. Vérifier dans la console :
   - `📸 Photo sélectionnée pour utilisateur: [ID]`
   - `⬆️ Upload avatar via Edge Function...`
   - `✅ Avatar uploadé avec succès: [URL]`
3. Vérifier dans Supabase :
   - **Storage** > **avatars** : Le fichier doit être présent
   - **Auth** > **Users** : `user_metadata.avatar_url` doit être rempli
   - **Table Editor** > **users** : `avatar_url` doit être rempli

## 🔧 Dépannage

### Erreur : "Function not found"
→ La fonction n'est pas déployée. Vérifiez les étapes de déploiement.

### Erreur : "Unauthorized"
→ La clé anon est incorrecte. Vérifiez que vous utilisez la bonne clé.

### Erreur : "Bucket not found"
→ Le bucket `avatars` n'existe pas. Créez-le dans Supabase Dashboard.

### Erreur : "RLS policy violation"
→ Les politiques RLS ne sont pas configurées. Exécutez `sql/12_avatars_storage_setup.sql`.

## 📝 Notes

- L'Edge Function utilise le **service_role** pour contourner les restrictions RLS
- L'avatar est uploadé **immédiatement** lors de l'inscription
- Plus besoin de gérer localStorage/sessionStorage
- L'avatar est disponible dès la première connexion

