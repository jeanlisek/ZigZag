# 📊 Guide de Configuration Google Sheets

## Méthode Simple (Recommandée) - Export CSV

### Étape 1 : Créer un Google Sheet

1. Allez sur [Google Sheets](https://sheets.google.com)
2. Créez un nouveau tableur
3. Donnez-lui un nom (ex: "Dashboard ZigZag")

### Étape 2 : Récupérer l'ID du Spreadsheet

1. Regardez l'URL de votre Google Sheet
2. L'URL ressemble à : `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
3. L'ID est la partie entre `/d/` et `/edit`
4. Dans cet exemple : `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Étape 3 : Configurer dans le Dashboard

1. Ouvrez le Dashboard Admin
2. Cliquez sur **"Intégrations"** dans le header
3. Activez **Google Sheets**
4. Collez l'ID du Spreadsheet dans le champ
5. Cliquez sur **"Enregistrer"**

### Étape 4 : Exporter les données

1. Cliquez sur **"Exporter maintenant"**
2. Un fichier CSV sera téléchargé
3. Ouvrez votre Google Sheet
4. Allez dans **Fichier → Importer**
5. Choisissez **"Téléverser"**
6. Sélectionnez le fichier CSV téléchargé
7. Choisissez **"Remplacer la feuille"** ou **"Insérer de nouvelles lignes"**
8. Cliquez sur **"Importer les données"**

✅ **C'est fait !** Vos données sont maintenant dans Google Sheets.

---

## Méthode Avancée - Export Automatique (Nécessite Backend)

Pour un export automatique direct vers Google Sheets sans passer par CSV, vous devez configurer l'API Google Sheets.

### Prérequis

1. Un compte Google Cloud Platform
2. Un projet Google Cloud
3. L'API Google Sheets activée

### Configuration

1. **Créer un projet Google Cloud :**
   - Allez sur [Google Cloud Console](https://console.cloud.google.com)
   - Créez un nouveau projet

2. **Activer l'API Google Sheets :**
   - Dans le menu, allez dans **APIs & Services → Library**
   - Recherchez "Google Sheets API"
   - Cliquez sur **Enable**

3. **Créer des identifiants :**
   - Allez dans **APIs & Services → Credentials**
   - Cliquez sur **Create Credentials → API Key**
   - Copiez la clé API générée

4. **Configurer dans le Dashboard :**
   - Dans la modale Intégrations
   - Collez la clé API dans le champ "Clé API"
   - Enregistrez

### ⚠️ Note Importante

L'export automatique nécessite un **backend** car :
- Les clés API ne doivent pas être exposées côté client
- L'API Google Sheets nécessite une authentification OAuth2 pour les opérations d'écriture
- La sécurité nécessite que les appels API soient faits côté serveur

### Solution Recommandée

Pour l'instant, utilisez la **méthode CSV** qui fonctionne parfaitement :
- Simple et rapide
- Pas besoin de configuration complexe
- Fonctionne immédiatement
- Sécurisé (pas d'exposition de clés API)

---

## Dépannage

### L'ID du Spreadsheet ne fonctionne pas

- Vérifiez que vous avez copié uniquement l'ID (pas l'URL complète)
- Vérifiez que le Google Sheet est accessible (pas privé)
- Testez en cliquant sur "Ouvrir le Sheet" pour vérifier

### Le CSV ne s'importe pas correctement

- Vérifiez que le fichier CSV est bien téléchargé
- Assurez-vous que Google Sheets peut accéder au fichier
- Essayez d'importer manuellement : Fichier → Importer → Téléverser

### Besoin d'aide ?

Si vous avez des erreurs, ouvrez la console du navigateur (F12) et regardez les messages d'erreur.

