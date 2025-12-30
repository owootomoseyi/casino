<template>
  <div class="app-container" :class="{ 'sidebar-collapsed': sidebarCollapsed }">
    <!-- Sidebar (Desktop) -->
    <Sidebar 
      v-if="!isAuthPage" 
      :collapsed="sidebarCollapsed"
      @toggle="toggleSidebar"
    />
    
    <!-- Main Content -->
    <div class="main-wrapper" :class="{ 'full-width': isAuthPage }">
      <!-- Header -->
      <Header v-if="!isAuthPage" @toggle-sidebar="toggleSidebar" />
      
      <!-- Page Content -->
      <main class="page-content" :class="{ 'auth-page': isAuthPage }">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
    
    <!-- Mobile Navigation -->
    <MobileNav v-if="!isAuthPage && isMobile" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from './components/layout/Sidebar.vue'
import Header from './components/layout/Header.vue'
import MobileNav from './components/layout/MobileNav.vue'

const route = useRoute()
const sidebarCollapsed = ref(false)
const isMobile = ref(window.innerWidth < 769)

const isAuthPage = computed(() => {
  return ['Login', 'Register', 'AdminLogin'].includes(route.name)
})

function toggleSidebar() {
  sidebarCollapsed.value = !sidebarCollapsed.value
}

function handleResize() {
  isMobile.value = window.innerWidth < 769
  if (isMobile.value) {
    sidebarCollapsed.value = true
  }
}

onMounted(() => {
  window.addEventListener('resize', handleResize)
  handleResize()
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.app-container {
  display: flex;
  min-height: 100vh;
  background: var(--bg-primary);
}

.main-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin-left: var(--sidebar-width);
  transition: margin-left var(--transition-base);
  min-height: 100vh;
}

.sidebar-collapsed .main-wrapper {
  margin-left: 80px;
}

.main-wrapper.full-width {
  margin-left: 0;
}

.page-content {
  flex: 1;
  padding: var(--space-xl);
  padding-top: calc(var(--header-height) + var(--space-xl));
  max-width: 1600px;
  width: 100%;
  margin: 0 auto;
}

.page-content.auth-page {
  padding-top: var(--space-xl);
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Page Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .main-wrapper {
    margin-left: 0;
    padding-bottom: var(--mobile-nav-height);
  }
  
  .sidebar-collapsed .main-wrapper {
    margin-left: 0;
  }
  
  .page-content {
    padding: var(--space-md);
    padding-top: calc(var(--header-height) + var(--space-md));
    padding-bottom: calc(var(--mobile-nav-height) + var(--space-lg));
  }
}

@media (max-width: 576px) {
  .page-content {
    padding: var(--space-sm);
    padding-top: calc(var(--header-height) + var(--space-sm));
    padding-bottom: calc(var(--mobile-nav-height) + var(--space-md));
  }
}

@media (max-width: 480px) {
  .page-content {
    padding: var(--space-xs);
    padding-top: calc(var(--header-height) + var(--space-xs));
    padding-bottom: calc(var(--mobile-nav-height) + var(--space-sm));
  }
}
</style>
