import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useUserStore = defineStore('user', () => {
    // Transaction history
    const transactions = ref([
        { id: 1, type: 'deposit', amount: 1000, status: 'completed', date: '2024-12-29', method: 'Bitcoin' },
        { id: 2, type: 'bet', amount: -50, game: 'Dice', status: 'completed', date: '2024-12-29' },
        { id: 3, type: 'win', amount: 95, game: 'Dice', status: 'completed', date: '2024-12-29' },
        { id: 4, type: 'bet', amount: -100, game: 'Crash', status: 'completed', date: '2024-12-28' },
        { id: 5, type: 'win', amount: 250, game: 'Crash', status: 'completed', date: '2024-12-28' }
    ])

    // Notifications
    const notifications = ref([
        { id: 1, type: 'bonus', title: 'Welcome Bonus!', message: 'You received $1000 welcome bonus', read: false, date: '2024-12-29' },
        { id: 2, type: 'promo', title: 'Weekend Special', message: '50% deposit bonus this weekend!', read: false, date: '2024-12-28' },
        { id: 3, type: 'win', title: 'Big Win!', message: 'Congratulations on your $500 win!', read: true, date: '2024-12-27' }
    ])

    // Bonuses
    const bonuses = ref([
        { id: 1, name: 'Welcome Bonus', amount: 1000, wagering: 10, progress: 0, expires: '2025-01-15', active: true },
        { id: 2, name: 'First Deposit', percentage: 100, maxAmount: 500, wagering: 20, progress: 0, expires: '2025-01-10', active: false },
        { id: 3, name: 'Free Spins', spins: 50, game: 'Slots', expires: '2025-01-05', active: true }
    ])

    // Getters
    const unreadNotifications = computed(() =>
        notifications.value.filter(n => !n.read).length
    )

    const activeBonuses = computed(() =>
        bonuses.value.filter(b => b.active)
    )

    const recentTransactions = computed(() =>
        transactions.value.slice(0, 10)
    )

    // Actions
    function addTransaction(transaction) {
        transactions.value.unshift({
            id: Date.now(),
            ...transaction,
            date: new Date().toISOString().split('T')[0],
            status: 'completed'
        })
    }

    function markNotificationRead(id) {
        const notification = notifications.value.find(n => n.id === id)
        if (notification) {
            notification.read = true
        }
    }

    function markAllNotificationsRead() {
        notifications.value.forEach(n => n.read = true)
    }

    function addNotification(notification) {
        notifications.value.unshift({
            id: Date.now(),
            ...notification,
            read: false,
            date: new Date().toISOString().split('T')[0]
        })
    }

    function claimBonus(id) {
        const bonus = bonuses.value.find(b => b.id === id)
        if (bonus && !bonus.active) {
            bonus.active = true
        }
    }

    return {
        transactions,
        notifications,
        bonuses,
        unreadNotifications,
        activeBonuses,
        recentTransactions,
        addTransaction,
        markNotificationRead,
        markAllNotificationsRead,
        addNotification,
        claimBonus
    }
})
