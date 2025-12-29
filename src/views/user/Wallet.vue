<template>
  <div class="wallet-page">
    <div class="page-header">
      <h1>💰 Wallet</h1>
    </div>
    
    <!-- Balance Card -->
    <div class="balance-card glass-card">
      <div class="balance-main">
        <span class="balance-label">Available Balance</span>
        <span class="balance-amount">${{ formatNumber(balance) }}</span>
      </div>
      <div class="balance-actions">
        <button class="btn btn-primary" @click="activeTab = 'deposit'">Deposit</button>
        <button class="btn btn-secondary" @click="activeTab = 'withdraw'">Withdraw</button>
      </div>
    </div>
    
    <!-- Tabs -->
    <div class="tabs">
      <button class="tab" :class="{ active: activeTab === 'deposit' }" @click="activeTab = 'deposit'">Deposit</button>
      <button class="tab" :class="{ active: activeTab === 'withdraw' }" @click="activeTab = 'withdraw'">Withdraw</button>
      <button class="tab" :class="{ active: activeTab === 'history' }" @click="activeTab = 'history'">History</button>
    </div>
    
    <!-- Deposit Section -->
    <div class="section glass-card" v-if="activeTab === 'deposit'">
      <h3>Select Payment Method</h3>
      <div class="payment-methods">
        <button 
          v-for="method in paymentMethods" 
          :key="method.id"
          class="payment-method"
          :class="{ selected: selectedMethod === method.id }"
          @click="selectedMethod = method.id"
        >
          <span class="method-icon">{{ method.icon }}</span>
          <span class="method-name">{{ method.name }}</span>
          <span class="method-bonus" v-if="method.bonus">+{{ method.bonus }}%</span>
        </button>
      </div>
      
      <h3>Enter Amount</h3>
      <div class="amount-section">
        <div class="amount-input">
          <span class="currency">$</span>
          <input type="number" v-model.number="depositAmount" min="10" step="10" />
        </div>
        <div class="quick-amounts">
          <button v-for="amount in [50, 100, 250, 500, 1000]" :key="amount" @click="depositAmount = amount" class="quick-btn">
            ${{ amount }}
          </button>
        </div>
      </div>
      
      <div class="deposit-summary">
        <div class="summary-row">
          <span>Deposit Amount</span>
          <span>${{ depositAmount.toFixed(2) }}</span>
        </div>
        <div class="summary-row bonus" v-if="depositBonus > 0">
          <span>Bonus ({{ getSelectedMethod?.bonus }}%)</span>
          <span class="text-green">+${{ depositBonus.toFixed(2) }}</span>
        </div>
        <div class="summary-row total">
          <span>Total Credit</span>
          <span class="text-gold">${{ totalCredit.toFixed(2) }}</span>
        </div>
      </div>
      
      <button class="btn btn-primary btn-lg w-full" @click="processDeposit">
        Deposit ${{ depositAmount }}
      </button>
    </div>
    
    <!-- Withdraw Section -->
    <div class="section glass-card" v-if="activeTab === 'withdraw'">
      <h3>Withdraw To</h3>
      <div class="payment-methods">
        <button 
          v-for="method in withdrawMethods" 
          :key="method.id"
          class="payment-method"
          :class="{ selected: withdrawMethod === method.id }"
          @click="withdrawMethod = method.id"
        >
          <span class="method-icon">{{ method.icon }}</span>
          <span class="method-name">{{ method.name }}</span>
        </button>
      </div>
      
      <h3>Enter Amount</h3>
      <div class="amount-section">
        <div class="amount-input">
          <span class="currency">$</span>
          <input type="number" v-model.number="withdrawAmount" :max="balance" min="10" step="10" />
        </div>
        <button class="btn btn-ghost btn-sm" @click="withdrawAmount = balance">Max</button>
      </div>
      
      <div class="withdraw-info">
        <p>⏱️ Processing time: 1-24 hours</p>
        <p>💳 Minimum withdrawal: $10</p>
      </div>
      
      <button class="btn btn-primary btn-lg w-full" @click="processWithdraw" :disabled="withdrawAmount > balance || withdrawAmount < 10">
        Withdraw ${{ withdrawAmount }}
      </button>
    </div>
    
    <!-- History Section -->
    <div class="section glass-card" v-if="activeTab === 'history'">
      <h3>Transaction History</h3>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Type</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>
                <span class="tx-type" :class="tx.type">
                  {{ tx.type === 'deposit' ? '↓' : '↑' }} {{ tx.type }}
                </span>
              </td>
              <td :class="tx.type === 'deposit' ? 'text-green' : 'text-red'">
                {{ tx.type === 'deposit' ? '+' : '-' }}${{ Math.abs(tx.amount).toFixed(2) }}
              </td>
              <td>{{ tx.method || 'N/A' }}</td>
              <td>
                <span class="badge" :class="'badge-' + (tx.status === 'completed' ? 'green' : 'gold')">
                  {{ tx.status }}
                </span>
              </td>
              <td>{{ tx.date }}</td>
            </tr>
          </tbody>
        </table>
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

const activeTab = ref('deposit')
const selectedMethod = ref('btc')
const withdrawMethod = ref('btc')
const depositAmount = ref(100)
const withdrawAmount = ref(50)

const paymentMethods = [
  { id: 'btc', name: 'Bitcoin', icon: '₿', bonus: 10 },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ', bonus: 10 },
  { id: 'usdt', name: 'USDT', icon: '💲', bonus: 5 },
  { id: 'card', name: 'Card', icon: '💳', bonus: 0 },
  { id: 'bank', name: 'Bank', icon: '🏦', bonus: 0 }
]

const withdrawMethods = [
  { id: 'btc', name: 'Bitcoin', icon: '₿' },
  { id: 'eth', name: 'Ethereum', icon: 'Ξ' },
  { id: 'bank', name: 'Bank', icon: '🏦' }
]

const balance = computed(() => authStore.userBalance)
const transactions = computed(() => userStore.transactions.filter(t => t.type === 'deposit' || t.type === 'withdrawal'))

const getSelectedMethod = computed(() => paymentMethods.find(m => m.id === selectedMethod.value))

const depositBonus = computed(() => {
  const method = getSelectedMethod.value
  if (method?.bonus) {
    return depositAmount.value * (method.bonus / 100)
  }
  return 0
})

const totalCredit = computed(() => depositAmount.value + depositBonus.value)

function formatNumber(num) {
  return new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(num)
}

function processDeposit() {
  authStore.updateBalance(totalCredit.value)
  userStore.addTransaction({
    type: 'deposit',
    amount: totalCredit.value,
    method: getSelectedMethod.value?.name
  })
  userStore.addNotification({
    type: 'deposit',
    title: 'Deposit Successful',
    message: `$${totalCredit.value.toFixed(2)} has been added to your account`
  })
}

function processWithdraw() {
  if (withdrawAmount.value > balance.value) return
  authStore.updateBalance(-withdrawAmount.value)
  userStore.addTransaction({
    type: 'withdrawal',
    amount: -withdrawAmount.value,
    method: withdrawMethods.find(m => m.id === withdrawMethod.value)?.name,
    status: 'pending'
  })
}
</script>

<style scoped>
.wallet-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
  max-width: 800px;
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
}

/* Balance Card */
.balance-card {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xl);
}

.balance-main {
  display: flex;
  flex-direction: column;
}

.balance-label {
  font-size: 0.875rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

.balance-amount {
  font-family: var(--font-display);
  font-size: 3rem;
  font-weight: 800;
  color: var(--color-primary);
}

.balance-actions {
  display: flex;
  gap: var(--space-md);
}

/* Section */
.section {
  padding: var(--space-xl);
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.section h3 {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Payment Methods */
.payment-methods {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: var(--space-sm);
}

.payment-method {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--bg-glass);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
  position: relative;
}

.payment-method:hover,
.payment-method.selected {
  border-color: var(--color-primary);
  background: rgba(255, 215, 0, 0.05);
}

.method-icon {
  font-size: 1.5rem;
}

.method-name {
  font-size: 0.75rem;
  font-weight: 500;
}

.method-bonus {
  position: absolute;
  top: -8px;
  right: -8px;
  padding: 2px 6px;
  background: var(--color-accent-green);
  border-radius: var(--radius-full);
  font-size: 0.625rem;
  font-weight: 700;
  color: white;
}

/* Amount Section */
.amount-section {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.amount-input {
  display: flex;
  align-items: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 0 var(--space-md);
}

.currency {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-muted);
}

.amount-input input {
  padding: var(--space-md);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  width: 150px;
}

.quick-amounts {
  display: flex;
  gap: var(--space-sm);
}

.quick-btn {
  padding: var(--space-sm) var(--space-md);
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

/* Summary */
.deposit-summary {
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.summary-row {
  display: flex;
  justify-content: space-between;
  padding: var(--space-sm) 0;
}

.summary-row.total {
  border-top: 1px solid var(--border-color);
  margin-top: var(--space-sm);
  padding-top: var(--space-md);
  font-weight: 700;
  font-size: 1.125rem;
}

/* Withdraw Info */
.withdraw-info {
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.withdraw-info p {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-xs);
}

/* Transaction Type */
.tx-type {
  text-transform: capitalize;
}

.tx-type.deposit {
  color: var(--color-accent-green);
}

.tx-type.withdrawal {
  color: var(--color-accent-orange);
}

@media (max-width: 768px) {
  .balance-card {
    flex-direction: column;
    text-align: center;
    gap: var(--space-lg);
  }
  
  .payment-methods {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .amount-section {
    flex-direction: column;
    align-items: stretch;
  }
  
  .quick-amounts {
    flex-wrap: wrap;
  }
}
</style>
