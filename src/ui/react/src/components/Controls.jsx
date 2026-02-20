"use client"

import { useState } from "react"
import { buy } from "../services/api"

export default function Controls({ onStart, onStop, price }) {
	const [valor, setValor] = useState(0)
	const [qtd, setQtd] = useState()

	const comprar = async (symbol, qtd) => {
		if (confirm(`Confirma ordem de compra no valor de R$${valor.toFixed(2)}`)) {
			const success = await buy({ symbol, qtd })
			if (!success) {
				alert("Erro ao executar compra")
			}
		}
	}

	const handleChangeQtd = (e) => {
		let value = e.target.value

		value = value.replace("-", "")

		if (value.startsWith(".")) {
			value = "0" + value
		}

		if (/^0\d+/.test(value)) {
			value = "0." + value.slice(1)
		}

		if (!/^\d*(?:\.\d*)?$/.test(value)) return

		e.target.value = value
		setQtd(value)

		setValor(value * price)
	}

	return (
		<div className="controls">
			<div>
				<button className="start" onClick={onStart}>
					▶ Iniciar
				</button>
				<button className="stop" onClick={onStop}>
					⏸ Parar
				</button>
			</div>
			<div className="controlsbuy">
				<label>BTCUSDT</label>
				<label>{valor.toFixed(2)}</label>
				<input min={0} type="number" value={0} onChange={handleChangeQtd} />
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
