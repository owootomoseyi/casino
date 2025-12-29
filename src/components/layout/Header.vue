<template>
  <header class="header">
    <div class="header-left">
      <!-- Mobile Menu Button -->
      <button class="menu-btn show-mobile-only" @click="$emit('toggle-sidebar')">
        <span>☰</span>
      </button>
      
      <!-- Search Bar -->
      <div class="search-bar hide-mobile">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search games..." 
          v-model="searchQuery"
          @focus="showSearchResults = true"
          @blur="hideSearchResults"
        />
        <!-- Search Results Dropdown -->
        <div class="search-results" v-if="showSearchResults && filteredGames.length">
          <router-link 
            v-for="game in filteredGames" 
            :key="game.id"
            :to="`/games/${game.id}`"
            class="search-result-item"
          >
            <span class="result-icon">{{ game.icon }}</span>
            <span class="result-name">{{ game.name }}</span>
          </router-link>
        </div>
      </div>
    </div>
    
    <div class="header-right">
      <!-- Balance (if logged in) -->
      <div class="balance-display" v-if="isAuthenticated">
        <span class="balance-label">Balance</span>
        <span class="balance-amount">${{ formatBalance(userBalance) }}</span>
      </div>
      
      <!-- Deposit Button (if logged in) -->
      <button class="btn btn-primary btn-sm" v-if="isAuthenticated" @click="showDepositModal = true">
        <span class="hide-mobile">Deposit</span>
        <span class="show-mobile-only">+</span>
      </button>
      
      <!-- Notifications (if logged in) -->
      <div class="notifications" v-if="isAuthenticated">
        <button class="notification-btn" @click="toggleNotifications">
          <span>🔔</span>
          <span class="notification-badge" v-if="unreadCount">{{ unreadCount }}</span>
        </button>
        
        <!-- Notifications Dropdown -->
        <div class="notifications-dropdown" v-if="showNotifications">
          <div class="dropdown-header">
            <span>Notifications</span>
            <button class="mark-read-btn" @click="markAllRead">Mark all read</button>
          </div>
          <div class="notifications-list">
            <div 
              v-for="notification in notifications" 
              :key="notification.id"
              class="notification-item"
              :class="{ unread: !notification.read }"
            >
              <span class="notification-icon">
                {{ notification.type === 'bonus' ? '🎁' : notification.type === 'win' ? '🏆' : '📢' }}
              </span>
              <div class="notification-content">
                <span class="notification-title">{{ notification.title }}</span>
                <span class="notification-message">{{ notification.message }}</span>
                <span class="notification-time">{{ notification.date }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- User Menu (if logged in) -->
      <div class="user-menu" v-if="isAuthenticated">
        <button class="user-btn" @click="toggleUserMenu">
          <div class="avatar">{{ user?.avatar || 'U' }}</div>
          <span class="username hide-mobile">{{ user?.username }}</span>
          <span class="dropdown-arrow">▼</span>
        </button>
        
        <!-- User Dropdown -->
        <div class="user-dropdown" v-if="showUserMenu">
          <router-link to="/profile" class="dropdown-item">
            <span>👤</span> Profile
          </router-link>
          <router-link to="/wallet" class="dropdown-item">
            <span>💰</span> Wallet
          </router-link>
          <router-link to="/history" class="dropdown-item">
            <span>📜</span> History
          </router-link>
          <router-link to="/bonuses" class="dropdown-item">
            <span>🎁</span> Bonuses
          </router-link>
          <div class="dropdown-divider"></div>
          <router-link to="/admin" class="dropdown-item" v-if="isAdmin">
            <span>🛡️</span> Admin Panel
          </router-link>
          <button class="dropdown-item logout" @click="logout">
            <span>🚪</span> Logout
          </button>
        </div>
      </div>
      
      <!-- Auth Buttons (if not logged in) -->
      <div class="auth-buttons" v-else>
        <router-link to="/login" class="btn btn-secondary btn-sm">Login</router-link>
        <router-link to="/register" class="btn btn-primary btn-sm">Sign Up</router-link>
      </div>
    </div>
    
    <!-- Deposit Modal -->
    <div class="modal-overlay" v-if="showDepositModal" @click.self="showDepositModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Deposit Funds</h3>
          <button class="close-btn" @click="showDepositModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="deposit-methods">
            <button 
              v-for="method in depositMethods" 
              :key="method.id"
              class="method-btn"
              :class="{ active: selectedMethod === method.id }"
              @click="selectedMethod = method.id"
            >
              <span class="method-icon">{{ method.icon }}</span>
              <span class="method-name">{{ method.name }}</span>
            </button>
          </div>
          <div class="input-group">
            <label>Amount (USD)</label>
            <input type="number" class="input" v-model="depositAmount" min="10" step="10" />
          </div>
          <div class="quick-amounts">
            <button v-for="amount in [100, 250, 500, 1000]" :key="amount" @click="depositAmount = amount" class="quick-btn">
              ${{ amount }}
            </button>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showDepositModal = false">Cancel</button>
          <button class="btn btn-primary" @click="processDeposit">Deposit ${{ depositAmount }}</button>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '../../stores/user'
import { useGamesStore } from '../../stores/games'

defineEmits(['toggle-sidebar'])

const router = useRouter()
const authStore = useAuthStore()
const userStore = useUserStore()
const gamesStore = useGamesStore()

// State
const searchQuery = ref('')
const showSearchResults = ref(false)
const showNotifications = ref(false)
const showUserMenu = ref(false)
const showDepositModal = ref(false)
const selectedMethod = ref('btc')
const depositAmount = ref(100)

// Deposit methods
const depositMethods = ref([
  { id: 'btc', name: 'Bitcoin', icon: '₿' },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ' },
  { id: 'card', name: 'Card', icon: '💳' },
  { id: 'bank', name: 'Bank', icon: '🏦' }
])

// Computed
const isAuthenticated = computed(() => authStore.isAuthenticated)
const isAdmin = computed(() => authStore.isAdmin)
const user = computed(() => authStore.currentUser)
const userBalance = computed(() => authStore.userBalance)
const notifications = computed(() => userStore.notifications)
const unreadCount = computed(() => userStore.unreadNotifications)

const filteredGames = computed(() => {
  if (!searchQuery.value) return []
  const query = searchQuery.value.toLowerCase()
  return gamesStore.games.filter(g => 
    g.name.toLowerCase().includes(query)
  ).slice(0, 5)
})

// Methods
function formatBalance(amount) {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount)
}

function toggleNotifications() {
  showNotifications.value = !showNotifications.value
  showUserMenu.value = false
}

function toggleUserMenu() {
  showUserMenu.value = !showUserMenu.value
  showNotifications.value = false
}

function hideSearchResults() {
  setTimeout(() => {
    showSearchResults.value = false
  }, 200)
}

function markAllRead() {
  userStore.markAllNotificationsRead()
}

function logout() {
  authStore.logout()
  router.push('/login')
  showUserMenu.value = false
}

function processDeposit() {
  // Demo: Just add to balance
  authStore.updateBalance(depositAmount.value)
  userStore.addTransaction({
    type: 'deposit',
    amount: depositAmount.value,
    method: depositMethods.value.find(m => m.id === selectedMethod.value)?.name
  })
  userStore.addNotification({
    type: 'deposit',
    title: 'Deposit Successful',
    message: `$${depositAmount.value} has been added to your account`
  })
  showDepositModal.value = false
}
</script>

<style scoped>
.header {
  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-width);
  height: var(--header-height);
  background: rgba(18, 18, 26, 0.95);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-xl);
  z-index: 99;
  transition: left var(--transition-base);
}

.sidebar-collapsed .header {
  left: 80px;
}

.header-left,
.header-right {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

/* Menu Button */
.menu-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
}

.menu-btn:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

/* Search Bar */
.search-bar {
  position: relative;
  display: flex;
  align-items: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 var(--space-md);
  width: 300px;
  transition: all var(--transition-fast);
}

.search-bar:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}

.search-icon {
  color: var(--text-muted);
  margin-right: var(--space-sm);
}

.search-bar input {
  flex: 1;
  padding: 0.625rem 0;
  color: var(--text-primary);
}

.search-bar input::placeholder {
  color: var(--text-muted);
}

/* Search Results */
.search-results {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  margin-top: var(--space-sm);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
  z-index: 100;
}

.search-result-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.search-result-item:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

.result-icon {
  font-size: 1.25rem;
}

/* Balance Display */
.balance-display {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
}

.balance-label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: var(--text-muted);
}

.balance-amount {
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-primary);
}

/* Notifications */
.notifications {
  position: relative;
}

.notification-btn {
  width: 44px;
  height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  color: var(--text-secondary);
  border-radius: var(--radius-md);
  position: relative;
  transition: all var(--transition-fast);
}

.notification-btn:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

.notification-badge {
  position: absolute;
  top: 6px;
  right: 6px;
  min-width: 18px;
  height: 18px;
  background: var(--color-accent-red);
  border-radius: var(--radius-full);
  font-size: 0.6875rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.notifications-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-sm);
  width: 320px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  z-index: 100;
}

.dropdown-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  border-bottom: 1px solid var(--border-color);
  font-weight: 600;
}

.mark-read-btn {
  font-size: 0.75rem;
  color: var(--color-primary);
}

.notifications-list {
  max-height: 300px;
  overflow-y: auto;
}

.notification-item {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md);
  border-bottom: 1px solid var(--border-color);
  transition: background var(--transition-fast);
}

.notification-item:hover {
  background: var(--bg-glass);
}

.notification-item.unread {
  background: rgba(255, 215, 0, 0.05);
}

.notification-icon {
  font-size: 1.25rem;
}

.notification-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.notification-title {
  font-size: 0.875rem;
  font-weight: 600;
}

.notification-message {
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

.notification-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* User Menu */
.user-menu {
  position: relative;
}

.user-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.user-btn:hover {
  background: var(--bg-glass);
}

.avatar {
  width: 36px;
  height: 36px;
  background: var(--gradient-gold);
  border-radius: var(--radius-full);
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  color: var(--bg-primary);
}

.username {
  font-weight: 500;
  color: var(--text-primary);
}

.dropdown-arrow {
  font-size: 0.625rem;
  color: var(--text-muted);
}

.user-dropdown {
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: var(--space-sm);
  width: 200px;
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  overflow: hidden;
  z-index: 100;
}

.dropdown-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md);
  color: var(--text-secondary);
  width: 100%;
  text-align: left;
  transition: all var(--transition-fast);
}

.dropdown-item:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

.dropdown-item.logout {
  color: var(--color-accent-red);
}

.dropdown-divider {
  height: 1px;
  background: var(--border-color);
  margin: var(--space-xs) 0;
}

/* Auth Buttons */
.auth-buttons {
  display: flex;
  gap: var(--space-sm);
}

/* Deposit Modal */
.deposit-methods {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.method-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--bg-glass);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  transition: all var(--transition-fast);
}

.method-btn:hover,
.method-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
  background: rgba(255, 215, 0, 0.1);
}

.method-icon {
  font-size: 1.5rem;
}

.method-name {
  font-size: 0.875rem;
  font-weight: 500;
}

.quick-amounts {
  display: flex;
  gap: var(--space-sm);
  margin-top: var(--space-md);
}

.quick-btn {
  flex: 1;
  padding: var(--space-sm);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.quick-btn:hover {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.close-btn:hover {
  background: var(--bg-glass);
  color: var(--text-primary);
}

/* Responsive */
@media (max-width: 768px) {
  .header {
    left: 0;
    padding: 0 var(--space-md);
  }
  
  .sidebar-collapsed .header {
    left: 0;
  }
  
  .balance-display {
    padding: var(--space-xs) var(--space-sm);
  }
  
  .balance-label {
    display: none;
  }
}
</style>
