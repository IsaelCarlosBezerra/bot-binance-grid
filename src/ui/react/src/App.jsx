import { useState, useEffect } from "react"
import Header from "./components/Header"
import StatusIndicator from "./components/StatusIndicator"
import Controls from "./components/Controls"
import FinancialSummary from "./components/FinancialSummary"
import MarketState from "./components/MarketState"
import BotConfiguration from "./components/BotConfiguration"
import OpenPositions from "./components/OpenPositions"
import LoginPage from "./components/LoginPage"
import BotSetup from "./components/BotSetup"
import {
	getToken,
	clearToken,
	getMe,
	startBot,
	stopBot,
	saveConfig,
	loadStatus,
	loadBalance,
	loadSummary,
} from "./services/api"

function App() {
	const [user, setUser] = useState(null)
	const [authLoading, setAuthLoading] = useState(true)
	const [botConfigured, setBotConfigured] = useState(false)

	const [data, setData] = useState(null)
	const [balance, setBalance] = useState(0)
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
	const fetchAll = async () => {
		const [status, bal, sum] = await Promise.all([
			loadStatus(),
			loadBalance(),
			loadSummary(),
		])
		if (status) setData(status)
		if (bal?.balance !== undefined) setBalance(bal.balance)
		if (sum?.summary) {
			setSummary(sum.summary)
			setSummaryOpen(sum.summaryOpen)
		}
	}

	useEffect(() => {
		if (!user || !botConfigured) return
		fetchAll()
		const interval = setInterval(fetchAll, 3000)
		return () => clearInterval(interval)
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

	const handleSaveConfig = async (config) => {
		const result = await saveConfig(config)
		if (result?.ok) {
			alert("Configuração salva")
			fetchAll()
		} else {
			alert("Erro ao salvar configuração")
		}
	}

	// ── Render ───────────────────────────────────────────────────────────────
	if (authLoading) return <div className="loading-screen">Carregando...</div>

	if (!user) return <LoginPage onAuth={handleAuth} />

	if (!botConfigured) return <BotSetup onSetup={() => setBotConfigured(true)} />

	const openPositions = data?.openPositions ?? []
	const alocado = {
		valorAlocado: openPositions.reduce((a, p) => a + p.quantity * p.buyPrice, 0),
		qtdAlocada: openPositions.reduce((a, p) => a + p.quantity, 0),
	}

	return (
		<>
			<Header user={user} onLogout={handleLogout} />
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
					<BotConfiguration config={data?.config} onSave={handleSaveConfig} />
					<OpenPositions positions={openPositions} />
				</div>
			</div>
		</>
	)
}

export default App
