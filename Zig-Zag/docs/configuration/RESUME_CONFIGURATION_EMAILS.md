# 📧 Résumé de la Configuration des Emails

## 1️⃣ Templates Supabase (Configuration Directe)

### ✅ Reset Password (Mot de passe oublié)
- **Fichier** : `TEMPLATE_SUPABASE_RESET_PASSWORD_COMPLET.html`
- **Configuration** : 
  - Aller dans Supabase Dashboard → Authentication → Email Templates
  - Sélectionner "Reset Password"
  - Copier-coller le HTML du fichier
  - Remplacer `{{ .ConfirmationURL }}` (déjà fait dans le template)
- **Fonctionnement** : Automatique quand un utilisateur clique sur "Mot de passe oublié"

### ✅ Confirm Signup (Confirmation d'inscription)
- **Fichier** : `TEMPLATE_SUPABASE_CONFIRM_SIGNUP_FINAL.html`
- **Configuration** :
  - Aller dans Supabase Dashboard → Authentication → Email Templates
  - Sélectionner "Confirm Signup"
  - Copier-coller le HTML du fichier
  - Remplacer `{{ .ConfirmationURL }}` (déjà fait dans le template)
- **Fonctionnement** : Automatique quand un utilisateur s'inscrit

**Note** : Ces templates sont stockés directement dans Supabase et utilisés automatiquement.

---

## 2️⃣ Email Beta (Workflow n8n)

### 📊 Architecture
```
n8n Workflow
├── 1. Récupérer emails depuis Supabase (table newsletter_signups)
├── 2. Code Node : Ajouter HTML complet de l'email Beta
│   └── HTML avec PERSO-07.png comme mascotte
└── 3. SMTP Node : Envoyer email via Gmail SMTP
```

### 🔧 Configuration Requise dans n8n

#### Node 1 : "Récupérer Emails Supabase"
- **Type** : HTTP Request
- **Méthode** : GET
- **URL** : `https://tihrltssmpxpreadpzqm.supabase.co/rest/v1/newsletter_signups?select=email`
- **Headers** (recommandé via variables d'environnement n8n) :
  - `apikey` : `{{ $env.SUPABASE_ANON_KEY }}`
  - `Authorization` : `Bearer {{ $env.SUPABASE_ANON_KEY }}`

#### Node 2 : "Ajouter HTML Content"
- **Type** : Code (JavaScript)
- **Fonction** : Ajoute le HTML complet de l'email Beta à chaque email
- **Note** : Le HTML inclut `https://zig-zag.fun/attached_assets/PERSO-07.png`

#### Node 3 : "Envoyer Email SMTP"
- **Type** : Email (SMTP)
- **To** : `={{ $json.email }}`
- **Subject** : `Beta ZigZag : Les 100 premiers joueurs`
- **Message** : `={{ $json.htmlContent }}`
- **Email Format** : `HTML`
- **From** (recommandé) : `{{ $env.EMAIL_FROM }}`

### 📝 Workflow JSON
- **Nom** : `n8n-workflow-email-smtp-direct.json`
- **Status** : ✅ Présent dans le projet (importable dans n8n)

### 🚀 Utilisation
1. **Test immédiat** : Exécuter le workflow manuellement dans n8n
2. **Programmation** : Ajouter un "Schedule Trigger" node au début pour envoyer automatiquement

---

## 📋 Résumé

| Type d'Email | Méthode | Fichier/Workflow | Status |
|--------------|---------|------------------|--------|
| **Reset Password** | Supabase Direct | `TEMPLATE_SUPABASE_RESET_PASSWORD_COMPLET.html` | ✅ Configuré dans Supabase Dashboard |
| **Confirm Signup** | Supabase Direct | `TEMPLATE_SUPABASE_CONFIRM_SIGNUP_FINAL.html` | ✅ Configuré dans Supabase Dashboard |
| **Email Beta** | n8n Workflow (SMTP) | `n8n-workflow-email-smtp-direct.json` | ✅ Workflow importable |

---

## 🔑 Points Importants

1. **Supabase** gère automatiquement les emails d'authentification (reset password, confirm signup)
2. **n8n** gère les emails marketing (Beta) car Supabase n'a pas de fonctionnalité d'envoi d'emails en masse
3. **SMTP Gmail** est utilisé pour l'envoi des emails Beta (nécessite un mot de passe d'application)
4. **PERSO-07.png** doit être uploadé sur `zig-zag.fun/attached_assets/` pour que l'image s'affiche dans les emails

---

## 🔧 Pour Reconfigurer le Workflow n8n

1. Importer `n8n-workflow-email-smtp-direct.json` dans n8n
2. Configurer une credential SMTP (ex: Gmail SMTP via mot de passe d'application)
3. Renseigner les variables d'environnement n8n suivantes :
   - `SUPABASE_URL` (optionnel) : `https://tihrltssmpxpreadpzqm.supabase.co`
   - `SUPABASE_ANON_KEY` : cle anon Supabase (pas de `service_role`)
   - `EMAIL_FROM` : adresse d'envoi (ex: `team@zig-zag.fun`)
