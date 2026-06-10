import { useState } from "react"
import { buy } from "../services/api"

export default function Controls({ onStart, onStop, price, symbol = "BTCUSDT", showBuy = true }) {
	const [valor, setValor] = useState(0)
	const [qtd, setQtd] = useState("")

	const comprar = async (tradeSymbol, tradeQtd) => {
		if (confirm(`Confirma compra de ${tradeQtd} ${tradeSymbol} por ${valor.toFixed(2)} USDT?`)) {
			const success = await buy({ symbol: tradeSymbol, qtd: tradeQtd })
			if (!success) alert("Erro ao executar compra")
		}
	}

	const handleChangeQtd = (e) => {
		let value = e.target.value.replace("-", "")
		if (value.startsWith(".")) value = "0" + value
		if (/^0\d+/.test(value)) value = "0." + value.slice(1)
		if (!/^\d*(?:\.\d*)?$/.test(value)) return
		e.target.value = value
		setQtd(value)
		setValor(Number(value) * (price ?? 0))
	}

	return (
		<div className="controls">
			<div className="controls-actions">
				<button className="start" onClick={onStart}>▶ Iniciar</button>
				<button className="stop" onClick={onStop}>⏸ Pausar</button>
			</div>
			{showBuy && (
				<div className="controlsbuy">
					<span className="controlsbuy-label">{symbol}</span>
					<span className="controlsbuy-label">{valor.toFixed(2)} USDT</span>
					<input
						type="number"
						min={0}
						placeholder="0.00"
						onChange={handleChangeQtd}
						autoComplete="off"
					/>
					<button
						disabled={!(Number(qtd) > 0)}
						onClick={() => comprar(symbol, qtd)}
						className="comprar"
					>
						Comprar
					</button>
				</div>
			)}
		</div>
	)
}
