import { useState, useEffect } from "react"
import { setupBot, saveConfig } from "../services/api"

export default function SettingsPage({ config, user, onSaved, onClose }) {
	const [tab, setTab] = useState("bot")
	const [saving, setSaving] = useState(false)
	const [message, setMessage] = useState(null)

	// ── Credenciais Binance ────────────────────────────────────────────────
	const [keys, setKeys] = useState({
		binanceApiKey: "",
		binanceApiSecret: "",
		testnet: config?.testnet ?? true,
		symbol: config?.symbol ?? "BTCUSDT",
	})

	// ── Config do bot ──────────────────────────────────────────────────────
	const [botForm, setBotForm] = useState({
		buyPercentageOfBalance: "",
		targetNetProfit: "",
		grossTargetPercentage: "",
		dropPercentage: "",
		cycleIntervalMs: "",
		buyReferenceMode: "LAST_BUY",
	})

	useEffect(() => {
		if (!config) return
		setBotForm({
			buyPercentageOfBalance: config.buyPercentageOfBalance ?? "",
			targetNetProfit: ((config.targetNetProfit ?? 0) * 100).toFixed(2),
			grossTargetPercentage: ((config.grossTargetPercentage ?? 0) * 100).toFixed(2),
			dropPercentage: ((config.dropPercentage ?? 0) * 100).toFixed(2),
			cycleIntervalMs: config.cycleIntervalMs ?? 5000,
			buyReferenceMode: config.buyReferenceMode ?? "LAST_BUY",
		})
		setKeys((k) => ({
			...k,
			testnet: config.testnet ?? true,
			symbol: config.symbol ?? "BTCUSDT",
		}))
	}, [config])

	const notify = (text, ok = true) => {
		setMessage({ text, ok })
		setTimeout(() => setMessage(null), 3000)
	}

	const handleSaveKeys = async (e) => {
		e.preventDefault()
		if (!keys.binanceApiKey || !keys.binanceApiSecret) {
			notify("Preencha API Key e API Secret", false)
			return
		}
		setSaving(true)
		const result = await setupBot(keys)
		setSaving(false)
		if (result?.ok) {
			notify("Credenciais salvas com sucesso")
			onSaved()
		} else {
			notify("Erro ao salvar credenciais", false)
		}
	}

	const handleSaveBot = async (e) => {
		e.preventDefault()
		setSaving(true)
		const result = await saveConfig({
			buyPercentageOfBalance: Number(botForm.buyPercentageOfBalance),
			targetNetProfit: Number(botForm.targetNetProfit) / 100,
			grossTargetPercentage: Number(botForm.grossTargetPercentage) / 100,
			dropPercentage: Number(botForm.dropPercentage) / 100,
			cycleIntervalMs: Number(botForm.cycleIntervalMs),
			buyReferenceMode: botForm.buyReferenceMode,
		})
		setSaving(false)
		if (result?.ok) {
			notify("Configurações salvas")
			onSaved()
		} else {
			notify("Erro ao salvar configurações", false)
		}
	}

	return (
		<div className="settings-overlay">
			<div className="settings-modal">
				<div className="settings-header">
					<h2>Configurações</h2>
					<button className="settings-close" onClick={onClose}>✕</button>
				</div>

				<div className="settings-user">
					<span>{user?.name}</span>
					<span className="header-email">{user?.email}</span>
					<span className={`plan-badge plan-${user?.plan?.toLowerCase()}`}>{user?.plan}</span>
				</div>

				<div className="login-tabs" style={{ marginBottom: 24 }}>
					<button
						className={`login-tab ${tab === "bot" ? "active" : ""}`}
						onClick={() => setTab("bot")}
					>
						Parâmetros do Bot
					</button>
					<button
						className={`login-tab ${tab === "keys" ? "active" : ""}`}
						onClick={() => setTab("keys")}
					>
						Credenciais Binance
					</button>
				</div>

				{message && (
					<div className={`settings-message ${message.ok ? "ok" : "err"}`}>
						{message.text}
					</div>
				)}

				{tab === "bot" && (
					<form onSubmit={handleSaveBot} className="settings-form">
						<div className="settings-field">
							<label>Símbolo</label>
							<input
								type="text"
								value={keys.symbol}
								onChange={(e) => setKeys({ ...keys, symbol: e.target.value.toUpperCase() })}
							/>
						</div>
						<div className="settings-field">
							<label>% do saldo por compra</label>
							<input
								type="number"
								step="0.01"
								min="0.01"
								max="1"
								value={botForm.buyPercentageOfBalance}
								onChange={(e) => setBotForm({ ...botForm, buyPercentageOfBalance: e.target.value })}
							/>
						</div>
						<div className="settings-field">
							<label>Queda para comprar (%)</label>
							<input
								type="number"
								step="0.01"
								value={botForm.dropPercentage}
								onChange={(e) => setBotForm({ ...botForm, dropPercentage: e.target.value })}
							/>
						</div>
						<div className="settings-field">
							<label>Lucro bruto alvo (%)</label>
							<input
								type="number"
								step="0.01"
								value={botForm.grossTargetPercentage}
								onChange={(e) => setBotForm({ ...botForm, grossTargetPercentage: e.target.value })}
							/>
						</div>
						<div className="settings-field">
							<label>Lucro líquido alvo (%)</label>
							<input
								type="number"
								step="0.01"
								value={botForm.targetNetProfit}
								onChange={(e) => setBotForm({ ...botForm, targetNetProfit: e.target.value })}
							/>
						</div>
						<div className="settings-field">
							<label>Intervalo do ciclo (ms)</label>
							<input
								type="number"
								step="1000"
								min="1000"
								value={botForm.cycleIntervalMs}
								onChange={(e) => setBotForm({ ...botForm, cycleIntervalMs: e.target.value })}
							/>
						</div>
						<div className="settings-field">
							<label>Modo de referência de compra</label>
							<select
								value={botForm.buyReferenceMode}
								onChange={(e) => setBotForm({ ...botForm, buyReferenceMode: e.target.value })}
							>
								<option value="LAST_BUY">Última compra</option>
								<option value="ANCHOR">Âncora</option>
							</select>
						</div>
						<button className="login-btn" type="submit" disabled={saving}>
							{saving ? "Salvando..." : "Salvar parâmetros"}
						</button>
					</form>
				)}

				{tab === "keys" && (
					<form onSubmit={handleSaveKeys} className="settings-form">
						<p className="settings-hint">
							Suas chaves são criptografadas antes de serem salvas. Preencha apenas se quiser substituir as atuais.
						</p>
						<div className="settings-field">
							<label>API Key</label>
							<input
								type="text"
								placeholder="Nova API Key"
								autoComplete="off"
								value={keys.binanceApiKey}
								onChange={(e) => setKeys({ ...keys, binanceApiKey: e.target.value })}
							/>
						</div>
						<div className="settings-field">
							<label>API Secret</label>
							<input
								type="password"
								placeholder="Novo API Secret"
								autoComplete="new-password"
								value={keys.binanceApiSecret}
								onChange={(e) => setKeys({ ...keys, binanceApiSecret: e.target.value })}
							/>
						</div>
						<div className="settings-field">
							<label style={{ display: "flex", alignItems: "center", gap: 8 }}>
								<input
									type="checkbox"
									checked={keys.testnet}
									onChange={(e) => setKeys({ ...keys, testnet: e.target.checked })}
								/>
								Usar Testnet da Binance
							</label>
						</div>
						<button className="login-btn" type="submit" disabled={saving}>
							{saving ? "Salvando..." : "Atualizar credenciais"}
						</button>
					</form>
				)}
			</div>
		</div>
	)
}
