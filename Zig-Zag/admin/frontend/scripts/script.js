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

    const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
    const navLinksContainer = document.querySelector('.nav-links');
    
    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navbarHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navbarHeight;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
                
                navLinksContainer.classList.remove('active');
            }
        });
    });

    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    
    if (mobileMenuToggle) {
        mobileMenuToggle.addEventListener('click', function() {
            navLinksContainer.classList.toggle('active');
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
});
