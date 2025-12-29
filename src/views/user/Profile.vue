<template>
  <div class="profile-page">
    <div class="page-header">
      <h1>👤 My Profile</h1>
    </div>
    
    <div class="profile-grid">
      <!-- Profile Card -->
      <div class="profile-card glass-card">
        <div class="avatar-section">
          <div class="avatar-large">{{ user?.avatar || 'U' }}</div>
          <button class="btn btn-ghost btn-sm">Change Avatar</button>
        </div>
        <div class="profile-info">
          <h2>{{ user?.username }}</h2>
          <p class="email">{{ user?.email }}</p>
          <div class="vip-badge">
            <span class="vip-icon">👑</span>
            <span>VIP Level {{ user?.vipLevel }}</span>
          </div>
          <p class="member-since">Member since {{ user?.createdAt }}</p>
        </div>
      </div>
      
      <!-- Stats Cards -->
      <div class="stats-section">
        <div class="stat-card">
          <span class="stat-icon">💰</span>
          <div class="stat-content">
            <span class="stat-label">Balance</span>
            <span class="stat-value text-gold">${{ formatNumber(user?.balance || 0) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🎮</span>
          <div class="stat-content">
            <span class="stat-label">Games Played</span>
            <span class="stat-value">{{ formatNumber(stats.gamesPlayed) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">🏆</span>
          <div class="stat-content">
            <span class="stat-label">Total Won</span>
            <span class="stat-value text-green">${{ formatNumber(stats.totalWon) }}</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="stat-icon">📈</span>
          <div class="stat-content">
            <span class="stat-label">Win Rate</span>
            <span class="stat-value">{{ stats.winRate }}%</span>
          </div>
        </div>
      </div>
      
      <!-- Settings Section -->
      <div class="settings-section glass-card">
        <h3>Account Settings</h3>
        <div class="settings-form">
          <div class="input-group">
            <label>Username</label>
            <input type="text" class="input" :value="user?.username" />
          </div>
          <div class="input-group">
            <label>Email</label>
            <input type="email" class="input" :value="user?.email" />
          </div>
          <div class="input-group">
            <label>Current Password</label>
            <input type="password" class="input" placeholder="Enter current password" />
          </div>
          <div class="input-group">
            <label>New Password</label>
            <input type="password" class="input" placeholder="Enter new password" />
          </div>
          <button class="btn btn-primary">Save Changes</button>
        </div>
      </div>
      
      <!-- Security Section -->
      <div class="security-section glass-card">
        <h3>Security</h3>
        <div class="security-options">
          <div class="security-item">
            <div class="security-info">
              <span class="security-icon">🔐</span>
              <div>
                <h4>Two-Factor Authentication</h4>
                <p>Add an extra layer of security</p>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm">Enable</button>
          </div>
          <div class="security-item">
            <div class="security-info">
              <span class="security-icon">📧</span>
              <div>
                <h4>Email Verification</h4>
                <p>Your email is verified</p>
              </div>
            </div>
            <span class="badge badge-green">Verified</span>
          </div>
          <div class="security-item">
            <div class="security-info">
              <span class="security-icon">📱</span>
              <div>
                <h4>Phone Verification</h4>
                <p>Add a phone number for recovery</p>
              </div>
            </div>
            <button class="btn btn-secondary btn-sm">Add</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const user = computed(() => authStore.currentUser)

const stats = {
  gamesPlayed: 1234,
  totalWon: 15678,
  winRate: 48.5
}

function formatNumber(num) {
  return new Intl.NumberFormat('en-US').format(num)
}
</script>

<style scoped>
.profile-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
}

.profile-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: var(--space-xl);
}

/* Profile Card */
.profile-card {
  padding: var(--space-xl);
  text-align: center;
  height: fit-content;
}

.avatar-section {
  margin-bottom: var(--space-lg);
}

.avatar-large {
  width: 100px;
  height: 100px;
  background: var(--gradient-gold);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  font-weight: 800;
  color: var(--bg-primary);
  margin: 0 auto var(--space-md);
}

.profile-info h2 {
  font-size: 1.5rem;
  margin-bottom: var(--space-xs);
}

.email {
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.vip-badge {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-sm) var(--space-md);
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid var(--color-primary);
  border-radius: var(--radius-full);
  color: var(--color-primary);
  font-weight: 600;
  margin-bottom: var(--space-md);
}

.member-since {
  font-size: 0.875rem;
  color: var(--text-muted);
}

/* Stats Section */
.stats-section {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-md);
  grid-column: 2;
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

.stat-label {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
}

.stat-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
}

/* Settings Section */
.settings-section,
.security-section {
  padding: var(--space-xl);
  grid-column: 1 / -1;
}

.settings-section h3,
.security-section h3 {
  font-size: 1.125rem;
  margin-bottom: var(--space-lg);
}

.settings-form {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
  max-width: 600px;
}

.settings-form .btn {
  grid-column: 1 / -1;
  width: fit-content;
}

/* Security Section */
.security-options {
  display: flex;
  flex-direction: column;
  gap: var(--space-md);
}

.security-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.security-info {
  display: flex;
  align-items: center;
  gap: var(--space-md);
}

.security-icon {
  font-size: 1.5rem;
}

.security-info h4 {
  font-size: 0.9375rem;
  margin-bottom: 2px;
}

.security-info p {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

@media (max-width: 768px) {
  .profile-grid {
    grid-template-columns: 1fr;
  }
  
  .stats-section {
    grid-column: 1;
  }
  
  .settings-form {
    grid-template-columns: 1fr;
  }
}
</style>
