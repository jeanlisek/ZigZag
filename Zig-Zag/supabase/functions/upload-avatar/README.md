# Edge Function: upload-avatar

## Description

Cette Edge Function permet d'uploader un avatar lors de l'inscription, même si l'utilisateur n'est pas encore connecté. Elle utilise le service_role pour contourner les restrictions RLS.

## Déploiement

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
   supabase functions deploy upload-avatar
   ```

## Utilisation

### Depuis le frontend (jouer.html)

```javascript
const formData = new FormData();
formData.append('file', profileFile);
formData.append('userId', data.user.id);

const response = await fetch('https://tihrltssmpxpreadpzqm.supabase.co/functions/v1/upload-avatar', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${SUPABASE_ANON_KEY}`
  },
  body: formData
});

const result = await response.json();
if (result.success) {
  console.log('Avatar uploadé:', result.avatarUrl);
}
```

## Variables d'environnement requises

- `SUPABASE_URL` : URL de votre projet Supabase
- `SUPABASE_SERVICE_ROLE_KEY` : Clé service_role (ajoutée automatiquement par Supabase)

## Sécurité

- ✅ Vérification de la taille du fichier (max 2 MB)
- ✅ Vérification du type MIME (images uniquement)
- ✅ Utilisation du service_role uniquement côté serveur
- ✅ Validation de l'ID utilisateur

