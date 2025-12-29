import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
    // State
    const user = ref(JSON.parse(localStorage.getItem('user')) || null)
    const token = ref(localStorage.getItem('token') || null)

    // Demo users for testing
    const demoUsers = [
        {
            id: 1,
            username: 'admin',
            email: 'admin@qr72casino.com',
            password: 'admin123',
            role: 'admin',
            balance: 100000,
            vipLevel: 10,
            avatar: 'A',
            createdAt: '2024-01-01'
        },
        {
            id: 2,
            username: 'demo',
            email: 'demo@qr72casino.com',
            password: 'demo123',
            role: 'user',
            balance: 5000,
            vipLevel: 3,
            avatar: 'D',
            createdAt: '2024-06-15'
        }
    ]

    // Getters
    const isAuthenticated = computed(() => !!user.value)
    const isAdmin = computed(() => user.value?.role === 'admin')
    const currentUser = computed(() => user.value)
    const userBalance = computed(() => user.value?.balance || 0)

    // Actions
    function login(email, password, isAdminLogin = false) {
        return new Promise((resolve, reject) => {
            // Simulate API call delay
            setTimeout(() => {
                const foundUser = demoUsers.find(u =>
                    u.email === email && u.password === password
                )

                if (!foundUser) {
                    reject(new Error('Invalid email or password'))
                    return
                }

                if (isAdminLogin && foundUser.role !== 'admin') {
                    reject(new Error('You do not have admin access'))
                    return
                }

                // Create user session
                const sessionUser = { ...foundUser }
                delete sessionUser.password

                user.value = sessionUser
                token.value = 'demo_token_' + Date.now()

                // Persist to localStorage
                localStorage.setItem('user', JSON.stringify(sessionUser))
                localStorage.setItem('token', token.value)

                resolve(sessionUser)
            }, 500)
        })
    }

    function register(username, email, password) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                // Check if email already exists
                const exists = demoUsers.find(u => u.email === email)
                if (exists) {
                    reject(new Error('Email already registered'))
                    return
                }

                // Create new user
                const newUser = {
                    id: Date.now(),
                    username,
                    email,
                    role: 'user',
                    balance: 1000, // Welcome bonus
                    vipLevel: 1,
                    avatar: username.charAt(0).toUpperCase(),
                    createdAt: new Date().toISOString().split('T')[0]
                }

                demoUsers.push({ ...newUser, password })

                user.value = newUser
                token.value = 'demo_token_' + Date.now()

                localStorage.setItem('user', JSON.stringify(newUser))
                localStorage.setItem('token', token.value)

                resolve(newUser)
            }, 500)
        })
    }

    function logout() {
        user.value = null
        token.value = null
        localStorage.removeItem('user')
        localStorage.removeItem('token')
    }

    function updateBalance(amount) {
        if (user.value) {
            user.value.balance += amount
            localStorage.setItem('user', JSON.stringify(user.value))
        }
    }

    function setBalance(amount) {
        if (user.value) {
            user.value.balance = amount
            localStorage.setItem('user', JSON.stringify(user.value))
        }
    }

    return {
        user,
        token,
        isAuthenticated,
        isAdmin,
        currentUser,
        userBalance,
        login,
        register,
        logout,
        updateBalance,
        setBalance
    }
})
