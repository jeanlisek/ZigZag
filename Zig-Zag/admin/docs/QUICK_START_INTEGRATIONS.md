# 🚀 Guide Rapide - Intégrations

## 📊 Google Sheets - Configuration en 3 étapes

### Étape 1 : Créer un Google Sheet
1. Allez sur https://sheets.google.com
2. Cliquez sur "Nouveau" → "Nouveau tableur"
3. Donnez-lui un nom (ex: "Dashboard ZigZag")

### Étape 2 : Récupérer l'ID
1. Regardez l'URL de votre Google Sheet
2. L'URL ressemble à : `https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit`
3. **Copiez la partie entre `/d/` et `/edit`**
   - Dans cet exemple : `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms`

### Étape 3 : Configurer dans le Dashboard
1. Ouvrez le Dashboard Admin
2. Cliquez sur **"Intégrations"** dans le header (icône cube)
3. Activez **Google Sheets** (cochez la case)
4. Collez l'ID dans le champ "ID du Spreadsheet"
5. Cliquez sur **"Enregistrer"**

### Exporter les données
1. Cliquez sur **"Exporter maintenant"**
2. Un fichier CSV sera téléchargé
3. Ouvrez votre Google Sheet
4. **Fichier → Importer → Téléverser**
5. Sélectionnez le CSV téléchargé
6. Choisissez **"Remplacer la feuille"** ou **"Insérer de nouvelles lignes"**
7. Cliquez sur **"Importer les données"**

✅ **C'est fait !** Vos données sont dans Google Sheets.

---

## 💬 Slack - Configuration

1. Créez un webhook Slack :
   - https://api.slack.com/messaging/webhooks
   - Créez une app → Activez Incoming Webhooks
   - Copiez l'URL du webhook

2. Dans le Dashboard :
   - Intégrations → Activez Slack
   - Collez l'URL du webhook
   - Choisissez le canal (#alerts)
   - Testez avec "Tester l'envoi"

---

## 🎮 Discord - Configuration

1. Créez un webhook Discord :
   - Serveur Discord → Paramètres du canal
   - Intégrations → Webhooks → Nouveau webhook
   - Copiez l'URL

2. Dans le Dashboard :
   - Intégrations → Activez Discord
   - Collez l'URL
   - Testez

---

## 🔗 Webhooks Personnalisés

1. Cliquez sur "+ Ajouter un webhook"
2. Remplissez :
   - Nom
   - URL du webhook
   - Événements à écouter (cochez les cases)
3. Sauvegardez

---

## ⚠️ Résolution des erreurs

### Erreur : "showIntegrations is not defined"
**Solution :** Vérifiez que `admin_advanced.js` est bien chargé après `admin.js` dans `admin.html`

### Erreur : "supabaseClient is not defined"
**Solution :** Vérifiez que le script Supabase est chargé avant `admin_advanced.js`

### Le bouton Intégrations ne fonctionne pas
**Solution :** Ouvrez la console (F12) et vérifiez les erreurs JavaScript

### L'export CSV ne fonctionne pas
**Solution :** Vérifiez que vous avez bien activé Google Sheets et entré l'ID

---

## 📞 Besoin d'aide ?

Si vous voyez une erreur spécifique :
1. Ouvrez la console du navigateur (F12)
2. Copiez le message d'erreur complet
3. Vérifiez que tous les fichiers sont bien chargés

