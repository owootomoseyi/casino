<template>
  <div class="auth-page register-page">
    <div class="auth-card glass-card">
      <!-- Header -->
      <div class="auth-header">
        <router-link to="/" class="logo">
          <div class="logo-icon">L</div>
          <span class="logo-text">QR72casino</span>
        </router-link>
        <h1 class="auth-title">Create Account</h1>
        <p class="auth-subtitle">Join us and claim your $1000 welcome bonus!</p>
      </div>
      
      <!-- Form -->
      <form @submit.prevent="handleRegister" class="auth-form">
        <div class="input-group">
          <label for="username">Username</label>
          <div class="input-with-icon">
            <span class="icon">👤</span>
            <input 
              id="username"
              type="text" 
              class="input" 
              v-model="username"
              placeholder="Choose a username"
              required
              minlength="3"
            />
          </div>
        </div>
        
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
              placeholder="Create a password"
              required
              minlength="6"
            />
            <button type="button" class="toggle-password" @click="showPassword = !showPassword">
              {{ showPassword ? '🙈' : '👁️' }}
            </button>
          </div>
          <!-- Password Strength -->
          <div class="password-strength">
            <div class="strength-bar">
              <div class="strength-fill" :style="{ width: passwordStrength.width }" :class="passwordStrength.class"></div>
            </div>
            <span class="strength-text" :class="passwordStrength.class">{{ passwordStrength.text }}</span>
          </div>
        </div>
        
        <div class="input-group">
          <label for="confirmPassword">Confirm Password</label>
          <div class="input-with-icon">
            <span class="icon">🔒</span>
            <input 
              id="confirmPassword"
              :type="showPassword ? 'text' : 'password'" 
              class="input" 
              v-model="confirmPassword"
              placeholder="Confirm your password"
              required
            />
          </div>
        </div>
        
        <!-- Terms -->
        <div class="terms-check">
          <label class="checkbox-label">
            <input type="checkbox" v-model="acceptTerms" required />
            <span>I agree to the <a href="#">Terms of Service</a> and <a href="#">Privacy Policy</a></span>
          </label>
        </div>
        
        <div class="age-check">
          <label class="checkbox-label">
            <input type="checkbox" v-model="ageVerified" required />
            <span>I confirm I am at least 18 years old</span>
          </label>
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
          :disabled="loading || !acceptTerms || !ageVerified"
        >
          <span v-if="loading" class="spinner">⏳</span>
          <span v-else>Create Account</span>
        </button>
      </form>
      
      <!-- Welcome Bonus -->
      <div class="welcome-bonus">
        <span class="bonus-icon">🎁</span>
        <div class="bonus-text">
          <span class="bonus-title">$1000 Welcome Bonus</span>
          <span class="bonus-subtitle">Claim after registration!</span>
        </div>
      </div>
      
      <!-- Footer -->
      <div class="auth-footer">
        <span>Already have an account?</span>
        <router-link to="/login" class="login-link">Sign In</router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

// State
const username = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const showPassword = ref(false)
const acceptTerms = ref(false)
const ageVerified = ref(false)
const loading = ref(false)
const error = ref('')

// Computed
const passwordStrength = computed(() => {
  const p = password.value
  if (p.length === 0) return { width: '0%', text: '', class: '' }
  if (p.length < 6) return { width: '25%', text: 'Weak', class: 'weak' }
  if (p.length < 8) return { width: '50%', text: 'Fair', class: 'fair' }
  if (p.length < 12 && /[A-Z]/.test(p) && /[0-9]/.test(p)) 
    return { width: '75%', text: 'Good', class: 'good' }
  if (p.length >= 12 && /[A-Z]/.test(p) && /[0-9]/.test(p) && /[^A-Za-z0-9]/.test(p))
    return { width: '100%', text: 'Strong', class: 'strong' }
  return { width: '50%', text: 'Fair', class: 'fair' }
})

// Methods
async function handleRegister() {
  error.value = ''
  
  // Validation
  if (password.value !== confirmPassword.value) {
    error.value = 'Passwords do not match'
    return
  }
  
  if (password.value.length < 6) {
    error.value = 'Password must be at least 6 characters'
    return
  }
  
  loading.value = true
  
  try {
    await authStore.register(username.value, email.value, password.value)
    router.push('/')
  } catch (err) {
    error.value = err.message
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

/* Password Strength */
.password-strength {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-top: var(--space-sm);
}

.strength-bar {
  flex: 1;
  height: 4px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
}

.strength-fill {
  height: 100%;
  border-radius: var(--radius-full);
  transition: all var(--transition-base);
}

.strength-fill.weak { background: var(--color-accent-red); }
.strength-fill.fair { background: var(--color-accent-orange); }
.strength-fill.good { background: var(--color-accent-cyan); }
.strength-fill.strong { background: var(--color-accent-green); }

.strength-text {
  font-size: 0.75rem;
  font-weight: 500;
}

.strength-text.weak { color: var(--color-accent-red); }
.strength-text.fair { color: var(--color-accent-orange); }
.strength-text.good { color: var(--color-accent-cyan); }
.strength-text.strong { color: var(--color-accent-green); }

/* Checkboxes */
.terms-check,
.age-check {
  margin-top: calc(var(--space-sm) * -1);
}

.checkbox-label {
  display: flex;
  align-items: flex-start;
  gap: var(--space-sm);
  font-size: 0.875rem;
  color: var(--text-secondary);
  cursor: pointer;
  line-height: 1.4;
}

.checkbox-label input {
  width: 16px;
  height: 16px;
  margin-top: 2px;
  accent-color: var(--color-primary);
}

.checkbox-label a {
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

/* Welcome Bonus */
.welcome-bonus {
  display: flex;
  align-items: center;
  gap: var(--space-md);
  margin-top: var(--space-xl);
  padding: var(--space-md);
  background: rgba(255, 215, 0, 0.1);
  border: 1px solid rgba(255, 215, 0, 0.3);
  border-radius: var(--radius-md);
}

.bonus-icon {
  font-size: 2rem;
}

.bonus-text {
  display: flex;
  flex-direction: column;
}

.bonus-title {
  font-weight: 700;
  color: var(--color-primary);
}

.bonus-subtitle {
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

.login-link {
  color: var(--color-primary);
  font-weight: 600;
  margin-left: var(--space-sm);
}
</style>
