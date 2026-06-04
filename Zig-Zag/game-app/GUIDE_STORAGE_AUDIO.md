# 🎤 Guide de Configuration - Storage Audio

**Date** : 22 Décembre 2024  
**Objectif** : Configurer Supabase Storage pour les enregistrements audio

---

## 📋 Vue d'ensemble

Les enregistrements audio sont maintenant stockés dans Supabase Storage au lieu d'être sauvegardés directement en base de données. Cela permet :
- ✅ URLs publiques persistantes (accessibles par tous les joueurs)
- ✅ Pas de limite de taille dans la base de données
- ✅ Meilleure performance
- ✅ Partage facile des récapitulatifs de partie sur les réseaux sociaux

---

## 🚀 Configuration en 3 Étapes

### Étape 1 : Créer le Bucket dans Supabase Dashboard

1. **Aller sur** [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. **Sélectionner** votre projet ZigZag
3. **Cliquer sur** "Storage" dans le menu de gauche
4. **Cliquer sur** "New bucket"
5. **Configurer le bucket** :
   - **Name** : `audio-recordings`
   - **Public bucket** : ✅ **Cocher** (pour permettre la lecture publique)
   - **File size limit** : `5242880` (5 MB - environ 30 secondes d'audio)
   - **Allowed MIME types** : 
     ```
     audio/webm, audio/ogg, audio/mp4, audio/aac, audio/wav
     ```
6. **Cliquer sur** "Create bucket"

✅ **Vérification** : Vous devriez voir le bucket `audio-recordings` dans la liste des buckets.

---

### Étape 2 : Configurer les Politiques RLS

1. **Aller dans** le SQL Editor de Supabase
2. **Ouvrir** le fichier `sql/09_audio_storage_setup.sql`
3. **Copier** tout le contenu (sauf les commentaires d'instructions)
4. **Coller** dans l'éditeur SQL
5. **Exécuter** le script (Run ou Ctrl+Enter)

✅ **Vérification** : Les politiques RLS devraient être créées. Vous pouvez vérifier dans "Storage" > "Policies".

---

### Étape 3 : Vérifier la Configuration

**Tester que le bucket existe** :
```sql
SELECT * FROM storage.buckets WHERE id = 'audio-recordings';
```

**Tester les politiques RLS** :
```sql
SELECT * FROM pg_policies 
WHERE tablename = 'objects' 
AND policyname LIKE '%audio%';
```

Vous devriez voir 4 politiques :
1. `Users can upload audio recordings` (INSERT)
2. `Public can read audio recordings` (SELECT)
3. `Users can update their audio recordings` (UPDATE)
4. `Users can delete their audio recordings` (DELETE)

---

## 📁 Structure des Fichiers

Les fichiers audio sont organisés comme suit :

```
audio-recordings/
  ├── {game_id}/
  │   ├── 1-{player_id}.webm
  │   ├── 2-{player_id}.ogg
  │   └── ...
```

**Format des noms de fichiers** : `{step_number}-{player_id}.{extension}`

**Exemple** :
- `abc-123-def/1-xyz-789-player.webm`
- `abc-123-def/2-xyz-789-player.ogg`

---

## 🔧 Fonctionnement Technique

### 1. Enregistrement Audio

Quand un joueur enregistre un audio :
1. Le composant `AudioRecorder` crée un blob avec `MediaRecorder`
2. Une `blob: URL` temporaire est créée
3. Le joueur peut écouter et réenregistrer si nécessaire

### 2. Upload vers Storage

Quand le joueur soumet son étape :
1. La fonction `submitStep` détecte que `content` est une `blob: URL`
2. Le blob est récupéré via `fetch()`
3. Le fichier est uploadé vers `audio-recordings/{game_id}/{step_number}-{player_id}.{ext}`
4. L'URL publique est obtenue via `getPublicUrl()`
5. Le contenu est remplacé par l'URL HTTPS publique
6. La `blob: URL` est révoquée pour libérer la mémoire

### 3. Lecture Audio

Quand un autre joueur visualise l'étape :
1. `StepViewer` récupère l'URL HTTPS depuis `step.content`
2. Le navigateur charge l'audio depuis Supabase Storage
3. L'élément `<audio>` avec `controls` permet la lecture

---

## ⚠️ Points d'Attention

### Formats Audio

Les formats audio varient selon le navigateur :
- **Chrome/Edge** : `audio/webm`
- **Firefox** : `audio/ogg` ou `audio/webm`
- **Safari** : `audio/mp4` ou `audio/aac`

Le code détecte automatiquement le format et l'extension depuis le type MIME.

### Taille des Fichiers

- **Limite configurée** : 5 MB par fichier
- **Réalité** : 30 secondes d'audio ≈ 1-3 MB
- Si besoin d'augmenter, modifier la limite dans le bucket

### Nettoyage

⚠️ **Pas encore implémenté** : Un système de nettoyage automatique devrait être ajouté pour supprimer les fichiers audio des parties terminées depuis plus de X jours (pour économiser l'espace de stockage).

---

## 🐛 Dépannage

### Erreur : "Bucket not found"

✅ **Solution** : Vérifier que le bucket `audio-recordings` existe bien dans Supabase Dashboard > Storage.

### Erreur : "Permission denied"

✅ **Solution** : Vérifier que les politiques RLS sont bien créées (exécuter `09_audio_storage_setup.sql`).

### Erreur : "File size limit exceeded"

✅ **Solution** : Augmenter la limite de taille du bucket dans Supabase Dashboard.

### L'audio ne se lit pas

✅ **Vérifications** :
1. Vérifier que l'URL dans `step.content` est bien une URL HTTPS
2. Vérifier que le bucket est public
3. Vérifier les permissions du navigateur (CORS)

---

## 📝 Notes pour le Futur

### Partage sur Réseaux Sociaux

Les URLs publiques permettent facilement :
- Partager un récapitulatif de partie avec les enregistrements audio
- Intégrer les audios dans des pages de résultats
- Créer des exports MP3/autres formats si besoin

### Évolutions Possibles

1. **Compression audio** : Ajouter une compression côté client avant upload
2. **Nettoyage automatique** : Créer un job qui supprime les fichiers > 30 jours
3. **Limite par utilisateur** : Ajouter une limite d'espace par utilisateur
4. **Format standardisé** : Convertir tous les formats en MP3 pour compatibilité maximale

---

## ✅ Checklist de Vérification

- [ ] Bucket `audio-recordings` créé et configuré comme public
- [ ] Politiques RLS exécutées (fichier `09_audio_storage_setup.sql`)
- [ ] Test d'enregistrement audio dans le jeu
- [ ] Vérification que l'audio est uploadé dans Storage
- [ ] Test de lecture audio par un autre joueur
- [ ] Test après rechargement de page
- [ ] Vérification que l'URL est bien HTTPS (pas blob:)

---

**Fichiers modifiés** :
- `Zig-Zag/game-app/src/lib/supabase/games.ts` - Upload vers Storage
- `Zig-Zag/game-app/src/utils/validation.ts` - Validation des URLs HTTPS
- `Zig-Zag/game-app/src/components/game/StepViewer.tsx` - Détection du type MIME
- `Zig-Zag/sql/09_audio_storage_setup.sql` - Configuration Storage

