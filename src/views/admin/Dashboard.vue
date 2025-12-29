<template>
  <div class="admin-dashboard">
    <div class="page-header">
      <h1>📊 Admin Dashboard</h1>
      <span class="last-updated">Last updated: {{ currentTime }}</span>
    </div>
    
    <!-- Stats Overview -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon revenue">💰</div>
        <div class="stat-content">
          <span class="stat-label">Today's Revenue</span>
          <span class="stat-value">${{ formatNumber(stats.todayRevenue) }}</span>
          <span class="stat-change positive">+12.5% from yesterday</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon users">👥</div>
        <div class="stat-content">
          <span class="stat-label">Active Users</span>
          <span class="stat-value">{{ formatNumber(stats.activeUsers) }}</span>
          <span class="stat-change positive">+8.2% this week</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon bets">🎮</div>
        <div class="stat-content">
          <span class="stat-label">Total Bets Today</span>
          <span class="stat-value">{{ formatNumber(stats.todayBets) }}</span>
          <span class="stat-change positive">+15.3% from yesterday</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon deposits">📥</div>
        <div class="stat-content">
          <span class="stat-label">Today's Deposits</span>
          <span class="stat-value">${{ formatNumber(stats.todayDeposits) }}</span>
          <span class="stat-change positive">+5.8% from yesterday</span>
        </div>
      </div>
    </div>
    
    <!-- Charts Row -->
    <div class="charts-row">
      <div class="chart-card glass-card">
        <h3>Revenue Overview</h3>
        <div class="chart-placeholder">
          <div class="mini-chart">
            <div v-for="(val, index) in revenueData" :key="index" class="chart-bar" :style="{ height: val + '%' }"></div>
          </div>
          <div class="chart-labels">
            <span v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']" :key="day">{{ day }}</span>
          </div>
        </div>
      </div>
      <div class="chart-card glass-card">
        <h3>Popular Games</h3>
        <div class="games-chart">
          <div v-for="game in popularGames" :key="game.name" class="game-bar">
            <div class="game-info">
              <span class="game-icon">{{ game.icon }}</span>
              <span class="game-name">{{ game.name }}</span>
            </div>
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: game.percentage + '%' }"></div>
            </div>
            <span class="game-value">{{ game.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Recent Activity -->
    <div class="activity-row">
      <div class="activity-card glass-card">
        <h3>Recent Transactions</h3>
        <div class="activity-list">
          <div v-for="tx in recentTransactions" :key="tx.id" class="activity-item">
            <div class="activity-icon" :class="tx.type">
              {{ tx.type === 'deposit' ? '📥' : tx.type === 'withdrawal' ? '📤' : '🎮' }}
            </div>
            <div class="activity-content">
              <span class="activity-user">{{ tx.user }}</span>
              <span class="activity-desc">{{ tx.description }}</span>
            </div>
            <div class="activity-meta">
              <span class="activity-amount" :class="tx.type === 'withdrawal' ? 'negative' : 'positive'">
                {{ tx.type === 'withdrawal' ? '-' : '+' }}${{ tx.amount }}
              </span>
              <span class="activity-time">{{ tx.time }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="activity-card glass-card">
        <h3>New Registrations</h3>
        <div class="activity-list">
          <div v-for="user in newUsers" :key="user.id" class="activity-item">
            <div class="avatar">{{ user.avatar }}</div>
            <div class="activity-content">
              <span class="activity-user">{{ user.username }}</span>
              <span class="activity-desc">{{ user.email }}</span>
            </div>
            <div class="activity-meta">
              <span class="activity-time">{{ user.time }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Quick Actions -->
    <div class="quick-actions glass-card">
      <h3>Quick Actions</h3>
      <div class="actions-grid">
        <router-link to="/admin/players" class="action-btn">
          <span class="action-icon">👥</span>
          <span>Manage Players</span>
        </router-link>
        <router-link to="/admin/games" class="action-btn">
          <span class="action-icon">🎮</span>
          <span>Game Settings</span>
        </router-link>
        <router-link to="/admin/finances" class="action-btn">
          <span class="action-icon">💵</span>
          <span>Financial Reports</span>
        </router-link>
        <router-link to="/admin/bonuses" class="action-btn">
          <span class="action-icon">🎁</span>
          <span>Manage Bonuses</span>
        </router-link>
        <router-link to="/admin/settings" class="action-btn">
          <span class="action-icon">⚙️</span>
          <span>Platform Settings</span>
        </router-link>
        <button class="action-btn danger">
          <span class="action-icon">🔧</span>
          <span>Maintenance Mode</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const currentTime = new Date().toLocaleTimeString()

const stats = {
  todayRevenue: 45678,
  activeUsers: 1234,
  todayBets: 15678,
  todayDeposits: 23456
}

const revenueData = [65, 78, 55, 85, 70, 92, 88]

const popularGames = [
  { name: 'Crash', icon: '🚀', percentage: 35 },
  { name: 'Dice', icon: '🎲', percentage: 25 },
  { name: 'Slots', icon: '🎰', percentage: 20 },
  { name: 'Mines', icon: '💎', percentage: 12 },
  { name: 'Blackjack', icon: '🃏', percentage: 8 }
]

const recentTransactions = [
  { id: 1, type: 'deposit', user: 'Player123', description: 'Bitcoin deposit', amount: 500, time: '2 min ago' },
  { id: 2, type: 'bet', user: 'LuckyWin', description: 'Won at Crash', amount: 245, time: '5 min ago' },
  { id: 3, type: 'withdrawal', user: 'HighRoller', description: 'Bank withdrawal', amount: 1000, time: '8 min ago' },
  { id: 4, type: 'deposit', user: 'NewPlayer', description: 'Card deposit', amount: 100, time: '12 min ago' },
  { id: 5, type: 'bet', user: 'ProGamer', description: 'Won at Dice', amount: 180, time: '15 min ago' }
]

const newUsers = [
  { id: 1, username: 'JohnDoe', email: 'john@example.com', avatar: 'J', time: '10 min ago' },
  { id: 2, username: 'LuckyPlayer', email: 'lucky@example.com', avatar: 'L', time: '25 min ago' },
  { id: 3, username: 'CasinoFan', email: 'fan@example.com', avatar: 'C', time: '1 hour ago' },
  { id: 4, username: 'BigWinner', email: 'big@example.com', avatar: 'B', time: '2 hours ago' }
]

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}
</script>

<style scoped>
.admin-dashboard {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
}

.last-updated {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
}

.stat-card {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
}

.stat-icon.revenue { background: rgba(255, 215, 0, 0.2); }
.stat-icon.users { background: rgba(139, 92, 246, 0.2); }
.stat-icon.bets { background: rgba(6, 182, 212, 0.2); }
.stat-icon.deposits { background: rgba(16, 185, 129, 0.2); }

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
}

.stat-change {
  font-size: 0.75rem;
}

.stat-change.positive { color: var(--color-accent-green); }
.stat-change.negative { color: var(--color-accent-red); }

/* Charts Row */
.charts-row {
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: var(--space-lg);
}

.chart-card {
  padding: var(--space-xl);
}

.chart-card h3 {
  font-size: 1rem;
  margin-bottom: var(--space-lg);
}

.chart-placeholder {
  height: 200px;
  display: flex;
  flex-direction: column;
}

.mini-chart {
  flex: 1;
  display: flex;
  align-items: flex-end;
  gap: var(--space-md);
  padding-bottom: var(--space-md);
}

.chart-bar {
  flex: 1;
  background: var(--gradient-gold);
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  min-height: 20px;
  transition: height var(--transition-base);
}

.chart-labels {
  display: flex;
  justify-content: space-around;
  font-size: 0.75rem;
  color: var(--text-muted);
}

.games-chart {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.game-bar {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.game-info {
  width: 100px;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.game-icon {
  font-size: 1.25rem;
}

.game-name {
  font-size: 0.875rem;
}

.bar-container {
  flex: 1;
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  background: var(--gradient-gold);
  border-radius: var(--radius-full);
}

.game-value {
  width: 40px;
  text-align: right;
  font-size: 0.875rem;
  font-weight: 600;
}

/* Activity Row */
.activity-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.activity-card {
  padding: var(--space-xl);
}

.activity-card h3 {
  font-size: 1rem;
  margin-bottom: var(--space-lg);
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.activity-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.activity-item:last-child {
  border-bottom: none;
}

.activity-icon {
  width: 40px;
  height: 40px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
}

.activity-icon.deposit { background: rgba(16, 185, 129, 0.2); }
.activity-icon.withdrawal { background: rgba(239, 68, 68, 0.2); }
.activity-icon.bet { background: rgba(139, 92, 246, 0.2); }

.activity-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.activity-user {
  font-weight: 600;
  font-size: 0.9375rem;
}

.activity-desc {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.activity-meta {
  text-align: right;
}

.activity-amount {
  display: block;
  font-weight: 600;
}

.activity-amount.positive { color: var(--color-accent-green); }
.activity-amount.negative { color: var(--color-accent-red); }

.activity-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Quick Actions */
.quick-actions {
  padding: var(--space-xl);
}

.quick-actions h3 {
  font-size: 1rem;
  margin-bottom: var(--space-lg);
}

.actions-grid {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: var(--space-md);
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  transition: all var(--transition-fast);
  text-align: center;
}

.action-btn:hover {
  border-color: var(--color-primary);
  background: rgba(255, 215, 0, 0.05);
}

.action-btn.danger:hover {
  border-color: var(--color-accent-red);
  background: rgba(239, 68, 68, 0.05);
}

.action-icon {
  font-size: 2rem;
}

.action-btn span:last-child {
  font-size: 0.875rem;
  font-weight: 500;
}

@media (max-width: 1200px) {
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .charts-row { grid-template-columns: 1fr; }
  .activity-row { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(3, 1fr); }
}

@media (max-width: 768px) {
  .stats-grid { grid-template-columns: 1fr; }
  .actions-grid { grid-template-columns: repeat(2, 1fr); }
}
</style>
