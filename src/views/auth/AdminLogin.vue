<template>
  <div class="admin-login-page">
    <div class="login-container">
      <div class="login-card glass-card">
        <!-- Admin Logo -->
        <div class="logo-section">
          <div class="admin-badge">
            <span class="shield">🛡️</span>
            <span class="crown">👑</span>
          </div>
          <h1>Admin Portal</h1>
          <p>QR72casino Management System</p>
        </div>
        
        <!-- Login Form -->
        <form @submit.prevent="handleLogin" class="login-form">
          <div class="input-group">
            <label for="email">Admin Email</label>
            <div class="input-wrapper">
              <span class="input-icon">📧</span>
              <input 
                type="email" 
                id="email" 
                v-model="email" 
                class="input"
                placeholder="admin@qr72casino.com"
                required
              />
            </div>
          </div>
          
          <div class="input-group">
            <label for="password">Password</label>
            <div class="input-wrapper">
              <span class="input-icon">🔒</span>
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password" 
                class="input"
                placeholder="Enter your password"
                required
              />
              <button type="button" class="toggle-password" @click="showPassword = !showPassword">
                {{ showPassword ? '👁️' : '👁️‍🗨️' }}
              </button>
            </div>
          </div>
          
          <div class="error-message" v-if="error">
            <span>⚠️</span> {{ error }}
          </div>
          
          <button type="submit" class="btn btn-primary btn-lg w-full" :disabled="loading">
            <span v-if="loading" class="spinner">⏳</span>
            <span v-else>🔐 Secure Login</span>
          </button>
        </form>
        
        <!-- Security Notice -->
        <div class="security-notice">
          <span>🔒</span>
          <p>This is a secure admin area. All activities are logged and monitored.</p>
        </div>
        
        <!-- Back to Main Site -->
        <div class="back-link">
          <router-link to="/">← Back to Main Site</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const showPassword = ref(false)
const loading = ref(false)
const error = ref('')

async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    const user = await authStore.login(email.value, password.value, true)
    
    if (user && authStore.isAdmin) {
      router.push('/admin')
    } else if (user) {
      error.value = 'Access denied. Admin credentials required.'
      authStore.logout()
    }
  } catch (err) {
    error.value = err.message || 'Invalid credentials'
  }
  
  loading.value = false
}
</script>

<style scoped>
.admin-login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl);
  background: 
    radial-gradient(ellipse at top, rgba(139, 92, 246, 0.15) 0%, transparent 50%),
    radial-gradient(ellipse at bottom, rgba(6, 182, 212, 0.1) 0%, transparent 50%),
    var(--bg-primary);
}

.login-container {
  width: 100%;
  max-width: 440px;
}

.login-card {
  padding: var(--space-2xl);
}

/* Logo Section */
.logo-section {
  text-align: center;
  margin-bottom: var(--space-2xl);
}

.admin-badge {
  position: relative;
  display: inline-block;
  margin-bottom: var(--space-md);
}

.admin-badge .shield {
  font-size: 4rem;
  display: block;
}

.admin-badge .crown {
  position: absolute;
  top: -10px;
  right: -10px;
  font-size: 1.5rem;
}

.logo-section h1 {
  font-family: var(--font-display);
  font-size: 1.75rem;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: var(--space-xs);
}

.logo-section p {
  color: var(--text-muted);
  font-size: 0.875rem;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
  margin-bottom: var(--space-xl);
}

.input-group label {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  margin-bottom: var(--space-sm);
  color: var(--text-secondary);
}

.input-wrapper {
  display: flex;
  align-items: center;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  transition: all var(--transition-fast);
}

.input-wrapper:focus-within {
  border-color: var(--color-primary);
  box-shadow: 0 0 0 3px rgba(255, 215, 0, 0.1);
}

.input-icon {
  padding: 0 var(--space-md);
  font-size: 1.25rem;
}

.input-wrapper .input {
  flex: 1;
  padding: var(--space-md);
  padding-left: 0;
  background: transparent;
  border: none;
  color: var(--text-primary);
}

.input-wrapper .input:focus {
  outline: none;
  box-shadow: none;
}

.toggle-password {
  padding: var(--space-md);
  color: var(--text-muted);
  cursor: pointer;
}

.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: var(--radius-md);
  color: var(--color-accent-red);
  font-size: 0.875rem;
}

.spinner {
  animation: spin 1s linear infinite;
}

/* Demo Credentials */
.demo-credentials {
  padding: var(--space-lg);
  background: rgba(139, 92, 246, 0.1);
  border: 1px solid rgba(139, 92, 246, 0.3);
  border-radius: var(--radius-md);
  text-align: center;
  margin-bottom: var(--space-lg);
}

.demo-credentials h4 {
  font-size: 0.875rem;
  margin-bottom: var(--space-md);
  color: var(--color-accent-purple);
}

.credentials-box {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
}

.credentials-box p {
  margin-bottom: 2px;
}

/* Security Notice */
.security-notice {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  margin-bottom: var(--space-lg);
}

.security-notice p {
  font-size: 0.75rem;
  color: var(--text-muted);
}

/* Back Link */
.back-link {
  text-align: center;
}

.back-link a {
  font-size: 0.875rem;
  color: var(--text-secondary);
  transition: color var(--transition-fast);
}

.back-link a:hover {
  color: var(--color-primary);
}

@media (max-width: 480px) {
  .login-card {
    padding: var(--space-xl);
  }
}
</style>
