<template>
  <aside class="sidebar" :class="{ collapsed }">
    <!-- Logo -->
    <div class="sidebar-header">
      <Logo to="/" :collapsed="collapsed" />
      <button class="collapse-btn hide-mobile" @click="$emit('toggle')">
        <span class="icon">{{ collapsed ? '→' : '←' }}</span>
      </button>
    </div>
    
    <!-- Navigation -->
    <nav class="sidebar-nav">
      <!-- Main Section -->
      <div class="nav-section">
        <span class="nav-label" v-if="!collapsed">Main</span>
        <router-link to="/" class="nav-item" active-class="active">
          <span class="nav-icon">🏠</span>
          <span class="nav-text" v-if="!collapsed">Home</span>
        </router-link>
        <router-link to="/games" class="nav-item" active-class="active">
          <span class="nav-icon">🎮</span>
          <span class="nav-text" v-if="!collapsed">All Games</span>
        </router-link>
      </div>
      
      <!-- Games Section -->
      <div class="nav-section">
        <span class="nav-label" v-if="!collapsed">Games</span>
        <router-link 
          v-for="game in featuredGames" 
          :key="game.id"
          :to="`/games/${game.id}`" 
          class="nav-item"
          active-class="active"
        >
          <span class="nav-icon">{{ game.icon }}</span>
          <span class="nav-text" v-if="!collapsed">{{ game.name }}</span>
          <span class="badge badge-gold" v-if="game.new && !collapsed">NEW</span>
        </router-link>
      </div>
      
      <!-- User Section (if logged in) -->
      <div class="nav-section" v-if="isAuthenticated">
        <span class="nav-label" v-if="!collapsed">Account</span>
        <router-link to="/wallet" class="nav-item" active-class="active">
          <span class="nav-icon">💰</span>
          <span class="nav-text" v-if="!collapsed">Wallet</span>
        </router-link>
        <router-link to="/bonuses" class="nav-item" active-class="active">
          <span class="nav-icon">🎁</span>
          <span class="nav-text" v-if="!collapsed">Bonuses</span>
        </router-link>
        <router-link to="/history" class="nav-item" active-class="active">
          <span class="nav-icon">📜</span>
          <span class="nav-text" v-if="!collapsed">History</span>
        </router-link>
        <router-link to="/profile" class="nav-item" active-class="active">
          <span class="nav-icon">👤</span>
          <span class="nav-text" v-if="!collapsed">Profile</span>
        </router-link>
      </div>
      
      <!-- Admin Section (if admin) -->
      <div class="nav-section" v-if="isAdmin">
        <span class="nav-label" v-if="!collapsed">Admin</span>
        <router-link to="/admin" class="nav-item" active-class="active">
          <span class="nav-icon">📊</span>
          <span class="nav-text" v-if="!collapsed">Dashboard</span>
        </router-link>
        <router-link to="/admin/players" class="nav-item" active-class="active">
          <span class="nav-icon">👥</span>
          <span class="nav-text" v-if="!collapsed">Players</span>
        </router-link>
        <router-link to="/admin/games" class="nav-item" active-class="active">
          <span class="nav-icon">🎲</span>
          <span class="nav-text" v-if="!collapsed">Games</span>
        </router-link>
        <router-link to="/admin/finances" class="nav-item" active-class="active">
          <span class="nav-icon">💵</span>
          <span class="nav-text" v-if="!collapsed">Finances</span>
        </router-link>
        <router-link to="/admin/settings" class="nav-item" active-class="active">
          <span class="nav-icon">⚙️</span>
          <span class="nav-text" v-if="!collapsed">Settings</span>
        </router-link>
      </div>
    </nav>
    
    <!-- Footer -->
    <div class="sidebar-footer" v-if="!collapsed">
      <div class="support-card">
        <span class="support-icon">💬</span>
        <div class="support-text">
          <span class="support-title">Need Help?</span>
          <span class="support-subtitle">24/7 Live Support</span>
        </div>
      </div>
    </div>
  </aside>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useGamesStore } from '../../stores/games'
import Logo from '../common/Logo.vue'

const props = defineProps({
  collapsed: Boolean
})

defineEmits(['toggle'])

const authStore = useAuthStore()
const gamesStore = useGamesStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const featuredGames = computed(() => gamesStore.games.slice(0, 6))
</script>

<style scoped>
.sidebar {
  position: fixed;
  left: 0;
  top: 0;
  bottom: 0;
  width: var(--sidebar-width);
  background: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  transition: width var(--transition-base);
  z-index: 100;
  overflow: hidden;
}

.sidebar.collapsed {
  width: 80px;
}

/* Header */
.sidebar-header {
  padding: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid var(--border-color);
}

.collapse-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.collapse-btn:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

/* Navigation */
.sidebar-nav {
  flex: 1;
  padding: var(--space-md);
  overflow-y: auto;
}

.nav-section {
  margin-bottom: var(--space-lg);
}

.nav-label {
  display: block;
  font-size: 0.6875rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--text-muted);
  padding: var(--space-sm) var(--space-md);
  margin-bottom: var(--space-xs);
}

.nav-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: 0.75rem var(--space-md);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
  margin-bottom: 2px;
}

.nav-item:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

.nav-item.active {
  background: rgba(255, 215, 0, 0.1);
  color: var(--color-primary);
}

.nav-icon {
  font-size: 1.25rem;
  width: 24px;
  text-align: center;
}

.nav-text {
  font-size: 0.9375rem;
  font-weight: 500;
  flex: 1;
}

.sidebar.collapsed .nav-item {
  justify-content: center;
  padding: 0.75rem;
}

.sidebar.collapsed .nav-label,
.sidebar.collapsed .nav-text,
.sidebar.collapsed .badge {
  display: none;
}

/* Footer */
.sidebar-footer {
  padding: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.support-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all var(--transition-fast);
}

.support-card:hover {
  background: var(--bg-glass-hover);
}

.support-icon {
  font-size: 1.5rem;
}

.support-text {
  display: flex;
  flex-direction: column;
}

.support-title {
  font-size: 0.875rem;
  font-weight: 600;
  color: var(--text-primary);
}

.support-subtitle {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Mobile */
@media (max-width: 768px) {
  .sidebar {
    display: none;
  }
}
</style>
