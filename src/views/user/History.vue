<template>
  <div class="history-page">
    <div class="page-header">
      <h1>📜 Betting History</h1>
    </div>
    
    <!-- Filters -->
    <div class="filters glass-card">
      <div class="filter-group">
        <label>Game</label>
        <select v-model="gameFilter" class="input">
          <option value="">All Games</option>
          <option v-for="game in games" :key="game">{{ game }}</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Result</label>
        <select v-model="resultFilter" class="input">
          <option value="">All Results</option>
          <option value="win">Wins</option>
          <option value="loss">Losses</option>
        </select>
      </div>
      <div class="filter-group">
        <label>Date Range</label>
        <select v-model="dateFilter" class="input">
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
        </select>
      </div>
    </div>
    
    <!-- Stats Summary -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-label">Total Bets</span>
        <span class="stat-value">{{ stats.totalBets }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Wagered</span>
        <span class="stat-value">${{ formatNumber(stats.totalWagered) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Total Won</span>
        <span class="stat-value text-green">${{ formatNumber(stats.totalWon) }}</span>
      </div>
      <div class="stat-card">
        <span class="stat-label">Net Profit</span>
        <span class="stat-value" :class="stats.netProfit >= 0 ? 'text-green' : 'text-red'">
          {{ stats.netProfit >= 0 ? '+' : '' }}${{ formatNumber(stats.netProfit) }}
        </span>
      </div>
    </div>
    
    <!-- History Table -->
    <div class="table-container glass-card">
      <table class="table">
        <thead>
          <tr>
            <th>Game</th>
            <th>Bet</th>
            <th>Multiplier</th>
            <th>Result</th>
            <th>Profit</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="bet in filteredHistory" :key="bet.id">
            <td>
              <div class="game-cell">
                <span class="game-icon">{{ getGameIcon(bet.game) }}</span>
                <span>{{ bet.game }}</span>
              </div>
            </td>
            <td>${{ bet.bet.toFixed(2) }}</td>
            <td>{{ bet.multiplier ? bet.multiplier.toFixed(2) + '×' : '-' }}</td>
            <td>
              <span class="badge" :class="bet.result === 'win' ? 'badge-green' : 'badge-red'">
                {{ bet.result }}
              </span>
            </td>
            <td :class="bet.profit >= 0 ? 'text-green' : 'text-red'">
              {{ bet.profit >= 0 ? '+' : '' }}${{ bet.profit.toFixed(2) }}
            </td>
            <td>{{ bet.date }}</td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <div class="empty-state" v-if="filteredHistory.length === 0">
      <span class="empty-icon">🎲</span>
      <h3>No bets found</h3>
      <p>Start playing to see your history here</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const gameFilter = ref('')
const resultFilter = ref('')
const dateFilter = ref('all')

const games = ['Dice', 'Crash', 'Slots', 'Blackjack', 'Roulette', 'Mines']

const history = ref([
  { id: 1, game: 'Dice', bet: 50, multiplier: 1.96, result: 'win', profit: 48, date: '2024-12-29' },
  { id: 2, game: 'Crash', bet: 100, multiplier: 2.5, result: 'win', profit: 150, date: '2024-12-29' },
  { id: 3, game: 'Slots', bet: 10, multiplier: null, result: 'loss', profit: -10, date: '2024-12-29' },
  { id: 4, game: 'Blackjack', bet: 25, multiplier: 2.0, result: 'win', profit: 25, date: '2024-12-28' },
  { id: 5, game: 'Mines', bet: 20, multiplier: 3.2, result: 'win', profit: 44, date: '2024-12-28' },
  { id: 6, game: 'Roulette', bet: 50, multiplier: null, result: 'loss', profit: -50, date: '2024-12-28' },
  { id: 7, game: 'Dice', bet: 100, multiplier: null, result: 'loss', profit: -100, date: '2024-12-27' },
  { id: 8, game: 'Crash', bet: 25, multiplier: 5.0, result: 'win', profit: 100, date: '2024-12-27' }
])

const filteredHistory = computed(() => {
  return history.value.filter(bet => {
    if (gameFilter.value && bet.game !== gameFilter.value) return false
    if (resultFilter.value && bet.result !== resultFilter.value) return false
    return true
  })
})

const stats = computed(() => {
  const data = filteredHistory.value
  return {
    totalBets: data.length,
    totalWagered: data.reduce((sum, b) => sum + b.bet, 0),
    totalWon: data.filter(b => b.result === 'win').reduce((sum, b) => sum + b.profit + b.bet, 0),
    netProfit: data.reduce((sum, b) => sum + b.profit, 0)
  }
})

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

function getGameIcon(game) {
  const icons = { Dice: '🎲', Crash: '🚀', Slots: '🎰', Blackjack: '🃏', Roulette: '🎡', Mines: '💎' }
  return icons[game] || '🎮'
}
</script>

<style scoped>
.history-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
}

.filters {
  display: flex;
  gap: var(--space-lg);
  padding: var(--space-lg);
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  min-width: 150px;
}

.filter-group label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.filter-group select {
  padding: var(--space-sm) var(--space-md);
}

.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.stat-card {
  padding: var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: var(--space-sm);
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}

.game-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.game-icon {
  font-size: 1.25rem;
}

.empty-state {
  text-align: center;
  padding: var(--space-3xl);
}

.empty-icon {
  font-size: 4rem;
  display: block;
  margin-bottom: var(--space-lg);
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .stats-row {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
