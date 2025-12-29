<template>
  <div class="admin-finances">
    <div class="page-header">
      <h1>💵 Financial Reports</h1>
      <div class="header-actions">
        <select v-model="dateRange" class="input">
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="year">This Year</option>
        </select>
        <button class="btn btn-secondary">📥 Export</button>
      </div>
    </div>
    
    <!-- Overview Cards -->
    <div class="overview-cards">
      <div class="overview-card revenue">
        <div class="card-icon">💰</div>
        <div class="card-content">
          <span class="card-label">Total Revenue</span>
          <span class="card-value">${{ formatNumber(overview.revenue) }}</span>
          <span class="card-change positive">+15.2% vs last period</span>
        </div>
      </div>
      <div class="overview-card deposits">
        <div class="card-icon">📥</div>
        <div class="card-content">
          <span class="card-label">Total Deposits</span>
          <span class="card-value">${{ formatNumber(overview.deposits) }}</span>
          <span class="card-change positive">+8.5% vs last period</span>
        </div>
      </div>
      <div class="overview-card withdrawals">
        <div class="card-icon">📤</div>
        <div class="card-content">
          <span class="card-label">Total Withdrawals</span>
          <span class="card-value">${{ formatNumber(overview.withdrawals) }}</span>
          <span class="card-change negative">+12.3% vs last period</span>
        </div>
      </div>
      <div class="overview-card profit">
        <div class="card-icon">📈</div>
        <div class="card-content">
          <span class="card-label">Net Profit</span>
          <span class="card-value text-green">${{ formatNumber(overview.profit) }}</span>
          <span class="card-change positive">+18.7% vs last period</span>
        </div>
      </div>
    </div>
    
    <!-- Charts Section -->
    <div class="charts-section">
      <div class="chart-card glass-card">
        <h3>Revenue Breakdown</h3>
        <div class="breakdown-chart">
          <div v-for="item in revenueBreakdown" :key="item.name" class="breakdown-item">
            <div class="item-header">
              <span class="item-name">{{ item.name }}</span>
              <span class="item-value">${{ formatNumber(item.value) }}</span>
            </div>
            <div class="bar-container">
              <div class="bar-fill" :style="{ width: item.percentage + '%', background: item.color }"></div>
            </div>
          </div>
        </div>
      </div>
      <div class="chart-card glass-card">
        <h3>Payment Methods</h3>
        <div class="payment-chart">
          <div v-for="method in paymentMethods" :key="method.name" class="payment-item">
            <span class="method-icon">{{ method.icon }}</span>
            <span class="method-name">{{ method.name }}</span>
            <span class="method-value">${{ formatNumber(method.value) }}</span>
            <span class="method-percentage">{{ method.percentage }}%</span>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Transactions Table -->
    <div class="transactions-section glass-card">
      <div class="section-header">
        <h3>Recent Transactions</h3>
        <div class="filters">
          <select v-model="txFilter" class="input">
            <option value="">All Types</option>
            <option value="deposit">Deposits</option>
            <option value="withdrawal">Withdrawals</option>
          </select>
        </div>
      </div>
      <div class="table-container">
        <table class="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>User</th>
              <th>Type</th>
              <th>Method</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="tx in transactions" :key="tx.id">
              <td>#{{ tx.id }}</td>
              <td>{{ tx.user }}</td>
              <td>
                <span class="tx-type" :class="tx.type">{{ tx.type }}</span>
              </td>
              <td>{{ tx.method }}</td>
              <td :class="tx.type === 'deposit' ? 'text-green' : 'text-red'">
                {{ tx.type === 'deposit' ? '+' : '-' }}${{ formatNumber(tx.amount) }}
              </td>
              <td>
                <span class="badge" :class="'badge-' + getStatusColor(tx.status)">{{ tx.status }}</span>
              </td>
              <td>{{ tx.date }}</td>
              <td>
                <button class="btn btn-ghost btn-sm" v-if="tx.status === 'pending'">Approve</button>
                <button class="btn btn-ghost btn-sm">View</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const dateRange = ref('month')
const txFilter = ref('')

const overview = {
  revenue: 456789,
  deposits: 389456,
  withdrawals: 234567,
  profit: 154889
}

const revenueBreakdown = [
  { name: 'Crash', value: 125000, percentage: 35, color: 'var(--color-accent-green)' },
  { name: 'Dice', value: 89000, percentage: 25, color: 'var(--color-primary)' },
  { name: 'Slots', value: 71000, percentage: 20, color: 'var(--color-accent-purple)' },
  { name: 'Mines', value: 42000, percentage: 12, color: 'var(--color-accent-cyan)' },
  { name: 'Others', value: 28000, percentage: 8, color: 'var(--text-muted)' }
]

const paymentMethods = [
  { name: 'Bitcoin', icon: '₿', value: 185000, percentage: 48 },
  { name: 'Ethereum', icon: 'Ξ', value: 95000, percentage: 24 },
  { name: 'Card', icon: '💳', value: 65000, percentage: 17 },
  { name: 'Bank', icon: '🏦', value: 44456, percentage: 11 }
]

const transactions = [
  { id: 1001, user: 'HighRoller', type: 'deposit', method: 'Bitcoin', amount: 5000, status: 'completed', date: '2024-12-29 14:30' },
  { id: 1002, user: 'LuckyPlayer', type: 'withdrawal', method: 'Ethereum', amount: 2500, status: 'pending', date: '2024-12-29 14:25' },
  { id: 1003, user: 'ProGamer', type: 'deposit', method: 'Card', amount: 500, status: 'completed', date: '2024-12-29 14:20' },
  { id: 1004, user: 'NewUser', type: 'deposit', method: 'Bitcoin', amount: 100, status: 'completed', date: '2024-12-29 14:15' },
  { id: 1005, user: 'BigWinner', type: 'withdrawal', method: 'Bank', amount: 10000, status: 'pending', date: '2024-12-29 14:10' }
]

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

function getStatusColor(status) {
  const colors = { completed: 'green', pending: 'gold', failed: 'red' }
  return colors[status] || 'gray'
}
</script>

<style scoped>
.admin-finances {
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

.header-actions {
  display: flex;
  gap: var(--space-md);
}

.header-actions select {
  padding: var(--space-sm) var(--space-md);
}

.overview-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
}

.overview-card {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.card-icon {
  width: 56px;
  height: 56px;
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.75rem;
}

.overview-card.revenue .card-icon { background: rgba(255, 215, 0, 0.2); }
.overview-card.deposits .card-icon { background: rgba(16, 185, 129, 0.2); }
.overview-card.withdrawals .card-icon { background: rgba(239, 68, 68, 0.2); }
.overview-card.profit .card-icon { background: rgba(139, 92, 246, 0.2); }

.card-content {
  display: flex;
  flex-direction: column;
}

.card-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.card-value {
  font-family: var(--font-display);
  font-size: 1.75rem;
  font-weight: 700;
}

.card-change {
  font-size: 0.75rem;
}

.card-change.positive { color: var(--color-accent-green); }
.card-change.negative { color: var(--color-accent-red); }

.charts-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-lg);
}

.chart-card {
  padding: var(--space-xl);
}

.chart-card h3 {
  font-size: 1rem;
  margin-bottom: var(--space-lg);
}

.breakdown-item {
  margin-bottom: var(--space-md);
}

.item-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-xs);
  font-size: 0.875rem;
}

.item-value {
  font-weight: 600;
}

.bar-container {
  height: 8px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.bar-fill {
  height: 100%;
  border-radius: var(--radius-full);
}

.payment-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-bottom: 1px solid var(--border-color);
}

.payment-item:last-child {
  border-bottom: none;
}

.method-icon {
  font-size: 1.5rem;
}

.method-name {
  flex: 1;
}

.method-value {
  font-weight: 600;
}

.method-percentage {
  color: var(--text-muted);
  font-size: 0.875rem;
}

.transactions-section {
  padding: var(--space-xl);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-lg);
}

.section-header h3 {
  font-size: 1rem;
}

.filters select {
  padding: var(--space-sm) var(--space-md);
}

.tx-type {
  text-transform: capitalize;
}

.tx-type.deposit { color: var(--color-accent-green); }
.tx-type.withdrawal { color: var(--color-accent-red); }

@media (max-width: 1024px) {
  .overview-cards { grid-template-columns: repeat(2, 1fr); }
  .charts-section { grid-template-columns: 1fr; }
}

@media (max-width: 640px) {
  .overview-cards { grid-template-columns: 1fr; }
}
</style>
