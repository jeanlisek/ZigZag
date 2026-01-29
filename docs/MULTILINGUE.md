# Système Multilingue (i18n)

## Vue d'ensemble

Le site ZigZag intègre un système multilingue permettant de basculer entre le français et l'anglais. Le système détecte automatiquement la langue du navigateur et permet à l'utilisateur de changer de langue via un sélecteur.

## Fichiers

- **`i18n.js`** : Système de traduction et gestion des langues

## Fonctionnalités

### 1. Détection automatique

- **Langue du navigateur** : Détection de la langue configurée dans le navigateur
- **Fallback** : Français par défaut si la langue détectée n'est pas supportée
- **Sauvegarde** : La langue choisie est sauvegardée dans `localStorage`

### 2. Sélecteur de langue

- **Position** : Fixe en haut à droite (sous la navbar)
- **Design** : Boutons avec indicateur de langue active
- **Langues disponibles** :
  - **FR** : Français (par défaut)
  - **EN** : Anglais

### 3. Traduction automatique

- **Attribut `data-i18n`** : Les éléments avec cet attribut sont traduits automatiquement
- **Mise à jour dynamique** : Le contenu se met à jour immédiatement lors du changement de langue
- **Support des attributs** :
  - `data-i18n` : Texte de l'élément
  - `data-i18n-alt` : Attribut `alt` des images
  - `data-i18n-title` : Attribut `title`

## Utilisation

### Dans les fichiers HTML

Ajouter l'attribut `data-i18n` aux éléments à traduire :

```html
<!-- Texte simple -->
<h1 data-i18n="hero.title">Le jeu qui déforme vos messages</h1>

<!-- Lien -->
<a href="/" data-i18n="nav.how-it-works">Comment ça marche</a>

<!-- Placeholder -->
<input type="text" data-i18n="form.email" placeholder="Email">

<!-- Alt d'image -->
<img src="logo.png" data-i18n-alt="logo.alt" alt="Logo ZigZag">
```

### Clés de traduction

Les clés suivent une hiérarchie avec des points :

- `nav.how-it-works` : Navigation → Comment ça marche
- `hero.title` : Hero → Titre
- `footer.contact` : Footer → Contact

### Ajouter une nouvelle traduction

Dans `i18n.js`, ajouter la clé dans les deux langues :

```javascript
const translations = {
    fr: {
        'nouvelle.section': 'Texte en français'
    },
    en: {
        'nouvelle.section': 'Text in English'
    }
};
```

Puis dans le HTML :

```html
<p data-i18n="nouvelle.section">Texte en français</p>
```

## Intégration

### Dans les fichiers HTML

```html
<!-- JavaScript (en premier, avant les autres scripts) -->
<script src="i18n.js"></script>
```

### Ordre de chargement

1. `i18n.js` (doit être chargé en premier)
2. `cookies.js`
3. `script.js`
4. `chatbot.js`

## Fonctionnement technique

### Détection de langue

```javascript
// 1. Vérifier localStorage
const savedLang = localStorage.getItem('zigzag-language');

// 2. Sinon, détecter la langue du navigateur
const browserLang = navigator.language.split('-')[0];

// 3. Fallback sur français
return translations[lang] ? lang : 'fr';
```

### Mise à jour du contenu

- Le script parcourt tous les éléments avec `data-i18n`
- Il remplace le texte par la traduction correspondante
- L'attribut `lang` du `<html>` est mis à jour

### API globale

Le système expose une API globale `window.ZigZagI18n` :

```javascript
// Obtenir une traduction
ZigZagI18n.t('nav.how-it-works');

// Changer la langue
ZigZagI18n.setLanguage('en');

// Obtenir la langue actuelle
ZigZagI18n.getCurrentLanguage();

// Forcer la mise à jour
ZigZagI18n.updatePageContent();
```

## Traductions disponibles

### Navigation
- `nav.how-it-works` : Comment ça marche / How it works
- `nav.features` : Expérience unique / Unique experience
- `nav.gallery` : Galerie / Gallery
- `nav.play` : Jouer maintenant / Play now

### Hero
- `hero.title` : Titre principal
- `hero.subtitle` : Sous-titre

### Sections
- `section.how-it-works` : Comment ça marche ?
- `section.features` : Une expérience unique
- `section.gallery` : Rien ne se passe jamais comme prévu...

### Footer
- `footer.contact` : Contact
- `footer.press` : Presse / Press
- `footer.legal` : Mentions Légales / Legal Notice
- `footer.copyright` : Copyright

### Boutons
- `btn.play` : Jouer maintenant / Play now
- `btn.contact` : Contact
- `btn.home` : Accueil / Home

## Ajouter une nouvelle langue

1. Ajouter la langue dans `translations` :

```javascript
const translations = {
    fr: { ... },
    en: { ... },
    es: {  // Nouvelle langue
        'nav.how-it-works': 'Cómo funciona',
        // ... toutes les autres clés
    }
};
```

2. Le sélecteur de langue s'ajoutera automatiquement

## Pages concernées

- `index.html` : Partiellement traduit (navigation, hero, footer)
- Les autres pages peuvent être traduites en ajoutant `data-i18n` aux éléments

## Personnalisation

### Modifier la position du sélecteur

Dans `i18n.js`, modifier les styles inline de `createLanguageSelector()` :

```javascript
selector.style.cssText = `
    position: fixed;
    top: 80px;  // Modifier ici
    right: 20px;  // Modifier ici
    // ...
`;
```

### Modifier le style des boutons

Les styles sont inline dans `createLanguageSelector()`. Modifier les propriétés CSS selon vos besoins.

## Notes importantes

- **Fallback** : Si une traduction n'existe pas, le système affiche la clé ou le texte français
- **Performance** : Les traductions sont chargées en mémoire, pas de requêtes serveur
- **Persistance** : La langue choisie est sauvegardée dans `localStorage` sous la clé `zigzag-language`
- **SEO** : L'attribut `lang` du `<html>` est mis à jour automatiquement

## Tests

### Vérifier le fonctionnement

1. Ouvrir le site
2. Le sélecteur de langue doit apparaître en haut à droite
3. Cliquer sur "EN" : le contenu doit se traduire
4. Recharger la page : la langue doit être conservée
5. Vérifier que l'attribut `lang` du `<html>` change

### Commandes de test

```javascript
// Changer la langue programmatiquement
ZigZagI18n.setLanguage('en');

// Obtenir la langue actuelle
ZigZagI18n.getCurrentLanguage();

// Réinitialiser (retour au français)
localStorage.removeItem('zigzag-language');
location.reload();
```






