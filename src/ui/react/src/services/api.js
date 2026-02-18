const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001'

export const startBot = async () => {
    try {
        const response = await fetch(`${API_URL}/start`, { method: 'POST' })
        return response.ok
    } catch (error) {
        console.error('Error starting bot:', error)
        return false
    }
}

export const stopBot = async () => {
    try {
        const response = await fetch(`${API_URL}/stop`, { method: 'POST' })
        return response.ok
    } catch (error) {
        console.error('Error stopping bot:', error)
        return false
    }
}

export const saveConfig = async (config) => {
    try {
        const response = await fetch(`${API_URL}/config`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(config)
        })
        return response.ok
    } catch (error) {
        console.error('Error saving config:', error)
        return false
    }
}

export const loadStatus = async () => {
    try {
        const response = await fetch(`${API_URL}/status`)
        if (!response.ok) {
            throw new Error('Failed to load status')
        }
        return await response.json()
    } catch (error) {
        console.error('Error loading status:', error)
        return null
    }
}
