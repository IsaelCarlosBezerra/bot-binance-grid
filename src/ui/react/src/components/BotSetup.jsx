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
			setError("Erro ao salvar. Verifique as credenciais e tente novamente.")
		}
	}

	const set = (field) => (e) =>
		setForm({ ...form, [field]: e.target.type === "checkbox" ? e.target.checked : e.target.value })

	return (
		<div className="login-page">
			<div className="login-card" style={{ maxWidth: 460 }}>
				<div className="login-brand">
					<div className="login-brand-icon">🔑</div>
					<h2 className="login-title" style={{ fontSize: "1.3rem" }}>Conectar Binance</h2>
					<p className="login-subtitle">Insira suas credenciais para começar a operar</p>
				</div>

				<form onSubmit={handleSubmit} className="login-form" autoComplete="off">
					<input
						className="login-input"
						type="text"
						placeholder="API Key"
						value={form.binanceApiKey}
						onChange={set("binanceApiKey")}
						autoComplete="off"
						required
					/>
					<input
						className="login-input"
						type="password"
						placeholder="API Secret"
						value={form.binanceApiSecret}
						onChange={set("binanceApiSecret")}
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
					<label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, color: "var(--text-2)", cursor: "pointer" }}>
						<input
							type="checkbox"
							checked={form.testnet}
							onChange={set("testnet")}
							style={{ width: "auto", accentColor: "var(--accent)" }}
						/>
						Usar Testnet da Binance (recomendado para testes)
					</label>

					{error && <p className="login-error">{error}</p>}

					<button className="login-btn" type="submit" disabled={loading}>
						{loading ? "Salvando..." : "Conectar e continuar"}
					</button>
				</form>
			</div>
		</div>
	)
}
