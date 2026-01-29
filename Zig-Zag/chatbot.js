// Chatbot ZigZag - Ziggy, le Guide Officiel
// Basé sur HelloZigZag_agent.yaml
// 
// PERSONNALITÉ DE ZIGGY :
// - Complice et Enthousiaste : Tutoie toujours, pote qui fait découvrir un jeu génial
// - Visuel et Rigolo : Émojis pertinents (🎨😂🚀✨✏) sans en abuser
// - Direct et Clair : Réponses courtes (2-3 phrases max), énergie avant tout
// - Super Positif : Encourageant, le mot d'ordre est "fun", jamais de négatif
// 
// MISSION :
// - Guider : Accueillir et présenter l'univers de ZigZag
// - Expliquer : Rendre les règles limpides et fun
// - Donner envie : Transmettre le fun et l'envie irrépressible de jouer
// - Assister : Aider à l'inscription et répondre aux questions pratiques
//
// RÈGLES D'OR :
// ❌ Ne jamais dire "Téléphone Arabe" (préférer "téléphone sans fil créatif")
// ❌ Ne pas promettre de dates ou futures fonctionnalités
// ❌ Ne jamais parler d'argent (sauf rappeler que c'est 100% gratuit)
// ❌ Ne jamais critiquer personne
// ✅ Rediriger vers l'action (zig-zag.fun)
// ✅ Célébrer l'imperfection (les "mauvais" dessins sont le cœur du jeu)
// ✅ Rester dans son rôle (rediriger poliment si hors-sujet)

document.addEventListener('DOMContentLoaded', function() {
    // Constantes
    const STORAGE_KEY = 'zigzag-chatbot-history';
    const STORAGE_FEEDBACK_KEY = 'zigzag-chatbot-feedback';
    const DEBOUNCE_DELAY = 300;
    
    // Mascottes disponibles pour le bouton
    const mascottes = [
        'attached_assets/mascottes/1000032519.png', // Mascotte principale
        'attached_assets/mascottes/1000032517.png', // Dessine
        'attached_assets/mascottes/1000032533.png', // Confus
        'attached_assets/mascottes/1000032536.png', // Rire
        'attached_assets/mascottes/1000032537.png', // Thumbs up
        'attached_assets/mascottes/1000032518.png', // Heureux
        'attached_assets/mascottes/1000032535.png', // Speed
        'attached_assets/mascottes/1000032543.png'  // Blasé
    ];
    
    // État de la conversation
    let conversationContext = [];
    let isTyping = false;
    let debounceTimer = null;
    let currentMascotIndex = 0;
    
    // Questions prédéfinies avec traductions
    const quickQuestions = {
        fr: [
            "C'est quoi ZigZag ?",
            "Comment on joue ?",
            "C'est gratuit ?",
            "Faut-il savoir dessiner ?",
            "Sur quelles plateformes ?",
            "Comment m'inscrire ?",
            "Combien de temps dure une partie ?",
            "Peut-on jouer entre amis ?",
            "Qui a créé ZigZag ?"
        ],
        en: [
            "What is ZigZag?",
            "How do you play?",
            "Is it free?",
            "Do you need to know how to draw?",
            "On which platforms?",
            "How do I sign up?",
            "How long does a game last?",
            "Can you play with friends?",
            "Who created ZigZag?"
        ]
    };
    
    // Réponses variées avec traductions - Ton Ziggy ultra-enthousiaste
    const responses = {
        fr: {
            "C'est quoi ZigZag ?": [
                "Salut ! ZigZag, c'est le jeu où tes phrases se transforment en dessins (souvent ratés 😂) puis redeviennent des phrases. Après 8 tours, tu découvres la transformation hilarante de l'idée de départ. Prêt(e) à voir tes mots prendre vie ? 🎨",
                "ZigZag, c'est un téléphone sans fil créatif où les phrases deviennent des dessins, et vice-versa ! 🎨 On lance une idée et on regarde comment elle se transforme joyeusement à chaque étape. Le but ? Le décalage hilarant à la fin ! Envie d'essayer ?",
                "Imagine un téléphone sans fil mais en version digitale et mondiale ! 🌍 Tu lances un message, il voyage, se transforme à chaque étape (✏ ↔ 📝), et revient complètement déformé. C'est tout le fun du jeu ! Prêt à créer ton premier Zig ?",
                "C'est le jeu où une simple phrase devient un parcours chaotique hilarant ! 😂 Tu écris, d'autres dessinent (le talent n'est PAS requis, au contraire !), puis d'autres décrivent. Après 8 tours, c'est la Grande Révélation ! Fonce sur zig-zag.fun ! 🚀"
            ],
            "Comment on joue ?": [
                "C'est ultra simple ! 1️⃣ Un joueur lance une phrase de départ 2️⃣ Le suivant doit la dessiner (le talent n'est pas requis !) 3️⃣ Le 3ème ne voit que le dessin et le décrit avec ses mots 4️⃣ On alterne ✏ ↔ 📝 pendant 8 tours 5️⃣ Grande Révélation finale ! Trop hâte que tu essaies ! 🚀",
                "Super facile ! 🎮 Tu lances une phrase, les autres alternent entre dessin et texte pendant 8 tours, puis c'est la révélation finale (spoiler: ça part TOUJOURS en vrille 😂). Chaque Zig est une surprise hilarante !",
                "Le principe ? Un message qui voyage et se transforme ! ✏ Tu écris → quelqu'un dessine → quelqu'un décrit le dessin → on recommence 8 fois. À la fin, découverte du chaos créatif ! C'est parti sur zig-zag.fun ? 🚀"
            ],
            "C'est gratuit ?": [
                "Oui, 100% gratuit, promis ! Pas de frais cachés, juste du fun à partager. Notre but ? Créer des moments drôles entre amis. 🎉",
                "Totalement gratuit ! 💯 Zéro pub, zéro achat caché. On veut juste que tu t'amuses et créés du chaos créatif avec tes potes !",
                "100% gratuit ! 🎉 Pas d'abonnement, pas de piège. Juste du pur plaisir créatif. Fonce, tu n'as rien à perdre (sauf peut-être tes côtes à force de rire 😂) !"
            ],
            "Faut-il savoir dessiner ?": [
                "Absolument pas ! Au contraire, plus les dessins sont simples ou décalés, plus le résultat est drôle. Ici, l'imperfection est une superstar ! ✨",
                "Non ! Les \"mauvais\" dessins sont le cœur du jeu. C'est ce qui le rend drôle ! 😂 Sur ZigZag, l'imperfection = art. Les dessins moches sont célébrés ! 🎨",
                "Zéro besoin de talent ! 😄 En fait, les dessins les plus simples donnent les meilleurs Zigs. L'imperfection, c'est notre force ! Viens gribouiller avec nous ! ✏"
            ],
            "Sur quelles plateformes ?": [
                "Dispo sur le web (zig-zag.fun) maintenant ! 📱 Les apps iOS et Android arrivent bientôt. Mais pourquoi attendre ? Joue tout de suite !",
                "Version web disponible immédiatement sur zig-zag.fun ! 🚀 Les versions mobiles iOS et Android sont en préparation.",
                "Tu peux jouer MAINTENANT sur zig-zag.fun depuis ton navigateur ! 🌐 Et bientôt sur iOS et Android. Mais vas-y, teste dès aujourd'hui ! 🎨"
            ],
            "Comment m'inscrire ?": [
                "Facile ! Va sur zig-zag.fun et clique sur \"Jouer maintenant\". Ton compte est créé en 30 secondes et tu peux lancer ton premier Zig. À toi de jouer ! 🚀",
                "Super rapide ! 🏃‍♂️ Va sur zig-zag.fun, clique \"Jouer maintenant\", connecte-toi avec Google ou ton email, et c'est parti ! Ton premier Zig t'attend !",
                "C'est l'affaire de 30 secondes ! 😊 Direction zig-zag.fun → \"Jouer maintenant\" → Google ou email → et HOP, tu lances ton premier chaos créatif ! 🎨"
            ],
            "Combien de temps dure une partie ?": [
                "Un Zig dure entre 10 minutes et 2 heures selon le rythme des joueurs. Chaque tour prend juste 2 à 5 minutes. ⏱️ Parfait pour une pause fun !",
                "Ça varie ! Entre 10 minutes (mode turbo 🚀) et 2 heures (mode cool 😎). Chaque étape prend 2-5 minutes. Tu joues à ton rythme !",
                "Flexible à 100% ! ⏱️ Chaque tour = 2-5 minutes. Une partie complète ? Entre 10 minutes et 2h selon l'énergie du groupe. Adapté à TON emploi du temps !"
            ],
            "Peut-on jouer entre amis ?": [
                "Absolument ! Tu peux créer des Zigs privés et inviter tes amis directement. Le chaos en groupe, c'est encore mieux ! 👥 De 2 à 20 joueurs !",
                "Oui ! 👥 Crée une partie privée et invite tes potes par lien ou email. De 2 à 20 joueurs par Zig ! Les fous rires en bande, c'est inoubliable ! 😂",
                "C'est même fait pour ça ! 🎉 Crée un Zig privé, invite de 2 à 20 potes, et regardez ensemble comment vos idées partent en vrille ! Fun garanti ! 🚀"
            ],
            "Qui a créé ZigZag ?": [
                "ZigZag a été créé par une équipe passionnée : Aurélie Périchon, Alexis Sapone, Jean-Li Sek & Briac Turquety ! 🎨 Les illustrations ont été réalisées par notre graphiste pickle_ink (Instagram : https://www.instagram.com/pickle__ink?igsh=MTVydHgxdXJ4eW5sbg%3D%3D). Ensemble, ils ont imaginé ce téléphone sans fil créatif pour générer du chaos et des fous rires.",
                "Les créateurs de ZigZag sont Aurélie Périchon, Alexis Sapone, Jean-Li Sek & Briac Turquety ! 🚀 Les visuels du projet ont été confiés à la graphiste pickle_ink (Instagram : https://www.instagram.com/pickle__ink?igsh=MTVydHgxdXJ4eW5sbg%3D%3D). Une équipe qui a voulu réinventer le téléphone sans fil en version digitale et mondiale.",
                "Une dream team créative : Aurélie Périchon, Alexis Sapone, Jean-Li Sek & Briac Turquety ! ✨ Côté illustrations, c'est la graphiste pickle_ink qui donne vie à l’univers visuel de ZigZag (Instagram : https://www.instagram.com/pickle__ink?igsh=MTVydHgxdXJ4eW5sbg%3D%3D). Leur mission ? Transformer tes phrases en chaos hilarant ! Tu testes ? 🎨"
            ]
        },
        en: {
            "What is ZigZag?": [
                "Hey! ZigZag is the game where your phrases become drawings (often failed ones 😂) then become phrases again. After 8 rounds, you discover the hilarious transformation of the original idea. Ready to see your words come to life? 🎨",
                "ZigZag is a creative telephone game where phrases become drawings, and vice-versa! 🎨 You launch an idea and watch how it transforms joyfully at each step. The goal? The hilarious chaos at the end! Want to try?",
                "Imagine a telephone game but digital and worldwide! 🌍 You send a message, it travels, transforms at each step (✏ ↔ 📝), and comes back completely distorted. That's all the fun! Ready to create your first Zig?",
                "It's the game where a simple phrase becomes a hilariously chaotic journey! 😂 You write, others draw (talent NOT required!), then others describe. After 8 rounds, it's the Big Reveal! Jump on zig-zag.fun! 🚀"
            ],
            "How do you play?": [
                "It's super simple! 1️⃣ A player launches a starting phrase 2️⃣ The next one must draw it (talent not required!) 3️⃣ The 3rd only sees the drawing and describes it 4️⃣ Alternate ✏ ↔ 📝 for 8 rounds 5️⃣ Big Reveal! Can't wait for you to try! 🚀",
                "Super easy! 🎮 You launch a phrase, others alternate between drawing and text for 8 rounds, then it's the final reveal (spoiler: it ALWAYS goes wild 😂). Each Zig is a hilarious surprise!",
                "The concept? A message that travels and transforms! ✏ You write → someone draws → someone describes the drawing → repeat 8 times. At the end, discover the creative chaos! Ready on zig-zag.fun? 🚀"
            ],
            "Is it free?": [
                "Yes, 100% free, promise! No hidden fees, just fun to share. Our goal? Creating funny moments between friends. 🎉",
                "Totally free! 💯 Zero ads, zero hidden purchases. We just want you to have fun and create creative chaos with your friends!",
                "100% free! 🎉 No subscription, no catch. Just pure creative pleasure. Go for it, you have nothing to lose (except maybe your ribs from laughing 😂)!"
            ],
            "Do you need to know how to draw?": [
                "Absolutely not! On the contrary, the simpler or more quirky the drawings, the funnier the result. Here, imperfection is a superstar! ✨",
                "No! \"Bad\" drawings are the heart of the game. That's what makes it funny! 😂 On ZigZag, imperfection = art. Terrible drawings are celebrated! 🎨",
                "Zero talent needed! 😄 Actually, the simplest drawings make the best Zigs. Imperfection is our strength! Come doodle with us! ✏"
            ],
            "On which platforms?": [
                "Available on the web (zig-zag.fun) right now! 📱 iOS and Android apps coming soon. But why wait? Play now!",
                "Web version available immediately on zig-zag.fun! 🚀 Mobile versions for iOS and Android are in the works.",
                "You can play NOW on zig-zag.fun from your browser! 🌐 And soon on iOS and Android. But go ahead, test it today! 🎨"
            ],
            "How do I sign up?": [
                "Easy! Go to zig-zag.fun and click \"Play now\". Your account is created in 30 seconds and you can launch your first Zig. Your turn to play! 🚀",
                "Super quick! 🏃‍♂️ Go to zig-zag.fun, click \"Play now\", connect with Google or your email, and you're off! Your first Zig awaits!",
                "Takes only 30 seconds! 😊 Head to zig-zag.fun → \"Play now\" → Google or email → and BOOM, launch your first creative chaos! 🎨"
            ],
            "How long does a game last?": [
                "A Zig lasts between 10 minutes and 2 hours depending on the players' pace. Each turn takes just 2 to 5 minutes. ⏱️ Perfect for a fun break!",
                "It varies! Between 10 minutes (turbo mode 🚀) and 2 hours (chill mode 😎). Each step takes 2-5 minutes. You play at your own pace!",
                "100% flexible! ⏱️ Each turn = 2-5 minutes. A complete game? Between 10 minutes and 2h depending on the group's energy. Fits YOUR schedule!"
            ],
            "Can you play with friends?": [
                "Absolutely! You can create private Zigs and invite your friends directly. Chaos in a group is even better! 👥 From 2 to 20 players!",
                "Yes! 👥 Create a private game and invite your buddies by link or email. From 2 to 20 players per Zig! Laughs in a group are unforgettable! 😂",
                "That's what it's made for! 🎉 Create a private Zig, invite 2 to 20 friends, and watch together how your ideas go wild! Fun guaranteed! 🚀"
            ],
            "Who created ZigZag?": [
                "ZigZag was created by a passionate team: Aurélie Périchon, Alexis Sapone, Jean-Li Sek & Briac Turquety! 🎨 The illustrations were crafted by our graphic artist pickle_ink (Instagram: https://www.instagram.com/pickle__ink?igsh=MTVydHgxdXJ4eW5sbg%3D%3D). Together, they imagined this creative telephone game to generate chaos and laughs.",
                "ZigZag's creators are Aurélie Périchon, Alexis Sapone, Jean-Li Sek & Briac Turquety! 🚀 The visual identity of the project is by the graphic designer pickle_ink (Instagram: https://www.instagram.com/pickle__ink?igsh=MTVydHgxdXJ4eW5sbg%3D%3D). They wanted to reinvent the telephone game in a digital and worldwide version.",
                "A creative dream team: Aurélie Périchon, Alexis Sapone, Jean-Li Sek & Briac Turquety! ✨ On the illustration side, the visual universe of ZigZag is brought to life by the artist pickle_ink (Instagram: https://www.instagram.com/pickle__ink?igsh=MTVydHgxdXJ4eW5sbg%3D%3D). Their mission? Transform your phrases into hilarious chaos! Wanna test it? 🎨"
            ]
        }
    };
    
    // Réponses génériques - Ton Ziggy (redirige poliment vers le jeu)
    const genericResponses = {
        fr: [
            "Excellente question, mais ma seule expertise, c'est le chaos créatif de ZigZag ! 😉 Pour le reste, je te laisse vérifier sur un site spécialisé. Envie de lancer un dessin en attendant ?",
            "Ah, là tu me dépasses un peu ! 😅 Je suis plutôt spécialiste du décalage hilarant et des dessins ratés. Pose-moi une question sur ZigZag, je serai plus utile ! 🎨",
            "Je ne suis pas sûr de bien comprendre, mais je peux t'aider avec ZigZag ! 🎮 Clique sur une des questions ci-dessus ou demande-moi comment jouer !",
            "Intéressant ! Pour des questions techniques ou hors ZigZag, contacte team@zig-zag.fun. Moi, je suis là pour te faire découvrir le fun du jeu ! 🚀",
            "Hmm, je ne suis pas expert en ça ! 🤔 Mais je SUIS expert en phrases qui se transforment en chaos ! Envie de tester ZigZag ? 🎨"
        ],
        en: [
            "Excellent question, but my only expertise is the creative chaos of ZigZag! 😉 For the rest, I'll let you check on a specialized site. Want to launch a drawing in the meantime?",
            "Ah, there you got me! 😅 I'm more of a specialist in hilarious chaos and failed drawings. Ask me about ZigZag, I'll be more helpful! 🎨",
            "I'm not sure I understand, but I can help you with ZigZag! 🎮 Click on one of the questions above or ask me how to play!",
            "Interesting! For technical questions or anything outside ZigZag, contact team@zig-zag.fun. I'm here to show you the fun of the game! 🚀",
            "Hmm, I'm not an expert on that! 🤔 But I AM an expert on phrases that transform into chaos! Want to test ZigZag? 🎨"
        ]
    };
    
    // Questions contextuelles (suivi après une réponse)
    const contextualQuestions = {
        fr: {
            "C'est quoi ZigZag ?": ["Comment on joue ?", "C'est gratuit ?"],
            "Comment on joue ?": ["Comment m'inscrire ?", "C'est gratuit ?"],
            "C'est gratuit ?": ["Comment m'inscrire ?", "Sur quelles plateformes ?"],
            "Comment m'inscrire ?": ["Comment on joue ?", "Peut-on jouer entre amis ?"],
            "Sur quelles plateformes ?": ["Comment m'inscrire ?", "C'est gratuit ?"],
            "Combien de temps dure une partie ?": ["Peut-on jouer entre amis ?", "Comment on joue ?"],
            "Peut-on jouer entre amis ?": ["Comment m'inscrire ?", "C'est quoi ZigZag ?"],
            "Qui a créé ZigZag ?": ["C'est quoi ZigZag ?", "Comment on joue ?"]
        },
        en: {
            "What is ZigZag?": ["How do you play?", "Is it free?"],
            "How do you play?": ["How do I sign up?", "Is it free?"],
            "Is it free?": ["How do I sign up?", "On which platforms?"],
            "How do I sign up?": ["How do you play?", "Can you play with friends?"],
            "On which platforms?": ["How do I sign up?", "Is it free?"],
            "How long does a game last?": ["Can you play with friends?", "How do you play?"],
            "Can you play with friends?": ["How do I sign up?", "What is ZigZag?"],
            "Who created ZigZag?": ["What is ZigZag?", "How do you play?"]
        }
    };
    
    // Détection d'intention améliorée avec synonymes
    const intentKeywords = {
        fr: {
            "C'est quoi ZigZag ?": ['quoi', 'c\'est', 'zigzag', 'qu\'est-ce', 'définition', 'explique', 'présente', 'c\'est quoi', 'qu\'est-ce que'],
            "Comment on joue ?": ['jouer', 'comment', 'fonctionne', 'règles', 'débuter', 'commencer', 'faire', 'comment jouer', 'comment on joue'],
            "C'est gratuit ?": ['gratuit', 'prix', 'payer', 'coût', 'tarif', 'abonnement', 'payant', 'gratis', 'coûte', 'combien coûte'],
            "Faut-il savoir dessiner ?": ['dessin', 'dessiner', 'artiste', 'talent', 'savoir dessiner', 'compétence', 'aptitude', 'faut-il', 'besoin de savoir'],
            "Sur quelles plateformes ?": ['plateforme', 'app', 'mobile', 'ios', 'android', 'web', 'télécharger', 'disponible', 'où', 'sur quoi'],
            "Comment m'inscrire ?": ['inscrire', 'compte', 'inscription', 'créer', 's\'inscrire', 'enregistrer', 'créer un compte', 'comment s\'inscrire'],
            "Combien de temps dure une partie ?": ['temps', 'durée', 'combien', 'long', 'minutes', 'heures', 'partie', 'combien de temps', 'dure'],
            "Peut-on jouer entre amis ?": ['ami', 'amis', 'privé', 'groupe', 'inviter', 'ensemble', 'copain', 'entre amis', 'avec des amis'],
            "Qui a créé ZigZag ?": ['créé', 'créateur', 'créateurs', 'qui', 'a créé', 'fondateur', 'fondateurs', 'équipe', 'développeur', 'développeurs', 'auteur', 'auteurs']
        },
        en: {
            "What is ZigZag?": ['what', 'is', 'zigzag', 'definition', 'explain', 'present', 'tell me', 'what is'],
            "How do you play?": ['play', 'how', 'works', 'rules', 'start', 'begin', 'do', 'how to play', 'how do you'],
            "Is it free?": ['free', 'price', 'pay', 'cost', 'tariff', 'subscription', 'paid', 'how much', 'costs'],
            "Do you need to know how to draw?": ['draw', 'drawing', 'artist', 'talent', 'skill', 'ability', 'need to know', 'know how'],
            "On which platforms?": ['platform', 'app', 'mobile', 'ios', 'android', 'web', 'download', 'available', 'where', 'on what'],
            "How do I sign up?": ['sign', 'account', 'register', 'create', 'signup', 'sign up', 'create account', 'how to sign'],
            "How long does a game last?": ['time', 'duration', 'how long', 'minutes', 'hours', 'game', 'last', 'how long does'],
            "Can you play with friends?": ['friend', 'friends', 'private', 'group', 'invite', 'together', 'with friends', 'play with'],
            "Who created ZigZag?": ['created', 'creator', 'creators', 'who', 'who created', 'founder', 'founders', 'team', 'developer', 'developers', 'author', 'authors', 'made', 'who made']
        }
    };
    
    // Obtenir la langue actuelle
    function getCurrentLanguage() {
        if (window.ZigZagI18n) {
            return window.ZigZagI18n.getCurrentLanguage();
        }
        return navigator.language.split('-')[0].toLowerCase() === 'en' ? 'en' : 'fr';
    }
    
    // Traduction
    function t(key, lang = null) {
        const currentLang = lang || getCurrentLanguage();
        if (window.ZigZagI18n) {
            return window.ZigZagI18n.t(key, currentLang);
        }
        return key;
    }
    
    // Charger l'historique
    function loadHistory() {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Erreur lors du chargement de l\'historique', e);
        }
        return [];
    }
    
    // Sauvegarder l'historique
    function saveHistory() {
        try {
            const history = Array.from(messagesContainer.children)
                .map(msg => {
                    const type = msg.classList.contains('user') ? 'user' : 'assistant';
                    const bubble = msg.querySelector('.message-bubble');
                    const text = bubble ? bubble.textContent.trim() : '';
                    // Ne sauvegarder que les messages avec du contenu
                    if (!text) return null;
                    return {
                        type,
                        text,
                        timestamp: Date.now()
                    };
                })
                .filter(msg => msg !== null); // Filtrer les messages vides
            
            // Limiter à 50 messages pour éviter un localStorage trop lourd
            const limitedHistory = history.slice(-50);
            localStorage.setItem(STORAGE_KEY, JSON.stringify(limitedHistory));
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde de l\'historique', e);
            // Si le localStorage est plein, essayer de nettoyer
            try {
                const currentHistory = loadHistory();
                if (currentHistory.length > 20) {
                    localStorage.setItem(STORAGE_KEY, JSON.stringify(currentHistory.slice(-20)));
                }
            } catch (e2) {
                console.warn('Impossible de nettoyer l\'historique', e2);
            }
        }
    }
    
    // Créer le widget
    const widget = document.createElement('div');
    widget.className = 'ai-chat-widget';
    widget.innerHTML = `
        <button id="aiChatToggle" aria-label="Ouvrir le chat" aria-expanded="false">
            <div class="loader">
                <div class="box mascot-box">
                    <img src="${mascottes[0]}" alt="Ziggy" class="mascot-icon" id="chatbotMascot">
                </div>
            </div>
            <div class="notification-badge" id="notificationBadge" style="display: none;" aria-label="Nouvelle notification">1</div>
        </button>
        <div id="aiChatPanel" class="chat-panel" role="dialog" aria-labelledby="chat-header-title" aria-modal="true">
            <div class="floating-particles" id="floatingParticles"></div>
            <div class="chat-header">
                <div class="chat-header-left">
                    <div class="chat-avatar" aria-hidden="true">
                        <img src="${mascottes[0]}" alt="Ziggy" class="chat-avatar-img" id="headerMascot">
                    </div>
                    <div class="chat-header-info">
                        <h3 id="chat-header-title">Ziggy - Guide ZigZag</h3>
                        <p id="chat-status">En ligne</p>
                    </div>
                </div>
                <div class="chat-header-actions">
                    <button class="chat-export-btn" id="chatExportBtn" aria-label="Exporter la conversation" title="Exporter">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                            <polyline points="7 10 12 15 17 10"></polyline>
                            <line x1="12" y1="15" x2="12" y2="3"></line>
                        </svg>
                    </button>
                    <button class="chat-close-btn" id="chatCloseBtn" aria-label="Fermer le chat">×</button>
                </div>
            </div>
            <div class="chat-messages" id="chatMessages" role="log" aria-live="polite" aria-atomic="false"></div>
            <div class="quick-questions" id="quickQuestions" role="group" aria-label="Questions rapides"></div>
            <div class="typing-indicator" id="typingIndicator" style="display: none;">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
                <span class="typing-text">Ziggy est en train d'écrire...</span>
            </div>
            <div class="chat-input-container">
                <input type="text" class="chat-input" id="chatInput" placeholder="Posez votre question..." 
                       aria-label="Zone de saisie de votre question" autocomplete="off" />
                <button class="chat-send-btn" id="chatSendBtn" aria-label="Envoyer le message" disabled>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </div>
        </div>
    `;
    document.body.appendChild(widget);
    
    const panel = document.getElementById('aiChatPanel');
    const toggle = document.getElementById('aiChatToggle');
    const closeBtn = document.getElementById('chatCloseBtn');
    const exportBtn = document.getElementById('chatExportBtn');
    const messagesContainer = document.getElementById('chatMessages');
    const quickQuestionsContainer = document.getElementById('quickQuestions');
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const notificationBadge = document.getElementById('notificationBadge');
    const typingIndicator = document.getElementById('typingIndicator');
    const chatStatus = document.getElementById('chat-status');
    const floatingParticles = document.getElementById('floatingParticles');
    const chatbotMascot = document.getElementById('chatbotMascot');
    
    // Fonction pour changer la mascotte
    function changeMascot() {
        if (chatbotMascot) {
            currentMascotIndex = (currentMascotIndex + 1) % mascottes.length;
            // Ajouter un effet de transition
            chatbotMascot.style.transition = 'opacity 0.3s ease';
            chatbotMascot.style.opacity = '0';
            setTimeout(() => {
                chatbotMascot.src = mascottes[currentMascotIndex];
                chatbotMascot.style.opacity = '1';
            }, 150);
        }
    }
    
    // Gestion des erreurs de chargement d'image pour le bouton
    if (chatbotMascot) {
        chatbotMascot.addEventListener('error', function() {
            // Si l'image ne charge pas, afficher le "Z" en fallback
            const box = chatbotMascot.parentElement;
            if (box) {
                box.innerHTML = 'Z';
                box.style.fontSize = '32px';
                box.style.fontWeight = '900';
                box.style.color = 'white';
            }
        });
    }
    
    // Gestion des erreurs de chargement d'image pour le header
    const headerMascot = document.getElementById('headerMascot');
    if (headerMascot) {
        headerMascot.addEventListener('error', function() {
            // Si l'image ne charge pas, afficher le "Z" en fallback
            const avatar = headerMascot.parentElement;
            if (avatar) {
                avatar.innerHTML = 'Z';
                avatar.style.fontSize = '28px';
                avatar.style.fontWeight = '900';
                avatar.style.color = 'white';
            }
        });
    }
    
    // Fonction pour changer la mascotte du header aussi
    function changeHeaderMascot() {
        const headerMascot = document.getElementById('headerMascot');
        if (headerMascot) {
            const randomMascot = mascottes[Math.floor(Math.random() * mascottes.length)];
            headerMascot.style.opacity = '0';
            setTimeout(() => {
                headerMascot.src = randomMascot;
                headerMascot.style.opacity = '1';
            }, 150);
        }
    }
    
    // Changer la mascotte du bouton et du header toutes les 5 secondes
    let mascotInterval = setInterval(() => {
        changeMascot();
        // Changer le header seulement si le panel est ouvert
        if (panel.classList.contains('active')) {
            changeHeaderMascot();
        }
    }, 5000);
    
    // Créer des particules flottantes pour l'effet visuel
    function createFloatingParticles() {
        if (!floatingParticles) return;
        
        const particleCount = 8;
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.style.left = Math.random() * 100 + '%';
            particle.style.top = Math.random() * 100 + '%';
            particle.style.animationDelay = Math.random() * 15 + 's';
            particle.style.animationDuration = (10 + Math.random() * 10) + 's';
            floatingParticles.appendChild(particle);
        }
    }
    
    // Créer les particules quand le panel s'ouvre
    if (floatingParticles) {
        createFloatingParticles();
    }
    
    // Afficher l'indicateur de frappe avec message varié
    function showTypingIndicator() {
        isTyping = true;
        const lang = getCurrentLanguage();
        const typingMessages = {
            fr: [
                'Ziggy est en train d\'écrire...',
                'Ziggy prépare une réponse fun...',
                'Ziggy réfléchit... 🎨',
                'Ziggy arrive avec la réponse...'
            ],
            en: [
                'Ziggy is typing...',
                'Ziggy is preparing a fun answer...',
                'Ziggy is thinking... 🎨',
                'Ziggy is coming with the answer...'
            ]
        };
        
        const messages = typingMessages[lang] || typingMessages.fr;
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];
        
        const typingText = typingIndicator.querySelector('.typing-text');
        if (typingText) {
            typingText.textContent = randomMessage;
        }
        
        typingIndicator.style.display = 'flex';
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    // Masquer l'indicateur de frappe
    function hideTypingIndicator() {
        isTyping = false;
        typingIndicator.style.display = 'none';
    }
    
    // Ajouter un message avec support des liens
    function addMessage(type, text, questionKey = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type}`;
        messageDiv.setAttribute('role', type === 'user' ? 'user' : 'assistant');
        
        const avatar = document.createElement('div');
        avatar.className = `message-avatar ${type}`;
        if (type === 'assistant') {
            // Utiliser une mascotte aléatoire pour chaque message
            const randomMascot = mascottes[Math.floor(Math.random() * mascottes.length)];
            const mascotImg = document.createElement('img');
            mascotImg.src = randomMascot;
            mascotImg.alt = 'Ziggy';
            mascotImg.className = 'message-avatar-img';
            // Gestion d'erreur pour les avatars de messages
            mascotImg.addEventListener('error', function() {
                avatar.innerHTML = 'Z';
                avatar.style.fontSize = '18px';
                avatar.style.fontWeight = '700';
                avatar.style.color = 'white';
            });
            avatar.appendChild(mascotImg);
        } else {
            avatar.textContent = '👤';
        }
        avatar.setAttribute('aria-hidden', 'true');
        
        const bubble = document.createElement('div');
        bubble.className = `message-bubble ${type}`;
        
        // Traiter le texte pour ajouter des liens (seulement si c'est une string)
        if (typeof text === 'string' && text.trim()) {
            const processedText = processTextWithLinks(text);
            bubble.innerHTML = processedText;
        } else {
            bubble.textContent = String(text || '');
        }
        
        // Bouton copier
        const copyBtn = document.createElement('button');
        copyBtn.className = 'message-copy-btn';
        copyBtn.setAttribute('aria-label', 'Copier le message');
        copyBtn.innerHTML = `
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        `;
        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(text).then(() => {
                copyBtn.innerHTML = '✓';
                setTimeout(() => {
                    copyBtn.innerHTML = `
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                        </svg>
                    `;
                }, 2000);
            });
        });
        
        // Boutons de feedback (seulement pour les réponses de l'assistant)
        let feedbackContainer = null;
        if (type === 'assistant') {
            feedbackContainer = document.createElement('div');
            feedbackContainer.className = 'message-feedback';
            const usefulBtn = document.createElement('button');
            usefulBtn.className = 'feedback-btn feedback-useful';
            usefulBtn.setAttribute('aria-label', 'Réponse utile');
            usefulBtn.textContent = '👍 Utile';
            usefulBtn.addEventListener('click', () => {
                saveFeedback(questionKey || text, true);
                usefulBtn.classList.add('active');
                notUsefulBtn.classList.remove('active');
            });
            const notUsefulBtn = document.createElement('button');
            notUsefulBtn.className = 'feedback-btn feedback-not-useful';
            notUsefulBtn.setAttribute('aria-label', 'Réponse pas utile');
            notUsefulBtn.textContent = '👎 Pas utile';
            notUsefulBtn.addEventListener('click', () => {
                saveFeedback(questionKey || text, false);
                notUsefulBtn.classList.add('active');
                usefulBtn.classList.remove('active');
            });
            feedbackContainer.appendChild(usefulBtn);
            feedbackContainer.appendChild(notUsefulBtn);
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
        messageContent.appendChild(bubble);
        messageContent.appendChild(copyBtn);
        
        messageDiv.appendChild(avatar);
        messageDiv.appendChild(messageContent);
        if (feedbackContainer) {
            messageDiv.appendChild(feedbackContainer);
        }
        
        messagesContainer.appendChild(messageDiv);
        
        // Scroll vers le bas avec animation
        setTimeout(() => {
            messagesContainer.scrollTo({
                top: messagesContainer.scrollHeight,
                behavior: 'smooth'
            });
        }, 100);
        
        // Sauvegarder l'historique
        saveHistory();
        
        // Ajouter au contexte
        conversationContext.push({ type, text, timestamp: Date.now() });
        if (conversationContext.length > 10) {
            conversationContext.shift();
        }
        
        return messageDiv;
    }
    
    // Traiter le texte pour ajouter des liens
    function processTextWithLinks(text) {
        if (!text || typeof text !== 'string') {
            return '';
        }
        
        let processed = text;
        const lang = getCurrentLanguage();
        
        // Échapper les caractères HTML pour éviter les injections
        processed = processed.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // Liens vers les pages (IMPORTANT: du plus long au plus court pour éviter les remplacements partiels)
        const pageLinks = {
            fr: [
                { keyword: 'jouer maintenant', url: '/jouer' },
                { keyword: 'mentions légales', url: '/mentions-legales' },
                { keyword: 'contact', url: '/contact' },
                { keyword: 'presse', url: '/presse' },
                { keyword: 'jouer', url: '/jouer' } // "jouer" en DERNIER pour éviter de remplacer "jouer maintenant"
            ],
            en: [
                { keyword: 'play now', url: '/jouer' },
                { keyword: 'legal notice', url: '/mentions-legales' },
                { keyword: 'contact', url: '/contact' },
                { keyword: 'press', url: '/presse' },
                { keyword: 'play', url: '/jouer' } // "play" en DERNIER
            ]
        };
        
        const links = pageLinks[lang] || pageLinks.fr;
        
        // Traiter les liens du plus long au plus court pour éviter les remplacements partiels
        // Utiliser un tableau de positions remplacées pour éviter les chevauchements
        const replacedRanges = [];
        
        links.forEach(({ keyword, url }) => {
            try {
                // Échapper les caractères spéciaux pour la regex
                const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                
                // Créer une regex qui fonctionne avec ou sans guillemets
                let regex;
                if (keyword.includes(' ')) {
                    // Pour les expressions de plusieurs mots, accepter les guillemets et espaces
                    regex = new RegExp('([\\s"\']|^)(' + escapedKeyword + ')([\\s"\']|$|[,;:!?.])', 'gi');
                } else {
                    // Pour les mots simples, utiliser \b mais aussi accepter les guillemets
                    regex = new RegExp('(\\b|["\']|^)(' + escapedKeyword + ')(\\b|["\']|$|[,;:!?.])', 'gi');
                }
                
                processed = processed.replace(regex, function(match, before, keywordMatch, after, offset, string) {
                    // Vérifier qu'on n'est pas déjà dans un lien HTML
                    const beforeText = string.substring(Math.max(0, offset - 100), offset);
                    
                    // Compter les balises <a> et </a> avant
                    const openTagsBefore = (beforeText.match(/<a\s/g) || []).length;
                    const closeTagsBefore = (beforeText.match(/<\/a>/g) || []).length;
                    
                    // Si on est dans un lien (plus de <a> que de </a> avant), ne pas remplacer
                    if (openTagsBefore > closeTagsBefore) {
                        return match;
                    }
                    
                    // Vérifier qu'on ne chevauche pas avec un remplacement précédent
                    const keywordStart = offset + (before ? before.length : 0);
                    const keywordEnd = keywordStart + (keywordMatch ? keywordMatch.length : keyword.length);
                    
                    for (let i = 0; i < replacedRanges.length; i++) {
                        const range = replacedRanges[i];
                        // Si chevauchement, ne pas remplacer
                        if ((keywordStart >= range.start && keywordStart < range.end) ||
                            (keywordEnd > range.start && keywordEnd <= range.end) ||
                            (keywordStart <= range.start && keywordEnd >= range.end)) {
                            return match;
                        }
                    }
                    
                    // Enregistrer la plage remplacée
                    replacedRanges.push({ start: keywordStart, end: keywordEnd });
                    
                    // Pour les expressions de plusieurs mots, reconstruire avec le contexte
                    if (keyword.includes(' ')) {
                        const actualKeyword = keywordMatch || keyword;
                        return (before || '') + '<a href="' + url + '" class="chat-link" target="_blank">' + actualKeyword + '</a>' + (after || '');
                    } else {
                        // Pour les mots simples, préserver le contexte
                        return (before || '') + '<a href="' + url + '" class="chat-link" target="_blank">' + (keywordMatch || keyword) + '</a>' + (after || '');
                    }
                });
            } catch (e) {
                console.warn('Erreur lors du traitement du lien', keyword, e);
            }
        });
        
        // Email
        processed = processed.replace(/\b(team@zig-zag\.fun)\b/gi, function(match, p1, offset, string) {
            const before = string.substring(Math.max(0, offset - 100), offset);
            const openTags = (before.match(/<a\s/g) || []).length;
            const closeTags = (before.match(/<\/a>/g) || []).length;
            if (openTags > closeTags) {
                return match;
            }
            return '<a href="mailto:' + match + '" class="chat-link">' + match + '</a>';
        });
        
        // URLs (après les autres pour éviter les conflits)
        processed = processed.replace(/(https?:\/\/[^\s<>"']+)/gi, function(match, offset, string) {
            const before = string.substring(Math.max(0, offset - 100), offset);
            const openTags = (before.match(/<a\s/g) || []).length;
            const closeTags = (before.match(/<\/a>/g) || []).length;
            if (openTags > closeTags) {
                return match;
            }
            return '<a href="' + match + '" class="chat-link" target="_blank">' + match + '</a>';
        });
        
        return processed;
    }
    
    // Sauvegarder le feedback
    function saveFeedback(question, isUseful) {
        try {
            const feedback = JSON.parse(localStorage.getItem(STORAGE_FEEDBACK_KEY) || '{}');
            feedback[question] = isUseful;
            localStorage.setItem(STORAGE_FEEDBACK_KEY, JSON.stringify(feedback));
        } catch (e) {
            console.warn('Erreur lors de la sauvegarde du feedback', e);
        }
    }
    
    // Détecter l'intention avec synonymes
    function detectIntent(text) {
        const lang = getCurrentLanguage();
        const lowerText = text.toLowerCase().trim();
        const keywords = intentKeywords[lang] || intentKeywords.fr;
        
        let bestMatch = null;
        let bestScore = 0;
        
        // Vérifier d'abord les correspondances exactes (priorité absolue)
        for (const question of Object.keys(keywords)) {
            if (lowerText === question.toLowerCase()) {
                return question; // Retourner immédiatement si correspondance exacte
            }
        }
        
        // Sinon, calculer les scores avec les mots-clés
        for (const question of Object.keys(keywords)) {
            const score = keywords[question].reduce((acc, keyword) => {
                // Vérifier si le mot-clé est présent (mots complets de préférence)
                try {
                    const escapedKeyword = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
                    const keywordRegex = new RegExp(`\\b${escapedKeyword}\\b`, 'i');
                    if (keywordRegex.test(lowerText)) {
                        return acc + 2; // Score plus élevé pour mots complets
                    } else if (lowerText.includes(keyword)) {
                        return acc + 1; // Score plus faible pour sous-chaînes
                    }
                } catch (e) {
                    // Si erreur regex, utiliser includes simple
                    if (lowerText.includes(keyword)) {
                        return acc + 1;
                    }
                }
                return acc;
            }, 0);
            
            if (score > bestScore) {
                bestScore = score;
                bestMatch = question;
            }
        }
        
        // Ne retourner une correspondance que si le score est > 0
        return bestScore > 0 ? bestMatch : null;
    }
    
    // Obtenir une réponse variée
    function getResponse(questionKey) {
        const lang = getCurrentLanguage();
        const responsesLang = responses[lang] || responses.fr;
        const questionResponses = responsesLang[questionKey];
        
        if (questionResponses && questionResponses.length > 0) {
            return questionResponses[Math.floor(Math.random() * questionResponses.length)];
        }
        
        return null;
    }
    
    // Afficher les questions contextuelles
    function showContextualQuestions(questionKey) {
        if (!questionKey) {
            showInitialQuestions();
            return;
        }
        
        const lang = getCurrentLanguage();
        const contextual = contextualQuestions[lang] || contextualQuestions.fr;
        const questions = contextual[questionKey];
        
        // Si pas de questions contextuelles pour cette clé, afficher les initiales
        if (!questions || questions.length === 0) {
            showInitialQuestions();
            return;
        }
        
        // Nettoyer les questions précédentes
        quickQuestionsContainer.innerHTML = '';
        
        questions.forEach(question => {
            const btn = document.createElement('button');
            btn.className = 'quick-question-btn';
            btn.textContent = question;
            btn.setAttribute('aria-label', `Poser la question: ${question}`);
            btn.addEventListener('click', () => {
                sendMessage(question);
            });
            quickQuestionsContainer.appendChild(btn);
        });
    }
    
    // Afficher les questions initiales
    function showInitialQuestions() {
        const lang = getCurrentLanguage();
        const questions = quickQuestions[lang] || quickQuestions.fr;
        
        quickQuestionsContainer.innerHTML = '';
        questions.forEach(question => {
            const btn = document.createElement('button');
            btn.className = 'quick-question-btn';
            btn.textContent = question;
            btn.setAttribute('aria-label', `Poser la question: ${question}`);
            btn.addEventListener('click', () => {
                sendMessage(question);
            });
            quickQuestionsContainer.appendChild(btn);
        });
    }
    
    // Envoyer un message avec debounce
    function sendMessage(text) {
        if (!text.trim() || isTyping) return;
        
        // Debounce
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        
        debounceTimer = setTimeout(() => {
            executeSendMessage(text);
        }, DEBOUNCE_DELAY);
    }
    
    // Exécuter l'envoi du message
    function executeSendMessage(text) {
        const trimmedText = text.trim();
        if (!trimmedText) return;
        
        // Message utilisateur
        addMessage('user', trimmedText);
        
        // Masquer les questions rapides temporairement
        quickQuestionsContainer.style.display = 'none';
        
        // Désactiver l'input
        input.disabled = true;
        sendBtn.disabled = true;
        
        // Afficher l'indicateur de frappe
        showTypingIndicator();
        
        // Simuler un délai de réponse (plus réaliste)
        const responseDelay = 800 + Math.random() * 400; // 800-1200ms
        
        setTimeout(() => {
            hideTypingIndicator();
            
            const lang = getCurrentLanguage();
            const responsesLang = responses[lang] || responses.fr;
            let questionKey = null;
            let response = null;
            
            // Vérifier d'abord la correspondance exacte (priorité absolue)
            if (responsesLang[trimmedText]) {
                questionKey = trimmedText;
                response = getResponse(trimmedText);
            } else {
                // Sinon, détecter l'intention avec les mots-clés
                questionKey = detectIntent(trimmedText);
                if (questionKey) {
                    response = getResponse(questionKey);
                }
            }
            
            // Si pas de réponse trouvée, utiliser générique
            if (!response) {
                const generic = genericResponses[lang] || genericResponses.fr;
                response = generic[Math.floor(Math.random() * generic.length)];
                questionKey = null; // Pas de question contextuelle pour les réponses génériques
            }
            
            // Ajouter la réponse
            addMessage('assistant', response, questionKey);
            
            // Afficher les questions contextuelles ou initiales
            if (questionKey) {
                showContextualQuestions(questionKey);
            } else {
                showInitialQuestions();
            }
            quickQuestionsContainer.style.display = 'flex';
            
            // Réactiver l'input
            input.disabled = false;
            sendBtn.disabled = false;
            input.focus();
        }, responseDelay);
    }
    
    // Exporter la conversation
    function exportConversation() {
        const messages = Array.from(messagesContainer.children).map(msg => {
            const type = msg.classList.contains('user') ? 'Utilisateur' : 'Assistant';
            const bubble = msg.querySelector('.message-bubble');
            const text = bubble ? bubble.textContent : '';
            return `[${type}]: ${text}`;
        });
        
        const content = `Conversation ZigZag - ${new Date().toLocaleString()}\n\n${messages.join('\n\n')}`;
        const blob = new Blob([content], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `zigzag-conversation-${Date.now()}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    // Charger l'historique au démarrage
    function loadSavedHistory() {
        const history = loadHistory();
        if (history.length > 0) {
            // Ne pas sauvegarder pendant le chargement
            const originalSaveHistory = saveHistory;
            saveHistory = () => {}; // Désactiver temporairement
            
            history.forEach(msg => {
                if (msg.text && msg.text.trim()) {
                    addMessage(msg.type, msg.text);
                }
            });
            
            // Réactiver la sauvegarde
            saveHistory = originalSaveHistory;
            
            // Afficher les questions initiales
            showInitialQuestions();
        }
    }
    
    // Message d'accueil - Ton Ziggy ultra-enthousiaste
    function showWelcomeMessage() {
        const lang = getCurrentLanguage();
        const welcomeMessages = {
            fr: [
                'Salut ! 👋 Je suis Ziggy, ton guide pour ZigZag ! Prêt(e) à découvrir le jeu où tes phrases deviennent des dessins hilarants ? C\'est parti ! 🎨✨',
                'Hey ! 🎨 Moi c\'est Ziggy ! Je suis là pour te faire découvrir ZigZag, le jeu où tes mots se transforment en chaos créatif ! Envie d\'essayer ? 🚀',
                'Salut ! Je suis Ziggy, l\'étincelle créative de ZigZag ! 😂 Prêt(e) à voir tes phrases partir en vrille joyeusement ? Pose-moi tes questions ! ✨'
            ],
            en: [
                'Hey! 👋 I\'m Ziggy, your guide for ZigZag! Ready to discover the game where your phrases become hilarious drawings? Let\'s go! 🎨✨',
                'Hi! 🎨 I\'m Ziggy! I\'m here to show you ZigZag, the game where your words transform into creative chaos! Want to try? 🚀',
                'Hey! I\'m Ziggy, the creative spark of ZigZag! 😂 Ready to see your phrases go joyfully wild? Ask me anything! ✨'
            ]
        };
        
        const messages = welcomeMessages[lang] || welcomeMessages.fr;
        const welcome = messages[Math.floor(Math.random() * messages.length)];
        addMessage('assistant', welcome);
    }
    
    // Toggle panel avec accessibilité
    toggle.addEventListener('click', () => {
        const isActive = panel.classList.contains('active');
        panel.classList.toggle('active');
        toggle.setAttribute('aria-expanded', !isActive);
        
        // Changer la mascotte à chaque clic
        changeMascot();
        if (!isActive) {
            // Changer aussi la mascotte du header quand on ouvre
            changeHeaderMascot();
        }
        
        if (!isActive) {
            notificationBadge.style.display = 'none';
            input.focus();
            
            // Charger l'historique ou afficher le message de bienvenue
            if (messagesContainer.children.length === 0) {
                const history = loadHistory();
                if (history.length > 0) {
                    loadSavedHistory();
                } else {
                    showWelcomeMessage();
                    showInitialQuestions();
                }
            } else {
                showInitialQuestions();
            }
        }
    });
    
    // Fermer le panel
    closeBtn.addEventListener('click', () => {
        panel.classList.remove('active');
        toggle.setAttribute('aria-expanded', 'false');
    });
    
    // Fermer avec Escape
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && panel.classList.contains('active')) {
            panel.classList.remove('active');
            toggle.setAttribute('aria-expanded', 'false');
        }
    });
    
    // Export
    exportBtn.addEventListener('click', exportConversation);
    
    // Envoyer avec le bouton
    sendBtn.addEventListener('click', () => {
        const text = input.value.trim();
        if (text && !isTyping) {
            sendMessage(text);
            input.value = '';
        }
    });
    
    // Envoyer avec Enter
    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey && !isTyping) {
            e.preventDefault();
            const text = input.value.trim();
            if (text) {
                sendMessage(text);
                input.value = '';
            }
        }
    });
    
    // Activer/désactiver le bouton d'envoi
    input.addEventListener('input', () => {
        sendBtn.disabled = !input.value.trim() || isTyping;
    });
    
    // Afficher la notification au chargement
    setTimeout(() => {
        if (!panel.classList.contains('active')) {
            const history = loadHistory();
            if (history.length === 0) {
                notificationBadge.style.display = 'flex';
            }
        }
    }, 2000);
    
    // Mettre à jour les traductions si i18n change
    if (window.ZigZagI18n) {
        const originalSetLanguage = window.ZigZagI18n.setLanguage;
        window.ZigZagI18n.setLanguage = function(lang) {
            originalSetLanguage.call(this, lang);
            // Mettre à jour le chatbot
            if (panel.classList.contains('active')) {
                showInitialQuestions();
            }
        };
    }
});

