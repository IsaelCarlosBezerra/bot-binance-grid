import { useState } from "react"
import { setupBot } from "../services/api"

export default function BotSetup({ onSetup }) {
	const [form, setForm] = useState({
		binanceApiKey: "",
		binanceApiSecret: "",
		testnet: true,
		symbol: "BTCUSDT",
	})
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError("")
		setLoading(true)
		const result = await setupBot(form)
		setLoading(false)
		if (result?.ok) {
			onSetup()
		} else {
			setError("Erro ao salvar configuração. Verifique as credenciais.")
		}
	}

	return (
		<div className="login-page">
			<div className="login-card" style={{ maxWidth: 480 }}>
				<h2 className="login-title" style={{ fontSize: "1.4rem" }}>Configurar Bot</h2>
				<p className="login-subtitle">Insira suas credenciais da Binance para começar</p>

				<form onSubmit={handleSubmit} className="login-form" autoComplete="off">
					<input
						className="login-input"
						type="text"
						placeholder="Binance API Key"
						value={form.binanceApiKey}
						onChange={(e) => setForm({ ...form, binanceApiKey: e.target.value })}
						autoComplete="off"
						required
					/>
					<input
						className="login-input"
						type="password"
						placeholder="Binance API Secret"
						value={form.binanceApiSecret}
						onChange={(e) => setForm({ ...form, binanceApiSecret: e.target.value })}
						autoComplete="new-password"
						required
					/>
					<input
						className="login-input"
						type="text"
						placeholder="Símbolo (ex: BTCUSDT)"
						value={form.symbol}
						onChange={(e) => setForm({ ...form, symbol: e.target.value.toUpperCase() })}
					/>
					<label style={{ display: "flex", alignItems: "center", gap: 8, color: "#aaa", fontSize: "0.9rem" }}>
						<input
							type="checkbox"
							checked={form.testnet}
							onChange={(e) => setForm({ ...form, testnet: e.target.checked })}
						/>
						Usar Testnet da Binance
					</label>

					{error && <p className="login-error">{error}</p>}

					<button className="login-btn" type="submit" disabled={loading}>
						{loading ? "Salvando..." : "Salvar e continuar"}
					</button>
				</form>
			</div>
		</div>
	)
}
