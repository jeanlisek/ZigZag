# 🔧 Correction des Permissions Dashboard

## 🚨 Problème Identifié

Le dashboard affiche **"0"** partout car les tables Supabase ont des règles de sécurité (RLS) qui bloquent l'accès avec la clé publique.

## ✅ Solution : Exécuter le script SQL

### Étape 1 : Ouvrir Supabase

1. Allez sur [https://supabase.com](https://supabase.com)
2. Connectez-vous à votre compte
3. Sélectionnez votre projet **Zigzag**

### Étape 2 : Ouvrir le SQL Editor

1. Dans le menu de gauche, cliquez sur **"SQL Editor"** (icône de base de données)
2. Cliquez sur **"New Query"** (Nouvelle requête)

### Étape 3 : Copier-Coller le Script

1. Ouvrez le fichier `database/fix_dashboard_permissions.sql`
2. **Copiez TOUT le contenu** du fichier
3. **Collez-le** dans l'éditeur SQL de Supabase

### Étape 4 : Exécuter le Script

1. Cliquez sur le bouton **"Run"** (Exécuter) en bas à droite
2. Attendez quelques secondes
3. Vous devriez voir un message de succès ✅

### Étape 5 : Vérifier les Tables

Pendant que vous êtes dans Supabase, vérifiez que ces tables existent :

#### Tables Requises :

1. **`users`** - Utilisateurs du jeu
   ```sql
   SELECT COUNT(*) FROM users;
   ```

2. **`zigs`** - Parties de jeu
   ```sql
   SELECT COUNT(*) FROM zigs;
   ```

3. **`newsletter_signups`** - Inscrits newsletter
   ```sql
   SELECT COUNT(*) FROM newsletter_signups;
   ```

4. **`contact_messages`** - Messages de contact
   ```sql
   SELECT COUNT(*) FROM contact_messages;
   ```

Si une table **n'existe pas**, vous verrez une erreur. Dans ce cas, créez-la d'abord !

### Étape 6 : Rafraîchir le Dashboard

1. Retournez sur votre dashboard : **http://localhost:5173**
2. Appuyez sur **F5** ou **Ctrl+R** pour rafraîchir
3. Les données devraient maintenant s'afficher ! 🎉

---

## 📊 Vérification Rapide

Exécutez cette requête dans Supabase pour voir vos données :

```sql
-- Statistiques globales
SELECT 
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM zigs) as total_zigs,
  (SELECT COUNT(*) FROM newsletter_signups) as newsletter_signups,
  (SELECT COUNT(*) FROM contact_messages) as contact_messages;
```

---

## 🔐 Note sur la Sécurité

Le script autorise la **lecture publique** des données. C'est OK pour un dashboard admin interne, mais :

⚠️ **Pour la production** :
- Créez un rôle admin spécifique
- Utilisez l'authentification
- Limitez l'accès par IP si nécessaire

---

## 🐛 Si Ça Ne Marche Toujours Pas

### Vérifiez la Console du Navigateur

1. Ouvrez le dashboard
2. Appuyez sur **F12** (outils développeur)
3. Allez dans l'onglet **Console**
4. Cherchez des erreurs rouges

### Erreurs Communes

#### Erreur : "relation does not exist"
→ La table n'existe pas dans Supabase
→ Créez-la d'abord (voir `admin_supabase_schema.sql`)

#### Erreur : "permission denied"
→ Les policies RLS bloquent encore
→ Vérifiez que le script a bien été exécuté

#### Erreur : "Invalid API key"
→ Vérifiez la clé Supabase dans `src/lib/supabase.ts`

---

## 📞 Besoin d'Aide ?

Si le problème persiste :
1. Copiez l'erreur de la console
2. Vérifiez les tables dans Supabase
3. Assurez-vous que le script SQL a bien été exécuté

