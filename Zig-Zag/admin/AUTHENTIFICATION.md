# 🔐 Authentification du Dashboard Admin

Le dashboard admin est maintenant protégé par une authentification Supabase. **Seuls les utilisateurs avec `is_admin = TRUE`** peuvent y accéder.

## 📋 Fonctionnement

1. **Page de connexion** : Lors de l'accès à `/admin`, une page de login s'affiche
2. **Authentification Supabase** : L'utilisateur doit se connecter avec un compte Supabase Auth
3. **Vérification admin** : Le système vérifie que l'utilisateur a `is_admin = TRUE` dans la table `users`
4. **Vérification de session** : La session est vérifiée à chaque chargement
5. **Déconnexion** : Un bouton de déconnexion est disponible dans la sidebar

## 🚀 Créer un compte administrateur

**📖 Guide complet** : Consultez `admin/GUIDE_CREATION_ADMIN.md` pour les instructions détaillées.

### Résumé rapide :

1. **Ajouter la colonne `is_admin`** : Exécutez `sql/11_add_admin_field.sql` dans Supabase SQL Editor
2. **Créer un compte** : Dans Supabase Dashboard > Authentication > Users > Add user
3. **Donner les droits admin** : Exécutez cette requête SQL :
   ```sql
   UPDATE public.users SET is_admin = TRUE WHERE email = 'votre-email@example.com';
   ```
4. **Se connecter** : Allez sur `/admin` et connectez-vous avec ce compte

## 🔒 Sécurité

- **Joueurs normaux** : Les joueurs normaux ont `is_admin = FALSE` et **ne peuvent pas** accéder au dashboard
- **Admins uniquement** : Seuls les utilisateurs avec `is_admin = TRUE` peuvent accéder
- **Vérification automatique** : Le système vérifie automatiquement le statut admin à chaque connexion

## 🛠️ Utilisation

1. **Accéder au dashboard** : Allez sur `https://zig-zag.fun/admin`
2. **Se connecter** : Entrez votre email et mot de passe Supabase
3. **Utiliser le dashboard** : Une fois connecté, vous avez accès à toutes les fonctionnalités
4. **Se déconnecter** : Cliquez sur l'icône de déconnexion (🔓) en bas de la sidebar

## ⚠️ Notes importantes

- **Sécurité** : Les mots de passe sont gérés par Supabase Auth (chiffrement, hash, etc.)
- **Session** : La session est persistante (reste connecté même après fermeture du navigateur)
- **Expiration** : Les sessions Supabase expirent après 7 jours d'inactivité par défaut
- **Multi-utilisateurs** : Plusieurs administrateurs peuvent se connecter simultanément

## 🔧 Dépannage

### "Email ou mot de passe incorrect"
- Vérifiez que le compte existe dans Supabase Auth
- Vérifiez l'orthographe de l'email et du mot de passe
- Réinitialisez le mot de passe si nécessaire (via Supabase Dashboard)

### "Accès non autorisé"
- Vérifiez que votre email est dans la liste `ADMIN_EMAILS` (si configurée)
- Si la liste est vide, tous les utilisateurs authentifiés devraient pouvoir accéder

### Le dashboard ne se charge pas
- Vérifiez que Supabase Auth est bien configuré
- Vérifiez les clés Supabase dans `src/lib/supabase.ts`
- Ouvrez la console du navigateur pour voir les erreurs

## 📝 Prochaines améliorations possibles

- [ ] Ajouter un champ `is_admin` dans la table `users` pour une gestion plus fine
- [ ] Créer une interface de gestion des administrateurs dans le dashboard
- [ ] Ajouter la réinitialisation de mot de passe depuis le dashboard
- [ ] Ajouter l'authentification à deux facteurs (2FA)

