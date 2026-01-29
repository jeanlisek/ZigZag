# 🔗 Guide des Intégrations

## Comment accéder aux intégrations

1. **Dans le header du dashboard**, cliquez sur le bouton **"Intégrations"** (icône de cube)
2. Une modale s'ouvre avec toutes les options d'intégration

## Intégrations disponibles

### 1. Google Sheets 📊

**Fonctionnalité :** Exportez vos données vers Google Sheets

**Configuration :**
1. Activez Google Sheets dans la modale
2. Entrez l'ID du Spreadsheet (trouvable dans l'URL du Google Sheet)
3. (Optionnel) Ajoutez votre clé API pour l'export automatique

**Utilisation :**
- Cliquez sur "Exporter maintenant" pour générer un CSV
- Importez le CSV dans Google Sheets

**Note :** Pour l'export automatique, vous devez configurer l'API Google Sheets (nécessite un backend)

### 2. Slack 💬

**Fonctionnalité :** Recevez les alertes directement sur Slack

**Configuration :**
1. Créez un webhook Slack :
   - Allez sur https://api.slack.com/messaging/webhooks
   - Créez une nouvelle app Slack
   - Activez les Incoming Webhooks
   - Copiez l'URL du webhook
2. Dans la modale Intégrations :
   - Activez Slack
   - Collez l'URL du webhook
   - Choisissez le canal (ex: #alerts)
3. Cliquez sur "Tester l'envoi" pour vérifier

**Événements déclenchés automatiquement :**
- Alertes (taux d'activation faible, CPA élevé, etc.)
- Nouveaux utilisateurs
- Rapports générés

### 3. Discord 🎮

**Fonctionnalité :** Recevez les alertes sur Discord

**Configuration :**
1. Créez un webhook Discord :
   - Dans votre serveur Discord, allez dans Paramètres du canal
   - Intégrations → Webhooks → Nouveau webhook
   - Copiez l'URL du webhook
2. Dans la modale Intégrations :
   - Activez Discord
   - Collez l'URL du webhook
3. Cliquez sur "Tester l'envoi" pour vérifier

### 4. Webhooks Personnalisés 🔗

**Fonctionnalité :** Créez vos propres webhooks pour intégrer avec n'importe quel service

**Configuration :**
1. Cliquez sur "+ Ajouter un webhook"
2. Entrez :
   - Nom du webhook
   - URL du webhook
   - Événements à écouter (séparés par des virgules)
     - Exemples : `new_user`, `alert`, `report`, `cost_added`

**Événements disponibles :**
- `new_user` : Nouvel utilisateur inscrit
- `alert` : Alerte déclenchée
- `report` : Rapport généré
- `cost_added` : Coût publicitaire ajouté
- `checklist_completed` : Tâche de checklist complétée

**Format des données envoyées :**
```json
{
  "event": "alert",
  "data": {
    "type": "activationRate",
    "value": 45,
    "message": "Taux d'activation faible: 45%"
  },
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

## Test des intégrations

Toutes les intégrations ont un bouton "Tester" qui envoie un message de test pour vérifier que la configuration fonctionne.

## Vérification du fonctionnement

### ✅ Ce qui fonctionne maintenant :

1. **Interface des intégrations** - Modale complète avec toutes les options
2. **Configuration Slack** - Test et envoi de messages
3. **Configuration Discord** - Test et envoi de messages
4. **Webhooks personnalisés** - Création, test, activation/désactivation
5. **Export Google Sheets** - Génération de CSV (importable dans Sheets)
6. **Déclenchement automatique** - Les alertes déclenchent automatiquement les webhooks configurés

### ⚠️ Ce qui nécessite un backend :

1. **Export automatique Google Sheets** - Nécessite l'API Google Sheets configurée côté serveur
2. **Envoi d'emails** - Nécessite un service d'email (SendGrid, Mailgun, etc.)
3. **Webhooks sécurisés** - En production, les webhooks devraient être validés côté serveur

## Exemple d'utilisation

1. **Configurer Slack pour les alertes :**
   - Ouvrez Intégrations
   - Activez Slack
   - Collez votre webhook URL
   - Sauvegardez
   - Dès qu'une alerte se déclenche, vous recevrez un message sur Slack !

2. **Créer un webhook pour Zapier/Make :**
   - Ajoutez un webhook personnalisé
   - URL : Votre webhook Zapier/Make
   - Événements : `new_user, alert`
   - Activez-le
   - Tous les nouveaux utilisateurs et alertes seront envoyés à Zapier/Make !

## Dépannage

**Le test ne fonctionne pas ?**
- Vérifiez que l'URL du webhook est correcte
- Vérifiez que le webhook est actif dans le service externe
- Ouvrez la console du navigateur (F12) pour voir les erreurs

**Les alertes ne sont pas envoyées ?**
- Vérifiez que l'intégration est activée
- Vérifiez que les événements sont bien sélectionnés pour les webhooks
- Vérifiez la console pour les erreurs

