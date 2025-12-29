import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

// Views
import Home from '../views/Home.vue'
import Games from '../views/Games.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import AdminLogin from '../views/auth/AdminLogin.vue'

// Game Views
import Dice from '../views/games/Dice.vue'
import Crash from '../views/games/Crash.vue'
import Slots from '../views/games/Slots.vue'
import Blackjack from '../views/games/Blackjack.vue'
import Roulette from '../views/games/Roulette.vue'
import Mines from '../views/games/Mines.vue'

// User Views
import Profile from '../views/user/Profile.vue'
import Wallet from '../views/user/Wallet.vue'
import History from '../views/user/History.vue'
import Bonuses from '../views/user/Bonuses.vue'

// Admin Views
import AdminDashboard from '../views/admin/Dashboard.vue'
import AdminPlayers from '../views/admin/Players.vue'
import AdminGames from '../views/admin/Games.vue'
import AdminFinances from '../views/admin/Finances.vue'
import AdminBonuses from '../views/admin/Bonuses.vue'
import AdminSettings from '../views/admin/Settings.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
    {
        path: '/',
        name: 'Home',
        component: Home
    },
    {
        path: '/games',
        name: 'Games',
        component: Games
    },
    {
        path: '/login',
        name: 'Login',
        component: Login,
        meta: { guest: true }
    },
    {
        path: '/register',
        name: 'Register',
        component: Register,
        meta: { guest: true }
    },
    {
        path: '/admin/login',
        name: 'AdminLogin',
        component: AdminLogin,
        meta: { guest: true }
    },
    // Game Routes
    {
        path: '/games/dice',
        name: 'Dice',
        component: Dice,
        meta: { requiresAuth: true }
    },
    {
        path: '/games/crash',
        name: 'Crash',
        component: Crash,
        meta: { requiresAuth: true }
    },
    {
        path: '/games/slots',
        name: 'Slots',
        component: Slots,
        meta: { requiresAuth: true }
    },
    {
        path: '/games/blackjack',
        name: 'Blackjack',
        component: Blackjack,
        meta: { requiresAuth: true }
    },
    {
        path: '/games/roulette',
        name: 'Roulette',
        component: Roulette,
        meta: { requiresAuth: true }
    },
    {
        path: '/games/mines',
        name: 'Mines',
        component: Mines,
        meta: { requiresAuth: true }
    },
    // User Routes
    {
        path: '/profile',
        name: 'Profile',
        component: Profile,
        meta: { requiresAuth: true }
    },
    {
        path: '/wallet',
        name: 'Wallet',
        component: Wallet,
        meta: { requiresAuth: true }
    },
    {
        path: '/history',
        name: 'History',
        component: History,
        meta: { requiresAuth: true }
    },
    {
        path: '/bonuses',
        name: 'Bonuses',
        component: Bonuses,
        meta: { requiresAuth: true }
    },
    // Admin Routes
    {
        path: '/admin',
        name: 'AdminDashboard',
        component: AdminDashboard,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/players',
        name: 'AdminPlayers',
        component: AdminPlayers,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/games',
        name: 'AdminGames',
        component: AdminGames,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/finances',
        name: 'AdminFinances',
        component: AdminFinances,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/bonuses',
        name: 'AdminBonuses',
        component: AdminBonuses,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    {
        path: '/admin/settings',
        name: 'AdminSettings',
        component: AdminSettings,
        meta: { requiresAuth: true, requiresAdmin: true }
    },
    // 404
    {
        path: '/:pathMatch(.*)*',
        name: 'NotFound',
        component: NotFound
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

// Navigation Guards
router.beforeEach((to, from, next) => {
    const authStore = useAuthStore()

    if (to.meta.requiresAuth && !authStore.isAuthenticated) {
        next({ name: 'Login', query: { redirect: to.fullPath } })
    } else if (to.meta.requiresAdmin && !authStore.isAdmin) {
        next({ name: 'Home' })
    } else if (to.meta.guest && authStore.isAuthenticated) {
        next({ name: 'Home' })
    } else {
        next()
    }
})

export default router
