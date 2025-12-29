<template>
  <div class="admin-settings">
    <div class="page-header">
      <h1>⚙️ Platform Settings</h1>
    </div>
    
    <div class="settings-grid">
      <!-- General Settings -->
      <section class="settings-section glass-card">
        <h2>🏠 General Settings</h2>
        <div class="settings-form">
          <div class="input-group">
            <label>Site Name</label>
            <input type="text" class="input" v-model="settings.siteName" />
          </div>
          <div class="input-group">
            <label>Site URL</label>
            <input type="url" class="input" v-model="settings.siteUrl" />
          </div>
          <div class="input-group">
            <label>Support Email</label>
            <input type="email" class="input" v-model="settings.supportEmail" />
          </div>
          <div class="input-group">
            <label>Default Currency</label>
            <select class="input" v-model="settings.currency">
              <option>USD</option>
              <option>EUR</option>
              <option>GBP</option>
              <option>BTC</option>
            </select>
          </div>
        </div>
      </section>
      
      <!-- Security Settings -->
      <section class="settings-section glass-card">
        <h2>🔒 Security Settings</h2>
        <div class="settings-form">
          <div class="toggle-group">
            <div class="toggle-info">
              <h4>Two-Factor Authentication</h4>
              <p>Require 2FA for all admin accounts</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.require2FA" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-group">
            <div class="toggle-info">
              <h4>IP Whitelist</h4>
              <p>Only allow admin access from specific IPs</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.ipWhitelist" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="toggle-group">
            <div class="toggle-info">
              <h4>Session Timeout</h4>
              <p>Auto-logout after inactivity</p>
            </div>
            <select class="input" v-model="settings.sessionTimeout">
              <option value="15">15 minutes</option>
              <option value="30">30 minutes</option>
              <option value="60">1 hour</option>
              <option value="120">2 hours</option>
            </select>
          </div>
        </div>
      </section>
      
      <!-- Payment Settings -->
      <section class="settings-section glass-card">
        <h2>💳 Payment Settings</h2>
        <div class="settings-form">
          <div class="input-group">
            <label>Minimum Deposit</label>
            <input type="number" class="input" v-model="settings.minDeposit" />
          </div>
          <div class="input-group">
            <label>Maximum Deposit</label>
            <input type="number" class="input" v-model="settings.maxDeposit" />
          </div>
          <div class="input-group">
            <label>Minimum Withdrawal</label>
            <input type="number" class="input" v-model="settings.minWithdrawal" />
          </div>
          <div class="input-group">
            <label>Maximum Withdrawal</label>
            <input type="number" class="input" v-model="settings.maxWithdrawal" />
          </div>
          <div class="toggle-group">
            <div class="toggle-info">
              <h4>Auto-Approve Withdrawals</h4>
              <p>Automatically approve withdrawals under limit</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.autoApprove" />
              <span class="toggle-slider"></span>
            </label>
          </div>
        </div>
      </section>
      
      <!-- Maintenance -->
      <section class="settings-section glass-card">
        <h2>🔧 Maintenance</h2>
        <div class="settings-form">
          <div class="toggle-group warning">
            <div class="toggle-info">
              <h4>Maintenance Mode</h4>
              <p>Disable all user access to the platform</p>
            </div>
            <label class="toggle">
              <input type="checkbox" v-model="settings.maintenanceMode" />
              <span class="toggle-slider"></span>
            </label>
          </div>
          <div class="input-group" v-if="settings.maintenanceMode">
            <label>Maintenance Message</label>
            <textarea class="input" rows="3" v-model="settings.maintenanceMessage"></textarea>
          </div>
          <div class="action-buttons">
            <button class="btn btn-secondary">Clear Cache</button>
            <button class="btn btn-secondary">Restart Services</button>
            <button class="btn btn-danger">Emergency Shutdown</button>
          </div>
        </div>
      </section>
    </div>
    
    <!-- Save Button -->
    <div class="save-section">
      <button class="btn btn-primary btn-lg" @click="saveSettings">💾 Save All Settings</button>
      <span class="last-saved">Last saved: {{ lastSaved }}</span>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'

const lastSaved = ref('2 minutes ago')

const settings = ref({
  siteName: 'QR72casino',
  siteUrl: 'https://qr72casino.com',
  supportEmail: 'support@qr72casino.com',
  currency: 'USD',
  require2FA: true,
  ipWhitelist: false,
  sessionTimeout: '30',
  minDeposit: 10,
  maxDeposit: 50000,
  minWithdrawal: 10,
  maxWithdrawal: 10000,
  autoApprove: true,
  maintenanceMode: false,
  maintenanceMessage: 'We are currently undergoing scheduled maintenance. Please check back soon.'
})

function saveSettings() {
  lastSaved.value = 'Just now'
  // Save logic here
}
</script>

<style scoped>
.admin-settings {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-lg);
}

.settings-section {
  padding: var(--space-xl);
}

.settings-section h2 {
  font-size: 1.125rem;
  margin-bottom: var(--space-lg);
}

.settings-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.toggle-group {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
}

.toggle-group.warning {
  border: 1px solid var(--color-accent-red);
  background: rgba(239, 68, 68, 0.05);
}

.toggle-info h4 {
  font-size: 0.9375rem;
  margin-bottom: 2px;
}

.toggle-info p {
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.toggle {
  position: relative;
  display: inline-block;
  width: 50px;
  height: 28px;
}

.toggle input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  position: absolute;
  cursor: pointer;
  inset: 0;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  transition: all var(--transition-fast);
}

.toggle-slider::before {
  position: absolute;
  content: "";
  height: 20px;
  width: 20px;
  left: 4px;
  bottom: 4px;
  background: white;
  border-radius: 50%;
  transition: all var(--transition-fast);
}

.toggle input:checked + .toggle-slider {
  background: var(--color-accent-green);
}

.toggle input:checked + .toggle-slider::before {
  transform: translateX(22px);
}

textarea.input {
  resize: vertical;
  min-height: 80px;
}

.action-buttons {
  display: flex;
  gap: var(--space-md);
}

.save-section {
  display: flex;
  align-items: center;
  gap: var(--space-lg);
  padding: var(--space-lg);
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-lg);
}

.last-saved {
  font-size: 0.875rem;
  color: var(--text-muted);
}

@media (max-width: 1024px) {
  .settings-grid { grid-template-columns: 1fr; }
}
</style>
