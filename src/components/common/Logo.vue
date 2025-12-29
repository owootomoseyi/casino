<template>
  <component :is="to ? 'router-link' : 'div'" :to="to" class="logo" :class="{ collapsed }">
    <div class="logo-icon">
      <svg viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="logoGold" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#FFD700"/>
            <stop offset="50%" style="stop-color:#FFC107"/>
            <stop offset="100%" style="stop-color:#FF8C00"/>
          </linearGradient>
        </defs>
        <!-- Diamond shape -->
        <path d="M32 6 L54 32 L32 58 L10 32 Z" fill="none" stroke="url(#logoGold)" stroke-width="3"/>
        <!-- Inner chip -->
        <circle cx="32" cy="32" r="12" stroke="url(#logoGold)" stroke-width="2.5" fill="none"/>
        <circle cx="32" cy="32" r="6" fill="url(#logoGold)"/>
        <!-- Corner dots -->
        <circle cx="32" cy="14" r="2.5" fill="url(#logoGold)"/>
        <circle cx="32" cy="50" r="2.5" fill="url(#logoGold)"/>
        <circle cx="16" cy="32" r="2.5" fill="url(#logoGold)"/>
        <circle cx="48" cy="32" r="2.5" fill="url(#logoGold)"/>
      </svg>
    </div>
    <span class="logo-text" v-if="!collapsed">
      <span class="logo-name">QR72</span><span class="logo-accent">casino</span>
    </span>
  </component>
</template>

<script setup>
defineProps({
  to: {
    type: String,
    default: null
  },
  collapsed: {
    type: Boolean,
    default: false
  }
})
</script>

<style scoped>
.logo {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  text-decoration: none;
  cursor: pointer;
}

.logo-icon {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
}

.logo-icon svg {
  width: 100%;
  height: 100%;
}

.logo-text {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 800;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.logo-name {
  color: var(--text-primary);
}

.logo-accent {
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* Collapsed state */
.logo.collapsed {
  justify-content: center;
}

.logo.collapsed .logo-icon {
  width: 36px;
  height: 36px;
}

/* Hover effect */
.logo:hover .logo-icon svg {
  filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));
}

.logo:hover .logo-accent {
  text-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}
</style>
