const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001"

export const startBot = async () => {
	try {
		const response = await fetch(`${API_URL}/start`, { method: "POST" })
		return response.ok
	} catch (error) {
		console.error("Error starting bot:", error)
		return false
	}
}

export const stopBot = async () => {
	try {
		const response = await fetch(`${API_URL}/stop`, { method: "POST" })
		return response.ok
	} catch (error) {
		console.error("Error stopping bot:", error)
		return false
	}
}

export const saveConfig = async (config) => {
	try {
		const response = await fetch(`${API_URL}/config`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(config),
		})
		return response.ok
	} catch (error) {
		console.error("Error saving config:", error)
		return false
	}
}

export const loadStatus = async () => {
	try {
		const response = await fetch(`${API_URL}/status`)
		if (!response.ok) {
			throw new Error("Failed to load status")
		}
		return await response.json()
	} catch (error) {
		console.error("Error loading status:", error)
		return null
	}
}

export const loadBalance = async () => {
	try {
		const response = await fetch(`${API_URL}/balance`)
		if (!response.ok) {
			throw new Error("Failed to load balance")
		}
		return await response.json()
	} catch (error) {
		console.error("Error loading balance:", error)
		return null
	}
}

export const loadAlocado = async () => {
	try {
		const response = await fetch(`${API_URL}/alocado`)
		if (!response.ok) {
			throw new Error("Failed to load total alocado")
		}
		return await response.json()
	} catch (error) {
		console.error("Error loading total alocado:", error)
		return null
	}
}

export const loadSumaryPrevisto = async () => {
	try {
		const response = await fetch(`${API_URL}/sumaryprevisto`)
		if (!response.ok) {
			throw new Error("Failed to load Resultados Previstos")
		}
		return await response.json()
	} catch (error) {
		console.error("Error loading Resultados Previstos:", error)
		return null
	}
}

export const buy = async ({ symbol, qtd }) => {
	try {
		const response = await fetch(`${API_URL}/buy`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ symbol, qtd }),
		})
		return response.ok
	} catch (error) {
		console.error("Error saving config:", error)
		return false
	}
}
