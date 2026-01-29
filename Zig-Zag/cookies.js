// Gestion du consentement aux cookies RGPD

document.addEventListener('DOMContentLoaded', function() {
    const COOKIE_CONSENT_KEY = 'zigzag-cookie-consent';
    const COOKIE_PREFERENCES_KEY = 'zigzag-cookie-preferences';
    
    // Catégories de cookies (les noms et descriptions sont traduits via i18n)
    const cookieCategories = {
        necessary: {
            name: 'Cookies nécessaires', // Sera remplacé par i18n
            description: 'Ces cookies sont essentiels au fonctionnement du site. Ils ne peuvent pas être désactivés.', // Sera remplacé par i18n
            required: true
        },
        analytics: {
            name: 'Cookies analytiques', // Sera remplacé par i18n
            description: 'Ces cookies nous aident à comprendre comment les visiteurs utilisent le site en collectant des informations anonymes.', // Sera remplacé par i18n
            required: false
        },
        marketing: {
            name: 'Cookies marketing', // Sera remplacé par i18n
            description: 'Ces cookies sont utilisés pour vous proposer des publicités personnalisées et mesurer leur efficacité.', // Sera remplacé par i18n
            required: false
        }
    };

    // Créer la bannière
    function createBanner() {
        // Vérifier si la bannière existe déjà
        let banner = document.getElementById('cookiesBanner');
        if (banner) {
            return banner;
        }
        
        banner = document.createElement('div');
        banner.className = 'cookies-banner';
        banner.id = 'cookiesBanner';
        banner.innerHTML = `
            <div class="cookies-banner-content">
                <div class="cookies-banner-text">
                    <p>
                        🍪 <span data-i18n="cookies.message">Nous utilisons des cookies pour améliorer votre expérience sur ZigZag. En continuant à naviguer, vous acceptez notre utilisation des cookies.</span> 
                        <a href="mentions-legales#cookies" target="_blank" data-i18n="cookies.learn-more">En savoir plus</a>
                    </p>
                </div>
                <div class="cookies-banner-actions">
                    <button class="cookies-btn cookies-btn-settings" id="cookiesSettingsBtn" data-i18n="cookies.settings">
                        Paramètres
                    </button>
                    <button class="cookies-btn cookies-btn-decline" id="cookiesDeclineBtn" data-i18n="cookies.decline">
                        Refuser
                    </button>
                    <button class="cookies-btn cookies-btn-accept" id="cookiesAcceptBtn" data-i18n="cookies.accept">
                        Accepter tout
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);
        
        // Mettre à jour les traductions si i18n est disponible
        if (window.ZigZagI18n && window.ZigZagI18n.updatePageContent) {
            setTimeout(() => {
                window.ZigZagI18n.updatePageContent();
            }, 50);
        }
        
        return banner;
    }

    // Créer le panneau de paramètres
    function createSettingsPanel() {
        const panel = document.createElement('div');
        panel.className = 'cookies-settings';
        panel.id = 'cookiesSettings';
        
        let categoriesHTML = '';
        Object.keys(cookieCategories).forEach(key => {
            const category = cookieCategories[key];
            const i18nKey = `cookies.${key}`;
            const i18nDescKey = `cookies.${key}-desc`;
            categoriesHTML += `
                <div class="cookie-category">
                    <div class="cookie-category-header">
                        <h4 data-i18n="${i18nKey}">${category.name}</h4>
                        <div class="cookie-toggle ${category.required ? 'active' : ''}" data-category="${key}" ${category.required ? 'style="opacity: 0.5; cursor: not-allowed;"' : ''}>
                            <div class="cookie-toggle-slider"></div>
                        </div>
                    </div>
                    <p data-i18n="${i18nDescKey}">${category.description}</p>
                </div>
            `;
        });
        
        panel.innerHTML = `
            <div class="cookies-settings-content">
                <div class="cookies-settings-header">
                    <h3 data-i18n="cookies.settings-title">Paramètres des cookies</h3>
                    <button class="cookies-settings-close" id="cookiesSettingsClose">×</button>
                </div>
                ${categoriesHTML}
                <div class="cookies-settings-actions">
                    <button class="cookies-btn cookies-btn-decline" id="cookiesSaveDecline" data-i18n="cookies.decline">
                        Refuser tout
                    </button>
                    <button class="cookies-btn cookies-btn-accept" id="cookiesSaveAccept" data-i18n="cookies.save">
                        Enregistrer les préférences
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(panel);
        return panel;
    }

    // Charger les préférences
    function loadPreferences() {
        const saved = localStorage.getItem(COOKIE_PREFERENCES_KEY);
        if (saved) {
            return JSON.parse(saved);
        }
        return {
            necessary: true,
            analytics: false,
            marketing: false
        };
    }

    // Sauvegarder les préférences
    function savePreferences(preferences) {
        localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(preferences));
        localStorage.setItem(COOKIE_CONSENT_KEY, 'true');
        
        // Appliquer les préférences
        applyPreferences(preferences);
    }

    // Appliquer les préférences
    function applyPreferences(preferences) {
        // Cookies nécessaires : toujours activés
        if (preferences.necessary) {
            // Initialiser les cookies nécessaires ici si besoin
        }

        // Cookies analytiques
        if (preferences.analytics) {
            // Initialiser Google Analytics ou autre outil d'analyse
            console.log('Analytics activés');
        } else {
            console.log('Analytics désactivés');
        }

        // Cookies marketing
        if (preferences.marketing) {
            // Initialiser les outils marketing
            console.log('Marketing activés');
        } else {
            console.log('Marketing désactivés');
        }
    }

    // Vérifier si le consentement a déjà été donné
    function hasConsent() {
        const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
        // Pour le débogage : retourner false pour forcer l'affichage
        // return false; // Décommenter pour tester
        return consent === 'true';
    }

    // Initialiser
    if (!hasConsent()) {
        // S'assurer que le body existe
        const initBanner = () => {
            if (!document.body) {
                setTimeout(initBanner, 50);
                return;
            }
            
            const banner = createBanner();
            const settingsPanel = createSettingsPanel();
            
            // Afficher la bannière avec un délai pour s'assurer que le CSS est chargé
            setTimeout(() => {
                if (banner && banner.parentNode) {
                    banner.style.display = 'block';
                    // Forcer le reflow
                    banner.offsetHeight;
                    requestAnimationFrame(() => {
                        banner.classList.add('show');
                    });
                }
            }, 200);
            
            setupBannerEvents(banner, settingsPanel);
        };
        
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', initBanner);
        } else {
            initBanner();
        }
    } else {
        // Charger et appliquer les préférences sauvegardées
        const preferences = loadPreferences();
        applyPreferences(preferences);
    }
    
    // Fonction pour configurer les événements de la bannière
    function setupBannerEvents(banner, settingsPanel) {

        // Bouton Accepter tout
        const acceptBtn = document.getElementById('cookiesAcceptBtn');
        if (acceptBtn) {
            acceptBtn.addEventListener('click', () => {
                const allAccepted = {
                    necessary: true,
                    analytics: true,
                    marketing: true
                };
                savePreferences(allAccepted);
                banner.style.display = 'none';
                banner.classList.remove('show');
            });
        }

        // Bouton Refuser
        const declineBtn = document.getElementById('cookiesDeclineBtn');
        if (declineBtn) {
            declineBtn.addEventListener('click', () => {
                const onlyNecessary = {
                    necessary: true,
                    analytics: false,
                    marketing: false
                };
                savePreferences(onlyNecessary);
                banner.style.display = 'none';
                banner.classList.remove('show');
            });
        }

        // Bouton Paramètres
        const settingsBtn = document.getElementById('cookiesSettingsBtn');
        if (settingsBtn) {
            settingsBtn.addEventListener('click', () => {
                banner.style.display = 'none';
                banner.classList.remove('show');
                settingsPanel.style.display = 'block';
                setTimeout(() => {
                    settingsPanel.classList.add('show');
                }, 10);
                
                // Charger les préférences actuelles
                const prefs = loadPreferences();
                Object.keys(cookieCategories).forEach(key => {
                    const toggle = settingsPanel.querySelector(`[data-category="${key}"]`);
                    if (toggle && !cookieCategories[key].required) {
                        toggle.classList.toggle('active', prefs[key]);
                    }
                });
                
                // Mettre à jour les traductions dans le panneau
                if (window.ZigZagI18n && window.ZigZagI18n.updatePageContent) {
                    setTimeout(() => {
                        window.ZigZagI18n.updatePageContent();
                    }, 50);
                }
            });
        }

        // Fermer le panneau de paramètres
        const settingsClose = document.getElementById('cookiesSettingsClose');
        if (settingsClose) {
            settingsClose.addEventListener('click', () => {
                settingsPanel.style.display = 'none';
                settingsPanel.classList.remove('show');
                banner.style.display = 'block';
                setTimeout(() => {
                    banner.classList.add('show');
                }, 10);
            });
        }

        // Toggles dans le panneau de paramètres
        settingsPanel.querySelectorAll('.cookie-toggle').forEach(toggle => {
            if (toggle.style.cursor !== 'not-allowed') {
                toggle.addEventListener('click', () => {
                    toggle.classList.toggle('active');
                });
            }
        });

        // Sauvegarder les préférences
        const saveAccept = document.getElementById('cookiesSaveAccept');
        if (saveAccept) {
            saveAccept.addEventListener('click', () => {
                const analyticsToggle = settingsPanel.querySelector('[data-category="analytics"]');
                const marketingToggle = settingsPanel.querySelector('[data-category="marketing"]');
                const preferences = {
                    necessary: true,
                    analytics: analyticsToggle ? analyticsToggle.classList.contains('active') : false,
                    marketing: marketingToggle ? marketingToggle.classList.contains('active') : false
                };
                savePreferences(preferences);
                settingsPanel.style.display = 'none';
                settingsPanel.classList.remove('show');
            });
        }

        // Refuser tout depuis le panneau
        const saveDecline = document.getElementById('cookiesSaveDecline');
        if (saveDecline) {
            saveDecline.addEventListener('click', () => {
                const onlyNecessary = {
                    necessary: true,
                    analytics: false,
                    marketing: false
                };
                savePreferences(onlyNecessary);
                settingsPanel.style.display = 'none';
                settingsPanel.classList.remove('show');
            });
        }
    }
    
    // Mettre à jour les traductions des boutons de cookies après création
    function updateCookiesTranslations() {
        if (window.ZigZagI18n && window.ZigZagI18n.updatePageContent) {
            // Petit délai pour s'assurer que les éléments sont dans le DOM
            setTimeout(() => {
                window.ZigZagI18n.updatePageContent();
            }, 100);
        }
    }
    
    // Attendre que i18n soit prêt
    if (window.ZigZagI18n && window.ZigZagI18n.updatePageContent) {
        updateCookiesTranslations();
    } else {
        // Attendre que i18n soit chargé (max 2 secondes)
        let attempts = 0;
        const maxAttempts = 40; // 40 * 50ms = 2 secondes
        const checkI18n = setInterval(() => {
            attempts++;
            if (window.ZigZagI18n && window.ZigZagI18n.updatePageContent) {
                clearInterval(checkI18n);
                updateCookiesTranslations();
            } else if (attempts >= maxAttempts) {
                clearInterval(checkI18n);
            }
        }, 50);
    }
});






