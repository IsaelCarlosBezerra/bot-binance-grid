import { useState, useEffect, useRef } from "react"
import Header from "./components/Header"
import FinancialSummary from "./components/FinancialSummary"
import WalletSummary from "./components/WalletSummary"
import MarketState from "./components/MarketState"
import OpenPositions from "./components/OpenPositions"
import LoginPage from "./components/LoginPage"
import BotSetup from "./components/BotSetup"
import SettingsPage from "./components/SettingsPage"
import {
	API_URL,
	authHeaders,
	getToken,
	clearToken,
	getMe,
	startBot,
	stopBot,
	loadBalance,
} from "./services/api"

function mergeDashboardState(prev, patch) {
	if (!prev) return patch

	return {
		...prev,
		...patch,
		config: patch.config ? { ...prev.config, ...patch.config } : prev.config,
		state: patch.state ? { ...prev.state, ...patch.state } : prev.state,
		openPositions: patch.openPositions ? patch.openPositions : prev.openPositions,
	}
}

function parseSseBlock(block) {
	let event = "message"
	let data = ""

	for (const line of block.split(/\r?\n/)) {
		if (line.startsWith("event:")) {
			event = line.slice(6).trim()
		} else if (line.startsWith("data:")) {
			data += line.slice(5).trimStart()
		}
	}

	if (!data) return null

	try {
		return { event, data: JSON.parse(data) }
	} catch {
		return null
	}
}

function App() {
	const [user, setUser] = useState(null)
	const [authLoading, setAuthLoading] = useState(true)
	const [botConfigured, setBotConfigured] = useState(false)
	const [showSettings, setShowSettings] = useState(false)
	const [activeScreen, setActiveScreen] = useState("home")

	const [data, setData] = useState(null)
	const [summary, setSummary] = useState(null)
	const [summaryOpen, setSummaryOpen] = useState(null)
	const [syncingBalance, setSyncingBalance] = useState(false)
	const retryRef = useRef(null)
	const abortRef = useRef(null)

	useEffect(() => {
		if (!getToken()) {
			setAuthLoading(false)
			return
		}
		getMe()
			.then((res) => {
				if (res?.user) {
					setUser(res.user)
					setBotConfigured(!!res.user.botInstance)
				} else {
					clearToken()
				}
			})
			.finally(() => setAuthLoading(false))
	}, [])

	useEffect(() => {
		window.scrollTo({ top: 0, behavior: "smooth" })
	}, [activeScreen])

	useEffect(() => {
		if (!user || !botConfigured) return

		let cancelled = false
		const controller = new AbortController()
		abortRef.current = controller

		const connect = async () => {
			try {
				const res = await fetch(`${API_URL}/bot/stream`, {
					headers: authHeaders(),
					signal: controller.signal,
				})

				if (!res.ok || !res.body) {
					throw new Error("stream unavailable")
				}

				const reader = res.body.getReader()
				const decoder = new TextDecoder()
				let buffer = ""

				while (!cancelled) {
					const { value, done } = await reader.read()
					if (done) break

					buffer += decoder.decode(value, { stream: true })

					let boundary = buffer.indexOf("\n\n")
					while (boundary !== -1) {
						const block = buffer.slice(0, boundary)
						buffer = buffer.slice(boundary + 2)
						const parsed = parseSseBlock(block)

						if (parsed?.event === "snapshot") {
							setData(parsed.data.status)
							setSummary(parsed.data.summary)
							setSummaryOpen(parsed.data.summaryOpen)
						} else if (parsed?.event === "state") {
							setData((prev) => mergeDashboardState(prev, parsed.data))
						} else if (parsed?.event === "summary") {
							setSummary(parsed.data.summary)
							setSummaryOpen(parsed.data.summaryOpen)
						}

						boundary = buffer.indexOf("\n\n")
					}
				}

				if (!cancelled && !controller.signal.aborted) {
					retryRef.current = window.setTimeout(connect, 2000)
				}
			} catch {
				if (cancelled || controller.signal.aborted) return
				retryRef.current = window.setTimeout(connect, 2000)
			}
		}

		connect()

		return () => {
			cancelled = true
			controller.abort()
			abortRef.current = null
			if (retryRef.current) {
				window.clearTimeout(retryRef.current)
				retryRef.current = null
			}
		}
	}, [user, botConfigured])

	const handleAuth = async (u) => {
		setUser(u)
		const me = await getMe()
		setBotConfigured(!!me?.user?.botInstance)
	}

	const handleLogout = () => {
		clearToken()
		setUser(null)
		setData(null)
		setSummary(null)
		setSummaryOpen(null)
		setActiveScreen("home")
	}

	const handleStart = async () => {
		await startBot()
	}

	const handleStop = async () => {
		await stopBot()
	}

	const handleSyncBalance = async () => {
		setSyncingBalance(true)
		try {
			const result = await loadBalance()
			if (result && typeof result.balance === "number") {
				setData((prev) => mergeDashboardState(prev, { state: { balance: result.balance } }))
			}
		} finally {
			setSyncingBalance(false)
		}
	}

	const screens = [
		{
			id: "home",
			title: "Mercado",
			description: "Preço, status do bot e ações rápidas",
		},
		{
			id: "finance",
			title: "Financeiro",
			description: "Resultados e desempenho",
		},
		{
			id: "wallet",
			title: "Carteira",
			description: "Saldo e alocação",
		},
		{
			id: "positions",
			title: "Posições",
			description: "Ordens abertas no bot",
		},
	]

	if (authLoading) return <div className="loading-screen">Carregando...</div>

	if (!user) return <LoginPage onAuth={handleAuth} />

	if (!botConfigured) return <BotSetup onSetup={() => setBotConfigured(true)} />

	const openPositions = data?.openPositions ?? []
	const balance = data?.state?.balance ?? 0
	const symbol = data?.config?.symbol ?? "BTCUSDT"
	const alocado = {
		valorAlocado: openPositions.reduce((a, p) => a + p.quantity * p.buyPrice, 0),
		qtdAlocada: openPositions.reduce((a, p) => a + p.quantity, 0),
	}

	return (
		<>
			<Header
				user={user}
				onLogout={handleLogout}
				onSettings={() => setShowSettings(true)}
			/>

			{showSettings && (
				<SettingsPage
					config={data?.config}
					user={user}
					onSaved={() => setShowSettings(false)}
					onClose={() => setShowSettings(false)}
				/>
			)}

			<div className="container dashboard-shell">
				<div className="screen-nav desktop-nav">
					{screens.map((screen) => (
						<button
							key={screen.id}
							type="button"
							className={`screen-card ${activeScreen === screen.id ? "active" : ""}`}
							onClick={() => setActiveScreen(screen.id)}
						>
							<span className="screen-card-kicker">Tela</span>
							<span className="screen-card-title">{screen.title}</span>
							<span className="screen-card-description">{screen.description}</span>
						</button>
					))}
				</div>

				<div className="screen-panel">
					<div className="screen-panel-header">
						<div>
							<p className="screen-panel-kicker">Painel principal</p>
							<h2>{screens.find((screen) => screen.id === activeScreen)?.title ?? "Mercado"}</h2>
						</div>
						{activeScreen !== "home" && (
							<button
								type="button"
								className="ghost-link"
								onClick={() => setActiveScreen("home")}
							>
								Voltar para inicio
							</button>
						)}
					</div>

					{activeScreen === "home" && (
						<div className="screen-stack">
							<MarketState
								strategy={data?.state}
								enabled={data?.running ?? false}
								onStart={handleStart}
								onStop={handleStop}
								symbol={symbol}
							/>
						</div>
					)}

					{activeScreen === "finance" && (
						<FinancialSummary
							summary={summary}
							summaryPrevisto={summaryOpen}
						/>
					)}

					{activeScreen === "wallet" && (
						<WalletSummary
							balance={balance}
							alocado={alocado}
							onSyncBalance={handleSyncBalance}
							syncingBalance={syncingBalance}
						/>
					)}

					{activeScreen === "positions" && (
						<OpenPositions positions={openPositions} />
					)}
				</div>

				<nav className="mobile-nav" aria-label="Navegação principal">
					{screens.map((screen) => (
						<button
							key={screen.id}
							type="button"
							className={`mobile-nav-item ${activeScreen === screen.id ? "active" : ""}`}
							onClick={() => setActiveScreen(screen.id)}
						>
							<span className="mobile-nav-title">{screen.title}</span>
							<span className="mobile-nav-desc">{screen.description}</span>
						</button>
					))}
				</nav>
			</div>
		</>
	)
}

export default App
