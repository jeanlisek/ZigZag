// Système multilingue pour ZigZag

const translations = {
    fr: {
        // Navigation
        'nav.how-it-works': 'Comment ça marche',
        'nav.features': 'Expérience unique',
        'nav.gallery': 'Galerie',
        'nav.play': 'Jouer maintenant',
        
        // Hero
        'hero.title': 'Le jeu qui déforme vos messages à travers le monde.',
        'hero.subtitle': 'Jouez en ligne gratuitement ! Lancez une phrase, un dessin ou un message vocal. Découvrez le dessin hilarant qui en résulte après un tour du monde en 7 étapes.',
        
        // Sections
        'section.how-it-works': 'Comment ça marche ?',
        'section.features': 'Une expérience unique',
        'section.gallery': 'Rien ne se passe jamais comme prévu...',
        
        // Footer
        'footer.contact': 'Contact',
        'footer.press': 'Presse',
        'footer.legal': 'Mentions Légales',
        'footer.copyright': '© 2025 ZigZag. Tous droits réservés.',
        
        // Buttons
        'btn.play': 'Jouer maintenant',
        'btn.contact': 'Contact',
        'btn.home': 'Accueil',
        
        // Common
        'common.loading': 'Chargement...',
        'common.error': 'Une erreur est survenue',
        
        // Cookies
        'cookies.message': 'Nous utilisons des cookies pour améliorer votre expérience sur ZigZag. En continuant à naviguer, vous acceptez notre utilisation des cookies.',
        'cookies.learn-more': 'En savoir plus',
        'cookies.accept': 'Accepter tout',
        'cookies.decline': 'Refuser',
        'cookies.settings': 'Paramètres',
        'cookies.settings-title': 'Paramètres des cookies',
        'cookies.save': 'Enregistrer les préférences',
        'cookies.necessary': 'Cookies nécessaires',
        'cookies.necessary-desc': 'Ces cookies sont essentiels au fonctionnement du site. Ils ne peuvent pas être désactivés.',
        'cookies.analytics': 'Cookies analytiques',
        'cookies.analytics-desc': 'Ces cookies nous aident à comprendre comment les visiteurs utilisent le site en collectant des informations anonymes.',
        'cookies.marketing': 'Cookies marketing',
        'cookies.marketing-desc': 'Ces cookies sont utilisés pour vous proposer des publicités personnalisées et mesurer leur efficacité.',
        
        // Page Jouer (Authentification)
        'jouer.title': 'Inscription & Connexion - ZigZag',
        'jouer.email': 'Email',
        'jouer.username': 'Pseudo',
        'jouer.password': 'Mot de passe',
        'jouer.confirm-password': 'Confirmer',
        'jouer.optional': '(Optionnel)',
        'jouer.remember': 'Se souvenir de moi',
        'jouer.forgot-password': 'Mot de passe oublié ?',
        'jouer.or': 'ou',
        'jouer.signup.title': 'Créer un compte',
        'jouer.signup.subtitle': 'Rejoignez ZigZag !',
        'jouer.signup.profile': 'Photo de Profil',
        'jouer.signup.add-photo': '+ Photo',
        'jouer.signup.submit': 'Créer mon compte',
        'jouer.login.title': 'Se connecter',
        'jouer.login.subtitle': 'Bienvenue !',
        'jouer.login.submit': 'Se connecter',
        'jouer.google.signup': 'Continuer avec Google',
        'jouer.google.login': 'Continuer avec Google',
        'jouer.back-home': 'Retour'
    },
    en: {
        // Navigation
        'nav.how-it-works': 'How it works',
        'nav.features': 'Unique experience',
        'nav.gallery': 'Gallery',
        'nav.play': 'Play now',
        
        // Hero
        'hero.title': 'The game that distorts your messages around the world.',
        'hero.subtitle': 'Play online for free! Launch a phrase, a drawing or a voice message. Discover the hilarious drawing that results after a trip around the world in 7 steps.',
        
        // Sections
        'section.how-it-works': 'How it works?',
        'section.features': 'A unique experience',
        'section.gallery': 'Nothing ever goes as planned...',
        
        // Footer
        'footer.contact': 'Contact',
        'footer.press': 'Press',
        'footer.legal': 'Legal Notice',
        'footer.copyright': '© 2025 ZigZag. All rights reserved.',
        
        // Buttons
        'btn.play': 'Play now',
        'btn.contact': 'Contact',
        'btn.home': 'Home',
        
        // Common
        'common.loading': 'Loading...',
        'common.error': 'An error occurred',
        
        // Cookies
        'cookies.message': 'We use cookies to improve your experience on ZigZag. By continuing to browse, you accept our use of cookies.',
        'cookies.learn-more': 'Learn more',
        'cookies.accept': 'Accept all',
        'cookies.decline': 'Decline',
        'cookies.settings': 'Settings',
        'cookies.settings-title': 'Cookie Settings',
        'cookies.save': 'Save preferences',
        'cookies.necessary': 'Necessary cookies',
        'cookies.necessary-desc': 'These cookies are essential for the website to function. They cannot be disabled.',
        'cookies.analytics': 'Analytics cookies',
        'cookies.analytics-desc': 'These cookies help us understand how visitors use the site by collecting anonymous information.',
        'cookies.marketing': 'Marketing cookies',
        'cookies.marketing-desc': 'These cookies are used to provide you with personalized ads and measure their effectiveness.',
        
        // Page Jouer (Authentication)
        'jouer.title': 'Sign Up & Login - ZigZag',
        'jouer.email': 'Email',
        'jouer.username': 'Username',
        'jouer.password': 'Password',
        'jouer.confirm-password': 'Confirm',
        'jouer.optional': '(Optional)',
        'jouer.remember': 'Remember me',
        'jouer.forgot-password': 'Forgot password?',
        'jouer.or': 'or',
        'jouer.signup.title': 'Create an account',
        'jouer.signup.subtitle': 'Join ZigZag!',
        'jouer.signup.profile': 'Profile Picture',
        'jouer.signup.add-photo': '+ Photo',
        'jouer.signup.submit': 'Create my account',
        'jouer.login.title': 'Sign in',
        'jouer.login.subtitle': 'Welcome!',
        'jouer.login.submit': 'Sign in',
        'jouer.google.signup': 'Continue with Google',
        'jouer.google.login': 'Continue with Google',
        'jouer.back-home': 'Back'
    }
};

// Détecter la langue du navigateur (toujours détecter, ne pas utiliser localStorage)
function detectLanguage() {
    // Détecter la langue du navigateur
    const browserLang = navigator.language || navigator.userLanguage || 'fr';
    const langCode = browserLang.split('-')[0].toLowerCase();
    
    // Retourner la langue détectée ou français par défaut
    return translations[langCode] ? langCode : 'fr';
}

// Obtenir la traduction
function t(key, lang = null) {
    const currentLang = lang || getCurrentLanguage();
    const keys = key.split('.');
    let value = translations[currentLang];
    
    for (const k of keys) {
        value = value?.[k];
    }
    
    // Fallback sur le français si la traduction n'existe pas
    if (!value && currentLang !== 'fr') {
        let fallback = translations.fr;
        for (const k of keys) {
            fallback = fallback?.[k];
        }
        return fallback || key;
    }
    
    return value || key;
}

// Obtenir la langue actuelle (toujours détecter, pas de sauvegarde)
function getCurrentLanguage() {
    return detectLanguage();
}

// Changer la langue (fonction conservée pour compatibilité, mais ne sauvegarde plus)
function setLanguage(lang) {
    if (!translations[lang]) {
        console.warn(`Langue ${lang} non supportée`);
        return;
    }
    
    // Ne plus sauvegarder dans localStorage - détection automatique uniquement
    document.documentElement.lang = lang;
    updatePageContent();
}

// Mettre à jour le contenu de la page
function updatePageContent() {
    const lang = getCurrentLanguage();
    
    // Mettre à jour les éléments avec data-i18n
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        if (!key) return;
        
        const translation = t(key, lang);
        if (!translation || translation === key) return; // Éviter de remplacer par la clé
        
        try {
            if (element.tagName === 'INPUT') {
                if (element.type === 'text' || element.type === 'email' || element.type === 'search') {
                    element.placeholder = translation;
                } else if (element.type === 'submit' || element.type === 'button') {
                    element.value = translation;
                }
            } else if (element.tagName === 'BUTTON') {
                // Pour les boutons, préserver les enfants (SVG, etc.) et remplacer seulement le texte
                const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === 3);
                if (textNodes.length > 0) {
                    // Remplacer le premier nœud texte
                    textNodes[0].textContent = translation;
                } else if (element.children.length === 0) {
                    // Pas d'enfants, remplacer tout
                    element.textContent = translation;
                } else {
                    // Il y a des enfants, ajouter le texte après
                    const existingText = textNodes.map(n => n.textContent).join('').trim();
                    if (!existingText) {
                        // Pas de texte existant, ajouter après les enfants
                        element.appendChild(document.createTextNode(translation));
                    }
                }
            } else if (element.tagName === 'A') {
                // Pour les liens, préserver les enfants (SVG, etc.) et remplacer le texte
                const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === 3);
                if (textNodes.length > 0) {
                    // Remplacer le premier nœud texte
                    textNodes[0].textContent = translation;
                } else if (element.children.length === 0) {
                    element.textContent = translation;
                } else {
                    // Il y a des enfants, chercher un span avec data-i18n ou ajouter le texte
                    const span = element.querySelector('span[data-i18n]');
                    if (span) {
                        span.textContent = translation;
                    } else {
                        // Ajouter le texte après les enfants
                        const existingText = textNodes.map(n => n.textContent).join('').trim();
                        if (!existingText) {
                            element.appendChild(document.createTextNode(' ' + translation));
                        }
                    }
                }
            } else if (element.tagName === 'SPAN') {
                // Pour les spans, remplacer simplement le texte
                element.textContent = translation;
            } else {
                // Pour les autres éléments (p, h1, h2, span, etc.)
                // Si l'élément a des enfants, ne remplacer que les nœuds texte
                if (element.children.length > 0) {
                    const textNodes = Array.from(element.childNodes).filter(node => node.nodeType === 3);
                    if (textNodes.length > 0) {
                        // Remplacer tous les nœuds texte par la traduction
                        textNodes.forEach(node => node.remove());
                        // Insérer la traduction au début
                        element.insertBefore(document.createTextNode(translation), element.firstChild);
                    }
                } else {
                    // Pas d'enfants, remplacer tout
                    element.textContent = translation;
                }
            }
        } catch (e) {
            console.warn('Erreur lors de la traduction de', key, e);
        }
    });
    
    // Mettre à jour les attributs alt et title
    document.querySelectorAll('[data-i18n-alt]').forEach(element => {
        const key = element.getAttribute('data-i18n-alt');
        if (key) {
            element.alt = t(key, lang);
        }
    });
    
    document.querySelectorAll('[data-i18n-title]').forEach(element => {
        const key = element.getAttribute('data-i18n-title');
        if (key) {
            element.title = t(key, lang);
        }
    });
}

// Plus de sélecteur de langue - détection automatique uniquement

// Exporter pour utilisation globale (immédiatement)
window.ZigZagI18n = {
    t,
    setLanguage,
    getCurrentLanguage,
    updatePageContent
};

// Initialiser
document.addEventListener('DOMContentLoaded', function() {
    const lang = detectLanguage();
    document.documentElement.lang = lang;
    
    // Pas de sélecteur - détection automatique uniquement
    // Attendre un peu pour que tous les éléments soient dans le DOM
    setTimeout(() => {
        updatePageContent();
    }, 50);
    
    // Réappliquer les traductions après un court délai (pour les éléments créés dynamiquement)
    setTimeout(() => {
        updatePageContent();
    }, 500);
});






