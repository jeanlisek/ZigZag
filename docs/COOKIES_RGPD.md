# Bannière de Consentement aux Cookies RGPD

## Vue d'ensemble

Le site ZigZag intègre une bannière de consentement aux cookies conforme au RGPD (Règlement Général sur la Protection des Données). Cette fonctionnalité permet aux utilisateurs de choisir quels types de cookies ils acceptent.

## Fichiers

- **`cookies.css`** : Styles de la bannière et du panneau de paramètres
- **`cookies.js`** : Logique de gestion du consentement et des préférences

## Fonctionnalités

### 1. Bannière de consentement

- **Affichage** : Bannière fixe en bas de l'écran
- **Délai** : Apparaît après 1 seconde de navigation
- **Actions** :
  - **Accepter tout** : Active tous les cookies (nécessaires, analytiques, marketing)
  - **Refuser** : Active uniquement les cookies nécessaires
  - **Paramètres** : Ouvre le panneau de configuration détaillée

### 2. Panneau de paramètres

- **Catégories de cookies** :
  - **Cookies nécessaires** : Toujours activés (non désactivables)
  - **Cookies analytiques** : Pour comprendre l'utilisation du site
  - **Cookies marketing** : Pour la publicité personnalisée

- **Fonctionnalités** :
  - Toggles pour activer/désactiver chaque catégorie
  - Description de chaque catégorie
  - Boutons "Enregistrer les préférences" et "Refuser tout"

### 3. Stockage des préférences

- **LocalStorage** : Les préférences sont sauvegardées dans `localStorage`
- **Clés utilisées** :
  - `zigzag-cookie-consent` : Indique si le consentement a été donné
  - `zigzag-cookie-preferences` : Stocke les préférences détaillées (JSON)

### 4. Application des préférences

- Les préférences sont appliquées immédiatement après le consentement
- Les cookies sont initialisés selon les choix de l'utilisateur
- Les préférences sont conservées entre les sessions

## Intégration

### Dans les fichiers HTML

```html
<!-- CSS -->
<link rel="stylesheet" href="cookies.css">

<!-- JavaScript (avant script.js) -->
<script src="cookies.js"></script>
```

### Ordre de chargement

1. `i18n.js` (si multilingue)
2. `cookies.js`
3. `script.js`
4. `chatbot.js`

## Personnalisation

### Modifier les catégories de cookies

Dans `cookies.js`, modifier l'objet `cookieCategories` :

```javascript
const cookieCategories = {
    necessary: {
        name: 'Cookies nécessaires',
        description: 'Description...',
        required: true
    },
    // Ajouter d'autres catégories
};
```

### Modifier les textes

Les textes sont directement dans le HTML généré par JavaScript. Modifier les chaînes dans `cookies.js` :

```javascript
banner.innerHTML = `
    <div class="cookies-banner-text">
        <p>Votre texte personnalisé ici</p>
    </div>
`;
```

### Modifier les styles

Les styles sont dans `cookies.css`. Principales classes :
- `.cookies-banner` : Bannière principale
- `.cookies-settings` : Panneau de paramètres
- `.cookie-category` : Catégorie de cookie
- `.cookie-toggle` : Toggle d'activation/désactivation

## Conformité RGPD

### Points de conformité

1. **Consentement explicite** : L'utilisateur doit cliquer pour accepter
2. **Choix granulaire** : Possibilité de choisir par catégorie
3. **Facilité de retrait** : Possibilité de modifier les préférences
4. **Information claire** : Description de chaque catégorie
5. **Lien vers mentions légales** : Lien vers la section cookies des mentions légales

### Recommandations

- Ajouter une section "Cookies" dans `mentions-legales.html` avec :
  - Liste détaillée des cookies utilisés
  - Durée de conservation
  - Finalité de chaque cookie
  - Informations sur les tiers (Google Analytics, etc.)

## Pages concernées

- `index.html`
- `contact.html`
- `presse.html`
- `mentions-legales.html`
- `jouer.html`
- `404.html`
- `500.html`

## Tests

### Vérifier le fonctionnement

1. Ouvrir le site dans un navigateur
2. La bannière doit apparaître après 1 seconde
3. Tester les trois boutons (Accepter, Refuser, Paramètres)
4. Vérifier que les préférences sont sauvegardées
5. Recharger la page : la bannière ne doit plus apparaître
6. Vider le localStorage pour réinitialiser

### Commandes de test

```javascript
// Vérifier les préférences sauvegardées
localStorage.getItem('zigzag-cookie-preferences');

// Réinitialiser le consentement
localStorage.removeItem('zigzag-cookie-consent');
localStorage.removeItem('zigzag-cookie-preferences');
location.reload();
```

## Notes importantes

- Les cookies nécessaires sont **toujours activés** (conformité RGPD)
- Le consentement est **valable jusqu'à modification** par l'utilisateur
- Les préférences sont **stockées localement** (pas de base de données)
- La bannière n'apparaît qu'**une seule fois** par utilisateur






