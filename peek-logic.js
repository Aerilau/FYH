globalThis.ProcrastiPetPeekLogic = Object.freeze({
  initialState() {
    return { bubbleFreeRemaining: 0, ignoredStreak: 0, lastPosition: null };
  },
  shouldShowBubble(state) {
    return (state?.bubbleFreeRemaining || 0) <= 0;
  },
  choosePosition(lastPosition, random = Math.random()) {
    const positions = ['left', 'right', 'top'].filter((position) => position !== lastPosition);
    return positions[Math.min(positions.length - 1, Math.floor(random * positions.length))];
  },
  afterAppearance(state, showBubble, clicked) {
    const current = { ...this.initialState(), ...(state || {}) };
    if (clicked) return { ...current, bubbleFreeRemaining: 5, ignoredStreak: 0 };
    let bubbleFreeRemaining = showBubble ? 4 : Math.max(0, current.bubbleFreeRemaining - 1);
    let ignoredStreak = current.ignoredStreak + 1;
    if (ignoredStreak >= 5) {
      bubbleFreeRemaining = 0;
      ignoredStreak = 0;
    }
    return { ...current, bubbleFreeRemaining, ignoredStreak };
  },
  reward(active, appearanceId, petState, peekState) {
    if (!active || active.id !== appearanceId || active.rewarded) return null;
    const coins = Math.max(0, Number(petState?.coins) || 0) + 10;
    return {
      active: { ...active, rewarded: true },
      petState: { ...(petState || {}), coins },
      peekState: { ...this.initialState(), ...(peekState || {}), bubbleFreeRemaining: 5, ignoredStreak: 0 },
      coins
    };
  }
});
