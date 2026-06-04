# 🗑️ Gestion de la Rétention des Fichiers Audio

**Date** : 22 Décembre 2024  
**Question** : Combien de temps les fichiers audio sont-ils stockés ?

---

## ⚠️ Situation Actuelle

### Réponse Directe

**Les fichiers audio sont stockés INDÉFINIMENT sur Supabase Storage.**  
Il n'y a actuellement **aucun mécanisme de nettoyage automatique** implémenté.

### Implications

✅ **Avantages** :
- Les récapitulatifs de parties restent accessibles indéfiniment
- Partage sur réseaux sociaux possible à tout moment
- Pas de perte de données

❌ **Inconvénients** :
- **Coûts de stockage** qui augmentent indéfiniment
- **Espace utilisé** qui grandit continuellement
- Pas de contrôle sur la rétention des données

---

## 📊 Estimation des Coûts

### Taille moyenne d'un fichier audio

- **30 secondes d'enregistrement** : ~1-3 MB
- **Format** : webm, ogg, mp4, aac, wav

### Calcul approximatif

Supposons :
- **10 parties/jour** avec audio
- **5 étapes/partie** en moyenne
- **2 MB/fichier** en moyenne
- **30 fichiers/jour** = **60 MB/jour**
- **~1.8 GB/mois**
- **~22 GB/an**

### Coûts Supabase Storage (tarif gratuit)

- **Gratuit jusqu'à 1 GB** de stockage
- Au-delà : tarification selon le plan Supabase

⚠️ **Attention** : Si vous dépassez 1 GB, des coûts peuvent s'appliquer.

---

## 🎯 Options de Gestion de la Rétention

### Option 1 : Conservation Indéfinie (Actuel)

**Avantages** :
- ✅ Données toujours disponibles
- ✅ Partage possible à tout moment
- ✅ Pas de code supplémentaire

**Inconvénients** :
- ❌ Coûts qui augmentent
- ❌ Espace utilisé qui grandit

**Recommandé si** : Vous avez peu de trafic et les coûts restent faibles.

---

### Option 2 : Nettoyage Automatique après X jours

**Stratégie** : Supprimer les fichiers audio des parties terminées depuis plus de X jours.

**Avantages** :
- ✅ Contrôle sur la rétention
- ✅ Coûts maîtrisés
- ✅ Espace libéré automatiquement

**Inconvénients** :
- ⚠️ Perte des récapitulatifs après X jours
- ⚠️ Code supplémentaire à maintenir

**Recommandé si** : Vous voulez maîtriser les coûts et l'espace.

**Durées suggérées** :
- **7 jours** : Conservation courte (économique)
- **30 jours** : Conservation moyenne (équilibrée) ⭐ **Recommandé**
- **90 jours** : Conservation longue (généreuse)
- **365 jours** : Conservation très longue (presque indéfinie)

---

### Option 3 : Conservation Selon le Type de Partie

**Stratégie** : Conserver différemment selon le type de partie.

**Exemples** :
- **Parties publiques (random)** : 7 jours
- **Parties privées** : 30 jours
- **Parties avec partage actif** : Conservation indéfinie

**Avantages** :
- ✅ Balance entre coûts et conservation
- ✅ Conservation prioritaire des contenus importants

**Inconvénients** :
- ⚠️ Logique plus complexe

---

## 🔧 Implémentation du Nettoyage Automatique

### Solution Proposée : Fonction SQL + Edge Function

Je peux créer :
1. **Fonction SQL** qui identifie les fichiers à supprimer
2. **Edge Function Supabase** qui s'exécute périodiquement (cron job)
3. **Optionnel** : Fonction manuelle pour nettoyage à la demande

### Structure Proposée

```
audio-recordings/
  ├── {game_id}/
  │   ├── 1-{player_id}.webm
  │   ├── 2-{player_id}.ogg
  │   └── ...
```

**Logique de nettoyage** :
1. Identifier les parties terminées depuis plus de X jours
2. Lister tous les fichiers audio dans `audio-recordings/{game_id}/`
3. Supprimer les fichiers
4. Optionnel : Supprimer le dossier `{game_id}/` s'il est vide

---

## 💡 Recommandation

### Pour Commencer

**Conservation de 30 jours** semble être un bon équilibre :
- ✅ Permet de partager les récapitulatifs récents
- ✅ Coûts maîtrisés
- ✅ Espace libéré régulièrement

### Pour le Futur

**Option 2 avec 30 jours** semble idéale :
- Implémenter une Edge Function qui s'exécute quotidiennement
- Supprimer les fichiers des parties terminées > 30 jours
- Logs pour suivre les suppressions

---

## ✅ Solution Implémentée

**Durée de conservation** : **24 heures** (à partir du début de la partie)  
**Statut** : ✅ Code créé, configuration requise

### Fichiers Créés

1. ✅ **Fonction SQL** : `sql/10_cleanup_audio_storage.sql`
   - Fonctions pour identifier les parties à nettoyer
   - Vue pour visualiser les parties concernées

2. ✅ **Edge Function** : `supabase/functions/cleanup-audio-recordings/`
   - Code TypeScript pour supprimer les fichiers
   - Documentation technique

3. ✅ **Documentation** : `GUIDE_NETTOYAGE_AUDIO.md`
   - Guide complet d'installation
   - Instructions étape par étape

---

## 🚀 Installation

Voir `GUIDE_NETTOYAGE_AUDIO.md` pour les instructions complètes.

**Résumé rapide** :
1. Exécuter `sql/10_cleanup_audio_storage.sql` dans Supabase
2. Déployer l'Edge Function `cleanup-audio-recordings`
3. Configurer un cron job (GitHub Actions recommandé)

---

**✅ Nettoyage automatique après 24h implémenté !** 🎉

