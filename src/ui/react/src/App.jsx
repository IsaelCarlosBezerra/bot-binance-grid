import { useState, useEffect, useRef } from "react"
import Header from "./components/Header"
import FinancialSummary from "./components/FinancialSummary"
import MarketState from "./components/MarketState"
import OpenPositions from "./components/OpenPositions"
import LoginPage from "./components/LoginPage"
import BotSetup from "./components/BotSetup"
import SettingsPage from "./components/SettingsPage"
import {
	getToken,
	clearToken,
	getMe,
	startBot,
	stopBot,
	loadStatus,
	loadSummary,
} from "./services/api"

function App() {
	const [user, setUser] = useState(null)
	const [authLoading, setAuthLoading] = useState(true)
	const [botConfigured, setBotConfigured] = useState(false)
	const [showSettings, setShowSettings] = useState(false)
	const [activeScreen, setActiveScreen] = useState("home")

	const [data, setData] = useState(null)
	const [summary, setSummary] = useState(null)
	const [summaryOpen, setSummaryOpen] = useState(null)

	// ── Auth bootstrap ──────────────────────────────────────────────────────
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

	// ── Polling do dashboard ────────────────────────────────────────────────
	const intervalRef = useRef(null)
	const failCountRef = useRef(0)

	const fetchAll = async () => {
		if (document.visibilityState === "hidden") return

		const status = await loadStatus()

		if (!status) {
			failCountRef.current += 1
			// Só para o polling após 5 falhas consecutivas (servidor realmente offline)
			if (failCountRef.current >= 5) {
				clearInterval(intervalRef.current)
				intervalRef.current = null
			}
			return
		}

		failCountRef.current = 0
		setData(status)
		const sum = await loadSummary()
		if (sum?.summary) {
			setSummary(sum.summary)
			setSummaryOpen(sum.summaryOpen)
		}
	}

	useEffect(() => {
		if (!user || !botConfigured) return
		fetchAll()
		intervalRef.current = setInterval(fetchAll, 3000)
		const onVisible = () => { if (document.visibilityState === "visible") fetchAll() }
		document.addEventListener("visibilitychange", onVisible)
		return () => {
			clearInterval(intervalRef.current)
			document.removeEventListener("visibilitychange", onVisible)
		}
	}, [user, botConfigured])

	// ── Handlers ────────────────────────────────────────────────────────────
	const handleAuth = async (u) => {
		setUser(u)
		const me = await getMe()
		setBotConfigured(!!me?.user?.botInstance)
	}

	const handleLogout = () => {
		clearToken()
		setUser(null)
		setData(null)
		setActiveScreen("home")
	}

	const handleStart = async () => { await startBot(); fetchAll() }
	const handleStop = async () => { await stopBot(); fetchAll() }

	const screens = [
		{
			id: "home",
			title: "Mercado",
			description: "Preço, status do bot e ações rápidas",
		},
		{
			id: "finance",
			title: "Financeiro",
			description: "Resultados, carteira e taxas",
		},
		{
			id: "positions",
			title: "Posições",
			description: "Ordens abertas no bot",
		},
	]

	// ── Render ───────────────────────────────────────────────────────────────
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
					onSaved={() => { setShowSettings(false); fetchAll() }}
					onClose={() => setShowSettings(false)}
				/>
			)}

			<div className="container dashboard-shell">
				<div className="screen-nav">
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
						<button
							type="button"
							className="ghost-link"
							onClick={() => setActiveScreen("home")}
							disabled={activeScreen === "home"}
						>
							Voltar para inicio
						</button>
					</div>

					{activeScreen === "home" && (
						<div className="screen-stack">
							<MarketState
								strategy={data?.state}
								enabled={data?.running ?? false}
								onStart={handleStart}
								onStop={handleStop}
								price={data?.state?.currentPrice}
								symbol={symbol}
							/>
						</div>
					)}

					{activeScreen === "finance" && (
						<FinancialSummary
							summary={summary}
							balance={balance}
							alocado={alocado}
							summaryPrevisto={summaryOpen}
						/>
					)}

					{activeScreen === "positions" && (
						<OpenPositions positions={openPositions} />
					)}
				</div>
			</div>
		</>
	)
}

export default App
