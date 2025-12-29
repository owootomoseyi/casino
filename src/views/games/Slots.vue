<template>
  <div class="game-page slots-page">
    <div class="game-container">
      <!-- Game Header -->
      <div class="game-header">
        <h2>🎰 Lucky Slots</h2>
        <div class="game-info">
          <span class="badge badge-gold">NEW</span>
          <span class="house-edge">RTP: 97%</span>
        </div>
      </div>
      
      <!-- Game Area -->
      <div class="game-area">
        <!-- Slot Machine -->
        <div class="slot-machine">
          <div class="slot-frame">
            <div class="reels-container">
              <div 
                v-for="(reel, index) in reels" 
                :key="index" 
                class="reel"
                :class="{ spinning: spinning[index] }"
              >
                <div class="reel-inner" :style="{ transform: `translateY(-${reelPositions[index] * 100}px)` }">
                  <div v-for="(symbol, sIndex) in reelSymbols" :key="sIndex" class="symbol">
                    {{ symbol }}
                  </div>
                </div>
                <div class="reel-result" v-if="!spinning[index]">
                  {{ results[index] }}
                </div>
              </div>
            </div>
            <div class="payline"></div>
          </div>
          
          <!-- Win Display -->
          <div class="win-display" v-if="lastWin > 0" :class="{ show: showWin }">
            <span class="win-text">WIN!</span>
            <span class="win-amount">${{ lastWin.toFixed(2) }}</span>
          </div>
        </div>
        
        <!-- Paytable -->
        <div class="paytable">
          <h4>Paytable</h4>
          <div class="paytable-grid">
            <div class="pay-item" v-for="pay in paytable" :key="pay.symbol">
              <span class="pay-symbols">{{ pay.symbol }} {{ pay.symbol }} {{ pay.symbol }}</span>
              <span class="pay-multiplier">{{ pay.multiplier }}×</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Game Controls -->
      <div class="game-controls">
        <div class="controls-row">
          <!-- Bet Amount -->
          <div class="control-group">
            <label>Bet Amount</label>
            <div class="bet-input">
              <button class="adjust-btn" @click="decreaseBet">−</button>
              <input type="number" v-model.number="betAmount" min="0.5" step="0.5" />
              <button class="adjust-btn" @click="increaseBet">+</button>
            </div>
          </div>
          
          <!-- Auto Spin -->
          <div class="control-group">
            <label>Auto Spins</label>
            <div class="bet-input">
              <input type="number" v-model.number="autoSpins" min="0" max="100" />
              <button class="adjust-btn" @click="toggleAutoSpin" :class="{ active: autoSpinActive }">
                {{ autoSpinActive ? '⏹' : '▶' }}
              </button>
            </div>
          </div>
          
          <!-- Spin Button -->
          <div class="control-group action-group">
            <button 
              class="btn btn-primary btn-lg spin-btn"
              @click="spin"
              :disabled="isSpinning || betAmount > balance"
            >
              <span v-if="isSpinning">Spinning...</span>
              <span v-else>🎰 SPIN</span>
            </button>
          </div>
        </div>
        
        <!-- Stats -->
        <div class="spin-stats">
          <div class="stat">
            <span class="stat-label">Total Bet</span>
            <span class="stat-value">${{ totalBet.toFixed(2) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Total Won</span>
            <span class="stat-value text-green">${{ totalWon.toFixed(2) }}</span>
          </div>
          <div class="stat">
            <span class="stat-label">Spins</span>
            <span class="stat-value">{{ spinCount }}</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- History Panel -->
    <div class="history-panel">
      <h3>🎯 Recent Spins</h3>
      <div class="history-list">
        <div 
          v-for="(spin, index) in history" 
          :key="index"
          class="history-item"
          :class="{ win: spin.win > 0 }"
        >
          <div class="spin-result">
            {{ spin.symbols.join(' ') }}
          </div>
          <span class="spin-bet">${{ spin.bet.toFixed(2) }}</span>
          <span class="spin-win" :class="spin.win > 0 ? 'text-green' : 'text-red'">
            {{ spin.win > 0 ? '+' : '' }}${{ (spin.win - spin.bet).toFixed(2) }}
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

// Symbols
const reelSymbols = ['🍒', '🍋', '🍊', '🍇', '🔔', '⭐', '7️⃣', '💎']

// Paytable
const paytable = [
  { symbol: '💎', multiplier: 100 },
  { symbol: '7️⃣', multiplier: 50 },
  { symbol: '⭐', multiplier: 25 },
  { symbol: '🔔', multiplier: 15 },
  { symbol: '🍇', multiplier: 10 },
  { symbol: '🍊', multiplier: 5 },
  { symbol: '🍋', multiplier: 3 },
  { symbol: '🍒', multiplier: 2 }
]

// State
const betAmount = ref(1)
const autoSpins = ref(0)
const autoSpinActive = ref(false)
const reels = ref([0, 1, 2])
const reelPositions = ref([0, 0, 0])
const results = ref(['🍒', '🍒', '🍒'])
const spinning = ref([false, false, false])
const isSpinning = ref(false)
const lastWin = ref(0)
const showWin = ref(false)
const totalBet = ref(0)
const totalWon = ref(0)
const spinCount = ref(0)
const history = ref([])

// Computed
const balance = computed(() => authStore.userBalance)

// Methods
function decreaseBet() {
  betAmount.value = Math.max(0.5, betAmount.value - 0.5)
}

function increaseBet() {
  betAmount.value = Math.min(balance.value, betAmount.value + 0.5)
}

function toggleAutoSpin() {
  autoSpinActive.value = !autoSpinActive.value
  if (autoSpinActive.value && autoSpins.value > 0) {
    spin()
  }
}

async function spin() {
  if (isSpinning.value || betAmount.value > balance.value) return
  
  isSpinning.value = true
  showWin.value = false
  lastWin.value = 0
  
  // Deduct bet
  authStore.updateBalance(-betAmount.value)
  totalBet.value += betAmount.value
  spinCount.value++
  
  // Start all reels spinning
  spinning.value = [true, true, true]
  
  // Random results
  const finalResults = [
    reelSymbols[Math.floor(Math.random() * reelSymbols.length)],
    reelSymbols[Math.floor(Math.random() * reelSymbols.length)],
    reelSymbols[Math.floor(Math.random() * reelSymbols.length)]
  ]
  
  // Weighted chance for wins (make it more exciting)
  if (Math.random() < 0.15) {
    // Two of a kind
    finalResults[1] = finalResults[0]
  }
  if (Math.random() < 0.05) {
    // Three of a kind
    finalResults[1] = finalResults[0]
    finalResults[2] = finalResults[0]
  }
  
  // Stop reels sequentially
  for (let i = 0; i < 3; i++) {
    await new Promise(resolve => setTimeout(resolve, 500 + i * 300))
    spinning.value[i] = false
    results.value[i] = finalResults[i]
  }
  
  // Calculate win
  let winAmount = 0
  if (finalResults[0] === finalResults[1] && finalResults[1] === finalResults[2]) {
    const payEntry = paytable.find(p => p.symbol === finalResults[0])
    if (payEntry) {
      winAmount = betAmount.value * payEntry.multiplier
    }
  } else if (finalResults[0] === finalResults[1] || finalResults[1] === finalResults[2]) {
    // Two in a row pays 1.5x
    winAmount = betAmount.value * 1.5
  }
  
  if (winAmount > 0) {
    lastWin.value = winAmount
    showWin.value = true
    totalWon.value += winAmount
    authStore.updateBalance(winAmount)
    
    userStore.addTransaction({
      type: 'win',
      amount: winAmount - betAmount.value,
      game: 'Slots'
    })
  } else {
    userStore.addTransaction({
      type: 'bet',
      amount: -betAmount.value,
      game: 'Slots'
    })
  }
  
  // Add to history
  history.value.unshift({
    symbols: [...finalResults],
    bet: betAmount.value,
    win: winAmount
  })
  
  if (history.value.length > 20) {
    history.value = history.value.slice(0, 20)
  }
  
  isSpinning.value = false
  
  // Auto spin
  if (autoSpinActive.value && autoSpins.value > 0) {
    autoSpins.value--
    if (autoSpins.value > 0 && balance.value >= betAmount.value) {
      setTimeout(() => spin(), 1000)
    } else {
      autoSpinActive.value = false
    }
  }
}
</script>

<style scoped>
.game-page {
  display: grid;
  grid-template-columns: 1fr 280px;
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

.game-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.house-edge {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Game Area */
.game-area {
  padding: var(--space-2xl);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-xl);
  background: radial-gradient(ellipse at center, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
}

/* Slot Machine */
.slot-machine {
  position: relative;
}

.slot-frame {
  background: linear-gradient(135deg, #2a2a3a 0%, #1a1a24 100%);
  border: 4px solid var(--color-primary);
  border-radius: var(--radius-xl);
  padding: var(--space-xl);
  box-shadow: 0 0 40px rgba(255, 215, 0, 0.3);
}

.reels-container {
  display: flex;
  gap: var(--space-md);
}

.reel {
  width: 100px;
  height: 120px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
}

.reel.spinning {
  animation: reelSpin 0.1s linear infinite;
}

@keyframes reelSpin {
  0%, 100% { transform: translateY(0); }
  25% { transform: translateY(-3px); }
  50% { transform: translateY(0); }
  75% { transform: translateY(3px); }
}

.reel-result {
  font-size: 3.5rem;
  animation: symbolDrop 0.3s ease-out;
}

@keyframes symbolDrop {
  from {
    transform: translateY(-20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.payline {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  height: 3px;
  background: var(--color-primary);
  transform: translateY(-50%);
  opacity: 0.5;
}

/* Win Display */
.win-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(0);
  background: rgba(0, 0, 0, 0.9);
  border: 3px solid var(--color-accent-green);
  border-radius: var(--radius-xl);
  padding: var(--space-xl) var(--space-2xl);
  text-align: center;
  z-index: 10;
  transition: transform 0.3s ease;
}

.win-display.show {
  transform: translate(-50%, -50%) scale(1);
  animation: winPulse 0.5s ease;
}

@keyframes winPulse {
  0%, 100% { transform: translate(-50%, -50%) scale(1); }
  50% { transform: translate(-50%, -50%) scale(1.1); }
}

.win-text {
  display: block;
  font-family: var(--font-display);
  font-size: 1.5rem;
  color: var(--color-accent-green);
  margin-bottom: var(--space-sm);
}

.win-amount {
  font-family: var(--font-display);
  font-size: 2.5rem;
  font-weight: 900;
  color: var(--color-primary);
  text-shadow: 0 0 20px rgba(255, 215, 0, 0.5);
}

/* Paytable */
.paytable {
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
  padding: var(--space-md);
  width: 100%;
  max-width: 400px;
}

.paytable h4 {
  font-size: 0.875rem;
  margin-bottom: var(--space-md);
  text-align: center;
  color: var(--text-secondary);
}

.paytable-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-sm);
}

.pay-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: var(--space-sm);
  background: var(--bg-glass);
  border-radius: var(--radius-sm);
}

.pay-symbols {
  font-size: 1rem;
}

.pay-multiplier {
  font-size: 0.75rem;
  font-weight: 700;
  color: var(--color-primary);
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

.adjust-btn:hover,
.adjust-btn.active {
  background: var(--bg-glass-hover);
  color: var(--color-primary);
}

.action-group {
  display: flex;
  align-items: flex-end;
}

.spin-btn {
  width: 100%;
  font-size: 1.125rem;
}

.spin-stats {
  display: flex;
  justify-content: space-around;
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.spin-stats .stat {
  text-align: center;
}

.stat-label {
  display: block;
  font-size: 0.6875rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.stat-value {
  font-family: var(--font-display);
  font-weight: 700;
}

/* History Panel */
.history-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
}

.history-panel h3 {
  font-size: 1rem;
  margin-bottom: var(--space-lg);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.history-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  font-size: 0.875rem;
}

.history-item.win {
  border-left: 3px solid var(--color-accent-green);
}

.spin-result {
  font-size: 1.25rem;
}

.spin-bet {
  color: var(--text-muted);
}

/* Responsive */
@media (max-width: 1024px) {
  .game-page {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .controls-row {
    grid-template-columns: 1fr;
  }
  
  .reel {
    width: 80px;
    height: 100px;
  }
  
  .reel-result {
    font-size: 2.5rem;
  }
  
  .paytable-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
