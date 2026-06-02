"use client"

import { useState } from "react"
import { buy } from "../services/api"

export default function Controls({ onStart, onStop, price }) {
	const [valor, setValor] = useState(0)
	const [qtd, setQtd] = useState("")

	const comprar = async (symbol, qtd) => {
		if (confirm(`Confirma ordem de compra no valor de ${valor.toFixed(2)} USDT`)) {
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
				<button className="stop" onClick={onStop}>⏸ Parar</button>
			</div>
			<div className="controlsbuy">
				<label style={{ margin: 0, fontSize: 13 }}>BTCUSDT</label>
				<label style={{ margin: 0, fontSize: 13, color: "var(--text-secondary)" }}>
					{valor.toFixed(2)} USDT
				</label>
				<input
					min={0}
					type="number"
					placeholder="0.00"
					onChange={handleChangeQtd}
					autoComplete="off"
				/>
				<button
					disabled={!Number(qtd) > 0}
					onClick={() => comprar("BTCUSDT", qtd)}
					className="comprar"
				>
					Comprar
				</button>
			</div>
		</div>
	)
}
