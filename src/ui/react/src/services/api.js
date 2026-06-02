const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:3001").replace(/\/$/, "")

// ─── Token ────────────────────────────────────────────────────────────────────

export const getToken = () => localStorage.getItem("token")
export const setToken = (token) => localStorage.setItem("token", token)
export const clearToken = () => localStorage.removeItem("token")

function authHeaders() {
	return {
		"Content-Type": "application/json",
		Authorization: `Bearer ${getToken()}`,
	}
}

async function request(path, options = {}) {
	try {
		const res = await fetch(`${API_URL}${path}`, options)
		if (res.status === 401) {
			clearToken()
			window.location.reload()
			return null
		}
		return res.ok ? res.json() : null
	} catch {
		return null
	}
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export const login = async (email, password) => {
	const res = await fetch(`${API_URL}/auth/login`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ email, password }),
	})
	const data = await res.json()
	if (!res.ok) throw new Error(data.error || "Erro ao fazer login")
	setToken(data.token)
	return data.user
}

export const register = async (name, email, password) => {
	const res = await fetch(`${API_URL}/auth/register`, {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify({ name, email, password }),
	})
	const data = await res.json()
	if (!res.ok) throw new Error(data.error || "Erro ao cadastrar")
	setToken(data.token)
	return data.user
}

export const getMe = () =>
	request("/auth/me", { headers: authHeaders() })

// ─── Bot ──────────────────────────────────────────────────────────────────────

export const loadStatus = () =>
	request("/bot/status", { headers: authHeaders() })

export const startBot = () =>
	request("/bot/start", { method: "POST", headers: authHeaders() })

export const stopBot = () =>
	request("/bot/stop", { method: "POST", headers: authHeaders() })

export const saveConfig = (config) =>
	request("/bot/config", {
		method: "PATCH",
		headers: authHeaders(),
		body: JSON.stringify(config),
	})

export const setupBot = (payload) =>
	request("/bot/setup", {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify(payload),
	})

export const loadBalance = () =>
	request("/bot/balance", { headers: authHeaders() })

export const loadPositions = () =>
	request("/bot/positions", { headers: authHeaders() })

export const loadSummary = () =>
	request("/bot/summary", { headers: authHeaders() })

export const loadPrice = () =>
	request("/bot/price", { headers: authHeaders() })

export const buy = ({ symbol, qtd }) =>
	request("/bot/buy", {
		method: "POST",
		headers: authHeaders(),
		body: JSON.stringify({ symbol, qtd }),
	})
