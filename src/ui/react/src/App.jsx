import { useState, useEffect } from "react"
import Header from "./components/Header"
import StatusIndicator from "./components/StatusIndicator"
import Controls from "./components/Controls"
import FinancialSummary from "./components/FinancialSummary"
import MarketState from "./components/MarketState"
import BotConfiguration from "./components/BotConfiguration"
import OpenPositions from "./components/OpenPositions"
import { startBot, stopBot, saveConfig, loadStatus } from "./services/api"

function App() {
	const [data, setData] = useState(null)

	const fetchStatus = async () => {
		const status = await loadStatus()
		if (status) {
			setData(status)
		}
	}

	useEffect(() => {
		fetchStatus()
		const interval = setInterval(fetchStatus, 3000)
		return () => clearInterval(interval)
	}, [])

	const handleStart = async () => {
		await startBot()
		fetchStatus()
	}

	const handleStop = async () => {
		await stopBot()
		fetchStatus()
	}

	const handleSaveConfig = async (config) => {
		const success = await saveConfig(config)
		if (success) {
			alert("Configuração salva")
			fetchStatus()
		} else {
			alert("Erro ao salvar configuração")
		}
	}

	return (
		<>
			<Header />
			<div className="container">
				<StatusIndicator enabled={data?.enabled || false} />
				<Controls onStart={handleStart} onStop={handleStop} />

				<div className="cards">
					<FinancialSummary summary={data?.summary} />
					<MarketState strategy={data?.strategy} />
					<BotConfiguration config={data?.config} onSave={handleSaveConfig} />
					<OpenPositions positions={data?.openPositions} />
				</div>
			</div>
		</>
	)
}

export default App
