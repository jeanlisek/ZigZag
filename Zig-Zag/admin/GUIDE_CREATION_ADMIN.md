# 👤 Guide : Créer un compte administrateur

## 🎯 Le problème

Dans Supabase, **tous les utilisateurs authentifiés** (y compris les joueurs normaux) sont dans la même table `auth.users`. Pour sécuriser le dashboard, nous utilisons un champ `is_admin` dans la table `public.users` pour distinguer les administrateurs des joueurs.

## ✅ Solution : Champ `is_admin`

Le dashboard vérifie maintenant le champ `is_admin` dans la table `users`. Seuls les utilisateurs avec `is_admin = TRUE` peuvent accéder au dashboard.

## 📋 Étapes pour créer un compte admin

### Étape 1 : Ajouter la colonne `is_admin` à la base de données

1. Allez sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionnez votre projet **ZigZag**
3. Allez dans **SQL Editor** (icône `</>` dans la sidebar)
4. Cliquez sur **New query**
5. Copiez-collez le contenu du fichier `sql/11_add_admin_field.sql` :

```sql
-- Ajouter la colonne is_admin si elle n'existe pas déjà
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT FALSE NOT NULL;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_users_is_admin ON public.users(is_admin) WHERE is_admin = TRUE;
```

6. Cliquez sur **Run** (ou `Ctrl+Enter` / `Cmd+Enter`)

✅ **Résultat** : La colonne `is_admin` est maintenant ajoutée à la table `users`. Tous les utilisateurs existants ont `is_admin = FALSE` par défaut.

### Étape 2 : Créer un compte utilisateur dans Supabase Auth

1. Dans Supabase Dashboard, allez dans **Authentication** > **Users**
2. Cliquez sur **Add user** > **Create new user**
3. Remplissez :
   - **Email** : `admin@zig-zag.fun` (ou votre email admin)
   - **Password** : Choisissez un mot de passe fort
   - **Auto Confirm User** : ✅ Cochez cette case (pour éviter de devoir confirmer l'email)
4. Cliquez sur **Create user**

✅ **Résultat** : Un compte est créé dans `auth.users`. Un profil correspondant sera automatiquement créé dans `public.users` grâce au trigger `handle_new_user()`.

### Étape 3 : Donner les droits admin à ce compte

Maintenant, il faut marquer ce compte comme administrateur dans la table `users` :

1. Dans Supabase Dashboard, allez dans **SQL Editor**
2. Créez une nouvelle requête
3. Exécutez cette requête (remplacez `admin@zig-zag.fun` par l'email que vous avez utilisé) :

```sql
-- Donner les droits admin à un utilisateur
UPDATE public.users 
SET is_admin = TRUE 
WHERE email = 'admin@zig-zag.fun';
```

4. Vérifiez que ça a fonctionné :

```sql
-- Vérifier que l'utilisateur est bien admin
SELECT id, email, username, is_admin 
FROM public.users 
WHERE email = 'admin@zig-zag.fun';
```

Vous devriez voir `is_admin = true` pour cet utilisateur.

✅ **Résultat** : Le compte a maintenant les droits administrateur.

### Étape 4 : Tester l'accès au dashboard

1. Allez sur `https://zig-zag.fun/admin` (ou `http://localhost:5173/admin` en local)
2. Connectez-vous avec :
   - **Email** : `admin@zig-zag.fun` (ou l'email que vous avez utilisé)
   - **Password** : Le mot de passe que vous avez défini
3. Le dashboard devrait s'afficher ! 🎉

## 🔍 Vérification rapide

Pour vérifier quels utilisateurs sont admin :

```sql
SELECT id, email, username, is_admin, created_at
FROM public.users 
WHERE is_admin = TRUE
ORDER BY created_at DESC;
```

## ⚠️ Important

- **Sécurité** : Seuls les utilisateurs avec `is_admin = TRUE` peuvent accéder au dashboard
- **Joueurs normaux** : Les joueurs normaux ont `is_admin = FALSE` et ne peuvent pas accéder au dashboard, même s'ils sont authentifiés
- **Multi-admins** : Vous pouvez créer plusieurs comptes admin en répétant les étapes 2 et 3

## 🛠️ Ajouter un autre admin

Pour ajouter un autre administrateur :

1. Créez le compte dans **Authentication** > **Users** (étape 2 ci-dessus)
2. Exécutez la requête SQL pour donner les droits admin (étape 3 ci-dessus)

## 🔒 Retirer les droits admin

Pour retirer les droits admin à un utilisateur :

```sql
UPDATE public.users 
SET is_admin = FALSE 
WHERE email = 'email@example.com';
```

## 📝 Résumé

1. ✅ Ajouter la colonne `is_admin` (fichier SQL)
2. ✅ Créer un compte dans Supabase Auth
3. ✅ Marquer ce compte comme admin dans la table `users`
4. ✅ Se connecter au dashboard avec ce compte

C'est tout ! Le dashboard est maintenant sécurisé. 🎉

