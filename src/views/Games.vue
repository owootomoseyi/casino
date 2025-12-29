<template>
  <div class="games-page">
    <!-- Page Header -->
    <div class="page-header">
      <h1 class="page-title">🎮 All Games</h1>
      <p class="page-subtitle">Choose from our collection of provably fair casino games</p>
    </div>
    
    <!-- Categories -->
    <div class="categories-bar">
      <button 
        v-for="category in categories" 
        :key="category.id"
        class="category-btn"
        :class="{ active: selectedCategory === category.id }"
        @click="selectedCategory = category.id"
      >
        <span class="category-icon">{{ category.icon }}</span>
        <span class="category-name">{{ category.name }}</span>
      </button>
    </div>
    
    <!-- Search & Sort -->
    <div class="filter-bar">
      <div class="search-input">
        <span class="search-icon">🔍</span>
        <input 
          type="text" 
          placeholder="Search games..." 
          v-model="searchQuery"
        />
      </div>
      <div class="sort-dropdown">
        <select v-model="sortBy" class="input">
          <option value="popular">Most Popular</option>
          <option value="name">Name A-Z</option>
          <option value="players">Most Players</option>
          <option value="new">Newest</option>
        </select>
      </div>
    </div>
    
    <!-- Games Grid -->
    <div class="games-grid">
      <router-link 
        v-for="game in filteredGames" 
        :key="game.id"
        :to="`/games/${game.id}`"
        class="game-card glass-card"
      >
        <div class="game-thumbnail">
          <span class="game-icon-large">{{ game.icon }}</span>
          <div class="game-overlay">
            <button class="play-btn btn btn-primary">Play Now</button>
          </div>
        </div>
        <div class="game-content">
          <div class="game-header">
            <h3 class="game-name">{{ game.name }}</h3>
            <span class="badge badge-gold" v-if="game.new">NEW</span>
            <span class="badge badge-purple" v-if="game.popular && !game.new">HOT</span>
          </div>
          <p class="game-desc">{{ game.description }}</p>
          <div class="game-stats">
            <div class="stat">
              <span class="stat-label">Min Bet</span>
              <span class="stat-value">${{ game.minBet }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Max Bet</span>
              <span class="stat-value">${{ game.maxBet }}</span>
            </div>
            <div class="stat">
              <span class="stat-label">Edge</span>
              <span class="stat-value">{{ game.houseEdge }}%</span>
            </div>
          </div>
          <div class="game-footer">
            <span class="players-online">
              <span class="dot live"></span>
              {{ formatNumber(game.players) }} playing
            </span>
          </div>
        </div>
      </router-link>
    </div>
    
    <!-- Empty State -->
    <div class="empty-state" v-if="filteredGames.length === 0">
      <span class="empty-icon">🎲</span>
      <h3>No games found</h3>
      <p>Try adjusting your filters or search query</p>
      <button class="btn btn-secondary" @click="resetFilters">Reset Filters</button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useGamesStore } from '../stores/games'

const gamesStore = useGamesStore()

// State
const selectedCategory = ref('all')
const searchQuery = ref('')
const sortBy = ref('popular')

// Computed
const categories = computed(() => gamesStore.categories)
const games = computed(() => gamesStore.games)

const filteredGames = computed(() => {
  let result = [...games.value]
  
  // Filter by category
  if (selectedCategory.value !== 'all') {
    result = result.filter(g => g.category === selectedCategory.value)
  }
  
  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    result = result.filter(g => 
      g.name.toLowerCase().includes(query) ||
      g.description.toLowerCase().includes(query)
    )
  }
  
  // Sort
  switch (sortBy.value) {
    case 'name':
      result.sort((a, b) => a.name.localeCompare(b.name))
      break
    case 'players':
      result.sort((a, b) => b.players - a.players)
      break
    case 'new':
      result.sort((a, b) => b.new - a.new)
      break
    default: // popular
      result.sort((a, b) => b.popular - a.popular)
  }
  
  return result
})

// Methods
function formatNumber(num) {
  return num >= 1000 ? (num / 1000).toFixed(1) + 'K' : num
}

function resetFilters() {
  selectedCategory.value = 'all'
  searchQuery.value = ''
  sortBy.value = 'popular'
}
</script>

<style scoped>
.games-page {
  display: flex;
  flex-direction: column;
  gap: var(--space-xl);
}

/* Page Header */
.page-header {
  text-align: center;
  padding: var(--space-xl) 0;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  margin-bottom: var(--space-sm);
}

.page-subtitle {
  font-size: 1rem;
  color: var(--text-secondary);
}

/* Categories */
.categories-bar {
  display: flex;
  gap: var(--space-sm);
  overflow-x: auto;
  padding: var(--space-sm) 0;
  -webkit-overflow-scrolling: touch;
}

.category-btn {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  padding: 0.625rem 1.25rem;
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-full);
  color: var(--text-secondary);
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  transition: all var(--transition-fast);
}

.category-btn:hover {
  border-color: var(--color-primary);
  color: var(--text-primary);
}

.category-btn.active {
  background: rgba(255, 215, 0, 0.1);
  border-color: var(--color-primary);
  color: var(--color-primary);
}

.category-icon {
  font-size: 1rem;
}

/* Filter Bar */
.filter-bar {
  display: flex;
  gap: var(--space-md);
  align-items: center;
}

.search-input {
  flex: 1;
  max-width: 400px;
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
  padding: 0.75rem 0;
  color: var(--text-primary);
}

.search-input input::placeholder {
  color: var(--text-muted);
}

.sort-dropdown select {
  padding: 0.75rem var(--space-md);
  background: var(--bg-glass);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  color: var(--text-primary);
  cursor: pointer;
}

/* Games Grid */
.games-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--space-lg);
}

.game-card {
  overflow: hidden;
  cursor: pointer;
}

.game-thumbnail {
  position: relative;
  height: 180px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.game-icon-large {
  font-size: 5rem;
  transition: transform var(--transition-base);
}

.game-card:hover .game-icon-large {
  transform: scale(1.1);
}

.game-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity var(--transition-base);
}

.game-card:hover .game-overlay {
  opacity: 1;
}

.game-content {
  padding: var(--space-lg);
}

.game-header {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  margin-bottom: var(--space-sm);
}

.game-name {
  font-size: 1.125rem;
  font-weight: 700;
  flex: 1;
}

.game-desc {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin-bottom: var(--space-md);
  line-height: 1.5;
}

.game-stats {
  display: flex;
  gap: var(--space-md);
  padding: var(--space-md) 0;
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
}

.game-stats .stat {
  flex: 1;
  text-align: center;
}

.game-stats .stat-label {
  display: block;
  font-size: 0.6875rem;
  text-transform: uppercase;
  color: var(--text-muted);
  margin-bottom: 2px;
}

.game-stats .stat-value {
  font-weight: 600;
  color: var(--color-primary);
}

.game-footer {
  padding-top: var(--space-md);
}

.players-online {
  display: flex;
  align-items: center;
  gap: var(--space-sm);
  font-size: 0.8125rem;
  color: var(--text-muted);
}

.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.dot.live {
  background: var(--color-accent-green);
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: var(--space-3xl);
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: var(--space-lg);
  display: block;
}

.empty-state h3 {
  font-size: 1.25rem;
  margin-bottom: var(--space-sm);
}

.empty-state p {
  color: var(--text-secondary);
  margin-bottom: var(--space-lg);
}

/* Responsive */
@media (max-width: 1024px) {
  .games-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 768px) {
  .filter-bar {
    flex-direction: column;
    align-items: stretch;
  }
  
  .search-input {
    max-width: none;
  }
  
  .games-grid {
    grid-template-columns: 1fr;
  }
}
</style>
