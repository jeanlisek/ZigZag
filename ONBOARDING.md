## Bienvenue sur ZigZag

Ce guide est là pour te permettre de :
- **Installer le projet** en moins de 10 minutes
- **Comprendre l’architecture globale**
- **Développer une première feature** (modération des contenus)
- **Déployer tes modifications** en sécurité

---

## 1. Installation du projet (< 10 min)

### 1.1. Prérequis
- **Node.js** (version récente LTS)
- **Python ≥ 3.11** (si tu touches au backend)
- **Un navigateur moderne** (Chrome, Edge, Firefox)
- **Un éditeur** type VS Code / Cursor

### 1.2. Récupérer le code
1. Cloner ou télécharger le repository.
2. Ouvrir le dossier racine dans ton éditeur.

### 1.3. Lancer le front en local
Le front est un site statique dans le dossier `Zig-Zag/`.

- Option simple : ouvrir `Zig-Zag/index.html` dans ton navigateur (double‑clic).
- Option propre (recommandée) : lancer un petit serveur statique, par exemple :

```bash
cd Zig-Zag
python -m http.server 8000
```

Puis ouvrir `http://localhost:8000` dans ton navigateur.

### 1.4. Supabase (lecture seule)
Le projet utilise Supabase côté client (clé **anon** uniquement).

Tu n’as rien à installer pour lire les données : les scripts chargent `@supabase/supabase-js@2` via CDN directement dans le navigateur.

Si tu dois modifier le schéma ou les policies, vois la partie **SQL / Supabase** de la doc dans `docs/rules-supabase.md` (et pense à mettre à jour `Zig-Zag/sql/01_complete_schema.sql`).

---

## 2. Comprendre l’architecture

### 2.1. Vue d’ensemble
- **Frontend statique** dans `Zig-Zag/`
  - Pages principales : `index.html`, `jouer.html`, `contact.html`, `admin.html`, `mentions-legales.html`, `presse.html`, `404.html`, `500.html`
  - Scripts : `script.js`, `admin.js`, `admin_advanced.js`, `chatbot.js`, `cookies.js`, `i18n.js`
  - Styles : `style.css`, `chatbot.css`, `cookies.css`
  - PWA : `manifest.json`, `sw.js`
- **Backend Python (optionnel)** dans `Zig-Zag_9-12-25/main.py`
- **Base de données Supabase** (auth, parties, contenu, contact, etc.)
- **Règles & process** dans `docs/` :
  - `rules-frontend.md`, `rules-backend.md`, `rules-supabase.md`, `rules-security.md`, `rules-workflow.md`

### 2.2. Flux utilisateur clés
- **Landing (`index.html`)** : présentation de ZigZag + inscription newsletter.
- **Jouer (`jouer.html`)** :
  - Auth via Supabase.
  - Création et gestion des parties (`zigs`, `steps`, `participants`).
- **Contact (`contact.html`)** : formulaire -> table `contact_messages`.
- **Admin (`admin.html`)** :
  - Dashboard analytics, filtres, pagination, exports.
  - S’appuie sur `admin.js` et `admin_advanced.js`.

### 2.3. Points techniques importants
- **Supabase côté client** via CDN UMD, client global `supabaseClient`.
- **RLS activé** sur toutes les tables : toujours en tenir compte.
- **PWA** : manifest, service worker, cache offline.
- **Chatbot / Assistant IA** : `chatbot.js` + `chatbot.css`, inclués sur toutes les pages.
- **Multilingue** : `i18n.js`, traductions via `data-i18n`.

Pour plus de détails, commence par lire :
- `docs/rules-frontend.md`
- `docs/rules-supabase.md`
- `docs/rules-security.md`

---

## 3. Développer une première feature : modération des contenus

Objectif : ajouter une **modération simple** pour :
- **Insultes / propos offensants**
- **Dessins / contenus visuels obscènes** (au niveau front, via règles simples)
- **Vocaux / audio** (bloquer ou marquer certains fichiers)

L’idée n’est pas de tout régler d’un coup, mais de t’offrir un **parcours concret**, du front jusqu’à la base.

### 3.1. Étape 1 – Choisir le point d’entrée

Commence par un **cas précis** (par exemple : empêcher l’envoi de messages insultants dans une zone de texte, ou bloquer le nom d’un zig offensant).

1. Identifier la page concernée (par ex. `jouer.html` ou `contact.html`).
2. Trouver le script associé (`script.js`, `admin.js`, etc.).
3. Localiser la fonction qui :
   - lit la valeur du champ,
   - l’envoie à Supabase (ou l’affiche aux autres utilisateurs).

### 3.2. Étape 2 – Ajouter une fonction de filtrage texte

Dans le fichier JS concerné (par ex. `script.js`) :
1. Créer une petite fonction utilitaire, par ex. `isContentOffensive(message)` :
   - liste d’insultes / expressions interdites,
   - comparaison en minuscules,
   - retourne `true` si le contenu est bloqué.
2. Appeler cette fonction **avant** d’envoyer les données à Supabase :
   - si contenu offensant → afficher un message d’erreur utilisateur clair,
   - ne pas appeler la requête Supabase.

Pense à :
- Respecter les règles de `docs/rules-frontend.md` (pas de `var`, async/await pour les appels Supabase, etc.).
- Ajouter des messages d’erreur propres et localisables (via `i18n` si possible).

### 3.3. Étape 3 – Dessins obscènes / contenus visuels

Pour un premier jet côté front :
- Limiter certains **motifs dans les titres / descriptions** des contenus visuels (même logique que ci‑dessus).
- Si des images sont uploadées :
  - Ajouter des **règles simples** (taille max, format autorisé, nom de fichier propre).
  - Prévoir un **champ “signalement”** ou un flag côté admin pour les contenus douteux (même sans algo d’IA complet au début).

Si tu ajoutes des colonnes (par ex. `is_flagged`, `moderation_status`) :
- Mettre à jour les fichiers SQL dans `Zig-Zag/sql/` (au minimum `01_complete_schema.sql`).
- Vérifier `docs/rules-supabase.md` pour les RLS et les migrations.

### 3.4. Étape 4 – Vocaux / audio

Selon l’état actuel du projet :
- Si les vocaux sont des **fichiers uploadés** :
  - Implémenter une **liste blanche de formats** (par ex. `.mp3`, `.wav`).
  - Limiter la **taille max**.
  - Ajouter un champ d’état de modération dans la base (ex : `pending_review`, `approved`, `rejected`) si ce n’est pas déjà fait.
- Si les vocaux passent par un backend Python :
  - Vérifier `Zig-Zag_9-12-25/main.py`.
  - Ajouter une fonction de vérification simple (par ex. validation du nom de fichier, taille, métadonnées) avant enregistrement.

Dans tous les cas :
- **Ne jamais stocker de secrets** dans le front ou le backend (voir `docs/rules-security.md`).
- **Toujours** gérer les erreurs (try/catch côté front, exceptions claires côté Python).

### 3.5. Étape 5 – Tests manuels de ta feature

Avant de considérer ta feature comme “ok” :
1. Lancer le site en local (`python -m http.server 8000` dans `Zig-Zag`).
2. Tester :
   - un contenu **propre** → doit passer,
   - un contenu **offensant** → doit être bloqué avec message clair,
   - comportement côté admin si tu as ajouté des flags / champs de modération.
3. Vérifier la console du navigateur :
   - pas d’erreurs JS,
   - pas d’appels Supabase qui échouent en silence.

---

## 4. Déployer tes modifications

Le projet étant statique (HTML/JS/CSS) avec Supabase côté client, le déploiement se fait comme pour un **site statique**.

### 4.1. Checklist avant déploiement
- **Lint / format** : respecter les conventions du projet si un outil est déjà en place.
- **Tests manuels** :
  - pages principales (landing, jouer, contact, admin),
  - ta nouvelle feature de modération (cas positifs / négatifs),
  - responsive basique (mobile / desktop).
- **Supabase** :
  - pas de `service_role` exposé,
  - pas de `select *` sur des données sensibles,
  - RLS toujours actif et cohérent avec tes changements.
- **SQL** :
  - si tu as modifié la base, vérifier que `Zig-Zag/sql/01_complete_schema.sql` est à jour,
  - ajouter une migration numérotée si nécessaire.

### 4.2. Process de déploiement (générique)

Selon l’hébergement choisi (Netlify, Vercel, OVH mutualisé, etc.) :
1. Construire/valider les fichiers dans `Zig-Zag/` (pas de build lourd, c’est du statique).
2. Déployer le contenu de `Zig-Zag/` sur l’hébergement (ou synchroniser via FTP/CI/CD).
3. Vérifier après mise en ligne :
   - que toutes les pages se chargent sans erreur,
   - que la PWA fonctionne toujours (installable, offline basique),
   - que ta feature de modération fonctionne en prod (pas uniquement en local).

Si un **workflow CI/CD** spécifique est mis en place plus tard, ce fichier sera mis à jour pour décrire la marche à suivre (branche, tests, validations).

---

## 5. Pour aller plus loin

Pour approfondir :
- **Règles générales** : `.cursorrules`
- **Frontend** : `docs/rules-frontend.md`
- **Backend** : `docs/rules-backend.md`
- **Supabase & SQL** : `docs/rules-supabase.md`
- **Sécurité** : `docs/rules-security.md`
- **Workflow & tests** : `docs/rules-workflow.md`

Si tu ajoutes une nouvelle étape importante au parcours dev (ex : nouveau outil de test, pipeline CI, système de modération avancé), pense à **mettre à jour ce fichier** ainsi que `docs/RULES_CHANGELOG.md`.

