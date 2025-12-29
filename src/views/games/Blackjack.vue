<template>
  <div class="game-page blackjack-page">
    <div class="game-container">
      <!-- Game Header -->
      <div class="game-header">
        <h2>🃏 Blackjack</h2>
        <div class="game-info">
          <span class="badge badge-green">Low Edge</span>
          <span class="house-edge">House Edge: 0.5%</span>
        </div>
      </div>
      
      <!-- Game Area -->
      <div class="game-area">
        <!-- Dealer Hand -->
        <div class="hand dealer-hand">
          <h3>Dealer <span class="hand-value" v-if="gameStarted">({{ dealerValue }})</span></h3>
          <div class="cards">
            <div 
              v-for="(card, index) in dealerCards" 
              :key="index"
              class="playing-card"
              :class="{ red: card.suit === '♥' || card.suit === '♦', hidden: index === 1 && !gameEnded }"
            >
              <template v-if="!(index === 1 && !gameEnded)">
                <span class="card-value">{{ card.value }}</span>
                <span class="card-suit">{{ card.suit }}</span>
              </template>
            </div>
          </div>
        </div>
        
        <!-- Result Display -->
        <div class="result-display" v-if="gameEnded">
          <span class="result-text" :class="result">
            {{ resultText }}
          </span>
          <span class="result-amount" v-if="winAmount !== 0" :class="winAmount > 0 ? 'text-green' : 'text-red'">
            {{ winAmount > 0 ? '+' : '' }}${{ winAmount.toFixed(2) }}
          </span>
        </div>
        
        <!-- Player Hand -->
        <div class="hand player-hand">
          <h3>Your Hand <span class="hand-value" v-if="gameStarted">({{ playerValue }})</span></h3>
          <div class="cards">
            <div 
              v-for="(card, index) in playerCards" 
              :key="index"
              class="playing-card"
              :class="{ red: card.suit === '♥' || card.suit === '♦' }"
            >
              <span class="card-value">{{ card.value }}</span>
              <span class="card-suit">{{ card.suit }}</span>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Game Controls -->
      <div class="game-controls">
        <!-- Pre-game controls -->
        <div class="pregame-controls" v-if="!gameStarted">
          <div class="control-group">
            <label>Bet Amount</label>
            <div class="bet-input">
              <button class="adjust-btn" @click="decreaseBet">−</button>
              <input type="number" v-model.number="betAmount" min="1" step="1" />
              <button class="adjust-btn" @click="increaseBet">+</button>
            </div>
          </div>
          <button 
            class="btn btn-primary btn-lg deal-btn"
            @click="deal"
            :disabled="betAmount > balance"
          >
            Deal Cards
          </button>
        </div>
        
        <!-- In-game controls -->
        <div class="ingame-controls" v-else-if="!gameEnded">
          <button class="btn btn-primary action-btn" @click="hit" :disabled="playerValue >= 21">
            <span>👊</span> Hit
          </button>
          <button class="btn btn-secondary action-btn" @click="stand">
            <span>✋</span> Stand
          </button>
          <button class="btn btn-secondary action-btn" @click="double" :disabled="!canDouble">
            <span>2️⃣</span> Double
          </button>
          <button class="btn btn-secondary action-btn" v-if="canSplit" @click="split">
            <span>✂️</span> Split
          </button>
        </div>
        
        <!-- Post-game controls -->
        <div class="postgame-controls" v-else>
          <button class="btn btn-primary btn-lg" @click="newGame">
            New Game
          </button>
        </div>
      </div>
    </div>
    
    <!-- Stats Panel -->
    <div class="stats-panel">
      <h3>📊 Session Stats</h3>
      <div class="stats-grid">
        <div class="stat-item">
          <span class="stat-label">Hands Played</span>
          <span class="stat-value">{{ stats.hands }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Wins</span>
          <span class="stat-value text-green">{{ stats.wins }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Losses</span>
          <span class="stat-value text-red">{{ stats.losses }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Pushes</span>
          <span class="stat-value">{{ stats.pushes }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Blackjacks</span>
          <span class="stat-value text-gold">{{ stats.blackjacks }}</span>
        </div>
        <div class="stat-item">
          <span class="stat-label">Net Profit</span>
          <span class="stat-value" :class="stats.profit >= 0 ? 'text-green' : 'text-red'">
            ${{ stats.profit.toFixed(2) }}
          </span>
        </div>
      </div>
      
      <h3>📜 Recent Hands</h3>
      <div class="history-list">
        <div 
          v-for="(hand, index) in history" 
          :key="index"
          class="history-item"
          :class="hand.result"
        >
          <span>{{ hand.player }} vs {{ hand.dealer }}</span>
          <span class="history-result">{{ hand.resultText }}</span>
          <span :class="hand.amount >= 0 ? 'text-green' : 'text-red'">
            {{ hand.amount >= 0 ? '+' : '' }}${{ hand.amount.toFixed(2) }}
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

// Deck
const suits = ['♠', '♥', '♦', '♣']
const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

// State
const betAmount = ref(10)
const gameStarted = ref(false)
const gameEnded = ref(false)
const playerCards = ref([])
const dealerCards = ref([])
const result = ref('')
const resultText = ref('')
const winAmount = ref(0)

const stats = ref({
  hands: 0,
  wins: 0,
  losses: 0,
  pushes: 0,
  blackjacks: 0,
  profit: 0
})

const history = ref([])

// Computed
const balance = computed(() => authStore.userBalance)

const playerValue = computed(() => calculateHandValue(playerCards.value))
const dealerValue = computed(() => {
  if (!gameEnded.value && dealerCards.value.length > 0) {
    return calculateCardValue(dealerCards.value[0])
  }
  return calculateHandValue(dealerCards.value)
})

const canDouble = computed(() => playerCards.value.length === 2 && balance.value >= betAmount.value)
const canSplit = computed(() => {
  if (playerCards.value.length !== 2) return false
  return calculateCardValue(playerCards.value[0]) === calculateCardValue(playerCards.value[1])
})

// Methods
function decreaseBet() {
  betAmount.value = Math.max(1, betAmount.value - 5)
}

function increaseBet() {
  betAmount.value = Math.min(balance.value, betAmount.value + 5)
}

function createDeck() {
  const deck = []
  for (const suit of suits) {
    for (const value of values) {
      deck.push({ suit, value })
    }
  }
  return shuffleDeck(deck)
}

function shuffleDeck(deck) {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function calculateCardValue(card) {
  if (['J', 'Q', 'K'].includes(card.value)) return 10
  if (card.value === 'A') return 11
  return parseInt(card.value)
}

function calculateHandValue(cards) {
  let value = 0
  let aces = 0
  
  for (const card of cards) {
    if (card.value === 'A') {
      aces++
      value += 11
    } else if (['J', 'Q', 'K'].includes(card.value)) {
      value += 10
    } else {
      value += parseInt(card.value)
    }
  }
  
  while (value > 21 && aces > 0) {
    value -= 10
    aces--
  }
  
  return value
}

let deck = []

function deal() {
  // Deduct bet
  authStore.updateBalance(-betAmount.value)
  
  deck = createDeck()
  gameStarted.value = true
  gameEnded.value = false
  result.value = ''
  resultText.value = ''
  winAmount.value = 0
  
  playerCards.value = [deck.pop(), deck.pop()]
  dealerCards.value = [deck.pop(), deck.pop()]
  
  // Check for blackjack
  if (playerValue.value === 21) {
    stand()
  }
}

function hit() {
  playerCards.value.push(deck.pop())
  
  if (playerValue.value > 21) {
    endGame('lose', 'Bust!')
  } else if (playerValue.value === 21) {
    stand()
  }
}

function stand() {
  // Dealer plays
  while (calculateHandValue(dealerCards.value) < 17) {
    dealerCards.value.push(deck.pop())
  }
  
  const playerVal = playerValue.value
  const dealerVal = calculateHandValue(dealerCards.value)
  
  if (dealerVal > 21) {
    endGame('win', 'Dealer Busts!')
  } else if (playerVal > dealerVal) {
    if (playerCards.value.length === 2 && playerVal === 21) {
      endGame('blackjack', 'Blackjack!')
    } else {
      endGame('win', 'You Win!')
    }
  } else if (playerVal < dealerVal) {
    endGame('lose', 'Dealer Wins')
  } else {
    endGame('push', 'Push')
  }
}

function double() {
  authStore.updateBalance(-betAmount.value)
  betAmount.value *= 2
  hit()
  if (!gameEnded.value) {
    stand()
  }
}

function split() {
  // Simplified split - just add another card to current hand
  playerCards.value = [playerCards.value[0], deck.pop()]
}

function endGame(resultType, text) {
  gameEnded.value = true
  result.value = resultType
  resultText.value = text
  
  stats.value.hands++
  
  if (resultType === 'win') {
    winAmount.value = betAmount.value
    authStore.updateBalance(betAmount.value * 2)
    stats.value.wins++
  } else if (resultType === 'blackjack') {
    winAmount.value = betAmount.value * 1.5
    authStore.updateBalance(betAmount.value * 2.5)
    stats.value.wins++
    stats.value.blackjacks++
  } else if (resultType === 'push') {
    winAmount.value = 0
    authStore.updateBalance(betAmount.value)
    stats.value.pushes++
  } else {
    winAmount.value = -betAmount.value
    stats.value.losses++
  }
  
  stats.value.profit += winAmount.value
  
  // Add to history
  history.value.unshift({
    player: playerValue.value,
    dealer: calculateHandValue(dealerCards.value),
    result: resultType,
    resultText: text,
    amount: winAmount.value
  })
  
  if (history.value.length > 10) {
    history.value = history.value.slice(0, 10)
  }
  
  userStore.addTransaction({
    type: winAmount.value >= 0 ? 'win' : 'bet',
    amount: winAmount.value,
    game: 'Blackjack'
  })
}

function newGame() {
  gameStarted.value = false
  gameEnded.value = false
  playerCards.value = []
  dealerCards.value = []
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
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background: radial-gradient(ellipse at center, #0d4f2a 0%, #0a3d21 50%, var(--bg-secondary) 100%);
  position: relative;
}

/* Hands */
.hand {
  text-align: center;
}

.hand h3 {
  font-size: 1rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.hand-value {
  color: var(--color-primary);
  font-weight: 700;
}

.cards {
  display: flex;
  justify-content: center;
  gap: var(--space-sm);
  flex-wrap: wrap;
}

.playing-card {
  width: 70px;
  height: 100px;
  background: white;
  border-radius: var(--radius-md);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1a1a1a;
  box-shadow: var(--shadow-md);
  animation: cardDeal 0.3s ease;
}

@keyframes cardDeal {
  from {
    transform: translateY(-50px) rotateY(180deg);
    opacity: 0;
  }
  to {
    transform: translateY(0) rotateY(0);
    opacity: 1;
  }
}

.playing-card.red {
  color: #dc2626;
}

.playing-card.hidden {
  background: linear-gradient(135deg, #1a1a4e 0%, #0d0d2b 100%);
}

.playing-card.hidden::before {
  content: '🎰';
  font-size: 2rem;
}

.card-value {
  font-size: 1.5rem;
}

.card-suit {
  font-size: 1.25rem;
}

/* Result Display */
.result-display {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  background: rgba(0, 0, 0, 0.9);
  padding: var(--space-lg) var(--space-2xl);
  border-radius: var(--radius-xl);
  z-index: 10;
  animation: resultPop 0.4s ease;
}

.result-text {
  display: block;
  font-family: var(--font-display);
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: var(--space-sm);
}

.result-text.win, .result-text.blackjack {
  color: var(--color-accent-green);
}

.result-text.lose {
  color: var(--color-accent-red);
}

.result-text.push {
  color: var(--color-primary);
}

.result-amount {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}

/* Game Controls */
.game-controls {
  padding: var(--space-xl);
  background: var(--bg-tertiary);
  border-top: 1px solid var(--border-color);
}

.pregame-controls {
  display: flex;
  align-items: flex-end;
  gap: var(--space-lg);
}

.control-group {
  flex: 1;
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

.deal-btn {
  flex: 1;
}

.ingame-controls {
  display: flex;
  gap: var(--space-md);
  justify-content: center;
}

.action-btn {
  min-width: 120px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm);
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

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-sm);
}

.stat-item {
  padding: var(--space-sm);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  text-align: center;
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
  font-weight: 700;
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

.history-item.win, .history-item.blackjack {
  border-left: 3px solid var(--color-accent-green);
}

.history-item.lose {
  border-left: 3px solid var(--color-accent-red);
}

.history-item.push {
  border-left: 3px solid var(--color-primary);
}

/* Responsive */
@media (max-width: 1024px) {
  .game-page {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .pregame-controls {
    flex-direction: column;
    align-items: stretch;
  }
  
  .ingame-controls {
    flex-wrap: wrap;
  }
  
  .action-btn {
    flex: 1 1 45%;
    min-width: unset;
  }
  
  .playing-card {
    width: 50px;
    height: 70px;
    font-size: 1rem;
  }
  
  .card-value {
    font-size: 1rem;
  }
  
  .card-suit {
    font-size: 0.875rem;
  }
}
</style>
