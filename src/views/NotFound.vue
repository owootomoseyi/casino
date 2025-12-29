<template>
  <div class="not-found-page">
    <div class="content">
      <span class="error-code">404</span>
      <h1>Page Not Found</h1>
      <p>The page you're looking for doesn't exist or has been moved.</p>
      <div class="actions">
        <router-link to="/" class="btn btn-primary">Go Home</router-link>
        <router-link to="/games" class="btn btn-secondary">Browse Games</router-link>
      </div>
    </div>
    <div class="decorations">
      <span class="emoji">🎰</span>
      <span class="emoji">🎲</span>
      <span class="emoji">🃏</span>
    </div>
  </div>
</template>

<style scoped>
.not-found-page {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 60vh;
  text-align: center;
  position: relative;
}

.content {
  position: relative;
  z-index: 1;
}

.error-code {
  font-family: var(--font-display);
  font-size: 8rem;
  font-weight: 900;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1;
}

h1 {
  font-size: 2rem;
  margin: var(--space-md) 0;
}

p {
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

.actions {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.decorations {
  position: absolute;
  inset: 0;
  pointer-events: none;
  overflow: hidden;
}

.emoji {
  position: absolute;
  font-size: 4rem;
  opacity: 0.1;
  animation: float 6s ease-in-out infinite;
}

.emoji:nth-child(1) { top: 20%; left: 10%; animation-delay: 0s; }
.emoji:nth-child(2) { top: 60%; right: 15%; animation-delay: 2s; }
.emoji:nth-child(3) { bottom: 20%; left: 20%; animation-delay: 4s; }
</style>
