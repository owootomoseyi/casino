<template>
  <div class="game-page dice-page">
    <div class="game-container">
      <!-- Game Header -->
      <div class="game-header">
        <h2>🎲 Dice</h2>
        <div class="game-info">
          <span class="badge badge-green">Provably Fair</span>
          <span class="house-edge">House Edge: 1%</span>
        </div>
      </div>
      
      <!-- Game Area -->
      <div class="game-area">
        <div class="dice-display" :class="resultClass">
          <span class="result-number">{{ displayNumber }}</span>
          <span class="result-text" v-if="lastResult">
            {{ lastResult === 'win' ? 'WIN!' : 'LOSE' }}
          </span>
        </div>
        
        <!-- Slider -->
        <div class="dice-slider">
          <div class="slider-track">
            <div class="slider-fill" :class="rollType" :style="{ width: sliderFillWidth }"></div>
            <input 
              type="range" 
              v-model="targetNumber"
              :min="rollType === 'under' ? 2 : 1"
              :max="rollType === 'under' ? 98 : 99"
              class="slider-input"
            />
          </div>
          <div class="slider-labels">
            <span>0</span>
            <span class="target-label">{{ targetNumber }}</span>
            <span>100</span>
          </div>
        </div>
      </div>
      
      <!-- Game Controls -->
      <div class="game-controls">
        <div class="controls-grid">
          <!-- Bet Amount -->
          <div class="control-group">
            <label>Bet Amount</label>
            <div class="bet-input">
              <button class="adjust-btn" @click="halveBet">½</button>
              <input type="number" v-model.number="betAmount" min="0.1" step="0.1" />
              <button class="adjust-btn" @click="doubleBet">2×</button>
            </div>
          </div>
          
          <!-- Roll Type -->
          <div class="control-group">
            <label>Roll Type</label>
            <div class="roll-type-toggle">
              <button 
                class="toggle-btn"
                :class="{ active: rollType === 'under' }"
                @click="rollType = 'under'"
              >
                Roll Under
              </button>
              <button 
                class="toggle-btn"
                :class="{ active: rollType === 'over' }"
                @click="rollType = 'over'"
              >
                Roll Over
              </button>
            </div>
          </div>
          
          <!-- Win Chance -->
          <div class="control-group">
            <label>Win Chance</label>
            <div class="stat-display">{{ winChance }}%</div>
          </div>
          
          <!-- Multiplier -->
          <div class="control-group">
            <label>Multiplier</label>
            <div class="stat-display text-gold">{{ multiplier }}×</div>
          </div>
          
          <!-- Profit on Win -->
          <div class="control-group">
            <label>Profit on Win</label>
            <div class="stat-display text-green">${{ potentialProfit }}</div>
          </div>
        </div>
        
        <!-- Roll Button -->
        <button 
          class="btn btn-primary btn-lg roll-btn"
          @click="rollDice"
          :disabled="rolling || betAmount > balance"
        >
          <span v-if="rolling" class="spinner">🎲</span>
          <span v-else>Roll Dice</span>
        </button>
      </div>
    </div>
    
    <!-- Bet History -->
    <div class="history-section">
      <h3>Recent Rolls</h3>
      <div class="history-list">
        <div 
          v-for="(roll, index) in history" 
          :key="index"
          class="history-item"
          :class="roll.result"
        >
          <span class="roll-number">{{ roll.number }}</span>
          <span class="roll-target">{{ roll.type }} {{ roll.target }}</span>
          <span class="roll-profit" :class="roll.result">
            {{ roll.result === 'win' ? '+' : '-' }}${{ roll.amount.toFixed(2) }}
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
const targetNumber = ref(50)
const rollType = ref('under')
const rolling = ref(false)
const displayNumber = ref(50.0)
const lastResult = ref(null)
const history = ref([])

// Computed
const balance = computed(() => authStore.userBalance)

const winChance = computed(() => {
  return rollType.value === 'under' 
    ? targetNumber.value - 1 
    : 100 - targetNumber.value
})

const multiplier = computed(() => {
  const houseEdge = 0.01
  const mult = (100 * (1 - houseEdge)) / winChance.value
  return mult.toFixed(4)
})

const potentialProfit = computed(() => {
  const profit = betAmount.value * (parseFloat(multiplier.value) - 1)
  return profit.toFixed(2)
})

const sliderFillWidth = computed(() => {
  return rollType.value === 'under'
    ? `${targetNumber.value}%`
    : `${100 - targetNumber.value}%`
})

const resultClass = computed(() => {
  if (!lastResult.value) return ''
  return lastResult.value
})

// Methods
function halveBet() {
  betAmount.value = Math.max(0.1, betAmount.value / 2)
}

function doubleBet() {
  betAmount.value = Math.min(balance.value, betAmount.value * 2)
}

async function rollDice() {
  if (rolling.value || betAmount.value > balance.value) return
  
  rolling.value = true
  lastResult.value = null
  
  // Deduct bet
  authStore.updateBalance(-betAmount.value)
  
  // Rolling animation
  const animationDuration = 1500
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    if (elapsed < animationDuration) {
      displayNumber.value = (Math.random() * 100).toFixed(2)
      requestAnimationFrame(animate)
    } else {
      // Final result (provably fair would be server-generated)
      const finalNumber = parseFloat((Math.random() * 100).toFixed(2))
      displayNumber.value = finalNumber
      
      // Determine win/lose
      const isWin = rollType.value === 'under'
        ? finalNumber < targetNumber.value
        : finalNumber > targetNumber.value
      
      lastResult.value = isWin ? 'win' : 'lose'
      
      // Handle winnings
      if (isWin) {
        const winnings = betAmount.value * parseFloat(multiplier.value)
        authStore.updateBalance(winnings)
        
        history.value.unshift({
          number: finalNumber,
          type: rollType.value,
          target: targetNumber.value,
          result: 'win',
          amount: winnings - betAmount.value
        })
      } else {
        history.value.unshift({
          number: finalNumber,
          type: rollType.value,
          target: targetNumber.value,
          result: 'lose',
          amount: betAmount.value
        })
      }
      
      // Add to transaction history
      userStore.addTransaction({
        type: isWin ? 'win' : 'bet',
        amount: isWin ? betAmount.value * parseFloat(multiplier.value) - betAmount.value : -betAmount.value,
        game: 'Dice'
      })
      
      // Keep only last 20 rolls
      if (history.value.length > 20) {
        history.value = history.value.slice(0, 20)
      }
      
      rolling.value = false
    }
  }
  
  animate()
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
  gap: var(--space-2xl);
  background: radial-gradient(ellipse at center, var(--bg-tertiary) 0%, var(--bg-secondary) 100%);
}

.dice-display {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-2xl) var(--space-3xl);
  background: var(--bg-card);
  border: 3px solid var(--border-color);
  border-radius: var(--radius-xl);
  transition: all var(--transition-base);
}

.dice-display.win {
  border-color: var(--color-accent-green);
  box-shadow: 0 0 40px rgba(16, 185, 129, 0.3);
}

.dice-display.lose {
  border-color: var(--color-accent-red);
  box-shadow: 0 0 40px rgba(239, 68, 68, 0.3);
}

.result-number {
  font-family: var(--font-display);
  font-size: 4rem;
  font-weight: 800;
}

.dice-display.win .result-number {
  color: var(--color-accent-green);
}

.dice-display.lose .result-number {
  color: var(--color-accent-red);
}

.result-text {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
}

/* Slider */
.dice-slider {
  width: 100%;
  max-width: 500px;
}

.slider-track {
  position: relative;
  height: 12px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: visible;
}

.slider-fill {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
  border-radius: var(--radius-full);
  transition: width var(--transition-fast);
}

.slider-fill.under {
  background: var(--color-accent-green);
}

.slider-fill.over {
  right: 0;
  left: auto;
  background: var(--color-accent-green);
}

.slider-input {
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  transform: translateY(-50%);
  width: 100%;
  height: 40px;
  background: transparent;
  cursor: pointer;
  -webkit-appearance: none;
}

.slider-input::-webkit-slider-thumb {
  -webkit-appearance: none;
  width: 24px;
  height: 24px;
  background: var(--color-primary);
  border-radius: 50%;
  cursor: grab;
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.slider-labels {
  display: flex;
  justify-content: space-between;
  margin-top: var(--space-sm);
  font-size: 0.875rem;
  color: var(--text-muted);
}

.target-label {
  font-weight: 700;
  color: var(--color-primary);
}

/* Game Controls */
.game-controls {
  padding: var(--space-xl);
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.controls-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-md);
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

.roll-type-toggle {
  display: flex;
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  overflow: hidden;
}

.roll-type-toggle .toggle-btn {
  flex: 1;
  padding: var(--space-sm);
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.roll-type-toggle .toggle-btn.active {
  background: var(--color-accent-green);
  color: white;
}

.stat-display {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
}

.roll-btn {
  width: 100%;
}

.spinner {
  animation: spin 0.3s linear infinite;
  display: inline-block;
}

/* History Section */
.history-section {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
}

.history-section h3 {
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

.history-item.lose {
  border-left: 3px solid var(--color-accent-red);
}

.roll-number {
  font-family: var(--font-display);
  font-weight: 700;
}

.roll-target {
  color: var(--text-muted);
  text-transform: capitalize;
}

.roll-profit.win {
  color: var(--color-accent-green);
}

.roll-profit.lose {
  color: var(--color-accent-red);
}

/* Responsive */
@media (max-width: 1024px) {
  .game-page {
    grid-template-columns: 1fr;
  }
  
  .controls-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}

@media (max-width: 640px) {
  .controls-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .result-number {
    font-size: 3rem;
  }
}
</style>
