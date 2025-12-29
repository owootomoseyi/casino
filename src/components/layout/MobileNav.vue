<template>
  <nav class="mobile-nav">
    <router-link to="/" class="nav-item" active-class="active" exact>
      <span class="nav-icon">🏠</span>
      <span class="nav-text">Home</span>
    </router-link>
    <router-link to="/games" class="nav-item" active-class="active">
      <span class="nav-icon">🎮</span>
      <span class="nav-text">Games</span>
    </router-link>
    <router-link to="/bonuses" class="nav-item" active-class="active" v-if="isAuthenticated">
      <span class="nav-icon">🎁</span>
      <span class="nav-text">Bonuses</span>
    </router-link>
    <router-link to="/wallet" class="nav-item" active-class="active" v-if="isAuthenticated">
      <span class="nav-icon">💰</span>
      <span class="nav-text">Wallet</span>
    </router-link>
    <router-link to="/profile" class="nav-item" active-class="active" v-if="isAuthenticated">
      <span class="nav-icon">👤</span>
      <span class="nav-text">Profile</span>
    </router-link>
    <router-link to="/login" class="nav-item" active-class="active" v-if="!isAuthenticated">
      <span class="nav-icon">🔑</span>
      <span class="nav-text">Login</span>
    </router-link>
  </nav>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()
const isAuthenticated = computed(() => authStore.isAuthenticated)
</script>

<style scoped>
.mobile-nav {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: var(--mobile-nav-height);
  background: rgba(18, 18, 26, 0.98);
  backdrop-filter: blur(20px);
  border-top: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-around;
  padding: 0 var(--space-sm);
  z-index: 100;
}

.nav-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
  min-width: 60px;
}

.nav-item:hover,
.nav-item.active {
  color: var(--color-primary);
}

.nav-icon {
  font-size: 1.25rem;
}

.nav-text {
  font-size: 0.6875rem;
  font-weight: 500;
}
</style>
