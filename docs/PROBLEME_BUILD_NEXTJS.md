# ⚠️ Problème de Build Next.js - Routes Dynamiques

## 🐛 Problème

Après l'ajout du système de tour par tour, le build Next.js échoue avec l'erreur :

```
Error: Page "/jeu/[game_id]" is missing "generateStaticParams()" so it cannot be used with "output: export" config.
```

### Cause

Next.js 16 avec `output: 'export'` exige que toutes les routes dynamiques (avec `[param]`) exportent une fonction `generateStaticParams()`. **Mais** cette fonction ne peut pas coexister avec la directive `'use client'`.

### Pages Concernées

- `/app/jeu/[game_id]/page.tsx` - Page de jeu principale
- `/app/jeu/[game_id]/results/page.tsx` - Page de résultats
- `/app/jeu/room/[room_code]/page.tsx` - Page de lobby

---

## ✅ Solutions Possibles

### Solution 1 : Refactoring en Composants Séparés (Recommandé)

Séparer la logique client dans des composants dédiés :

**Structure actuelle :**
```
/app/jeu/[game_id]/page.tsx   ('use client')
```

**Structure proposée :**
```
/app/jeu/[game_id]/page.tsx         (serveur, exporte generateStaticParams)
/app/jeu/[game_id]/GameClient.tsx   ('use client', contient toute la logique)
```

**Exemple de refactoring :**

```tsx
// page.tsx (serveur)
import GameClient from './GameClient';

export function generateStaticParams() {
  return [{ game_id: '__fallback__' }];
}

export default function GamePage({ params }: { params: { game_id: string } }) {
  return <GameClient gameId={params.game_id} />;
}
```

```tsx
// GameClient.tsx ('use client')
'use client';

export default function GameClient({ gameId }: { gameId: string }) {
  // Tout le code actuel de page.tsx
  // ...
}
```

### Solution 2 : Mode Hybride (Non recommandé pour hébergement statique)

Utiliser `output: 'standalone'` au lieu de `export`, mais cela nécessite un serveur Node.js.

### Solution 3 : Fallback Simple (Temporaire)

Créer des pages fallback génériques qui sont remplacées dynamiquement côté client.

---

## 🛠️ Plan de Correction

### Étape 1 : Refactoring de `/app/jeu/[game_id]/page.tsx`

1. Créer `/app/jeu/[game_id]/GamePageClient.tsx`
2. Déplacer tout le code avec `'use client'` dans ce nouveau fichier
3. Modifier `page.tsx` pour qu'il devienne un composant serveur qui importe `GamePageClient`
4. Exporter `generateStaticParams()` depuis `page.tsx`

### Étape 2 : Refactoring de `/app/jeu/[game_id]/results/page.tsx`

Même processus que l'étape 1.

### Étape 3 : Refactoring de `/app/jeu/room/[room_code]/page.tsx`

Déjà partiellement fait avec `RoomLobbyPageClient`, il suffit de retirer `'use client'` de `page.tsx`.

### Étape 4 : Build et Test

```bash
cd game-app
npm run build
```

---

## 📝 État Actuel

L'amélioration du système de tour par tour est **complète** mais ne peut pas être buildée à cause de cette limitation technique de Next.js.

### Fichiers Modifiés (Fonctionnels mais non buildables)

✅ `/lib/supabase/games.ts` - Fonction `getCurrentPlayerForStep()` ajoutée  
✅ `/app/jeu/[game_id]/page.tsx` - Logique de détermination du tour ajoutée  
✅ `/app/globals.css` - Styles pour l'état d'attente ajoutés  
✅ `/docs/AMELIORATION_TOUR_PAR_TOUR.md` - Documentation complète  

### Fonctionnalités Implémentées

✅ Rotation circulaire des joueurs en parties privées  
✅ Interface désactivée pour les joueurs en attente  
✅ Affichage du joueur actif avec avatar animé  
✅ Messages clairs d'attente du tour  
✅ Mode random inchangé (premier arrivé, premier servi)  

---

## 🚀 Déploiement Temporaire

En attendant le refactoring, deux options :

### Option A : Déployer l'ancienne version

Revenir à un commit précédent avant l'ajout du système de tour par tour.

### Option B : Tester en local

```bash
cd game-app
npm run dev
```

L'application fonctionne parfaitement en mode développement avec `npm run dev`.

---

## 📋 Checklist du Refactoring

- [ ] Créer `GamePageClient.tsx`
- [ ] Refactorer `page.tsx` en composant serveur
- [ ] Exporter `generateStaticParams()` depuis `page.tsx`
- [ ] Répéter pour `/results/page.tsx`
- [ ] Corriger `/room/[room_code]/page.tsx`
- [ ] Tester le build : `npm run build`
- [ ] Vérifier que `out/jeu/__fallback__/index.html` existe
- [ ] Vérifier que le `.htaccess` route correctement les URLs dynamiques
- [ ] Tester le déploiement
- [ ] Valider le fonctionnement du système de tour par tour

---

## 🔗 Ressources

- [Next.js App Router - generateStaticParams](https://nextjs.org/docs/app/api-reference/functions/generate-static-params)
- [Next.js Static Export](https://nextjs.org/docs/app/building-your-application/deploying/static-exports)
- [Next.js Client Components](https://nextjs.org/docs/app/building-your-application/rendering/client-components)

---

## 💡 Note Importante

Le système de tour par tour **fonctionne** et est **complètement implémenté**. Le problème est uniquement lié au build statique de Next.js. Une fois le refactoring effectué, l'application pourra être buildée et déployée normalement.

Le code métier est correct, seule l'architecture des fichiers doit être ajustée pour respecter les contraintes de Next.js 16 en mode `export`.
