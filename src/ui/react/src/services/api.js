export const startBot = async () => {
    try {
        const response = await fetch('/start', { method: 'POST' })
        return response.ok
    } catch (error) {
        console.error('Error starting bot:', error)
        return false
    }
}

export const stopBot = async () => {
    try {
        const response = await fetch('/stop', { method: 'POST' })
        return response.ok
    } catch (error) {
        console.error('Error stopping bot:', error)
        return false
    }
}

export const saveConfig = async (config) => {
    try {
        const response = await fetch('/config', {
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
        const response = await fetch('http://localhost:/status')
        if (!response.ok) {
            throw new Error('Failed to load status')
        }
        return await response.json()
    } catch (error) {
        console.error('Error loading status:', error)
        return null
    }
}
