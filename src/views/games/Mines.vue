<template>
  <div class="game-page mines-page">
    <div class="game-container">
      <!-- Game Header -->
      <div class="game-header">
        <h2>💎 Mines</h2>
        <div class="game-info">
          <span class="badge badge-gold">NEW</span>
          <span class="house-edge">House Edge: 1%</span>
        </div>
      </div>
      
      <!-- Game Area -->
      <div class="game-area">
        <!-- Mines Grid -->
        <div class="mines-grid">
          <button 
            v-for="(cell, index) in grid" 
            :key="index"
            class="mine-cell"
            :class="{ 
              revealed: cell.revealed, 
              safe: cell.revealed && !cell.isMine,
              mine: cell.revealed && cell.isMine,
              disabled: !gameActive
            }"
            @click="revealCell(index)"
            :disabled="cell.revealed || !gameActive || gameOver"
          >
            <span v-if="cell.revealed">
              {{ cell.isMine ? '💣' : '💎' }}
            </span>
            <span v-else-if="!gameActive">?</span>
          </button>
        </div>
        
        <!-- Game Over Display -->
        <div class="game-result" v-if="gameOver">
          <div class="result-card" :class="hitMine ? 'lose' : 'win'">
            <span class="result-icon">{{ hitMine ? '💥' : '🏆' }}</span>
            <span class="result-text">{{ hitMine ? 'BOOM!' : 'CASHED OUT!' }}</span>
            <span class="result-amount" :class="hitMine ? 'text-red' : 'text-green'">
              {{ hitMine ? '-' : '+' }}${{ lastProfit.toFixed(2) }}
            </span>
          </div>
        </div>
      </div>
      
      <!-- Game Controls -->
      <div class="game-controls">
        <!-- Pre-game controls -->
        <div class="pregame-controls" v-if="!gameActive && !gameOver">
          <div class="control-row">
            <div class="control-group">
              <label>Bet Amount</label>
              <div class="bet-input">
                <button class="adjust-btn" @click="halveBet">½</button>
                <input type="number" v-model.number="betAmount" min="0.1" step="0.1" />
                <button class="adjust-btn" @click="doubleBet">2×</button>
              </div>
            </div>
            
            <div class="control-group">
              <label>Mines (1-24)</label>
              <div class="bet-input">
                <button class="adjust-btn" @click="mineCount = Math.max(1, mineCount - 1)">−</button>
                <input type="number" v-model.number="mineCount" min="1" max="24" />
                <button class="adjust-btn" @click="mineCount = Math.min(24, mineCount + 1)">+</button>
              </div>
            </div>
          </div>
          
          <div class="mine-presets">
            <button 
              v-for="preset in [1, 3, 5, 10, 15, 20]" 
              :key="preset"
              class="preset-btn"
              :class="{ active: mineCount === preset }"
              @click="mineCount = preset"
            >
              {{ preset }} Mines
            </button>
          </div>
          
          <button 
            class="btn btn-primary btn-lg start-btn"
            @click="startGame"
            :disabled="betAmount > balance"
          >
            Start Game
          </button>
        </div>
        
        <!-- In-game controls -->
        <div class="ingame-controls" v-else-if="gameActive">
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">Gems Found</span>
              <span class="stat-value">{{ gemsFound }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Multiplier</span>
              <span class="stat-value text-gold">{{ currentMultiplier.toFixed(2) }}×</span>
            </div>
            <div class="stat">
              <span class="stat-label">Next Tile</span>
              <span class="stat-value text-cyan">{{ nextMultiplier.toFixed(2) }}×</span>
            </div>
            <div class="stat">
              <span class="stat-label">Current Profit</span>
              <span class="stat-value text-green">${{ currentProfit.toFixed(2) }}</span>
            </div>
          </div>
          
          <button 
            class="btn btn-success btn-lg cashout-btn"
            @click="cashOut"
            :disabled="gemsFound === 0"
          >
            💰 Cash Out ${{ potentialWin.toFixed(2) }}
          </button>
        </div>
        
        <!-- Post-game controls -->
        <div class="postgame-controls" v-else>
          <button class="btn btn-primary btn-lg" @click="resetGame">
            Play Again
          </button>
        </div>
      </div>
    </div>
    
    <!-- Stats Panel -->
    <div class="stats-panel">
      <h3>📊 Game Info</h3>
      
      <div class="info-card">
        <div class="info-row">
          <span>Grid Size</span>
          <span>5 × 5 (25 tiles)</span>
        </div>
        <div class="info-row">
          <span>Mines</span>
          <span>{{ mineCount }}</span>
        </div>
        <div class="info-row">
          <span>Safe Tiles</span>
          <span>{{ 25 - mineCount }}</span>
        </div>
        <div class="info-row">
          <span>Win Chance</span>
          <span>{{ ((25 - mineCount) / 25 * 100).toFixed(1) }}%</span>
        </div>
      </div>
      
      <h3>🎯 Multiplier Table</h3>
      <div class="multiplier-table">
        <div class="mult-row" v-for="i in Math.min(10, 25 - mineCount)" :key="i">
          <span>{{ i }} gem{{ i > 1 ? 's' : '' }}</span>
          <span class="text-gold">{{ getMultiplier(i).toFixed(2) }}×</span>
        </div>
      </div>
      
      <h3>📜 History</h3>
      <div class="history-list">
        <div 
          v-for="(game, index) in history" 
          :key="index"
          class="history-item"
          :class="game.win ? 'win' : 'lose'"
        >
          <span>{{ game.gems }} 💎 / {{ game.mines }} 💣</span>
          <span :class="game.win ? 'text-green' : 'text-red'">
            {{ game.win ? '+' : '' }}${{ game.amount.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '../../stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

// State
const betAmount = ref(1)
const mineCount = ref(3)
const grid = ref(createEmptyGrid())
const gameActive = ref(false)
const gameOver = ref(false)
const hitMine = ref(false)
const gemsFound = ref(0)
const lastProfit = ref(0)
const history = ref([])

// Computed
const balance = computed(() => authStore.userBalance)

const currentMultiplier = computed(() => {
  return gemsFound.value > 0 ? getMultiplier(gemsFound.value) : 1
})

const nextMultiplier = computed(() => {
  return getMultiplier(gemsFound.value + 1)
})

const currentProfit = computed(() => {
  return betAmount.value * currentMultiplier.value - betAmount.value
})

const potentialWin = computed(() => {
  return betAmount.value * currentMultiplier.value
})

// Methods
function createEmptyGrid() {
  return Array(25).fill(null).map(() => ({
    isMine: false,
    revealed: false
  }))
}

function halveBet() {
  betAmount.value = Math.max(0.1, betAmount.value / 2)
}

function doubleBet() {
  betAmount.value = Math.min(balance.value, betAmount.value * 2)
}

function getMultiplier(gems) {
  if (gems === 0) return 1
  
  const safeCount = 25 - mineCount.value
  let multiplier = 0.99 // 1% house edge
  
  for (let i = 0; i < gems; i++) {
    multiplier *= (safeCount - i) / (25 - i)
  }
  
  return 1 / multiplier
}

function startGame() {
  if (betAmount.value > balance.value) return
  
  // Deduct bet
  authStore.updateBalance(-betAmount.value)
  
  // Create new grid with mines
  grid.value = createEmptyGrid()
  const minePositions = new Set()
  
  while (minePositions.size < mineCount.value) {
    minePositions.add(Math.floor(Math.random() * 25))
  }
  
  minePositions.forEach(pos => {
    grid.value[pos].isMine = true
  })
  
  gameActive.value = true
  gameOver.value = false
  hitMine.value = false
  gemsFound.value = 0
}

function revealCell(index) {
  if (!gameActive.value || grid.value[index].revealed) return
  
  grid.value[index].revealed = true
  
  if (grid.value[index].isMine) {
    // Hit a mine - game over
    hitMine.value = true
    gameOver.value = true
    gameActive.value = false
    lastProfit.value = betAmount.value
    
    // Reveal all mines
    grid.value.forEach(cell => {
      if (cell.isMine) cell.revealed = true
    })
    
    history.value.unshift({
      gems: gemsFound.value,
      mines: mineCount.value,
      win: false,
      amount: -betAmount.value
    })
    
    userStore.addTransaction({
      type: 'bet',
      amount: -betAmount.value,
      game: 'Mines'
    })
  } else {
    // Found a gem
    gemsFound.value++
    
    // Check if all gems found
    if (gemsFound.value === 25 - mineCount.value) {
      cashOut()
    }
  }
}

function cashOut() {
  if (gemsFound.value === 0) return
  
  const winnings = potentialWin.value
  authStore.updateBalance(winnings)
  
  lastProfit.value = winnings - betAmount.value
  gameOver.value = true
  gameActive.value = false
  
  // Reveal all cells
  grid.value.forEach(cell => cell.revealed = true)
  
  history.value.unshift({
    gems: gemsFound.value,
    mines: mineCount.value,
    win: true,
    amount: lastProfit.value
  })
  
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10)
  }
  
  userStore.addTransaction({
    type: 'win',
    amount: lastProfit.value,
    game: 'Mines'
  })
}

function resetGame() {
  grid.value = createEmptyGrid()
  gameActive.value = false
  gameOver.value = false
  hitMine.value = false
  gemsFound.value = 0
}
</script>

<style scoped>
.game-page {
  display: grid;
  grid-template-columns: 1fr 300px;
  gap: var(--space-xl);
}

.game-container {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  overflow: hidden;
}

/* Game Header */
.game-header {
  padding: var(--space-lg);
  border-bottom: 1px solid var(--border-color);
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.game-header h2 {
  font-family: var(--font-display);
  font-size: 1.25rem;
}

/* Game Area */
.game-area {
  padding: var(--space-2xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
  background: radial-gradient(ellipse at center, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  position: relative;
}

/* Mines Grid */
.mines-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-sm);
  max-width: 400px;
  width: 100%;
}

.mine-cell {
  aspect-ratio: 1;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  cursor: pointer;
  transition: all var(--transition-fast);
}

.mine-cell:hover:not(.revealed):not(.disabled) {
  border-color: var(--color-primary);
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 215, 0, 0.3);
}

.mine-cell.revealed {
  cursor: default;
}

.mine-cell.safe {
  background: rgba(16, 185, 129, 0.2);
  border-color: var(--color-accent-green);
  animation: gemReveal 0.3s ease;
}

@keyframes gemReveal {
  0% { transform: scale(0); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
}

.mine-cell.mine {
  background: rgba(239, 68, 68, 0.3);
  border-color: var(--color-accent-red);
  animation: mineReveal 0.5s ease;
}

@keyframes mineReveal {
  0%, 50% { transform: scale(1); }
  25% { transform: scale(1.2); }
  75% { transform: scale(0.9); }
  100% { transform: scale(1); }
}

.mine-cell.disabled:not(.revealed) {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Game Result */
.game-result {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 10;
}

.result-card {
  background: rgba(0, 0, 0, 0.95);
  padding: var(--space-xl) var(--space-2xl);
  border-radius: var(--radius-xl);
  text-align: center;
  animation: resultPop 0.4s ease;
}

.result-card.win {
  border: 3px solid var(--color-accent-green);
  box-shadow: 0 0 40px rgba(16, 185, 129, 0.4);
}

.result-card.lose {
  border: 3px solid var(--color-accent-red);
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.4);
}

.result-icon {
  display: block;
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.result-text {
  display: block;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  margin-bottom: var(--space-sm);
}

.result-card.win .result-text {
  color: var(--color-accent-green);
}

.result-card.lose .result-text {
  color: var(--color-accent-red);
}

.result-amount {
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
}

/* Game Controls */
.game-controls {
  padding: var(--space-xl);
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.pregame-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.control-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.control-group label {
  display: block;
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: var(--space-sm);
}

.bet-input {
  display: flex;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.bet-input input {
  flex: 1;
  padding: var(--space-sm) var(--space-md);
  text-align: center;
  color: var(--text-primary);
  background: transparent;
  font-weight: 600;
}

.adjust-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  font-weight: 600;
  transition: all var(--transition-fast);
}

.adjust-btn:hover {
  background: var(--bg-glass-hover);
  color: var(--color-primary);
}

.mine-presets {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.preset-btn {
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-secondary);
  font-size: 0.875rem;
  transition: all var(--transition-fast);
}

.preset-btn:hover,
.preset-btn.active {
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.start-btn {
  width: 100%;
}

.ingame-controls {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.game-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.game-stats .stat {
  text-align: center;
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.stat-label {
  display: block;
  font-size: 0.6875rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
}

.cashout-btn {
  width: 100%;
  animation: glow 1.5s infinite;
}

.postgame-controls {
  display: flex;
  justify-content: center;
}

/* Stats Panel */
.stats-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.stats-panel h3 {
  font-size: 1rem;
}

.info-card {
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  padding: var(--space-md);
}

.info-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
  font-size: 0.875rem;
}

.info-row:not(:last-child) {
  border-bottom: 1px solid var(--border-color);
}

.multiplier-table {
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  padding: var(--space-md);
  max-height: 200px;
  overflow-y: auto;
}

.mult-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-xs) 0;
  font-size: 0.8125rem;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.history-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.history-item.win {
  border-left: 3px solid var(--color-accent-green);
}

.history-item.lose {
  border-left: 3px solid var(--color-accent-red);
}

/* Responsive */
@media (max-width: 1024px) {
  .game-page {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .control-row {
    grid-template-columns: 1fr;
  }
  
  .game-stats {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .mine-cell {
    font-size: 1.5rem;
  }
}
</style>
