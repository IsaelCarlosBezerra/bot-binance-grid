"use client"

import { useState } from "react"
import { buy } from "../services/api"

export default function Controls({ onStart, onStop, price }) {
	const [valor, setValor] = useState(0)
	const [qtd, setQtd] = useState("")

	const comprar = async (symbol, qtd) => {
		if (confirm(`Confirma compra de ${qtd} BTC por ${valor.toFixed(2)} USDT?`)) {
			const success = await buy({ symbol, qtd })
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
			<div className="controlsbuy">
				<span className="controlsbuy-label">BTCUSDT</span>
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
					onClick={() => comprar("BTCUSDT", qtd)}
					className="comprar"
				>
					Comprar
				</button>
			</div>
		</div>
	)
}
