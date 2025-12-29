import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useGamesStore = defineStore('games', () => {
    // All available games
    const games = ref([
        {
            id: 'dice',
            name: 'Dice',
            category: 'originals',
            icon: '🎲',
            description: 'Predict if the roll will be higher or lower',
            image: '/games/dice.jpg',
            houseEdge: 1,
            minBet: 0.1,
            maxBet: 10000,
            popular: true,
            new: false,
            players: 1234
        },
        {
            id: 'crash',
            name: 'Crash',
            category: 'originals',
            icon: '🚀',
            description: 'Cash out before the rocket crashes',
            image: '/games/crash.jpg',
            houseEdge: 1,
            minBet: 0.1,
            maxBet: 10000,
            popular: true,
            new: false,
            players: 2567
        },
        {
            id: 'slots',
            name: 'Lucky Slots',
            category: 'slots',
            icon: '🎰',
            description: 'Spin the reels and match symbols to win',
            image: '/games/slots.jpg',
            houseEdge: 3,
            minBet: 0.5,
            maxBet: 1000,
            popular: true,
            new: true,
            players: 3891
        },
        {
            id: 'blackjack',
            name: 'Blackjack',
            category: 'cards',
            icon: '🃏',
            description: 'Beat the dealer without going over 21',
            image: '/games/blackjack.jpg',
            houseEdge: 0.5,
            minBet: 1,
            maxBet: 5000,
            popular: true,
            new: false,
            players: 1823
        },
        {
            id: 'roulette',
            name: 'Roulette',
            category: 'table',
            icon: '🎡',
            description: 'Place your bets on the spinning wheel',
            image: '/games/roulette.jpg',
            houseEdge: 2.7,
            minBet: 0.5,
            maxBet: 5000,
            popular: true,
            new: false,
            players: 2156
        },
        {
            id: 'mines',
            name: 'Mines',
            category: 'originals',
            icon: '💎',
            description: 'Reveal gems while avoiding hidden mines',
            image: '/games/mines.jpg',
            houseEdge: 1,
            minBet: 0.1,
            maxBet: 10000,
            popular: true,
            new: true,
            players: 4521
        }
    ])

    // Categories
    const categories = ref([
        { id: 'all', name: 'All Games', icon: '🎮' },
        { id: 'originals', name: 'Originals', icon: '⭐' },
        { id: 'slots', name: 'Slots', icon: '🎰' },
        { id: 'cards', name: 'Cards', icon: '🃏' },
        { id: 'table', name: 'Table Games', icon: '🎲' },
        { id: 'live', name: 'Live Casino', icon: '📺' }
    ])

    // Recent plays (for history)
    const recentPlays = ref([])

    // Live bets (for social proof)
    const liveBets = ref([
        { id: 1, user: 'Player***23', game: 'Crash', bet: 50, multiplier: 2.5, profit: 75, time: '2s ago' },
        { id: 2, user: 'Lucky***99', game: 'Dice', bet: 100, multiplier: 1.9, profit: 90, time: '5s ago' },
        { id: 3, user: 'High***er', game: 'Mines', bet: 25, multiplier: 3.2, profit: 55, time: '8s ago' },
        { id: 4, user: 'Win***42', game: 'Slots', bet: 10, multiplier: 15, profit: 140, time: '12s ago' },
        { id: 5, user: 'Pro***77', game: 'Blackjack', bet: 200, multiplier: 2.0, profit: 200, time: '15s ago' }
    ])

    // Getters
    const popularGames = computed(() =>
        games.value.filter(g => g.popular)
    )

    const newGames = computed(() =>
        games.value.filter(g => g.new)
    )

    const gamesByCategory = computed(() => (category) => {
        if (category === 'all') return games.value
        return games.value.filter(g => g.category === category)
    })

    const getGameById = computed(() => (id) => {
        return games.value.find(g => g.id === id)
    })

    // Actions
    function addPlay(play) {
        recentPlays.value.unshift({
            id: Date.now(),
            ...play,
            timestamp: new Date()
        })

        // Keep only last 50 plays
        if (recentPlays.value.length > 50) {
            recentPlays.value = recentPlays.value.slice(0, 50)
        }
    }

    function addLiveBet(bet) {
        liveBets.value.unshift({
            id: Date.now(),
            ...bet,
            time: 'just now'
        })

        // Keep only last 20 bets
        if (liveBets.value.length > 20) {
            liveBets.value = liveBets.value.slice(0, 20)
        }
    }

    return {
        games,
        categories,
        recentPlays,
        liveBets,
        popularGames,
        newGames,
        gamesByCategory,
        getGameById,
        addPlay,
        addLiveBet
    }
})
