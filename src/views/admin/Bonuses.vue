<template>
  <div class="admin-bonuses">
    <div class="page-header">
      <h1>🎁 Bonus Management</h1>
      <button class="btn btn-primary" @click="showCreateModal = true">+ Create Bonus</button>
    </div>
    
    <!-- Active Promotions -->
    <section class="section">
      <h2>Active Promotions</h2>
      <div class="bonuses-grid">
        <div v-for="bonus in activeBonuses" :key="bonus.id" class="bonus-card glass-card">
          <div class="bonus-header">
            <span class="bonus-icon">{{ bonus.icon }}</span>
            <span class="badge badge-green">Active</span>
          </div>
          <h3>{{ bonus.name }}</h3>
          <p>{{ bonus.description }}</p>
          <div class="bonus-stats">
            <div class="stat">
              <span class="label">Claims</span>
              <span class="value">{{ bonus.claims }}</span>
            </div>
            <div class="stat">
              <span class="label">Total Value</span>
              <span class="value">${{ formatNumber(bonus.totalValue) }}</span>
            </div>
          </div>
          <div class="bonus-details">
            <span>Wagering: {{ bonus.wagering }}×</span>
            <span>Expires: {{ bonus.expires }}</span>
          </div>
          <div class="bonus-actions">
            <button class="btn btn-ghost btn-sm">Edit</button>
            <button class="btn btn-ghost btn-sm danger">Disable</button>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Scheduled Promotions -->
    <section class="section">
      <h2>Scheduled Promotions</h2>
      <div class="table-container glass-card">
        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Type</th>
              <th>Value</th>
              <th>Start Date</th>
              <th>End Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="promo in scheduledPromos" :key="promo.id">
              <td>{{ promo.name }}</td>
              <td>{{ promo.type }}</td>
              <td>{{ promo.value }}</td>
              <td>{{ promo.startDate }}</td>
              <td>{{ promo.endDate }}</td>
              <td>
                <button class="btn btn-ghost btn-sm">Edit</button>
                <button class="btn btn-ghost btn-sm danger">Cancel</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    
    <!-- Bonus Statistics -->
    <section class="section">
      <h2>📊 Bonus Statistics</h2>
      <div class="stats-grid">
        <div class="stat-card">
          <span class="stat-label">Total Bonuses Given</span>
          <span class="stat-value">${{ formatNumber(stats.totalGiven) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Wagering Generated</span>
          <span class="stat-value">${{ formatNumber(stats.wageringGenerated) }}</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Conversion Rate</span>
          <span class="stat-value">{{ stats.conversionRate }}%</span>
        </div>
        <div class="stat-card">
          <span class="stat-label">Net Cost</span>
          <span class="stat-value text-red">-${{ formatNumber(stats.netCost) }}</span>
        </div>
      </div>
    </section>
    
    <!-- Create Bonus Modal -->
    <div class="modal-overlay" v-if="showCreateModal" @click.self="showCreateModal = false">
      <div class="modal">
        <div class="modal-header">
          <h3>Create New Bonus</h3>
          <button class="close-btn" @click="showCreateModal = false">✕</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>Bonus Name</label>
            <input type="text" class="input" placeholder="e.g., Welcome Bonus" />
          </div>
          <div class="input-group">
            <label>Type</label>
            <select class="input">
              <option>Deposit Match</option>
              <option>Free Spins</option>
              <option>Cashback</option>
              <option>No Deposit</option>
            </select>
          </div>
          <div class="input-row">
            <div class="input-group">
              <label>Value</label>
              <input type="text" class="input" placeholder="100% or $50" />
            </div>
            <div class="input-group">
              <label>Wagering</label>
              <input type="number" class="input" placeholder="10" />
            </div>
          </div>
          <div class="input-row">
            <div class="input-group">
              <label>Min Deposit</label>
              <input type="number" class="input" placeholder="20" />
            </div>
            <div class="input-group">
              <label>Max Bonus</label>
              <input type="number" class="input" placeholder="500" />
            </div>
          </div>
          <div class="input-row">
            <div class="input-group">
              <label>Start Date</label>
              <input type="date" class="input" />
            </div>
            <div class="input-group">
              <label>End Date</label>
              <input type="date" class="input" />
            </div>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="showCreateModal = false">Cancel</button>
          <button class="btn btn-primary">Create Bonus</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const showCreateModal = ref(false)

const activeBonuses = ref([
  { id: 1, name: 'Welcome Bonus', description: '100% deposit match up to $1000', icon: '🎁', claims: 1250, totalValue: 125000, wagering: 10, expires: 'Ongoing' },
  { id: 2, name: 'Weekend Reload', description: '50% bonus every weekend', icon: '🔄', claims: 450, totalValue: 22500, wagering: 15, expires: 'Weekly' },
  { id: 3, name: 'Free Spins Friday', description: '50 free spins on Lucky Slots', icon: '🎰', claims: 890, totalValue: 8900, wagering: 5, expires: 'Weekly' }
])

const scheduledPromos = ref([
  { id: 1, name: 'New Year Blast', type: 'Deposit Match', value: '200%', startDate: '2025-01-01', endDate: '2025-01-07' },
  { id: 2, name: 'Valentine Special', type: 'Cashback', value: '20%', startDate: '2025-02-14', endDate: '2025-02-15' }
])

const stats = {
  totalGiven: 156450,
  wageringGenerated: 1564500,
  conversionRate: 68,
  netCost: 45000
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}
</script>

<style scoped>
.admin-bonuses {
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

.section h2 {
  font-size: 1.25rem;
  margin-bottom: var(--space-lg);
}

.bonuses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.bonus-card {
  padding: var(--space-lg);
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.bonus-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.bonus-icon {
  font-size: 2rem;
}

.bonus-card h3 {
  font-size: 1.125rem;
}

.bonus-card p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.bonus-stats {
  display: flex;
  gap: var(--space-lg);
}

.bonus-stats .stat {
  display: flex;
  flex-direction: column;
}

.bonus-stats .label {
  font-size: 0.6875rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.bonus-stats .value {
  font-family: var(--font-display);
  font-weight: 700;
}

.bonus-details {
  display: flex;
  gap: var(--space-lg);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.bonus-actions {
  display: flex;
  gap: var(--space-sm);
  margin-top: auto;
}

.danger {
  color: var(--color-accent-red);
}

.stats-grid {
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

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-md);
}

.close-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .bonuses-grid { grid-template-columns: repeat(2, 1fr); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
}

@media (max-width: 640px) {
  .bonuses-grid { grid-template-columns: 1fr; }
  .stats-grid { grid-template-columns: 1fr; }
}
</style>
