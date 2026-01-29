document.addEventListener('DOMContentLoaded', function() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };

    const observer = new IntersectionObserver(function(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, observerOptions);

    const fadeElements = document.querySelectorAll('.fade-in-up');
    fadeElements.forEach(element => {
        observer.observe(element);
    });

    // Fonction pour scroller vers une section sans modifier l'URL
    function scrollToSection(sectionId) {
        const targetSection = document.querySelector(sectionId);
        if (targetSection) {
            const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
            const targetPosition = targetSection.offsetTop - navbarHeight;
            
            window.scrollTo({
                top: targetPosition,
                behavior: 'smooth'
            });
            
            // Empêcher le changement d'URL en remplaçant l'état de l'historique
            if (window.location.hash) {
                history.replaceState(null, '', window.location.pathname + window.location.search);
            }
        }
    }

    // Fonction pour vérifier si un lien pointe vers une section cible
    function isAnchorLink(href) {
        if (!href) return false;
        // Vérifier à la fois l'attribut href et l'URL complète
        const hrefStr = typeof href === 'string' ? href : (href.getAttribute ? href.getAttribute('href') : '');
        return hrefStr.includes('#how-it-works') || hrefStr.includes('#features') || hrefStr.includes('#gallery');
    }

    // Fonction pour extraire l'ID de section depuis un href
    function extractSectionId(href) {
        if (!href || !href.includes('#')) return null;
        // Extraire l'ancre (gère #section, /#section, etc.)
        const parts = href.split('#');
        if (parts.length > 1) {
            return '#' + parts[parts.length - 1].split('?')[0].split('/')[0]; // Prendre la partie après #, avant ? et /
        }
        return null;
    }

    // Fonction pour gérer le clic sur un lien d'ancre
    function handleAnchorClick(e, linkElement) {
        const link = linkElement || this;
        const href = link.getAttribute('href') || link.href;
        
        // Vérifier si c'est un lien vers une section cible
        if (!isAnchorLink(href)) {
            return; // Ce n'est pas un lien vers une section cible, laisser le comportement par défaut
        }
        
        // Empêcher le comportement par défaut IMMÉDIATEMENT
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        
        // Extraire l'ID de la section
        const targetId = extractSectionId(href);
        if (!targetId) return;
        
        const currentPage = window.location.pathname;
        const currentFile = currentPage.split('/').pop() || '';
        // Détecter si on est sur la page d'accueil (/, /index)
        const isIndexPage = currentPage === '/' || currentPage.endsWith('/') || currentFile === '' || currentFile === 'index' || currentFile === 'index.html';
        
        if (isIndexPage) {
            // Sur la page d'accueil, scroller directement
            scrollToSection(targetId);
            const navLinksContainer = document.querySelector('.nav-links');
            navLinksContainer?.classList.remove('active');
        } else {
            // Sur une autre page, rediriger vers la page d'accueil puis scroller
            const indexPath = '/';
            // Stocker l'ID de la section pour scroller après le chargement
            sessionStorage.setItem('scrollToSection', targetId);
            window.location.href = indexPath;
        }
    }

    // Utiliser la délégation d'événements en phase de capture pour intercepter AVANT tout autre gestionnaire
    document.addEventListener('click', function(e) {
        // Trouver le lien le plus proche dans la hiérarchie
        const target = e.target.closest('a');
        if (!target) return;
        
        // Vérifier si le lien a un attribut data-section (pour les liens sans ancre dans l'URL)
        const dataSection = target.getAttribute('data-section');
        if (dataSection && (dataSection === 'how-it-works' || dataSection === 'features' || dataSection === 'gallery')) {
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            const targetId = '#' + dataSection;
            const currentPage = window.location.pathname;
            const currentFile = currentPage.split('/').pop() || '';
            const isIndexPage = currentPage === '/' || currentPage.endsWith('/') || currentFile === '' || currentFile === 'index' || currentFile === 'index.html';
            
            if (isIndexPage) {
                // Sur la page d'accueil, scroller directement
                scrollToSection(targetId);
                const navLinksContainer = document.querySelector('.nav-links');
                navLinksContainer?.classList.remove('active');
            } else {
                // Sur une autre page, rediriger vers la page d'accueil puis scroller
                sessionStorage.setItem('scrollToSection', targetId);
                window.location.href = '/';
            }
            return;
        }
        
        // Vérifier si c'est un lien vers une section cible (avec ancre dans l'URL)
        const href = target.getAttribute('href') || target.href;
        if (isAnchorLink(href)) {
            handleAnchorClick(e, target);
        }
    }, true); // Phase de capture pour intercepter avant les autres gestionnaires

    // Scroller vers la section si on vient d'une autre page
    const sectionToScroll = sessionStorage.getItem('scrollToSection');
    if (sectionToScroll) {
        sessionStorage.removeItem('scrollToSection');
        // Attendre que la page soit complètement chargée et que les sections soient rendues
        const scrollToSectionAfterLoad = () => {
            const targetSection = document.querySelector(sectionToScroll);
            if (targetSection) {
                scrollToSection(sectionToScroll);
                // Retirer l'ancre de l'URL si elle a été ajoutée
                if (window.location.hash) {
                    history.replaceState(null, '', window.location.pathname + window.location.search);
                }
            } else {
                // Si la section n'est pas encore disponible, réessayer après un court délai
                setTimeout(scrollToSectionAfterLoad, 100);
            }
        };
        // Démarrer après un court délai pour laisser le DOM se charger
        setTimeout(scrollToSectionAfterLoad, 200);
    }

    // Si on arrive sur la page d'accueil avec une ancre dans l'URL, scroller puis retirer l'ancre
    const currentHash = window.location.hash;
    if (currentHash && (currentHash === '#how-it-works' || currentHash === '#features' || currentHash === '#gallery')) {
        setTimeout(() => {
            scrollToSection(currentHash);
        }, 100);
    }

    // Menu mobile
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const navLinksContainer = document.querySelector('.nav-links');
    
    if (mobileMenuToggle && navLinksContainer) {
        mobileMenuToggle.addEventListener('click', function(e) {
            e.stopPropagation();
            navLinksContainer.classList.toggle('active');
            // Animation du bouton hamburger
            mobileMenuToggle.classList.toggle('active');
        });
        
        // Fermer le menu si on clique sur un lien
        const navLinks = navLinksContainer.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navLinksContainer.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            });
        });
        
        // Fermer le menu si on clique en dehors
        document.addEventListener('click', function(e) {
            if (!mobileMenuToggle.contains(e.target) && !navLinksContainer.contains(e.target)) {
                navLinksContainer.classList.remove('active');
                mobileMenuToggle.classList.remove('active');
            }
        });
    }

    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', function() {
        let scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > 100) {
            navbar.style.transform = 'translateY(-100%)';
        } else {
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });

    navbar.style.transition = 'transform 0.3s ease';

    const playButtons = document.querySelectorAll('.btn-primary, .btn-cta-main');
    playButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            if (this.getAttribute('href') === '#' || this.getAttribute('href') === '#play') {
                e.preventDefault();
                alert('Le jeu sera bientôt disponible en ligne ! Restez connectés pour jouer gratuitement.');
            }
        });
    });

    // PWA Installation Prompt
    let deferredPrompt;
    const installBanner = document.createElement('div');
    installBanner.id = 'pwa-install-banner';
    installBanner.style.cssText = `
        position: fixed;
        bottom: 100px;
        right: 20px;
        background: linear-gradient(135deg, #F54291 0%, #FF912D 100%);
        color: white;
        padding: 16px 20px;
        border-radius: 16px;
        box-shadow: 0 8px 24px rgba(245, 66, 145, 0.4);
        z-index: 10000;
        max-width: 300px;
        display: none;
        font-family: 'Roboto', sans-serif;
        font-size: 14px;
    `;
    installBanner.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
            <div style="flex: 1;">
                <strong>Installer ZigZag</strong>
                <p style="margin: 4px 0 0 0; font-size: 12px; opacity: 0.9;">Ajoutez ZigZag à votre écran d'accueil pour un accès rapide !</p>
            </div>
            <button id="pwa-install-btn" style="
                background: white;
                color: #F54291;
                border: none;
                padding: 8px 16px;
                border-radius: 8px;
                font-weight: 600;
                cursor: pointer;
                font-size: 13px;
            ">Installer</button>
            <button id="pwa-dismiss-btn" style="
                background: transparent;
                color: white;
                border: none;
                padding: 4px;
                cursor: pointer;
                font-size: 18px;
                line-height: 1;
            ">×</button>
        </div>
    `;
    document.body.appendChild(installBanner);

    // Écouter l'événement beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        
        // Vérifier si l'utilisateur a déjà refusé
        if (!localStorage.getItem('pwa-install-dismissed')) {
            installBanner.style.display = 'block';
        }
    });

    // Bouton d'installation
    document.getElementById('pwa-install-btn')?.addEventListener('click', async () => {
        if (!deferredPrompt) return;
        
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        
        if (outcome === 'accepted') {
            console.log('PWA installée avec succès');
        }
        
        deferredPrompt = null;
        installBanner.style.display = 'none';
    });

    // Bouton de fermeture
    document.getElementById('pwa-dismiss-btn')?.addEventListener('click', () => {
        installBanner.style.display = 'none';
        localStorage.setItem('pwa-install-dismissed', 'true');
    });

    // Masquer la bannière si l'app est déjà installée
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
        installBanner.style.display = 'none';
    }
});
