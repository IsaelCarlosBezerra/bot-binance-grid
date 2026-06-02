import { useState } from "react"
import { login, register } from "../services/api"

export default function LoginPage({ onAuth }) {
	const [mode, setMode] = useState("login") // "login" | "register"
	const [form, setForm] = useState({ name: "", email: "", password: "" })
	const [error, setError] = useState("")
	const [loading, setLoading] = useState(false)

	const handleSubmit = async (e) => {
		e.preventDefault()
		setError("")
		setLoading(true)
		try {
			const user =
				mode === "login"
					? await login(form.email, form.password)
					: await register(form.name, form.email, form.password)
			onAuth(user)
		} catch (err) {
			setError(err.message)
		} finally {
			setLoading(false)
		}
	}

	return (
		<div className="login-page">
			<div className="login-card">
				<h1 className="login-title">Grid Bot</h1>
				<p className="login-subtitle">Plataforma de trading automatizado</p>

				<div className="login-tabs">
					<button
						className={`login-tab ${mode === "login" ? "active" : ""}`}
						onClick={() => setMode("login")}
					>
						Entrar
					</button>
					<button
						className={`login-tab ${mode === "register" ? "active" : ""}`}
						onClick={() => setMode("register")}
					>
						Cadastrar
					</button>
				</div>

				<form onSubmit={handleSubmit} className="login-form">
					{mode === "register" && (
						<input
							className="login-input"
							type="text"
							placeholder="Nome"
							value={form.name}
							onChange={(e) => setForm({ ...form, name: e.target.value })}
							required
						/>
					)}
					<input
						className="login-input"
						type="email"
						placeholder="E-mail"
						value={form.email}
						onChange={(e) => setForm({ ...form, email: e.target.value })}
						required
					/>
					<input
						className="login-input"
						type="password"
						placeholder="Senha"
						value={form.password}
						onChange={(e) => setForm({ ...form, password: e.target.value })}
						required
					/>

					{error && <p className="login-error">{error}</p>}

					<button className="login-btn" type="submit" disabled={loading}>
						{loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
					</button>
				</form>
			</div>
		</div>
	)
}
