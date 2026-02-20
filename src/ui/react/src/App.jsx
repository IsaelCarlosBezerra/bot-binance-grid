import { useState, useEffect } from "react"
import Header from "./components/Header"
import StatusIndicator from "./components/StatusIndicator"
import Controls from "./components/Controls"
import FinancialSummary from "./components/FinancialSummary"
import MarketState from "./components/MarketState"
import BotConfiguration from "./components/BotConfiguration"
import OpenPositions from "./components/OpenPositions"
import {
	startBot,
	stopBot,
	saveConfig,
	loadStatus,
	loadBalance,
	loadAlocado,
	loadSumaryPrevisto,
} from "./services/api"

function App() {
	const [data, setData] = useState(null)
	const [balance, setBalance] = useState(0)
	const [alocado, setAlocado] = useState({
		valorAlocado: 0,
		qtdAlocada: 0,
	})
	const [summaryPrevisto, setSummaryPrevisto] = useState(null)

	const fetchStatus = async () => {
		const status = await loadStatus()
		if (status) {
			setData(status)
		}
	}

	const fechtBalance = async () => {
		const balance = await loadBalance()
		if (balance) {
			setBalance(balance.balance)
		}
	}

	const fechtTotalAlocado = async () => {
		const alocado = await loadAlocado()
		if (alocado) {
			setAlocado({ valorAlocado: alocado.valorAlocado, qtdAlocada: alocado.qtdAlocada })
		}
	}

	const fechtResultadosPrevistos = async () => {
		const summaryPrevisto = await loadSumaryPrevisto()

		if (summaryPrevisto) {
			setSummaryPrevisto(summaryPrevisto.summary)
		}
	}

	useEffect(() => {
		fetchStatus()
		fechtBalance()
		fechtTotalAlocado()
		fechtResultadosPrevistos()
		const interval = setInterval(fetchStatus, 3000)
		return () => clearInterval(interval)
	}, [])

	const handleStart = async () => {
		await startBot()
		fetchStatus()
		fechtBalance()
		fechtResultadosPrevistos()
	}

	const handleStop = async () => {
		await stopBot()
		fetchStatus()
		fechtBalance()
		fechtResultadosPrevistos()
	}

	const handleSaveConfig = async (config) => {
		const success = await saveConfig(config)
		if (success) {
			alert("Configuração salva")
			fetchStatus()
			fechtBalance()
			fechtResultadosPrevistos()
		} else {
			alert("Erro ao salvar configuração")
		}
	}

	return (
		<>
			<Header />
			<div className="container">
				<StatusIndicator enabled={data?.enabled || false} />
				<Controls
					onStart={handleStart}
					onStop={handleStop}
					price={data?.strategy.currentPrice}
				/>

				<div className="cards">
					<FinancialSummary
						summary={data?.summary}
						balance={balance}
						alocado={alocado}
						summaryPrevisto={summaryPrevisto}
					/>
					<MarketState strategy={data?.strategy} />
					<BotConfiguration config={data?.config} onSave={handleSaveConfig} />
					<OpenPositions positions={data?.openPositions} />
				</div>
			</div>
		</>
	)
}

export default App
