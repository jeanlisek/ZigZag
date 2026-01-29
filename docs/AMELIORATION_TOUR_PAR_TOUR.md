# ✅ Amélioration : Système de Tour par Tour

## 🎯 Problème Identifié

Dans les parties privées à plusieurs joueurs, l'interface permettait à tous les joueurs de voir et d'interagir avec les étapes en même temps. Cependant, seul un joueur pouvait valider son action, ce qui créait de la confusion :

- ❌ Tous les joueurs voyaient l'interface active (dessin, texte, audio)
- ❌ Plusieurs joueurs pouvaient commencer à dessiner/écrire en même temps
- ❌ Mais un seul pouvait réellement valider
- ❌ Les autres perdaient leur travail sans comprendre pourquoi

## ✅ Solution Implémentée

### Système de Rotation Circulaire

Un système de tour par tour a été ajouté pour les **parties privées** uniquement :

1. **Rotation circulaire** : Les joueurs jouent à tour de rôle dans l'ordre de leur arrivée
2. **Interface bloquée** : Seul le joueur actif peut interagir avec l'interface
3. **Affichage clair** : Les autres joueurs voient qui doit jouer et attendent leur tour

### Logique de Rotation

```typescript
// Déterminer quel joueur doit jouer
const playerIndex = stepNumber % players.length;
const currentPlayer = players[playerIndex];
```

**Exemple avec 3 joueurs :**
- Étape 0 : Joueur 1 (index 0)
- Étape 1 : Joueur 2 (index 1)
- Étape 2 : Joueur 3 (index 2)
- Étape 3 : Joueur 1 (index 0)
- Étape 4 : Joueur 2 (index 1)
- etc.

---

## 🎨 Améliorations UX

### Pour le joueur actif (son tour)
- ✅ Interface complètement active (dessin, texte, audio)
- ✅ Timer visible
- ✅ Bouton "Envoyer mon interprétation" actif
- ✅ Titre : **"À votre tour !"**

### Pour les autres joueurs (en attente)
- ✅ Interface désactivée
- ✅ Message clair : **"⏳ En attente du tour de [Pseudo]"**
- ✅ Avatar du joueur actif affiché
- ✅ Texte explicatif : *"C'est au tour de [Pseudo] de jouer"*
- ✅ Indication : *"Vous pourrez jouer à votre prochain tour !"*
- ✅ Spinner d'attente animé

### Exemple visuel

```
┌─────────────────────────────────────────┐
│   ⏳ En attente du tour de Alice         │
│                                          │
│         ┌───┐                            │
│         │ A │  (avatar animé)            │
│         └───┘                            │
│                                          │
│   C'est au tour de Alice de jouer.      │
│   Vous pourrez jouer à votre            │
│   prochain tour !                        │
│                                          │
│   [◯ spinner animé]                     │
└─────────────────────────────────────────┘
```

---

## 📁 Fichiers Modifiés

### 1. `/src/app/jeu/[game_id]/page.tsx`

**Ajouts :**
- Import de `getCurrentPlayerForStep` et `getOrCreatePlayerId`
- Nouveaux états : `currentPlayerId`, `isMyTurn`, `currentPlayerNickname`
- Logique de détermination du tour dans `loadGame()`
- Affichage conditionnel dans `renderInput()`
- Bouton de soumission conditionné par `isMyTurn`

**Code clé :**

```typescript
// Vérifier si c'est le tour du joueur actuel
const myPlayerId = await getOrCreatePlayerId();
setCurrentPlayerId(myPlayerId);

// Pour les parties privées, déterminer qui doit jouer
if (gameData.mode === 'private' && gameData.players && gameData.players.length > 0) {
  const currentPlayer = await getCurrentPlayerForStep(
    gameId, 
    gameData.current_step_number, 
    gameData.players
  );
  if (currentPlayer) {
    setIsMyTurn(currentPlayer.player_id === myPlayerId);
    setCurrentPlayerNickname(currentPlayer.nickname);
  }
} else {
  // Mode random : tout le monde peut jouer
  setIsMyTurn(true);
}
```

### 2. `/src/lib/supabase/games.ts`

**Nouvelle fonction :**

```typescript
export async function getCurrentPlayerForStep(
  gameId: string,
  stepNumber: number,
  players: Player[]
): Promise<Player | null> {
  if (!players || players.length === 0) {
    return null;
  }
  
  // Rotation circulaire
  const playerIndex = stepNumber % players.length;
  return players[playerIndex];
}
```

### 3. `/src/app/globals.css`

**Nouvelles classes CSS :**
- `.waiting-turn-message` - Container pour le message d'attente
- `.waiting-avatar` - Avatar du joueur actif
- `.avatar-placeholder` - Avatar avec animation pulse
- `.waiting-spinner` - Spinner d'attente

---

## 🎮 Comportement par Mode de Jeu

### Mode `private` (parties privées)
- ✅ **Tour par tour activé**
- ✅ Rotation circulaire des joueurs
- ✅ Interface bloquée pour les joueurs en attente
- ✅ Affichage du joueur actif

### Mode `random` (matchmaking public)
- ❌ **Tour par tour désactivé**
- ✅ Premier arrivé, premier servi
- ✅ Interface active pour tous
- ℹ️ La logique existante reste inchangée

---

## 🧪 Scénario de Test

### Test 1 : Partie privée à 3 joueurs

1. **Alice** crée une partie privée
2. **Bob** et **Charlie** rejoignent
3. La partie démarre

**Étape 0 (Dessin) :**
- ✅ Alice voit l'interface active → peut dessiner
- ⏳ Bob voit "En attente du tour de Alice"
- ⏳ Charlie voit "En attente du tour de Alice"

**Étape 1 (Texte) :**
- ⏳ Alice voit "En attente du tour de Bob"
- ✅ Bob voit l'interface active → peut écrire
- ⏳ Charlie voit "En attente du tour de Bob"

**Étape 2 (Dessin) :**
- ⏳ Alice voit "En attente du tour de Charlie"
- ⏳ Bob voit "En attente du tour de Charlie"
- ✅ Charlie voit l'interface active → peut dessiner

**Étape 3 (Texte) :**
- ✅ Alice voit l'interface active → peut écrire (rotation complète)
- ⏳ Bob attend
- ⏳ Charlie attend

### Test 2 : Mode random (matchmaking)

1. Plusieurs joueurs rejoignent une partie publique
2. ✅ Tous voient l'interface active
3. ✅ Le premier à valider soumet l'étape
4. ✅ Les autres passent automatiquement à l'étape suivante

---

## 🚀 Déploiement

Pour déployer cette amélioration :

```bash
cd Zig-Zag/game-app
npm run build
```

Puis uploadez le contenu de `out/` sur `game.zig-zag.fun`.

---

## 📊 Impact

### Avant
- 😕 Confusion : plusieurs joueurs travaillent en même temps
- 😤 Frustration : perte de travail pour ceux qui ne peuvent pas valider
- 🐛 Bug apparent : "Pourquoi je ne peux pas valider ?"

### Après
- ✅ Clarté : le joueur actif est clairement identifié
- ✅ Pas de perte de travail : un seul joueur peut interagir
- ✅ Compréhension : message explicite d'attente du tour

---

## 🔄 Améliorations Futures Possibles

1. **Notification sonore** quand c'est votre tour
2. **Liste des joueurs** avec indication visuelle du tour actuel
3. **Timer global** visible par tous les joueurs
4. **Historique des tours** : qui a joué quoi et quand
5. **Mode spectateur** : voir ce que les autres font en temps réel (mais sans interférer)

---

## 📝 Notes Techniques

- La rotation circulaire utilise le **modulo** du nombre de joueurs
- L'ordre des joueurs est basé sur leur **ordre d'arrivée** (`joined_at`)
- La détermination du tour est **côté client** (pas de requête supplémentaire)
- Compatible avec les **parties solo** (1 joueur = toujours son tour)
- Les joueurs sont récupérés dans `getGameWithSteps()` avec `is_active = true`

---

✨ **Le système de tour par tour améliore significativement l'expérience multijoueur des parties privées !**
