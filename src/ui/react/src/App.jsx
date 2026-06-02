import { useState, useEffect, useRef } from "react"
import Header from "./components/Header"
import StatusIndicator from "./components/StatusIndicator"
import Controls from "./components/Controls"
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

	// ── Polling do dashboard ────────────────────────────────────────────────
	const intervalRef = useRef(null)

	const fetchAll = async () => {
		if (document.visibilityState === "hidden") return

		const status = await loadStatus()

		if (!status) {
			// servidor offline — encerra tudo
			clearInterval(intervalRef.current)
			intervalRef.current = null
			return
		}

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
	const handleAuth = (u) => {
		setUser(u)
		setBotConfigured(false)
	}

	const handleLogout = () => {
		clearToken()
		setUser(null)
		setData(null)
	}

	const handleStart = async () => { await startBot(); fetchAll() }
	const handleStop = async () => { await stopBot(); fetchAll() }

	// ── Render ───────────────────────────────────────────────────────────────
	if (authLoading) return <div className="loading-screen">Carregando...</div>

	if (!user) return <LoginPage onAuth={handleAuth} />

	if (!botConfigured) return <BotSetup onSetup={() => setBotConfigured(true)} />

	const openPositions = data?.openPositions ?? []
	const balance = data?.state?.balance ?? 0
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

			<div className="container">
				<StatusIndicator enabled={data?.running ?? false} />
				<Controls
					onStart={handleStart}
					onStop={handleStop}
					price={data?.state?.currentPrice}
				/>
				<div className="cards">
					<FinancialSummary
						summary={summary}
						balance={balance}
						alocado={alocado}
						summaryPrevisto={summaryOpen}
					/>
					<MarketState strategy={data?.state} />
					<OpenPositions positions={openPositions} />
				</div>
			</div>
		</>
	)
}

export default App
