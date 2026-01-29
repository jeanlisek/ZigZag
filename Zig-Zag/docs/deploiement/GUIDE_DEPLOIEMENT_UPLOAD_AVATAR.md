# 🚀 Guide de Déploiement - Edge Function upload-avatar

## 📋 Prérequis

1. **Node.js installé** (v16 ou supérieur)
2. **Accès à votre terminal**
3. **Compte Supabase** avec accès au projet `tihrltssmpxpreadpzqm`

## 🔧 Étapes de Déploiement

### Étape 1 : Installer les dépendances (si nécessaire)

Depuis le dossier `Zig-Zag` :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/24:01/Zig-Zag/Zig-Zag"
npm install
```

Cela installera la CLI Supabase dans `node_modules` (déjà dans `devDependencies`).

### Étape 2 : Se connecter à Supabase

```bash
npm run supabase:login
```

Ou directement :
```bash
npx supabase login
```

**Ce que ça fait** : Ouvre votre navigateur pour vous authentifier avec votre compte Supabase. Vous devez accepter l'autorisation.

### Étape 3 : Lier le projet (une seule fois)

```bash
npm run supabase:link
```

Ou directement :
```bash
npx supabase link --project-ref tihrltssmpxpreadpzqm
```

**Ce que ça fait** : Crée un fichier `.supabase/config.toml` qui lie votre projet local à votre projet Supabase.

### Étape 4 : Déployer l'Edge Function

```bash
npm run supabase:deploy:avatar
```

Ou directement :
```bash
npx supabase functions deploy upload-avatar
```

**Ce que ça fait** : 
- Compile et déploie la fonction `upload-avatar` vers Supabase
- Prend généralement 1-2 minutes
- La fonction est disponible immédiatement après

## ✅ Vérification

### Dans le terminal

Après le déploiement, vous devriez voir :
```
Deploying function upload-avatar...
Function upload-avatar deployed successfully
```

### Dans Supabase Dashboard

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet `tihrltssmpxpreadpzqm`
3. Aller dans **Edge Functions** dans le menu de gauche
4. Vous devriez voir `upload-avatar` dans la liste avec la date de dernière mise à jour

### Tester la fonction

L'URL de la fonction sera :
```
https://tihrltssmpxpreadpzqm.supabase.co/functions/v1/upload-avatar
```

## ⚙️ Variables d'Environnement

**Aucune configuration manuelle nécessaire !** 

Supabase ajoute automatiquement ces variables lors du déploiement :
- `SUPABASE_URL` : `https://tihrltssmpxpreadpzqm.supabase.co`
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service_role (sécurisée, jamais exposée côté client)
- `SUPABASE_ANON_KEY` : Clé anon (pour vérifier les tokens JWT)

Ces variables sont accessibles dans le code via `Deno.env.get("SUPABASE_URL")`.

## 🔒 Sécurité

La fonction a été sécurisée pour :
- ✅ Vérifier l'authentification via le header `Authorization`
- ✅ Valider que le `userId` correspond à l'utilisateur authentifié
- ✅ Empêcher l'upload d'avatar pour un autre utilisateur

## ❌ Dépannage

### Erreur : "supabase: command not found"
**Solution** : Utilisez `npx` au lieu de `supabase` directement :
```bash
npx supabase login
```

### Erreur : "Not logged in"
**Solution** : 
```bash
npx supabase login
```
Cela ouvrira votre navigateur pour vous authentifier.

### Erreur : "Project not found" ou "Project not linked"
**Solution** : Lier le projet :
```bash
npx supabase link --project-ref tihrltssmpxpreadpzqm
```

### Erreur : "Function not found"
**Solution** : Vérifiez que vous êtes dans le bon dossier :
```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/24:01/Zig-Zag/Zig-Zag"
ls supabase/functions/upload-avatar/index.ts
```

### Erreur : "Permission denied"
**Solution** : Vérifiez que vous avez les droits d'admin sur le projet Supabase.

## 📝 Notes

- Le déploiement prend généralement 1-2 minutes
- La fonction est disponible immédiatement après le déploiement
- Pas besoin de redémarrer quoi que ce soit
- Les modifications dans `index.ts` nécessitent un redéploiement pour être prises en compte

## 🔄 Redéploiement après modification

Si vous modifiez le code de `upload-avatar/index.ts`, redéployez simplement :

```bash
npm run supabase:deploy:avatar
```

## 📚 Documentation

- [Supabase Edge Functions Docs](https://supabase.com/docs/guides/functions)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli)
