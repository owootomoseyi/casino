<template>
  <div class="admin-players">
    <div class="page-header">
      <h1>👥 Player Management</h1>
      <button class="btn btn-primary" @click="showAddPlayer = true">+ Add Player</button>
    </div>
    
    <!-- Stats Overview -->
    <div class="stats-row">
      <div class="stat-card">
        <span class="stat-icon">👥</span>
        <div class="stat-content">
          <span class="stat-value">{{ players.length }}</span>
          <span class="stat-label">Total Players</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">✅</span>
        <div class="stat-content">
          <span class="stat-value text-green">{{ players.filter(p => p.status === 'active').length }}</span>
          <span class="stat-label">Active</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">💰</span>
        <div class="stat-content">
          <span class="stat-value text-gold">${{ formatNumber(totalBalance) }}</span>
          <span class="stat-label">Total Balances</span>
        </div>
      </div>
      <div class="stat-card">
        <span class="stat-icon">🎰</span>
        <div class="stat-content">
          <span class="stat-value">${{ formatNumber(totalWagered) }}</span>
          <span class="stat-label">Total Wagered</span>
        </div>
      </div>
    </div>
    
    <!-- Filters -->
    <div class="filters glass-card">
      <div class="search-input">
        <span>🔍</span>
        <input type="text" v-model="searchQuery" placeholder="Search by username, email, or ID..." />
      </div>
      <select v-model="statusFilter" class="input">
        <option value="">All Status</option>
        <option value="active">Active</option>
        <option value="suspended">Suspended</option>
        <option value="banned">Banned</option>
        <option value="pending">Pending Verification</option>
      </select>
      <select v-model="vipFilter" class="input">
        <option value="">All VIP Levels</option>
        <option v-for="i in 10" :key="i" :value="i">VIP {{ i }}</option>
      </select>
      <button class="btn btn-secondary" @click="exportPlayers">📥 Export</button>
    </div>
    
    <!-- Players Table -->
    <div class="table-container glass-card">
      <table class="table">
        <thead>
          <tr>
            <th><input type="checkbox" v-model="selectAll" @change="toggleSelectAll" /></th>
            <th>Player</th>
            <th>Balance</th>
            <th>VIP</th>
            <th>Wagered</th>
            <th>Profit/Loss</th>
            <th>Limits</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="player in filteredPlayers" :key="player.id" :class="{ 'row-selected': selectedPlayers.includes(player.id) }">
            <td><input type="checkbox" :value="player.id" v-model="selectedPlayers" /></td>
            <td>
              <div class="player-cell">
                <div class="avatar" :class="'avatar-' + player.status">{{ player.avatar }}</div>
                <div class="player-info">
                  <span class="player-name">{{ player.username }}</span>
                  <span class="player-email">{{ player.email }}</span>
                </div>
              </div>
            </td>
            <td class="text-gold font-bold">${{ formatNumber(player.balance) }}</td>
            <td><span class="vip-badge">👑 {{ player.vipLevel }}</span></td>
            <td>${{ formatNumber(player.totalWagered) }}</td>
            <td :class="player.profitLoss >= 0 ? 'text-green' : 'text-red'">
              {{ player.profitLoss >= 0 ? '+' : '' }}${{ formatNumber(player.profitLoss) }}
            </td>
            <td>
              <span class="limit-badge" :class="player.hasLimits ? 'has-limits' : ''">
                {{ player.hasLimits ? '⚠️ Active' : '—' }}
              </span>
            </td>
            <td>
              <span class="badge" :class="'badge-' + getStatusColor(player.status)">
                {{ player.status }}
              </span>
            </td>
            <td>
              <div class="action-buttons">
                <button class="btn btn-icon" @click="viewPlayer(player)" title="View Details">👁️</button>
                <button class="btn btn-icon" @click="editPlayer(player)" title="Edit Player">✏️</button>
                <button class="btn btn-icon" @click="adjustBalance(player)" title="Adjust Balance">💰</button>
                <button class="btn btn-icon" @click="openLimits(player)" title="Set Limits">⚙️</button>
                <button class="btn btn-icon danger" @click="openStatusModal(player)" title="Change Status">🚫</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- Bulk Actions -->
    <div class="bulk-actions" v-if="selectedPlayers.length > 0">
      <span>{{ selectedPlayers.length }} player(s) selected</span>
      <button class="btn btn-secondary btn-sm" @click="bulkAddBonus">🎁 Add Bonus</button>
      <button class="btn btn-secondary btn-sm" @click="bulkSendMessage">💬 Send Message</button>
      <button class="btn btn-danger btn-sm" @click="bulkSuspend">⏸️ Suspend All</button>
    </div>
    
    <!-- Pagination -->
    <div class="pagination">
      <button class="btn btn-ghost btn-sm">&lt; Prev</button>
      <span class="page-info">Page 1 of 10 ({{ filteredPlayers.length }} players)</span>
      <button class="btn btn-ghost btn-sm">Next &gt;</button>
    </div>
    
    <!-- View Player Modal -->
    <div class="modal-overlay" v-if="viewingPlayer" @click.self="viewingPlayer = null">
      <div class="modal modal-lg">
        <div class="modal-header">
          <h3>👤 Player Details - {{ viewingPlayer.username }}</h3>
          <button class="close-btn" @click="viewingPlayer = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="modal-tabs">
            <button :class="{ active: playerTab === 'overview' }" @click="playerTab = 'overview'">Overview</button>
            <button :class="{ active: playerTab === 'transactions' }" @click="playerTab = 'transactions'">Transactions</button>
            <button :class="{ active: playerTab === 'activity' }" @click="playerTab = 'activity'">Activity Log</button>
            <button :class="{ active: playerTab === 'notes' }" @click="playerTab = 'notes'">Admin Notes</button>
          </div>
          
          <!-- Overview Tab -->
          <div v-if="playerTab === 'overview'" class="tab-content">
            <div class="player-profile-header">
              <div class="avatar-xl">{{ viewingPlayer.avatar }}</div>
              <div class="profile-info">
                <h2>{{ viewingPlayer.username }}</h2>
                <p>{{ viewingPlayer.email }}</p>
                <span class="badge" :class="'badge-' + getStatusColor(viewingPlayer.status)">{{ viewingPlayer.status }}</span>
              </div>
            </div>
            
            <div class="stats-grid">
              <div class="stat-box">
                <span class="label">Balance</span>
                <span class="value text-gold">${{ formatNumber(viewingPlayer.balance) }}</span>
              </div>
              <div class="stat-box">
                <span class="label">Total Deposited</span>
                <span class="value">${{ formatNumber(viewingPlayer.totalDeposited) }}</span>
              </div>
              <div class="stat-box">
                <span class="label">Total Withdrawn</span>
                <span class="value">${{ formatNumber(viewingPlayer.totalWithdrawn) }}</span>
              </div>
              <div class="stat-box">
                <span class="label">Total Wagered</span>
                <span class="value">${{ formatNumber(viewingPlayer.totalWagered) }}</span>
              </div>
              <div class="stat-box">
                <span class="label">Total Won</span>
                <span class="value text-green">${{ formatNumber(viewingPlayer.totalWon) }}</span>
              </div>
              <div class="stat-box">
                <span class="label">Profit/Loss</span>
                <span class="value" :class="viewingPlayer.profitLoss >= 0 ? 'text-green' : 'text-red'">
                  {{ viewingPlayer.profitLoss >= 0 ? '+' : '' }}${{ formatNumber(viewingPlayer.profitLoss) }}
                </span>
              </div>
              <div class="stat-box">
                <span class="label">VIP Level</span>
                <span class="value">👑 Level {{ viewingPlayer.vipLevel }}</span>
              </div>
              <div class="stat-box">
                <span class="label">Member Since</span>
                <span class="value">{{ viewingPlayer.joinedDate }}</span>
              </div>
            </div>
            
            <!-- Spending Limits Section -->
            <div class="section-card">
              <h4>⚠️ Responsible Gaming Limits</h4>
              <div class="limits-grid">
                <div class="limit-item">
                  <span class="limit-label">Daily Deposit Limit</span>
                  <span class="limit-value">{{ viewingPlayer.limits?.dailyDeposit ? '$' + formatNumber(viewingPlayer.limits.dailyDeposit) : 'Not Set' }}</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">Weekly Deposit Limit</span>
                  <span class="limit-value">{{ viewingPlayer.limits?.weeklyDeposit ? '$' + formatNumber(viewingPlayer.limits.weeklyDeposit) : 'Not Set' }}</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">Monthly Deposit Limit</span>
                  <span class="limit-value">{{ viewingPlayer.limits?.monthlyDeposit ? '$' + formatNumber(viewingPlayer.limits.monthlyDeposit) : 'Not Set' }}</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">Loss Limit (Daily)</span>
                  <span class="limit-value">{{ viewingPlayer.limits?.dailyLoss ? '$' + formatNumber(viewingPlayer.limits.dailyLoss) : 'Not Set' }}</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">Wager Limit (Daily)</span>
                  <span class="limit-value">{{ viewingPlayer.limits?.dailyWager ? '$' + formatNumber(viewingPlayer.limits.dailyWager) : 'Not Set' }}</span>
                </div>
                <div class="limit-item">
                  <span class="limit-label">Session Time Limit</span>
                  <span class="limit-value">{{ viewingPlayer.limits?.sessionTime ? viewingPlayer.limits.sessionTime + ' hours' : 'Not Set' }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Transactions Tab -->
          <div v-if="playerTab === 'transactions'" class="tab-content">
            <table class="table table-compact">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="tx in playerTransactions" :key="tx.id">
                  <td>{{ tx.date }}</td>
                  <td>{{ tx.type }}</td>
                  <td :class="tx.type === 'deposit' ? 'text-green' : 'text-red'">
                    {{ tx.type === 'deposit' ? '+' : '-' }}${{ formatNumber(tx.amount) }}
                  </td>
                  <td>{{ tx.method }}</td>
                  <td><span class="badge" :class="'badge-' + getStatusColor(tx.status)">{{ tx.status }}</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <!-- Activity Log Tab -->
          <div v-if="playerTab === 'activity'" class="tab-content">
            <div class="activity-log">
              <div v-for="log in playerActivity" :key="log.id" class="log-item">
                <span class="log-icon">{{ log.icon }}</span>
                <div class="log-content">
                  <span class="log-action">{{ log.action }}</span>
                  <span class="log-time">{{ log.time }}</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Admin Notes Tab -->
          <div v-if="playerTab === 'notes'" class="tab-content">
            <div class="notes-list">
              <div v-for="note in playerNotes" :key="note.id" class="note-item">
                <div class="note-header">
                  <span class="note-author">{{ note.author }}</span>
                  <span class="note-date">{{ note.date }}</span>
                </div>
                <p class="note-content">{{ note.content }}</p>
              </div>
            </div>
            <div class="add-note">
              <textarea v-model="newNote" class="input" placeholder="Add a note about this player..." rows="3"></textarea>
              <button class="btn btn-primary" @click="addNote">Add Note</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- Edit Player Modal -->
    <div class="modal-overlay" v-if="editingPlayer" @click.self="editingPlayer = null">
      <div class="modal">
        <div class="modal-header">
          <h3>✏️ Edit Player</h3>
          <button class="close-btn" @click="editingPlayer = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="input-group">
            <label>Username</label>
            <input type="text" class="input" v-model="editForm.username" />
          </div>
          <div class="input-group">
            <label>Email</label>
            <input type="email" class="input" v-model="editForm.email" />
          </div>
          <div class="input-row">
            <div class="input-group">
              <label>VIP Level</label>
              <select class="input" v-model="editForm.vipLevel">
                <option v-for="i in 10" :key="i" :value="i">VIP {{ i }}</option>
              </select>
            </div>
            <div class="input-group">
              <label>Status</label>
              <select class="input" v-model="editForm.status">
                <option value="active">Active</option>
                <option value="suspended">Suspended</option>
                <option value="banned">Banned</option>
                <option value="pending">Pending</option>
              </select>
            </div>
          </div>
          <div class="input-group">
            <label>Admin Notes</label>
            <textarea class="input" v-model="editForm.notes" rows="3" placeholder="Internal notes about this player..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="editingPlayer = null">Cancel</button>
          <button class="btn btn-primary" @click="savePlayer">💾 Save Changes</button>
        </div>
      </div>
    </div>
    
    <!-- Balance Adjustment Modal -->
    <div class="modal-overlay" v-if="adjustingBalance" @click.self="adjustingBalance = null">
      <div class="modal">
        <div class="modal-header">
          <h3>💰 Adjust Balance - {{ adjustingBalance.username }}</h3>
          <button class="close-btn" @click="adjustingBalance = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="current-balance">
            <span>Current Balance:</span>
            <span class="text-gold font-bold">${{ formatNumber(adjustingBalance.balance) }}</span>
          </div>
          <div class="adjustment-type">
            <button 
              :class="{ active: balanceAction === 'add' }" 
              @click="balanceAction = 'add'"
              class="type-btn add"
            >
              ➕ Add Funds
            </button>
            <button 
              :class="{ active: balanceAction === 'remove' }" 
              @click="balanceAction = 'remove'"
              class="type-btn remove"
            >
              ➖ Remove Funds
            </button>
            <button 
              :class="{ active: balanceAction === 'set' }" 
              @click="balanceAction = 'set'"
              class="type-btn set"
            >
              🔄 Set Balance
            </button>
          </div>
          <div class="input-group">
            <label>Amount ($)</label>
            <input type="number" class="input input-lg" v-model.number="balanceAmount" min="0" step="0.01" />
          </div>
          <div class="input-group">
            <label>Reason (required)</label>
            <select class="input" v-model="balanceReason">
              <option value="">Select reason...</option>
              <option value="bonus">Bonus/Promotion</option>
              <option value="refund">Refund</option>
              <option value="correction">Balance Correction</option>
              <option value="manual_deposit">Manual Deposit</option>
              <option value="manual_withdrawal">Manual Withdrawal</option>
              <option value="chargeback">Chargeback</option>
              <option value="fraud">Fraud Investigation</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="input-group" v-if="balanceReason === 'other'">
            <label>Custom Reason</label>
            <input type="text" class="input" v-model="balanceCustomReason" placeholder="Enter reason..." />
          </div>
          <div class="preview-balance" v-if="balanceAmount > 0">
            <span>New Balance:</span>
            <span class="text-gold font-bold">${{ formatNumber(calculateNewBalance()) }}</span>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="adjustingBalance = null">Cancel</button>
          <button class="btn btn-primary" @click="confirmBalanceAdjust" :disabled="!balanceReason || balanceAmount <= 0">
            ✅ Confirm Adjustment
          </button>
        </div>
      </div>
    </div>
    
    <!-- Limits Modal -->
    <div class="modal-overlay" v-if="settingLimits" @click.self="settingLimits = null">
      <div class="modal">
        <div class="modal-header">
          <h3>⚙️ Set Limits - {{ settingLimits.username }}</h3>
          <button class="close-btn" @click="settingLimits = null">✕</button>
        </div>
        <div class="modal-body">
          <p class="limits-info">Set responsible gaming limits for this player. Leave blank to remove limit.</p>
          
          <h4>💵 Deposit Limits</h4>
          <div class="input-row">
            <div class="input-group">
              <label>Daily Deposit ($)</label>
              <input type="number" class="input" v-model.number="limitsForm.dailyDeposit" min="0" />
            </div>
            <div class="input-group">
              <label>Weekly Deposit ($)</label>
              <input type="number" class="input" v-model.number="limitsForm.weeklyDeposit" min="0" />
            </div>
            <div class="input-group">
              <label>Monthly Deposit ($)</label>
              <input type="number" class="input" v-model.number="limitsForm.monthlyDeposit" min="0" />
            </div>
          </div>
          
          <h4>📉 Loss & Wager Limits</h4>
          <div class="input-row">
            <div class="input-group">
              <label>Daily Loss Limit ($)</label>
              <input type="number" class="input" v-model.number="limitsForm.dailyLoss" min="0" />
            </div>
            <div class="input-group">
              <label>Daily Wager Limit ($)</label>
              <input type="number" class="input" v-model.number="limitsForm.dailyWager" min="0" />
            </div>
          </div>
          
          <h4>⏱️ Time Limits</h4>
          <div class="input-row">
            <div class="input-group">
              <label>Session Time (hours)</label>
              <input type="number" class="input" v-model.number="limitsForm.sessionTime" min="0" max="24" />
            </div>
            <div class="input-group">
              <label>Cooldown Period (hours)</label>
              <input type="number" class="input" v-model.number="limitsForm.cooldown" min="0" />
            </div>
          </div>
          
          <h4>🚫 Self-Exclusion</h4>
          <div class="input-group">
            <label>Self-Exclude Until</label>
            <input type="date" class="input" v-model="limitsForm.selfExcludeUntil" />
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-ghost" @click="clearAllLimits">Clear All Limits</button>
          <button class="btn btn-secondary" @click="settingLimits = null">Cancel</button>
          <button class="btn btn-primary" @click="saveLimits">💾 Save Limits</button>
        </div>
      </div>
    </div>
    
    <!-- Status Change Modal -->
    <div class="modal-overlay" v-if="changingStatus" @click.self="changingStatus = null">
      <div class="modal">
        <div class="modal-header">
          <h3>🚫 Change Status - {{ changingStatus.username }}</h3>
          <button class="close-btn" @click="changingStatus = null">✕</button>
        </div>
        <div class="modal-body">
          <div class="status-options">
            <button 
              v-for="status in ['active', 'suspended', 'banned']" 
              :key="status"
              :class="['status-btn', status, { active: newStatus === status }]"
              @click="newStatus = status"
            >
              <span class="status-icon">{{ status === 'active' ? '✅' : status === 'suspended' ? '⏸️' : '🚫' }}</span>
              <span class="status-label">{{ status.charAt(0).toUpperCase() + status.slice(1) }}</span>
            </button>
          </div>
          <div class="input-group" v-if="newStatus !== 'active'">
            <label>Reason (required)</label>
            <select class="input" v-model="statusReason">
              <option value="">Select reason...</option>
              <option value="fraud">Fraud/Suspicious Activity</option>
              <option value="abuse">Bonus Abuse</option>
              <option value="chargeback">Chargebacks</option>
              <option value="self_request">Player Request</option>
              <option value="verification">Verification Issues</option>
              <option value="multi_account">Multiple Accounts</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div class="input-group" v-if="newStatus === 'suspended'">
            <label>Duration</label>
            <select class="input" v-model="suspendDuration">
              <option value="24h">24 Hours</option>
              <option value="7d">7 Days</option>
              <option value="30d">30 Days</option>
              <option value="permanent">Permanent (until manual review)</option>
            </select>
          </div>
          <div class="input-group">
            <label>Notes</label>
            <textarea class="input" v-model="statusNotes" rows="3" placeholder="Add notes about this action..."></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button class="btn btn-secondary" @click="changingStatus = null">Cancel</button>
          <button 
            class="btn" 
            :class="newStatus === 'banned' ? 'btn-danger' : 'btn-primary'"
            @click="confirmStatusChange"
            :disabled="newStatus !== 'active' && !statusReason"
          >
            {{ newStatus === 'active' ? '✅ Activate' : newStatus === 'suspended' ? '⏸️ Suspend' : '🚫 Ban' }} Player
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Filters
const searchQuery = ref('')
const statusFilter = ref('')
const vipFilter = ref('')

// Selection
const selectAll = ref(false)
const selectedPlayers = ref([])

// Modals
const viewingPlayer = ref(null)
const editingPlayer = ref(null)
const adjustingBalance = ref(null)
const settingLimits = ref(null)
const changingStatus = ref(null)
const showAddPlayer = ref(false)

// Tabs
const playerTab = ref('overview')

// Edit Form
const editForm = ref({
  username: '',
  email: '',
  vipLevel: 1,
  status: 'active',
  notes: ''
})

// Balance Adjustment
const balanceAction = ref('add')
const balanceAmount = ref(0)
const balanceReason = ref('')
const balanceCustomReason = ref('')

// Limits Form
const limitsForm = ref({
  dailyDeposit: null,
  weeklyDeposit: null,
  monthlyDeposit: null,
  dailyLoss: null,
  dailyWager: null,
  sessionTime: null,
  cooldown: null,
  selfExcludeUntil: null
})

// Status Change
const newStatus = ref('active')
const statusReason = ref('')
const suspendDuration = ref('24h')
const statusNotes = ref('')

// Notes
const newNote = ref('')

// Sample Data
const players = ref([
  { 
    id: 1, username: 'HighRoller', email: 'high@test.com', avatar: 'H', 
    balance: 25000, vipLevel: 8, totalWagered: 150000, totalWon: 45000, 
    totalDeposited: 50000, totalWithdrawn: 20000, profitLoss: -5000,
    status: 'active', joinedDate: '2024-01-15', hasLimits: false,
    limits: {}
  },
  { 
    id: 2, username: 'LuckyPlayer', email: 'lucky@test.com', avatar: 'L', 
    balance: 5000, vipLevel: 4, totalWagered: 35000, totalWon: 12000, 
    totalDeposited: 10000, totalWithdrawn: 5000, profitLoss: 2000,
    status: 'active', joinedDate: '2024-03-20', hasLimits: true,
    limits: { dailyDeposit: 500, dailyLoss: 200 }
  },
  { 
    id: 3, username: 'NewUser123', email: 'new@test.com', avatar: 'N', 
    balance: 1000, vipLevel: 1, totalWagered: 2500, totalWon: 800, 
    totalDeposited: 1500, totalWithdrawn: 0, profitLoss: -200,
    status: 'active', joinedDate: '2024-12-01', hasLimits: false,
    limits: {}
  },
  { 
    id: 4, username: 'ProGambler', email: 'pro@test.com', avatar: 'P', 
    balance: 15000, vipLevel: 6, totalWagered: 85000, totalWon: 28000, 
    totalDeposited: 30000, totalWithdrawn: 15000, profitLoss: -2000,
    status: 'suspended', joinedDate: '2024-02-10', hasLimits: true,
    limits: { sessionTime: 4 }
  },
  { 
    id: 5, username: 'CheatUser', email: 'cheat@test.com', avatar: 'C', 
    balance: 0, vipLevel: 2, totalWagered: 5000, totalWon: 15000, 
    totalDeposited: 500, totalWithdrawn: 0, profitLoss: 10000,
    status: 'banned', joinedDate: '2024-06-05', hasLimits: false,
    limits: {}
  }
])

// Sample Transaction Data
const playerTransactions = ref([
  { id: 1, date: '2024-12-29', type: 'deposit', amount: 500, method: 'Bitcoin', status: 'completed' },
  { id: 2, date: '2024-12-28', type: 'withdrawal', amount: 200, method: 'Bank', status: 'pending' },
  { id: 3, date: '2024-12-27', type: 'deposit', amount: 1000, method: 'Card', status: 'completed' },
])

// Sample Activity Log
const playerActivity = ref([
  { id: 1, icon: '🎰', action: 'Played Crash - Won $245', time: '2 hours ago' },
  { id: 2, icon: '💰', action: 'Deposited $500 via Bitcoin', time: '5 hours ago' },
  { id: 3, icon: '🎲', action: 'Played Dice - Lost $50', time: '1 day ago' },
  { id: 4, icon: '🔐', action: 'Logged in from new device', time: '2 days ago' },
])

// Sample Notes
const playerNotes = ref([
  { id: 1, author: 'Admin', date: '2024-12-28', content: 'VIP player, handle with care.' },
  { id: 2, author: 'Support', date: '2024-12-25', content: 'Requested verification documents.' },
])

// Computed
const filteredPlayers = computed(() => {
  return players.value.filter(player => {
    if (searchQuery.value) {
      const query = searchQuery.value.toLowerCase()
      if (!player.username.toLowerCase().includes(query) && 
          !player.email.toLowerCase().includes(query) &&
          !player.id.toString().includes(query)) {
        return false
      }
    }
    if (statusFilter.value && player.status !== statusFilter.value) return false
    if (vipFilter.value && player.vipLevel !== parseInt(vipFilter.value)) return false
    return true
  })
})

const totalBalance = computed(() => players.value.reduce((sum, p) => sum + p.balance, 0))
const totalWagered = computed(() => players.value.reduce((sum, p) => sum + p.totalWagered, 0))

// Methods
function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}

function getStatusColor(status) {
  const colors = { active: 'green', suspended: 'gold', banned: 'red', pending: 'gray', completed: 'green' }
  return colors[status] || 'gray'
}

function toggleSelectAll() {
  if (selectAll.value) {
    selectedPlayers.value = filteredPlayers.value.map(p => p.id)
  } else {
    selectedPlayers.value = []
  }
}

function viewPlayer(player) {
  viewingPlayer.value = player
  playerTab.value = 'overview'
}

function editPlayer(player) {
  editingPlayer.value = player
  editForm.value = {
    username: player.username,
    email: player.email,
    vipLevel: player.vipLevel,
    status: player.status,
    notes: ''
  }
}

function savePlayer() {
  if (editingPlayer.value) {
    editingPlayer.value.username = editForm.value.username
    editingPlayer.value.email = editForm.value.email
    editingPlayer.value.vipLevel = editForm.value.vipLevel
    editingPlayer.value.status = editForm.value.status
    editingPlayer.value = null
  }
}

function adjustBalance(player) {
  adjustingBalance.value = player
  balanceAction.value = 'add'
  balanceAmount.value = 0
  balanceReason.value = ''
  balanceCustomReason.value = ''
}

function calculateNewBalance() {
  if (!adjustingBalance.value) return 0
  const current = adjustingBalance.value.balance
  switch (balanceAction.value) {
    case 'add': return current + balanceAmount.value
    case 'remove': return Math.max(0, current - balanceAmount.value)
    case 'set': return balanceAmount.value
    default: return current
  }
}

function confirmBalanceAdjust() {
  if (adjustingBalance.value && balanceReason.value) {
    adjustingBalance.value.balance = calculateNewBalance()
    adjustingBalance.value = null
  }
}

function openLimits(player) {
  settingLimits.value = player
  limitsForm.value = { ...player.limits }
}

function saveLimits() {
  if (settingLimits.value) {
    settingLimits.value.limits = { ...limitsForm.value }
    settingLimits.value.hasLimits = Object.values(limitsForm.value).some(v => v)
    settingLimits.value = null
  }
}

function clearAllLimits() {
  limitsForm.value = {
    dailyDeposit: null,
    weeklyDeposit: null,
    monthlyDeposit: null,
    dailyLoss: null,
    dailyWager: null,
    sessionTime: null,
    cooldown: null,
    selfExcludeUntil: null
  }
}

function openStatusModal(player) {
  changingStatus.value = player
  newStatus.value = player.status
  statusReason.value = ''
  statusNotes.value = ''
}

function confirmStatusChange() {
  if (changingStatus.value) {
    changingStatus.value.status = newStatus.value
    changingStatus.value = null
  }
}

function addNote() {
  if (newNote.value.trim()) {
    playerNotes.value.unshift({
      id: Date.now(),
      author: 'Admin',
      date: new Date().toISOString().split('T')[0],
      content: newNote.value
    })
    newNote.value = ''
  }
}

function exportPlayers() {
  console.log('Exporting players...')
}

function bulkAddBonus() {
  console.log('Adding bonus to:', selectedPlayers.value)
}

function bulkSendMessage() {
  console.log('Sending message to:', selectedPlayers.value)
}

function bulkSuspend() {
  console.log('Suspending:', selectedPlayers.value)
}
</script>

<style scoped>
.admin-players {
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

/* Stats Row */
.stats-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
}

.stat-card {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-lg);
  background: var(--bg-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.stat-icon {
  font-size: 2rem;
}

.stat-content {
  display: flex;
  flex-direction: column;
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}

.stat-label {
  font-size: 0.75rem;
  color: var(--text-muted);
  text-transform: uppercase;
}

/* Filters */
.filters {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-lg);
  flex-wrap: wrap;
}

.search-input {
  flex: 1;
  min-width: 200px;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0 var(--space-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
}

.search-input input {
  flex: 1;
  padding: var(--space-sm) 0;
  color: var(--text-primary);
}

.filters select {
  padding: var(--space-sm) var(--space-md);
  min-width: 140px;
}

/* Table */
.player-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.avatar-active { border: 2px solid var(--color-accent-green); }
.avatar-suspended { border: 2px solid var(--color-primary); }
.avatar-banned { border: 2px solid var(--color-accent-red); }

.player-info {
  display: flex;
  flex-direction: column;
}

.player-name {
  font-weight: 600;
}

.player-email {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0.25rem 0.5rem;
  background: rgba(255, 215, 0, 0.1);
  border-radius: var(--radius-sm);
  font-size: 0.8125rem;
  color: var(--color-primary);
}

.limit-badge {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.limit-badge.has-limits {
  color: var(--color-primary);
}

.action-buttons {
  display: flex;
  gap: 2px;
}

.btn-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  font-size: 1rem;
}

.btn-icon:hover {
  background: var(--bg-glass);
}

.btn-icon.danger:hover {
  background: rgba(239, 68, 68, 0.1);
}

.row-selected {
  background: rgba(255, 215, 0, 0.05);
}

/* Bulk Actions */
.bulk-actions {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-md) var(--space-lg);
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
}

/* Pagination */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: var(--space-lg);
}

.page-info {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Modal Large */
.modal-lg {
  max-width: 800px;
  width: 90%;
}

/* Modal Tabs */
.modal-tabs {
  display: flex;
  gap: var(--space-xs);
  margin-bottom: var(--space-xl);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: var(--space-md);
}

.modal-tabs button {
  padding: var(--space-sm) var(--space-md);
  border-radius: var(--radius-sm);
  color: var(--text-muted);
  transition: all var(--transition-fast);
}

.modal-tabs button.active {
  background: rgba(255, 215, 0, 0.1);
  color: var(--color-primary);
}

/* Player Profile Header */
.player-profile-header {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.avatar-xl {
  width: 80px;
  height: 80px;
  background: var(--gradient-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2rem;
  font-weight: 800;
  color: var(--bg-primary);
}

.profile-info h2 {
  margin-bottom: var(--space-xs);
}

.profile-info p {
  color: var(--text-muted);
  margin-bottom: var(--space-sm);
}

/* Stats Grid */
.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-md);
  margin-bottom: var(--space-xl);
}

.stat-box {
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  text-align: center;
}

.stat-box .label {
  display: block;
  font-size: 0.6875rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: var(--space-xs);
}

.stat-box .value {
  font-family: var(--font-display);
  font-size: 1.125rem;
  font-weight: 700;
}

/* Section Card */
.section-card {
  padding: var(--space-lg);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.section-card h4 {
  margin-bottom: var(--space-md);
}

.limits-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.limit-item {
  display: flex;
  flex-direction: column;
  gap: var(--space-xs);
}

.limit-label {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.limit-value {
  font-weight: 600;
}

/* Activity Log */
.activity-log {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.log-item {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  padding: var(--space-sm) 0;
  border-bottom: 1px solid var(--border-color);
}

.log-icon {
  font-size: 1.5rem;
}

.log-content {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.log-action {
  font-size: 0.9375rem;
}

.log-time {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Notes */
.notes-list {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.note-item {
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.note-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: var(--space-sm);
}

.note-author {
  font-weight: 600;
  font-size: 0.875rem;
}

.note-date {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.note-content {
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.add-note {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.add-note textarea {
  resize: vertical;
}

/* Balance Adjustment */
.current-balance {
  display: flex;
  justify-content: space-between;
  padding: var(--space-lg);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
  font-size: 1.25rem;
}

.adjustment-type {
  display: flex;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.type-btn {
  flex: 1;
  padding: var(--space-md);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  text-align: center;
  transition: all var(--transition-fast);
}

.type-btn.add.active {
  border-color: var(--color-accent-green);
  background: rgba(16, 185, 129, 0.1);
}

.type-btn.remove.active {
  border-color: var(--color-accent-red);
  background: rgba(239, 68, 68, 0.1);
}

.type-btn.set.active {
  border-color: var(--color-primary);
  background: rgba(255, 215, 0, 0.1);
}

.preview-balance {
  display: flex;
  justify-content: space-between;
  padding: var(--space-md);
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-md);
  font-size: 1.125rem;
}

/* Limits Modal */
.limits-info {
  color: var(--text-muted);
  margin-bottom: var(--space-lg);
}

.modal-body h4 {
  margin: var(--space-lg) 0 var(--space-md);
  font-size: 1rem;
}

.modal-body h4:first-child {
  margin-top: 0;
}

/* Status Change */
.status-options {
  display: flex;
  gap: var(--space-md);
  margin-bottom: var(--space-lg);
}

.status-btn {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-lg);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.status-btn.active.active {
  border-color: var(--color-accent-green);
  background: rgba(16, 185, 129, 0.1);
}

.status-btn.suspended.active {
  border-color: var(--color-primary);
  background: rgba(255, 215, 0, 0.1);
}

.status-btn.banned.active {
  border-color: var(--color-accent-red);
  background: rgba(239, 68, 68, 0.1);
}

.status-icon {
  font-size: 2rem;
}

.status-label {
  font-weight: 600;
}

.input-row {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-md);
}

.input-lg {
  font-size: 1.25rem;
  padding: var(--space-md);
}

.font-bold {
  font-weight: 700;
}

@media (max-width: 1024px) {
  .stats-row { grid-template-columns: repeat(2, 1fr); }
  .stats-grid { grid-template-columns: repeat(2, 1fr); }
  .limits-grid { grid-template-columns: repeat(2, 1fr); }
  .input-row { grid-template-columns: 1fr 1fr; }
  
  .modal-lg {
    max-width: 95%;
    margin: var(--space-md);
  }
}

@media (max-width: 768px) {
  .admin-players {
    gap: var(--space-md);
  }
  
  .page-header {
    flex-direction: column;
    gap: var(--space-md);
    align-items: stretch;
  }
  
  .page-header h1 {
    font-size: 1.5rem;
    text-align: center;
  }
  
  .page-header .btn {
    width: 100%;
  }
  
  .stats-row { 
    grid-template-columns: repeat(2, 1fr); 
    gap: var(--space-sm);
  }
  
  .stat-card {
    padding: var(--space-md);
    flex-direction: column;
    text-align: center;
  }
  
  .stat-value {
    font-size: 1.25rem;
  }
  
  .filters { 
    flex-direction: column; 
    padding: var(--space-md);
    gap: var(--space-sm);
  }
  
  .search-input {
    width: 100%;
  }
  
  .filters select {
    min-width: 100%;
  }
  
  /* Table scroll container */
  .table-container {
    overflow-x: auto;
    padding: var(--space-sm);
  }
  
  .table {
    min-width: 800px;
    font-size: 0.8125rem;
  }
  
  .table th,
  .table td {
    padding: var(--space-sm);
  }
  
  .player-info {
    max-width: 120px;
  }
  
  .player-email {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 100px;
  }
  
  .action-buttons {
    flex-wrap: wrap;
    gap: 4px;
  }
  
  .btn-icon {
    width: 28px;
    height: 28px;
    font-size: 0.875rem;
  }
  
  .bulk-actions {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm);
    text-align: center;
  }
  
  .pagination {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  /* Modals */
  .modal {
    margin: var(--space-sm);
    max-height: 90vh;
    overflow-y: auto;
  }
  
  .modal-lg {
    max-width: 100%;
    margin: var(--space-sm);
  }
  
  .modal-header {
    padding: var(--space-md);
  }
  
  .modal-header h3 {
    font-size: 1.125rem;
  }
  
  .modal-body {
    padding: var(--space-md);
  }
  
  .modal-footer {
    padding: var(--space-md);
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .modal-footer .btn {
    width: 100%;
  }
  
  .modal-tabs {
    flex-wrap: wrap;
    gap: var(--space-xs);
  }
  
  .modal-tabs button {
    flex: 1;
    min-width: 80px;
    font-size: 0.75rem;
    padding: var(--space-xs) var(--space-sm);
  }
  
  .player-profile-header {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-xl {
    width: 60px;
    height: 60px;
    font-size: 1.5rem;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: var(--space-sm);
  }
  
  .stat-box {
    padding: var(--space-sm);
  }
  
  .stat-box .value {
    font-size: 1rem;
  }
  
  .limits-grid {
    grid-template-columns: 1fr;
  }
  
  .input-row { 
    grid-template-columns: 1fr; 
  }
  
  .status-options { 
    flex-direction: column; 
  }
  
  .status-btn {
    flex-direction: row;
    justify-content: center;
    gap: var(--space-md);
    padding: var(--space-md);
  }
  
  .status-icon {
    font-size: 1.5rem;
  }
  
  /* Balance Modal */
  .adjustment-type {
    flex-direction: column;
    gap: var(--space-sm);
  }
  
  .type-btn {
    padding: var(--space-sm) var(--space-md);
  }
  
  .current-balance,
  .preview-balance {
    font-size: 1rem;
    padding: var(--space-md);
  }
  
  /* Activity Log */
  .log-item {
    padding: var(--space-sm) 0;
  }
  
  .log-icon {
    font-size: 1.25rem;
  }
  
  .log-action {
    font-size: 0.875rem;
  }
  
  /* Notes */
  .note-item {
    padding: var(--space-sm);
  }
  
  .add-note textarea {
    font-size: 1rem;
  }
}

@media (max-width: 480px) {
  .admin-players {
    gap: var(--space-sm);
  }
  
  .page-header h1 {
    font-size: 1.25rem;
  }
  
  .stats-row { 
    grid-template-columns: 1fr; 
  }
  
  .stat-card {
    flex-direction: row;
    justify-content: flex-start;
    text-align: left;
  }
  
  .stat-icon {
    font-size: 1.5rem;
  }
  
  .stat-value {
    font-size: 1.125rem;
  }
  
  .stat-label {
    font-size: 0.6875rem;
  }
  
  .table {
    font-size: 0.75rem;
  }
  
  .avatar {
    width: 28px;
    height: 28px;
    font-size: 0.75rem;
  }
  
  .vip-badge {
    font-size: 0.6875rem;
    padding: 2px 4px;
  }
  
  .badge {
    font-size: 0.625rem;
    padding: 2px 6px;
  }
  
  .btn-icon {
    width: 24px;
    height: 24px;
    font-size: 0.75rem;
  }
  
  .modal-header h3 {
    font-size: 1rem;
  }
  
  .stats-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-box .label {
    font-size: 0.625rem;
  }
  
  .stat-box .value {
    font-size: 0.9375rem;
  }
  
  .section-card {
    padding: var(--space-md);
  }
  
  .section-card h4 {
    font-size: 0.9375rem;
  }
  
  .limit-item {
    padding: var(--space-xs) 0;
    border-bottom: 1px solid var(--border-color);
  }
  
  .limit-label {
    font-size: 0.6875rem;
  }
  
  .limit-value {
    font-size: 0.875rem;
  }
  
  /* Input adjustments */
  .input-group label {
    font-size: 0.8125rem;
  }
  
  .input, select {
    font-size: 1rem;
    padding: var(--space-sm);
  }
  
  .input-lg {
    font-size: 1.125rem;
    padding: var(--space-sm);
  }
  
  /* Transaction table */
  .table-compact {
    font-size: 0.6875rem;
  }
  
  .table-compact th,
  .table-compact td {
    padding: var(--space-xs);
  }
}

/* Extra small devices */
@media (max-width: 360px) {
  .page-header h1 {
    font-size: 1.125rem;
  }
  
  .modal {
    margin: var(--space-xs);
  }
  
  .modal-header,
  .modal-body,
  .modal-footer {
    padding: var(--space-sm);
  }
  
  .stats-grid,
  .limits-grid {
    gap: var(--space-xs);
  }
  
  .status-btn {
    padding: var(--space-sm);
  }
  
  .status-icon {
    font-size: 1.25rem;
  }
  
  .status-label {
    font-size: 0.875rem;
  }
}
</style>
