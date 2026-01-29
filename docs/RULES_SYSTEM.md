# Système de Gestion des Règles - Guide

## Vue d'ensemble

Ce système garantit que les règles du projet Zigzag sont toujours à jour et facilement consultables.

## Structure

### Fichiers de règles
- `docs/rules-frontend.md` : Règles frontend (HTML, CSS, JavaScript)
- `docs/rules-backend.md` : Règles backend (Python)
- `docs/rules-supabase.md` : Règles Supabase & MCP
- `docs/rules-security.md` : Règles sécurité & données
- `docs/rules-workflow.md` : Règles workflow & tests
- `.cursorrules` : Règles principales (sommaire)

### Fichiers de suivi
- `docs/RULES_CHANGELOG.md` : Historique complet de tous les changements
- `docs/RULES_SYSTEM.md` : Ce fichier (guide du système)

## Fonctionnement automatique

### 1. Consultation systématique
Avant chaque action, l'IA :
- Lit `.cursorrules` pour les principes généraux
- Consulte les fichiers de règles pertinents selon le contexte
- Vérifie les conventions avant de modifier du code

### 2. Mise à jour automatique
Après chaque changement significatif, l'IA :
- Identifie si les règles doivent être mises à jour
- Propose les modifications nécessaires
- Documente le changement dans `RULES_CHANGELOG.md`
- Met à jour la section "Changements récents" du fichier concerné

### 3. Suivi des changements
Chaque modification est documentée avec :
- **Date** : Date du changement
- **Type** : Ajout | Modification | Correction | Suppression
- **Fichier** : Fichier de règles concerné
- **Description** : Détails du changement

## Types de changements à documenter

### Changements significatifs
- ✅ Ajout de nouvelles fonctionnalités
- ✅ Modification d'informations de contact/réseaux sociaux
- ✅ Changements de structure de fichiers
- ✅ Nouvelles conventions de code
- ✅ Modifications de sécurité
- ✅ Changements d'API ou d'intégrations

### Changements mineurs (optionnels)
- Corrections typographiques
- Reformulations mineures
- Ajouts de clarifications mineures

## Comment utiliser

### Pour l'IA
1. **Avant chaque action** : Consulter les règles pertinentes
2. **Pendant l'action** : Respecter les conventions documentées
3. **Après l'action** : Vérifier si une mise à jour des règles est nécessaire

### Pour le développeur
1. Consulter `RULES_CHANGELOG.md` pour voir l'historique
2. Vérifier la section "Changements récents" dans chaque fichier de règles
3. Demander à l'IA de mettre à jour les règles si nécessaire

## Exemples de changements documentés

### Exemple 1 : Nouvelle fonctionnalité
```
### Ajout - Navigation sans modification d'URL
- **Fichier** : `rules-frontend.md`
- **Description** : Documentation de la fonctionnalité de navigation interne...
```

### Exemple 2 : Correction
```
### Correction - Nom du dossier
- **Fichier** : `rules-frontend.md`
- **Description** : Correction du nom du dossier de `Zig-Zag_9-12-25/` vers `Zig-Zag/`
```

### Exemple 3 : Modification d'informations
```
### Ajout - Informations de contact et réseaux sociaux
- **Fichier** : `rules-frontend.md`
- **Description** : Ajout d'une section "Informations de contact" avec l'email principal...
```

## Maintenance

- Le changelog est mis à jour automatiquement après chaque modification significative
- Les sections "Changements récents" pointent vers le changelog complet
- Le système est conçu pour rester à jour sans intervention manuelle

## Avantages

1. **Traçabilité** : Historique complet de tous les changements
2. **Cohérence** : Les règles restent synchronisées avec le code
3. **Efficacité** : Consultation automatique avant chaque action
4. **Documentation** : Référence centralisée pour toutes les conventions







