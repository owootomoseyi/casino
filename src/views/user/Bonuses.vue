<template>
  <div class="bonuses-page">
    <div class="page-header">
      <h1>🎁 Bonuses & Promotions</h1>
    </div>
    
    <!-- Active Bonuses -->
    <section class="section">
      <h2>Active Bonuses</h2>
      <div class="bonuses-grid">
        <div v-for="bonus in activeBonuses" :key="bonus.id" class="bonus-card glass-card active">
          <div class="bonus-icon">{{ bonus.icon }}</div>
          <div class="bonus-content">
            <h3>{{ bonus.name }}</h3>
            <p>{{ bonus.description }}</p>
            <div class="bonus-progress" v-if="bonus.wagering">
              <div class="progress-bar">
                <div class="progress" :style="{ width: bonus.progress + '%' }"></div>
              </div>
              <span class="progress-text">{{ bonus.progress }}% wagered ({{ bonus.wagering }}× required)</span>
            </div>
            <div class="bonus-footer">
              <span class="expires">Expires: {{ bonus.expires }}</span>
              <span class="value text-gold">{{ bonus.value }}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Available Bonuses -->
    <section class="section">
      <h2>Available Bonuses</h2>
      <div class="bonuses-grid">
        <div v-for="bonus in availableBonuses" :key="bonus.id" class="bonus-card glass-card">
          <div class="bonus-icon">{{ bonus.icon }}</div>
          <div class="bonus-content">
            <h3>{{ bonus.name }}</h3>
            <p>{{ bonus.description }}</p>
            <div class="bonus-terms">
              <span>Min Deposit: ${{ bonus.minDeposit }}</span>
              <span>Wagering: {{ bonus.wagering }}×</span>
            </div>
            <div class="bonus-footer">
              <span class="value text-gold">{{ bonus.value }}</span>
              <button class="btn btn-primary btn-sm" @click="claimBonus(bonus)">Claim</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- VIP Program -->
    <section class="section">
      <h2>👑 VIP Program</h2>
      <div class="vip-section glass-card">
        <div class="vip-header">
          <div class="vip-level">
            <span class="level-badge">Level {{ currentLevel }}</span>
            <h3>{{ vipLevels[currentLevel - 1]?.name }}</h3>
          </div>
          <div class="vip-progress">
            <div class="progress-bar large">
              <div class="progress" :style="{ width: vipProgress + '%' }"></div>
            </div>
            <span>{{ vipPoints }} / {{ nextLevelPoints }} points to Level {{ currentLevel + 1 }}</span>
          </div>
        </div>
        <div class="vip-levels">
          <div 
            v-for="(level, index) in vipLevels" 
            :key="index"
            class="vip-level-card"
            :class="{ current: index + 1 === currentLevel, unlocked: index + 1 <= currentLevel }"
          >
            <span class="level-number">{{ index + 1 }}</span>
            <span class="level-name">{{ level.name }}</span>
            <span class="level-bonus">{{ level.bonus }}</span>
          </div>
        </div>
      </div>
    </section>
    
    <!-- Daily Rewards -->
    <section class="section">
      <h2>🎯 Daily Rewards</h2>
      <div class="daily-rewards glass-card">
        <div 
          v-for="day in 7" 
          :key="day"
          class="day-reward"
          :class="{ claimed: day <= claimedDays, today: day === claimedDays + 1 }"
        >
          <span class="day-label">Day {{ day }}</span>
          <span class="day-reward-value">{{ getDailyReward(day) }}</span>
          <span class="checkmark" v-if="day <= claimedDays">✓</span>
        </div>
        <button 
          class="btn btn-primary claim-daily"
          @click="claimDaily"
          :disabled="dailyClaimed"
        >
          {{ dailyClaimed ? 'Come Back Tomorrow' : 'Claim Daily Reward' }}
        </button>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuthStore } from '../../stores/auth'
import { useUserStore } from '../../stores/user'

const authStore = useAuthStore()
const userStore = useUserStore()

const currentLevel = ref(3)
const vipPoints = ref(2500)
const nextLevelPoints = ref(5000)
const vipProgress = computed(() => (vipPoints.value / nextLevelPoints.value) * 100)
const claimedDays = ref(3)
const dailyClaimed = ref(false)

const activeBonuses = ref([
  { id: 1, name: 'Welcome Bonus', description: 'Your signup bonus is active!', value: '$1,000', icon: '🎁', wagering: 10, progress: 35, expires: 'Jan 15, 2025' },
  { id: 2, name: 'Free Spins', description: '50 free spins on Lucky Slots', value: '50 Spins', icon: '🎰', wagering: 5, progress: 60, expires: 'Jan 5, 2025' }
])

const availableBonuses = ref([
  { id: 3, name: 'First Deposit', description: '100% match on your first deposit', value: 'Up to $500', icon: '💰', minDeposit: 20, wagering: 20 },
  { id: 4, name: 'Reload Bonus', description: '50% bonus on your next deposit', value: 'Up to $200', icon: '🔄', minDeposit: 50, wagering: 15 },
  { id: 5, name: 'Weekend Special', description: 'Extra 25% every weekend', value: 'Up to $100', icon: '🎉', minDeposit: 25, wagering: 10 }
])

const vipLevels = [
  { name: 'Bronze', bonus: '5% Cashback' },
  { name: 'Silver', bonus: '7% Cashback' },
  { name: 'Gold', bonus: '10% Cashback' },
  { name: 'Platinum', bonus: '12% Cashback' },
  { name: 'Diamond', bonus: '15% Cashback' }
]

function getDailyReward(day) {
  const rewards = ['$5', '$10', '$15', '$25', '$50', '$75', '$100']
  return rewards[day - 1]
}

function claimBonus(bonus) {
  activeBonuses.value.push({ ...bonus, progress: 0, expires: 'Jan 20, 2025' })
  availableBonuses.value = availableBonuses.value.filter(b => b.id !== bonus.id)
}

function claimDaily() {
  if (dailyClaimed.value) return
  dailyClaimed.value = true
  claimedDays.value++
  const reward = parseInt(getDailyReward(claimedDays.value).replace('$', ''))
  authStore.updateBalance(reward)
  userStore.addNotification({
    type: 'bonus',
    title: 'Daily Reward Claimed!',
    message: `You received $${reward}`
  })
}
</script>

<style scoped>
.bonuses-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-2xl);
}

.page-header h1 {
  font-size: 1.75rem;
  font-weight: 800;
}

.section h2 {
  font-size: 1.25rem;
  margin-bottom: var(--space-lg);
}

/* Bonuses Grid */
.bonuses-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.bonus-card {
  padding: var(--space-lg);
  display: flex;
  gap: var(--space-md);
}

.bonus-card.active {
  border-color: var(--color-primary);
  background: rgba(255, 215, 0, 0.05);
}

.bonus-icon {
  font-size: 2.5rem;
}

.bonus-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: var(--space-sm);
}

.bonus-content h3 {
  font-size: 1rem;
}

.bonus-content p {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

.bonus-progress {
  margin: var(--space-sm) 0;
}

.progress-text {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.bonus-terms {
  display: flex;
  gap: var(--space-md);
  font-size: 0.75rem;
  color: var(--text-muted);
}

.bonus-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
}

.expires {
  font-size: 0.75rem;
  color: var(--text-muted);
}

.value {
  font-family: var(--font-display);
  font-weight: 700;
}

/* VIP Section */
.vip-section {
  padding: var(--space-xl);
}

.vip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--space-xl);
}

.level-badge {
  padding: 0.25rem 0.75rem;
  background: var(--gradient-gold);
  color: var(--bg-primary);
  border-radius: var(--radius-full);
  font-size: 0.75rem;
  font-weight: 700;
}

.vip-level h3 {
  font-size: 1.5rem;
  margin-top: var(--space-sm);
}

.vip-progress {
  text-align: right;
}

.progress-bar.large {
  width: 300px;
  height: 12px;
  margin-bottom: var(--space-sm);
}

.vip-levels {
  display: flex;
  gap: var(--space-md);
}

.vip-level-card {
  flex: 1;
  padding: var(--space-lg);
  background: var(--bg-glass);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
  opacity: 0.5;
}

.vip-level-card.unlocked {
  opacity: 1;
}

.vip-level-card.current {
  border-color: var(--color-primary);
  background: rgba(255, 215, 0, 0.1);
}

.level-number {
  display: block;
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.level-name {
  display: block;
  font-weight: 600;
  margin: var(--space-sm) 0;
}

.level-bonus {
  font-size: 0.875rem;
  color: var(--text-secondary);
}

/* Daily Rewards */
.daily-rewards {
  padding: var(--space-xl);
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.day-reward {
  flex: 1;
  padding: var(--space-lg);
  background: var(--bg-glass);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  text-align: center;
  position: relative;
}

.day-reward.claimed {
  background: rgba(16, 185, 129, 0.1);
  border-color: var(--color-accent-green);
}

.day-reward.today {
  border-color: var(--color-primary);
  animation: glow 2s infinite;
}

.day-label {
  display: block;
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-bottom: var(--space-sm);
}

.day-reward-value {
  font-family: var(--font-display);
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--color-primary);
}

.checkmark {
  position: absolute;
  top: 8px;
  right: 8px;
  color: var(--color-accent-green);
  font-weight: 700;
}

.claim-daily {
  min-width: 180px;
}

@media (max-width: 1024px) {
  .bonuses-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .vip-levels {
    flex-wrap: wrap;
  }
  
  .vip-level-card {
    flex: 1 1 30%;
  }
}

@media (max-width: 768px) {
  .bonuses-grid {
    grid-template-columns: 1fr;
  }
  
  .vip-header {
    flex-direction: column;
    text-align: center;
    gap: var(--space-lg);
  }
  
  .vip-progress {
    text-align: center;
  }
  
  .progress-bar.large {
    width: 100%;
  }
  
  .daily-rewards {
    flex-wrap: wrap;
  }
  
  .day-reward {
    flex: 1 1 30%;
  }
}
</style>
