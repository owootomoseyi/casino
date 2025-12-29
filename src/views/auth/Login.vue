<template>
  <div class="auth-page login-page">
    <div class="auth-card glass-card">
      <!-- Header -->
      <div class="auth-header">
        <Logo to="/" class="auth-logo" />
        <h1 class="auth-title">Welcome Back</h1>
        <p class="auth-subtitle">Sign in to continue playing</p>
      </div>
      
      <!-- Form -->
      <form @submit.prevent="handleLogin" class="auth-form">
        <div class="input-group">
          <label for="email">Email</label>
          <div class="input-with-icon">
            <span class="icon">📧</span>
            <input 
              id="email"
              type="email" 
              class="input" 
              v-model="email"
              placeholder="Enter your email"
              required
            />
          </div>
        </div>
        
        <div class="input-group">
          <label for="password">Password</label>
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input 
              id="password"
              :type="showPassword ? 'text' : 'password'" 
              class="input" 
              v-model="password"
              placeholder="Enter your password"
              required
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
        </div>
        
        <div class="form-options">
          <label class="checkbox-label">
            <input type="checkbox" v-model="rememberMe" />
            <span>Remember me</span>
          </label>
          <a href="#" class="forgot-link">Forgot password?</a>
        </div>
        
        <!-- Error Message -->
        <div class="error-message" v-if="error">
          <span>⚠️</span>
          {{ error }}
        </div>
        
        <!-- Submit Button -->
        <button 
          type="submit" 
          class="btn btn-primary btn-lg w-full"
          :disabled="loading"
        >
          <span v-if="loading" class="spinner">⏳</span>
          <span v-else>Sign In</span>
        </button>
      </form>
      
      <!-- Footer -->
      <div class="auth-footer">
        <span>Don't have an account?</span>
        <router-link to="/register" class="register-link">Create Account</router-link>
      </div>
      
      <!-- Admin Link -->
      <div class="admin-link">
        <router-link to="/admin/login">🛡️ Admin Portal</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../../stores/auth'
import Logo from '../../components/common/Logo.vue'

const router = useRouter()
const route = useRoute()
const authStore = useAuthStore()

// State
const email = ref('')
const password = ref('')
const showPassword = ref(false)
const rememberMe = ref(false)
const loading = ref(false)
const error = ref('')

// Methods
async function handleLogin() {
  error.value = ''
  loading.value = true
  
  try {
    const user = await authStore.login(email.value, password.value)
    
    if (user) {
      const redirect = route.query.redirect || '/'
      router.push(redirect)
    }
  } catch (err) {
    error.value = err.message || 'Invalid credentials'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-lg);
  background: radial-gradient(ellipse at top, var(--bg-secondary) 0%, var(--bg-primary) 100%);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: var(--space-2xl);
}

/* Header */
.auth-header {
  text-align: center;
  margin-bottom: var(--space-xl);
}

.logo {
  display: inline-flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-lg);
}

.logo-icon {
  width: 48px;
  height: 48px;
  background: var(--gradient-gold);
  border-radius: var(--radius-md);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: var(--font-display);
  font-weight: 800;
  font-size: 1.5rem;
  color: var(--bg-primary);
}

.logo-text {
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.25rem;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.auth-title {
  font-size: 1.75rem;
  font-weight: 800;
  margin-bottom: var(--space-xs);
}

.auth-subtitle {
  color: var(--text-secondary);
}

/* Form */
.auth-form {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.input-with-icon {
  position: relative;
}

.input-with-icon .icon {
  position: absolute;
  left: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
}

.input-with-icon .input {
  padding-left: 2.75rem;
  padding-right: 2.75rem;
}

.toggle-password {
  position: absolute;
  right: var(--space-md);
  top: 50%;
  transform: translateY(-50%);
  font-size: 1rem;
  color: var(--text-muted);
}

.form-options {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  accent-color: var(--color-primary);
}

.forgot-link {
  font-size: 0.875rem;
  color: var(--color-primary);
}

/* Error Message */
.error-message {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: var(--space-md);
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid var(--color-accent-red);
  border-radius: var(--radius-md);
  color: var(--color-accent-red);
  font-size: 0.875rem;
}

/* Spinner */
.spinner {
  animation: spin 1s linear infinite;
  display: inline-block;
}

/* Demo Credentials */
.demo-credentials {
  margin-top: var(--space-xl);
  padding: var(--space-md);
  background: var(--bg-glass);
  border-radius: var(--radius-md);
  text-align: center;
}

.demo-title {
  font-size: 0.75rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: var(--space-sm);
}

.demo-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 0.8125rem;
  color: var(--text-secondary);
}

/* Footer */
.auth-footer {
  margin-top: var(--space-xl);
  text-align: center;
  font-size: 0.9375rem;
  color: var(--text-secondary);
}

.register-link {
  color: var(--color-primary);
  font-weight: 600;
  margin-left: var(--space-sm);
}

/* Admin Link */
.admin-link {
  margin-top: var(--space-lg);
  text-align: center;
  padding-top: var(--space-lg);
  border-top: 1px solid var(--border-color);
}

.admin-link a {
  font-size: 0.875rem;
  color: var(--text-muted);
  transition: color var(--transition-fast);
}

.admin-link a:hover {
  color: var(--color-accent-purple);
}
</style>
