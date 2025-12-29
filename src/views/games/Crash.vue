<template>
  <div class="game-page crash-page">
    <div class="game-container">
      <!-- Game Header -->
      <div class="game-header">
        <h2>🚀 Crash</h2>
        <div class="game-info">
          <span class="badge badge-green">Provably Fair</span>
          <span class="game-status" :class="gameState">
            {{ gameState === 'waiting' ? 'Starting soon...' : gameState === 'running' ? 'IN PROGRESS' : 'CRASHED!' }}
          </span>
        </div>
      </div>
      
      <!-- Game Area -->
      <div class="game-area">
        <div class="crash-display" :class="gameState">
          <span class="multiplier-value">{{ currentMultiplier.toFixed(2) }}×</span>
          <div class="progress-bar" v-if="gameState === 'waiting'">
            <div class="progress" :style="{ width: waitProgress + '%' }"></div>
          </div>
        </div>
        
        <!-- Graph -->
        <div class="crash-graph">
          <canvas ref="graphCanvas"></canvas>
        </div>
      </div>
      
      <!-- Game Controls -->
      <div class="game-controls">
        <div class="controls-row">
          <!-- Bet Amount -->
          <div class="control-group">
            <label>Bet Amount</label>
            <div class="bet-input">
              <button class="adjust-btn" @click="halveBet">½</button>
              <input type="number" v-model.number="betAmount" min="0.1" step="0.1" />
              <button class="adjust-btn" @click="doubleBet">2×</button>
            </div>
          </div>
          
          <!-- Auto Cashout -->
          <div class="control-group">
            <label>Auto Cashout</label>
            <div class="bet-input">
              <input type="number" v-model.number="autoCashout" min="1.01" step="0.1" />
              <span class="input-suffix">×</span>
            </div>
          </div>
          
          <!-- Action Button -->
          <div class="control-group action-group">
            <button 
              v-if="!hasBet && gameState !== 'crashed'"
              class="btn btn-primary btn-lg action-btn"
              @click="placeBet"
              :disabled="betAmount > balance"
            >
              Place Bet
            </button>
            <button 
              v-else-if="hasBet && !hasCashedOut && gameState === 'running'"
              class="btn btn-success btn-lg action-btn cashout-btn"
              @click="cashOut"
            >
              Cash Out @ {{ currentMultiplier.toFixed(2) }}×
            </button>
            <button 
              v-else
              class="btn btn-secondary btn-lg action-btn"
              disabled
            >
              {{ hasCashedOut ? `Cashed Out @ ${cashoutMultiplier.toFixed(2)}×` : 'Waiting...' }}
            </button>
          </div>
        </div>
        
        <!-- Live Bets Display -->
        <div class="current-bet" v-if="hasBet">
          <span class="bet-label">Your Bet:</span>
          <span class="bet-value">${{ betAmount.toFixed(2) }}</span>
          <span class="potential-win" v-if="!hasCashedOut">
            Potential: <span class="text-green">${{ potentialWin.toFixed(2) }}</span>
          </span>
          <span class="actual-win text-green" v-else>
            Won: ${{ actualWin.toFixed(2) }}
          </span>
        </div>
      </div>
    </div>
    
    <!-- Live Bets Sidebar -->
    <div class="live-bets-panel">
      <h3>🎯 Live Bets</h3>
      <div class="bets-list">
        <div 
          v-for="bet in liveBets" 
          :key="bet.id"
          class="bet-item"
          :class="{ 'cashed-out': bet.cashedOut, 'lost': !bet.cashedOut && gameState === 'crashed' }"
        >
          <div class="bet-user">
            <div class="avatar avatar-sm">{{ bet.user.charAt(0) }}</div>
            <span>{{ bet.user }}</span>
          </div>
          <span class="bet-amount">${{ bet.amount.toFixed(2) }}</span>
          <span class="bet-result" v-if="bet.cashedOut">
            {{ bet.multiplier.toFixed(2) }}× <span class="text-green">+${{ bet.profit.toFixed(2) }}</span>
          </span>
        </div>
      </div>
      
      <!-- History -->
      <h3>📊 Recent Crashes</h3>
      <div class="crash-history">
        <span 
          v-for="(crash, index) in crashHistory" 
          :key="index"
          class="crash-badge"
          :class="crash >= 2 ? 'high' : 'low'"
        >
          {{ crash.toFixed(2) }}×
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '../../stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

// State
const betAmount = ref(1)
const autoCashout = ref(2.0)
const gameState = ref('waiting') // waiting, running, crashed
const currentMultiplier = ref(1.0)
const waitProgress = ref(0)
const hasBet = ref(false)
const hasCashedOut = ref(false)
const cashoutMultiplier = ref(1.0)
const graphCanvas = ref(null)

const crashHistory = ref([2.35, 1.24, 5.67, 1.02, 3.45, 1.89, 12.34, 1.56, 2.78, 4.21])
const liveBets = ref([
  { id: 1, user: 'Player***23', amount: 50, cashedOut: false, multiplier: 0, profit: 0 },
  { id: 2, user: 'Lucky***99', amount: 100, cashedOut: false, multiplier: 0, profit: 0 },
  { id: 3, user: 'High***er', amount: 25, cashedOut: false, multiplier: 0, profit: 0 }
])

let gameInterval = null
let waitInterval = null

// Computed
const balance = computed(() => authStore.userBalance)

const potentialWin = computed(() => {
  return betAmount.value * currentMultiplier.value
})

const actualWin = computed(() => {
  return betAmount.value * cashoutMultiplier.value
})

// Methods
function halveBet() {
  betAmount.value = Math.max(0.1, betAmount.value / 2)
}

function doubleBet() {
  betAmount.value = Math.min(balance.value, betAmount.value * 2)
}

function placeBet() {
  if (gameState.value === 'crashed' || betAmount.value > balance.value) return
  
  authStore.updateBalance(-betAmount.value)
  hasBet.value = true
  hasCashedOut.value = false
  
  liveBets.value.push({
    id: Date.now(),
    user: 'You',
    amount: betAmount.value,
    cashedOut: false,
    multiplier: 0,
    profit: 0
  })
}

function cashOut() {
  if (!hasBet.value || hasCashedOut.value || gameState.value !== 'running') return
  
  hasCashedOut.value = true
  cashoutMultiplier.value = currentMultiplier.value
  
  const winnings = betAmount.value * cashoutMultiplier.value
  authStore.updateBalance(winnings)
  
  userStore.addTransaction({
    type: 'win',
    amount: winnings - betAmount.value,
    game: 'Crash'
  })
  
  // Update live bets display
  const myBet = liveBets.value.find(b => b.user === 'You')
  if (myBet) {
    myBet.cashedOut = true
    myBet.multiplier = cashoutMultiplier.value
    myBet.profit = winnings - betAmount.value
  }
}

function startGame() {
  gameState.value = 'running'
  currentMultiplier.value = 1.0
  
  // Random crash point (with house edge)
  const crashPoint = Math.max(1.0, (0.99 / Math.random()))
  
  gameInterval = setInterval(() => {
    currentMultiplier.value += 0.01 * (1 + currentMultiplier.value * 0.1)
    
    // Auto cashout check
    if (hasBet.value && !hasCashedOut.value && autoCashout.value > 0 && currentMultiplier.value >= autoCashout.value) {
      cashOut()
    }
    
    // Crash check
    if (currentMultiplier.value >= crashPoint) {
      crash()
    }
    
    // Simulate other players cashing out
    liveBets.value.forEach(bet => {
      if (!bet.cashedOut && bet.user !== 'You' && Math.random() < 0.02) {
        bet.cashedOut = true
        bet.multiplier = currentMultiplier.value
        bet.profit = bet.amount * bet.multiplier - bet.amount
      }
    })
  }, 50)
}

function crash() {
  clearInterval(gameInterval)
  gameState.value = 'crashed'
  
  // Add to history
  crashHistory.value.unshift(currentMultiplier.value)
  if (crashHistory.value.length > 15) crashHistory.value.pop()
  
  // Handle loss if not cashed out
  if (hasBet.value && !hasCashedOut.value) {
    userStore.addTransaction({
      type: 'bet',
      amount: -betAmount.value,
      game: 'Crash'
    })
  }
  
  // Start next round after delay
  setTimeout(() => {
    resetGame()
    startWaiting()
  }, 3000)
}

function resetGame() {
  hasBet.value = false
  hasCashedOut.value = false
  cashoutMultiplier.value = 1.0
  liveBets.value = [
    { id: Date.now(), user: 'Player***' + Math.floor(Math.random() * 100), amount: Math.floor(Math.random() * 100) + 10, cashedOut: false, multiplier: 0, profit: 0 },
    { id: Date.now() + 1, user: 'Lucky***' + Math.floor(Math.random() * 100), amount: Math.floor(Math.random() * 100) + 10, cashedOut: false, multiplier: 0, profit: 0 },
    { id: Date.now() + 2, user: 'High***' + Math.floor(Math.random() * 100), amount: Math.floor(Math.random() * 100) + 10, cashedOut: false, multiplier: 0, profit: 0 }
  ]
}

function startWaiting() {
  gameState.value = 'waiting'
  currentMultiplier.value = 1.0
  waitProgress.value = 0
  
  waitInterval = setInterval(() => {
    waitProgress.value += 2
    if (waitProgress.value >= 100) {
      clearInterval(waitInterval)
      startGame()
    }
  }, 100)
}

onMounted(() => {
  startWaiting()
})

onUnmounted(() => {
  clearInterval(gameInterval)
  clearInterval(waitInterval)
})
</script>

<style scoped>
.game-page {
  display: grid;
  grid-template-columns: 1fr 320px;
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

.game-status {
  font-size: 0.875rem;
  font-weight: 600;
  padding: 0.25rem 0.75rem;
  border-radius: var(--radius-full);
}

.game-status.waiting {
  background: rgba(139, 92, 246, 0.2);
  color: var(--color-accent-purple);
}

.game-status.running {
  background: rgba(16, 185, 129, 0.2);
  color: var(--color-accent-green);
  animation: pulse 1s infinite;
}

.game-status.crashed {
  background: rgba(239, 68, 68, 0.2);
  color: var(--color-accent-red);
}

/* Game Area */
.game-area {
  padding: var(--space-2xl);
  min-height: 350px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: var(--space-xl);
  background: radial-gradient(ellipse at center, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
  position: relative;
}

.crash-display {
  text-align: center;
}

.multiplier-value {
  font-family: var(--font-display);
  font-size: 6rem;
  font-weight: 900;
  transition: all var(--transition-fast);
}

.crash-display.waiting .multiplier-value {
  color: var(--text-secondary);
}

.crash-display.running .multiplier-value {
  color: var(--color-accent-green);
  text-shadow: 0 0 40px rgba(16, 185, 129, 0.5);
}

.crash-display.crashed .multiplier-value {
  color: var(--color-accent-red);
  text-shadow: 0 0 40px rgba(239, 68, 68, 0.5);
}

.crash-display .progress-bar {
  width: 200px;
  height: 6px;
  margin-top: var(--space-md);
}

.crash-graph {
  width: 100%;
  height: 150px;
  background: var(--bg-card);
  border-radius: var(--radius-md);
}

/* Game Controls */
.game-controls {
  padding: var(--space-xl);
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.controls-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1.5fr;
  gap: var(--space-lg);
  margin-bottom: var(--space-lg);
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

.input-suffix {
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-tertiary);
  color: var(--text-muted);
  display: flex;
  align-items: center;
}

.action-group {
  display: flex;
  align-items: flex-end;
}

.action-btn {
  width: 100%;
}

.cashout-btn {
  animation: glow 1s infinite;
}

.current-bet {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.bet-label {
  color: var(--text-muted);
}

.bet-value {
  font-family: var(--font-display);
  font-weight: 700;
  color: var(--color-primary);
}

/* Live Bets Panel */
.live-bets-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.live-bets-panel h3 {
  font-size: 1rem;
}

.bets-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
  max-height: 250px;
  overflow-y: auto;
}

.bet-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.bet-item.cashed-out {
  background: rgba(16, 185, 129, 0.1);
  border-left: 3px solid var(--color-accent-green);
}

.bet-item.lost {
  background: rgba(239, 68, 68, 0.1);
  border-left: 3px solid var(--color-accent-red);
  opacity: 0.6;
}

.bet-user {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.bet-amount {
  font-weight: 600;
}

.bet-result {
  font-size: 0.75rem;
}

/* Crash History */
.crash-history {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.crash-badge {
  padding: 0.25rem 0.5rem;
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  font-weight: 600;
}

.crash-badge.high {
  background: rgba(16, 185, 129, 0.2);
  color: var(--color-accent-green);
}

.crash-badge.low {
  background: rgba(239, 68, 68, 0.2);
  color: var(--color-accent-red);
}

/* Responsive */
@media (max-width: 1024px) {
  .game-page {
    grid-template-columns: 1fr;
  }
  
  .multiplier-value {
    font-size: 4rem;
  }
}

@media (max-width: 640px) {
  .controls-row {
    grid-template-columns: 1fr;
  }
}
</style>
