# 🚀 Guide de Déploiement - Edge Function upload-avatar

## 📋 Prérequis

1. **Node.js installé** (v16 ou supérieur)
2. **Accès à votre terminal**

## 🔧 Étapes de Déploiement

### ✅ Étape 1 : Supabase CLI est déjà installé localement

Pas besoin d'installer globalement, c'est déjà fait !

### Étape 2 : Se connecter à Supabase

Depuis le dossier `Zig-Zag` :

```bash
cd "/Users/jean-lisek/Desktop/Ancienne save/22:12/Zig-Zag/Zig-Zag"
npm run supabase:login
```

Ou directement :
```bash
npx supabase login
```

Cela ouvrira votre navigateur pour vous authentifier avec votre compte Supabase.

### Étape 3 : Lier le projet

```bash
npm run supabase:link
```

Ou directement :
```bash
npx supabase link --project-ref tihrltssmpxpreadpzqm
```

### Étape 4 : Déployer l'Edge Function

```bash
npm run supabase:deploy:avatar
```

Ou directement :
```bash
npx supabase functions deploy upload-avatar
```

## ✅ Vérification

Après le déploiement, vous devriez voir :
```
Deploying function upload-avatar...
Function upload-avatar deployed successfully
```

## 🔍 Vérifier dans Supabase Dashboard

1. Aller sur [Supabase Dashboard](https://supabase.com/dashboard)
2. Sélectionner votre projet
3. Aller dans **Edge Functions** dans le menu de gauche
4. Vous devriez voir `upload-avatar` dans la liste

## ⚙️ Variables d'Environnement

**Aucune configuration manuelle nécessaire !** 

Supabase ajoute automatiquement ces variables lors du déploiement :
- `SUPABASE_URL` : URL de votre projet
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service_role (sécurisée, jamais exposée)

## 🧪 Test

Après le déploiement, créer un compte avec une photo. Dans la console, vous devriez voir :
- `⬆️ Upload avatar via Edge Function...`
- `✅ Avatar uploadé avec succès: [URL]`

## ❌ Dépannage

### Erreur : "supabase: command not found"
→ Supabase CLI n'est pas installé. Réessayez l'étape 1.

### Erreur : "Not logged in"
→ Vous n'êtes pas connecté. Réessayez l'étape 2.

### Erreur : "Project not found"
→ Vérifiez que le project-ref `tihrltssmpxpreadpzqm` est correct.

### Erreur : "Function not found"
→ Vérifiez que vous êtes dans le bon dossier et que le fichier `supabase/functions/upload-avatar/index.ts` existe.

## 📝 Notes

- Le déploiement prend généralement 1-2 minutes
- La fonction est disponible immédiatement après le déploiement
- Pas besoin de redémarrer quoi que ce soit

