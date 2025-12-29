<template>
  <div class="home-page">
    <!-- Hero Section -->
    <section class="hero">
      <div class="hero-content">
        <h1 class="hero-title">
          <span class="text-gold">Welcome to</span>
          <br />
          <span class="brand-name">QR72casino</span>
        </h1>
        <p class="hero-subtitle">
          Experience premium gaming with provably fair games, instant payouts, and exclusive rewards.
        </p>
        <div class="hero-actions">
          <router-link to="/register" class="btn btn-primary btn-lg" v-if="!isAuthenticated">
            Get Started
          </router-link>
          <router-link to="/games" class="btn btn-secondary btn-lg">
            Explore Games
          </router-link>
        </div>
        <div class="hero-stats">
          <div class="stat">
            <span class="stat-value">$2.5M+</span>
            <span class="stat-label">Total Paid Out</span>
          </div>
          <div class="stat">
            <span class="stat-value">50K+</span>
            <span class="stat-label">Active Players</span>
          </div>
          <div class="stat">
            <span class="stat-value">99.9%</span>
            <span class="stat-label">Uptime</span>
          </div>
        </div>
      </div>
      <div class="hero-visual">
        <div class="floating-cards">
          <span class="card card-1">🎲</span>
          <span class="card card-2">🎰</span>
          <span class="card card-3">🃏</span>
          <span class="card card-4">💎</span>
          <span class="card card-5">🚀</span>
        </div>
      </div>
    </section>
    
    <!-- Featured Games -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">🔥 Popular Games</h2>
        <router-link to="/games" class="see-all">See All →</router-link>
      </div>
      <div class="games-grid">
        <router-link 
          v-for="game in popularGames" 
          :key="game.id"
          :to="`/games/${game.id}`"
          class="game-card glass-card"
        >
          <div class="game-icon">{{ game.icon }}</div>
          <div class="game-info">
            <h3 class="game-name">{{ game.name }}</h3>
            <p class="game-desc">{{ game.description }}</p>
          </div>
          <div class="game-meta">
            <span class="players">
              <span class="dot live"></span>
              {{ game.players }} playing
            </span>
            <span class="badge badge-gold" v-if="game.new">NEW</span>
          </div>
        </router-link>
      </div>
    </section>
    
    <!-- Live Bets -->
    <section class="section">
      <div class="section-header">
        <h2 class="section-title">⚡ Live Bets</h2>
        <span class="live-indicator">
          <span class="dot live pulse"></span>
          Live
        </span>
      </div>
      <div class="live-bets-table table-container">
        <table class="table">
          <thead>
            <tr>
              <th>Player</th>
              <th>Game</th>
              <th>Bet</th>
              <th>Multiplier</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="bet in liveBets" :key="bet.id">
              <td>
                <div class="player-cell">
                  <div class="avatar avatar-sm">{{ bet.user.charAt(0) }}</div>
                  <span>{{ bet.user }}</span>
                </div>
              </td>
              <td>{{ bet.game }}</td>
              <td>${{ bet.bet.toFixed(2) }}</td>
              <td>
                <span class="multiplier">{{ bet.multiplier }}x</span>
              </td>
              <td :class="bet.profit > 0 ? 'text-green' : 'text-red'">
                {{ bet.profit > 0 ? '+' : '' }}${{ bet.profit.toFixed(2) }}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
    
    <!-- Features -->
    <section class="section features-section">
      <div class="section-header">
        <h2 class="section-title">✨ Why Choose Us</h2>
      </div>
      <div class="features-grid">
        <div class="feature-card glass-card">
          <div class="feature-icon">🔒</div>
          <h3 class="feature-title">Provably Fair</h3>
          <p class="feature-desc">Every game result can be verified. Complete transparency in all outcomes.</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">⚡</div>
          <h3 class="feature-title">Instant Payouts</h3>
          <p class="feature-desc">Withdraw your winnings instantly to your preferred payment method.</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">🎁</div>
          <h3 class="feature-title">Generous Bonuses</h3>
          <p class="feature-desc">Welcome bonus, daily rewards, and VIP perks for loyal players.</p>
        </div>
        <div class="feature-card glass-card">
          <div class="feature-icon">💬</div>
          <h3 class="feature-title">24/7 Support</h3>
          <p class="feature-desc">Our support team is always ready to help you with any questions.</p>
        </div>
      </div>
    </section>
    
    <!-- CTA Section -->
    <section class="cta-section" v-if="!isAuthenticated">
      <div class="cta-content">
        <h2 class="cta-title">Ready to Start Winning?</h2>
        <p class="cta-subtitle">Join thousands of players and get your $1000 welcome bonus today!</p>
        <router-link to="/register" class="btn btn-primary btn-lg">
          Create Account
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useAuthStore } from '../stores/auth'
import { useGamesStore } from '../stores/games'

const authStore = useAuthStore()
const gamesStore = useGamesStore()

const isAuthenticated = computed(() => authStore.isAuthenticated)
const popularGames = computed(() => gamesStore.popularGames)
const liveBets = computed(() => gamesStore.liveBets)
</script>

<style scoped>
.home-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-3xl);
}

/* Hero Section */
.hero {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-2xl);
  align-items: center;
  padding: var(--space-2xl) 0;
}

.hero-content {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.hero-title {
  font-size: 3rem;
  line-height: 1.1;
  font-weight: 800;
}

.brand-name {
  font-family: var(--font-display);
  font-size: 4rem;
  background: var(--gradient-gold);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  max-width: 500px;
}

.hero-actions {
  display: flex;
  gap: var(--space-md);
  margin-top: var(--space-md);
}

.hero-stats {
  display: flex;
  gap: var(--space-xl);
  margin-top: var(--space-xl);
  padding-top: var(--space-xl);
  border-top: 1px solid var(--border-color);
}

.hero-stats .stat {
  display: flex;
  flex-direction: column;
}

.hero-stats .stat-value {
  font-family: var(--font-display);
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--color-primary);
}

.hero-stats .stat-label {
  font-size: 0.875rem;
  color: var(--text-muted);
}

.hero-visual {
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  height: 400px;
}

.floating-cards {
  position: relative;
  width: 300px;
  height: 300px;
}

.floating-cards .card {
  position: absolute;
  width: 80px;
  height: 80px;
  background: var(--bg-card);
  border: 2px solid var(--border-color);
  border-radius: var(--radius-lg);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 2.5rem;
  animation: float 3s ease-in-out infinite;
  box-shadow: var(--shadow-lg);
}

.card-1 { top: 0; left: 50%; transform: translateX(-50%); animation-delay: 0s; }
.card-2 { top: 30%; left: 0; animation-delay: 0.5s; }
.card-3 { top: 30%; right: 0; animation-delay: 1s; }
.card-4 { bottom: 20%; left: 15%; animation-delay: 1.5s; }
.card-5 { bottom: 20%; right: 15%; animation-delay: 2s; }

/* Section Styles */
.section {
  display: flex;
  flex-direction: column;
  gap: var(--space-lg);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.see-all {
  color: var(--color-primary);
  font-weight: 500;
  font-size: 0.9375rem;
}

.live-indicator {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  color: var(--color-accent-green);
  font-weight: 500;
  font-size: 0.875rem;
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--text-muted);
}

.dot.live {
  background: var(--color-accent-green);
}

.dot.pulse {
  animation: pulse 1.5s infinite;
}

/* Games Grid */
.games-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.game-card {
  display: flex;
  flex-direction: column;
  padding: var(--space-lg);
  cursor: pointer;
}

.game-icon {
  font-size: 3rem;
  margin-bottom: var(--space-md);
}

.game-info {
  flex: 1;
}

.game-name {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: var(--space-xs);
}

.game-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

.game-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: var(--space-md);
  padding-top: var(--space-md);
  border-top: 1px solid var(--border-color);
}

.players {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

/* Live Bets Table */
.live-bets-table {
  background: var(--bg-card);
}

.player-cell {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
}

.multiplier {
  color: var(--color-accent-green);
  font-weight: 600;
}

/* Features Grid */
.features-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg);
}

.feature-card {
  padding: var(--space-xl);
  text-align: center;
}

.feature-icon {
  font-size: 2.5rem;
  margin-bottom: var(--space-md);
}

.feature-title {
  font-size: 1.125rem;
  font-weight: 700;
  margin-bottom: var(--space-sm);
}

.feature-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  line-height: 1.5;
}

/* CTA Section */
.cta-section {
  background: var(--gradient-card);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-xl);
  padding: var(--space-3xl);
  text-align: center;
}

.cta-title {
  font-family: var(--font-display);
  font-size: 2rem;
  margin-bottom: var(--space-md);
}

.cta-subtitle {
  font-size: 1.125rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-xl);
}

/* Responsive */
@media (max-width: 1024px) {
  .features-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
  
  .hero-content {
    align-items: center;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .brand-name {
    font-size: 2.5rem;
  }
  
  .hero-subtitle {
    text-align: center;
  }
  
  .hero-visual {
    display: none;
  }
  
  .hero-stats {
    justify-content: center;
    flex-wrap: wrap;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
  }
}
</style>
