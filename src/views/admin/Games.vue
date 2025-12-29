<template>
  <div class="admin-games">
    <div class="page-header">
      <h1>🎮 Game Management</h1>
    </div>
    
    <!-- Games Grid -->
    <div class="games-grid">
      <div v-for="game in games" :key="game.id" class="game-card glass-card">
        <div class="game-header">
          <span class="game-icon">{{ game.icon }}</span>
          <div class="game-status">
            <span class="status-indicator" :class="game.enabled ? 'active' : 'inactive'"></span>
            {{ game.enabled ? 'Active' : 'Disabled' }}
          </div>
        </div>
        <h3>{{ game.name }}</h3>
        <div class="game-stats">
          <div class="stat">
            <span class="label">House Edge</span>
            <span class="value">{{ game.houseEdge }}%</span>
          </div>
          <div class="stat">
            <span class="label">Today's Volume</span>
            <span class="value">${{ formatNumber(game.volume) }}</span>
          </div>
          <div class="stat">
            <span class="label">Today's Profit</span>
            <span class="value" :class="game.profit >= 0 ? 'text-green' : 'text-red'">
              {{ game.profit >= 0 ? '+' : '' }}${{ formatNumber(game.profit) }}
            </span>
          </div>
          <div class="stat">
            <span class="label">Active Players</span>
            <span class="value">{{ game.activePlayers }}</span>
          </div>
        </div>
        <div class="game-controls">
          <div class="control-row">
            <label>Min Bet</label>
            <input type="number" v-model="game.minBet" class="input" />
          </div>
          <div class="control-row">
            <label>Max Bet</label>
            <input type="number" v-model="game.maxBet" class="input" />
          </div>
        </div>
        <div class="game-actions">
          <button 
            class="btn btn-sm" 
            :class="game.enabled ? 'btn-danger' : 'btn-success'"
            @click="toggleGame(game)"
          >
            {{ game.enabled ? 'Disable' : 'Enable' }}
          </button>
          <button class="btn btn-secondary btn-sm" @click="configureGame(game)">Configure</button>
        </div>
      </div>
    </div>
    
    <!-- Game Statistics -->
    <section class="stats-section glass-card">
      <h2>📊 Overall Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total Volume (24h)</span>
          <span class="stat-value">${{ formatNumber(totalVolume) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Profit (24h)</span>
          <span class="stat-value text-green">${{ formatNumber(totalProfit) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Total Bets (24h)</span>
          <span class="stat-value">{{ formatNumber(totalBets) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Average Bet Size</span>
          <span class="stat-value">${{ averageBet.toFixed(2) }}</span>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const games = ref([
  { id: 'dice', name: 'Dice', icon: '🎲', houseEdge: 1, volume: 125000, profit: 1250, activePlayers: 234, enabled: true, minBet: 0.1, maxBet: 10000 },
  { id: 'crash', name: 'Crash', icon: '🚀', houseEdge: 1, volume: 185000, profit: 1850, activePlayers: 456, enabled: true, minBet: 0.1, maxBet: 10000 },
  { id: 'slots', name: 'Slots', icon: '🎰', houseEdge: 3, volume: 95000, profit: 2850, activePlayers: 189, enabled: true, minBet: 0.5, maxBet: 1000 },
  { id: 'blackjack', name: 'Blackjack', icon: '🃏', houseEdge: 0.5, volume: 75000, profit: 375, activePlayers: 123, enabled: true, minBet: 1, maxBet: 5000 },
  { id: 'roulette', name: 'Roulette', icon: '🎡', houseEdge: 2.7, volume: 65000, profit: 1755, activePlayers: 98, enabled: true, minBet: 0.5, maxBet: 5000 },
  { id: 'mines', name: 'Mines', icon: '💎', houseEdge: 1, volume: 145000, profit: 1450, activePlayers: 345, enabled: true, minBet: 0.1, maxBet: 10000 }
])

const totalVolume = computed(() => games.value.reduce((sum, g) => sum + g.volume, 0))
const totalProfit = computed(() => games.value.reduce((sum, g) => sum + g.profit, 0))
const totalBets = ref(15678)
const averageBet = computed(() => totalVolume.value / totalBets.value)

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

function toggleGame(game) {
  game.enabled = !game.enabled
}

function configureGame(game) {
  console.log('Configure game:', game.name)
}
</script>

<style scoped>
.admin-games {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
}

.games-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.game-card {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.game-icon {
  font-size: 2.5rem;
}

.game-status {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.status-indicator {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.status-indicator.active {
  background: var(--color-accent-green);
}

.status-indicator.inactive {
  background: var(--color-accent-red);
}

.game-card h3 {
  font-size: 1.25rem;
}

.game-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.game-stats .stat {
  padding: var(--space-sm);
  background: var(--bg-glass);
  border-radius: var(--radius-sm);
}

.game-stats .label {
  display: block;
  font-size: 0.6875rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.game-stats .value {
  font-weight: 600;
}

.game-controls {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.control-row label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.control-row input {
  padding: var(--space-sm);
  font-size: 0.875rem;
}

.game-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
}

.game-actions .btn {
  flex: 1;
}

.stats-section {
  padding: var(--space-xl);
}

.stats-section h2 {
  font-size: 1.25rem;
  margin-bottom: var(--space-lg);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.stat-card {
  padding: var(--space-lg);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
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

@media (max-width: 1024px) {
  .games-grid { grid-template-columns: repeat(2, 1fr); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .games-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
