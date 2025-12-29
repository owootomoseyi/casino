<template>
  <div class="game-page roulette-page">
    <div class="game-container">
      <!-- Game Header -->
      <div class="game-header">
        <h2>🎡 Roulette</h2>
        <div class="game-info">
          <span class="badge badge-purple">European</span>
          <span class="house-edge">House Edge: 2.7%</span>
        </div>
      </div>
      
      <!-- Game Area -->
      <div class="game-area">
        <!-- Wheel -->
        <div class="wheel-container">
          <div class="roulette-wheel" :class="{ spinning }" :style="{ transform: `rotate(${wheelRotation}deg)` }">
            <div class="wheel-center"></div>
          </div>
          <div class="ball" v-if="spinning || result !== null"></div>
          <div class="result-marker" v-if="result !== null">
            <span class="result-number" :class="getNumberColor(result)">{{ result }}</span>
          </div>
        </div>
        
        <!-- Betting Table -->
        <div class="betting-table">
          <!-- Numbers Grid -->
          <div class="numbers-grid">
            <button 
              class="bet-spot zero"
              :class="{ selected: isSelected('0') }"
              @click="toggleBet('0')"
            >0</button>
            <div class="number-rows">
              <div class="number-row" v-for="row in 12" :key="row">
                <button 
                  v-for="col in 3" 
                  :key="col"
                  class="bet-spot number"
                  :class="[getNumberColor((row - 1) * 3 + col), { selected: isSelected(String((row - 1) * 3 + col)) }]"
                  @click="toggleBet(String((row - 1) * 3 + col))"
                >
                  {{ (row - 1) * 3 + col }}
                </button>
              </div>
            </div>
          </div>
          
          <!-- Outside Bets -->
          <div class="outside-bets">
            <div class="bet-row">
              <button class="bet-spot outside" :class="{ selected: isSelected('1-12') }" @click="toggleBet('1-12')">1-12</button>
              <button class="bet-spot outside" :class="{ selected: isSelected('13-24') }" @click="toggleBet('13-24')">13-24</button>
              <button class="bet-spot outside" :class="{ selected: isSelected('25-36') }" @click="toggleBet('25-36')">25-36</button>
            </div>
            <div class="bet-row">
              <button class="bet-spot outside" :class="{ selected: isSelected('1-18') }" @click="toggleBet('1-18')">1-18</button>
              <button class="bet-spot outside" :class="{ selected: isSelected('even') }" @click="toggleBet('even')">Even</button>
              <button class="bet-spot outside red" :class="{ selected: isSelected('red') }" @click="toggleBet('red')">Red</button>
              <button class="bet-spot outside black" :class="{ selected: isSelected('black') }" @click="toggleBet('black')">Black</button>
              <button class="bet-spot outside" :class="{ selected: isSelected('odd') }" @click="toggleBet('odd')">Odd</button>
              <button class="bet-spot outside" :class="{ selected: isSelected('19-36') }" @click="toggleBet('19-36')">19-36</button>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Game Controls -->
      <div class="game-controls">
        <div class="controls-row">
          <!-- Chip Selection -->
          <div class="control-group">
            <label>Chip Value</label>
            <div class="chip-selector">
              <button 
                v-for="chip in chips" 
                :key="chip"
                class="chip"
                :class="{ selected: selectedChip === chip }"
                @click="selectedChip = chip"
              >
                ${{ chip }}
              </button>
            </div>
          </div>
          
          <!-- Current Bets -->
          <div class="control-group">
            <label>Total Bet: ${{ totalBet }}</label>
            <div class="bet-actions">
              <button class="btn btn-ghost btn-sm" @click="clearBets" :disabled="spinning">Clear</button>
              <button class="btn btn-ghost btn-sm" @click="undoLastBet" :disabled="spinning || bets.length === 0">Undo</button>
            </div>
          </div>
          
          <!-- Spin Button -->
          <div class="control-group action-group">
            <button 
              class="btn btn-primary btn-lg spin-btn"
              @click="spin"
              :disabled="spinning || totalBet === 0 || totalBet > balance"
            >
              {{ spinning ? 'Spinning...' : '🎡 SPIN' }}
            </button>
          </div>
        </div>
        
        <!-- Active Bets Display -->
        <div class="active-bets" v-if="bets.length > 0">
          <span class="bets-label">Your Bets:</span>
          <div class="bet-tags">
            <span v-for="(bet, index) in bets" :key="index" class="bet-tag">
              {{ bet.type }}: ${{ bet.amount }}
            </span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- History Panel -->
    <div class="history-panel">
      <h3>📊 Recent Numbers</h3>
      <div class="number-history">
        <span 
          v-for="(num, index) in history" 
          :key="index"
          class="history-number"
          :class="getNumberColor(num)"
        >
          {{ num }}
        </span>
      </div>
      
      <h3>💰 Results</h3>
      <div class="results-list">
        <div v-for="(res, index) in resultHistory" :key="index" class="result-item" :class="res.win ? 'win' : 'lose'">
          <span>Number: {{ res.number }}</span>
          <span :class="res.win ? 'text-green' : 'text-red'">
            {{ res.win ? '+' : '' }}${{ res.amount.toFixed(2) }}
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

// Roulette numbers and their colors
const redNumbers = [1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36]

// State
const chips = [1, 5, 10, 25, 100]
const selectedChip = ref(10)
const bets = ref([])
const spinning = ref(false)
const wheelRotation = ref(0)
const result = ref(null)
const history = ref([23, 7, 0, 14, 35, 2, 19, 8, 31, 4])
const resultHistory = ref([])

// Computed
const balance = computed(() => authStore.userBalance)
const totalBet = computed(() => bets.value.reduce((sum, bet) => sum + bet.amount, 0))

// Methods
function getNumberColor(num) {
  if (num === 0 || num === '0') return 'green'
  return redNumbers.includes(parseInt(num)) ? 'red' : 'black'
}

function isSelected(type) {
  return bets.value.some(bet => bet.type === type)
}

function toggleBet(type) {
  if (spinning.value) return
  
  const existingBet = bets.value.find(bet => bet.type === type)
  if (existingBet) {
    existingBet.amount += selectedChip.value
  } else {
    bets.value.push({ type, amount: selectedChip.value })
  }
}

function clearBets() {
  bets.value = []
}

function undoLastBet() {
  bets.value.pop()
}

function calculateWinnings(winningNumber) {
  let totalWinnings = 0
  
  for (const bet of bets.value) {
    let win = false
    let multiplier = 0
    
    // Single number
    if (bet.type === String(winningNumber)) {
      win = true
      multiplier = 35
    }
    // Red/Black
    else if (bet.type === 'red' && redNumbers.includes(winningNumber)) {
      win = true
      multiplier = 1
    }
    else if (bet.type === 'black' && !redNumbers.includes(winningNumber) && winningNumber !== 0) {
      win = true
      multiplier = 1
    }
    // Even/Odd
    else if (bet.type === 'even' && winningNumber !== 0 && winningNumber % 2 === 0) {
      win = true
      multiplier = 1
    }
    else if (bet.type === 'odd' && winningNumber % 2 === 1) {
      win = true
      multiplier = 1
    }
    // Ranges
    else if (bet.type === '1-18' && winningNumber >= 1 && winningNumber <= 18) {
      win = true
      multiplier = 1
    }
    else if (bet.type === '19-36' && winningNumber >= 19 && winningNumber <= 36) {
      win = true
      multiplier = 1
    }
    else if (bet.type === '1-12' && winningNumber >= 1 && winningNumber <= 12) {
      win = true
      multiplier = 2
    }
    else if (bet.type === '13-24' && winningNumber >= 13 && winningNumber <= 24) {
      win = true
      multiplier = 2
    }
    else if (bet.type === '25-36' && winningNumber >= 25 && winningNumber <= 36) {
      win = true
      multiplier = 2
    }
    
    if (win) {
      totalWinnings += bet.amount + (bet.amount * multiplier)
    }
  }
  
  return totalWinnings
}

async function spin() {
  if (spinning.value || totalBet.value === 0 || totalBet.value > balance.value) return
  
  spinning.value = true
  result.value = null
  
  // Deduct bets
  authStore.updateBalance(-totalBet.value)
  
  // Random result
  const winningNumber = Math.floor(Math.random() * 37)
  
  // Spin animation
  const spins = 5 + Math.random() * 3
  const targetRotation = wheelRotation.value + (spins * 360) + (winningNumber * (360 / 37))
  
  const duration = 4000
  const startRotation = wheelRotation.value
  const startTime = Date.now()
  
  const animate = () => {
    const elapsed = Date.now() - startTime
    const progress = Math.min(elapsed / duration, 1)
    const eased = 1 - Math.pow(1 - progress, 3) // Ease out cubic
    
    wheelRotation.value = startRotation + (targetRotation - startRotation) * eased
    
    if (progress < 1) {
      requestAnimationFrame(animate)
    } else {
      // Show result
      result.value = winningNumber
      history.value.unshift(winningNumber)
      if (history.value.length > 15) history.value.pop()
      
      // Calculate winnings
      const winnings = calculateWinnings(winningNumber)
      
      if (winnings > 0) {
        authStore.updateBalance(winnings)
        resultHistory.value.unshift({
          number: winningNumber,
          win: true,
          amount: winnings - totalBet.value
        })
      } else {
        resultHistory.value.unshift({
          number: winningNumber,
          win: false,
          amount: -totalBet.value
        })
      }
      
      if (resultHistory.value.length > 10) resultHistory.value.pop()
      
      userStore.addTransaction({
        type: winnings > 0 ? 'win' : 'bet',
        amount: winnings > 0 ? winnings - totalBet.value : -totalBet.value,
        game: 'Roulette'
      })
      
      spinning.value = false
      bets.value = []
    }
  }
  
  animate()
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

/* Game Area */
.game-area {
  padding: var(--space-xl);
  display: flex;
  gap: var(--space-xl);
  align-items: flex-start;
  background: radial-gradient(ellipse at center, #0d4f2a 0%, #0a3d21 50%, var(--bg-secondary) 100%);
}

/* Wheel */
.wheel-container {
  position: relative;
  width: 200px;
  height: 200px;
}

.roulette-wheel {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    from 0deg,
    #00a651, #e31937, #1a1a1a, #e31937, #1a1a1a,
    #e31937, #1a1a1a, #e31937, #1a1a1a, #e31937,
    #1a1a1a, #e31937, #1a1a1a, #e31937, #1a1a1a,
    #e31937, #1a1a1a, #e31937, #1a1a1a, #e31937,
    #1a1a1a, #e31937, #1a1a1a, #e31937, #1a1a1a,
    #e31937, #1a1a1a, #e31937, #1a1a1a, #e31937,
    #1a1a1a, #e31937, #1a1a1a, #e31937, #1a1a1a,
    #e31937, #1a1a1a
  );
  border: 6px solid var(--color-primary);
  box-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
  transition: transform 0.1s linear;
}

.wheel-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  background: var(--color-primary);
  border-radius: 50%;
}

.result-marker {
  position: absolute;
  top: -30px;
  left: 50%;
  transform: translateX(-50%);
}

.result-number {
  display: inline-block;
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-md);
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 800;
  color: white;
}

.result-number.red { background: #e31937; }
.result-number.black { background: #1a1a1a; }
.result-number.green { background: #00a651; }

/* Betting Table */
.betting-table {
  flex: 1;
}

.numbers-grid {
  display: flex;
  gap: 2px;
  margin-bottom: var(--space-md);
}

.bet-spot {
  padding: var(--space-sm);
  font-size: 0.875rem;
  font-weight: 600;
  border: 2px solid transparent;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: all var(--transition-fast);
  color: white;
}

.bet-spot:hover {
  transform: scale(1.05);
  border-color: var(--color-primary);
}

.bet-spot.selected {
  border-color: var(--color-primary);
  box-shadow: 0 0 10px rgba(255, 215, 0, 0.5);
}

.bet-spot.zero {
  width: 40px;
  background: #00a651;
}

.number-rows {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.number-row {
  display: flex;
  gap: 2px;
}

.bet-spot.number {
  width: 40px;
  height: 36px;
}

.bet-spot.red { background: #e31937; }
.bet-spot.black { background: #1a1a1a; }

.outside-bets {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.bet-row {
  display: flex;
  gap: 2px;
}

.bet-spot.outside {
  flex: 1;
  background: #1a1a1a;
  padding: var(--space-sm) var(--space-md);
}

/* Game Controls */
.game-controls {
  padding: var(--space-xl);
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.controls-row {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
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

.chip-selector {
  display: flex;
  gap: var(--space-sm);
}

.chip {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background: var(--bg-card);
  border: 3px solid var(--border-color);
  color: var(--text-primary);
  font-weight: 700;
  font-size: 0.75rem;
  transition: all var(--transition-fast);
}

.chip:hover,
.chip.selected {
  border-color: var(--color-primary);
  background: rgba(255, 215, 0, 0.1);
  color: var(--color-primary);
}

.bet-actions {
  display: flex;
  gap: var(--space-sm);
}

.action-group {
  display: flex;
  align-items: flex-end;
}

.spin-btn {
  width: 100%;
}

.active-bets {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  flex-wrap: wrap;
}

.bets-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.bet-tags {
  display: flex;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.bet-tag {
  padding: 0.25rem 0.5rem;
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-sm);
  font-size: 0.75rem;
  color: var(--color-primary);
}

/* History Panel */
.history-panel {
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.history-panel h3 {
  font-size: 1rem;
}

.number-history {
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm);
}

.history-number {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 700;
  color: white;
}

.history-number.red { background: #e31937; }
.history-number.black { background: #1a1a1a; }
.history-number.green { background: #00a651; }

.results-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.result-item {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  font-size: 0.8125rem;
}

.result-item.win {
  border-left: 3px solid var(--color-accent-green);
}

.result-item.lose {
  border-left: 3px solid var(--color-accent-red);
}

/* Responsive */
@media (max-width: 1024px) {
  .game-page {
    grid-template-columns: 1fr;
  }
  
  .game-area {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 640px) {
  .controls-row {
    grid-template-columns: 1fr;
  }
  
  .bet-spot.number {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
}
</style>
