function fmt(n) {
	return (n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function WalletSummary({ balance, alocado }) {
	if (balance === null || balance === undefined) {
		return (
			<div className="card">
				<div className="card-title">Carteira</div>
				<div style={{ color: "var(--text-3)", fontSize: 14 }}>Carregando...</div>
			</div>
		)
	}

	const { valorAlocado } = alocado ?? { valorAlocado: 0, qtdAlocada: 0 }
	const bal = balance ?? 0
	const saldoCarteira = valorAlocado + bal
	const percentualAlocado = saldoCarteira > 0 ? (valorAlocado / saldoCarteira) * 100 : 0

	return (
		<div className="card finance-card">
			<div className="card-title">Carteira</div>

			<div className="wallet-actions">
				<button type="button" className="wallet-sync-btn">
					Sincronizar saldo da carteira
				</button>
			</div>

			<div className="metrics-grid finance-wallet-grid">
				<div className="metric">
					<span className="metric-label">Saldo Total</span>
					<span className="metric-value accent">{fmt(saldoCarteira)}</span>
				</div>
				<div className="metric">
					<span className="metric-label">Saldo Livre</span>
					<span className="metric-value">{fmt(bal)}</span>
				</div>
				<div className="metric">
					<span className="metric-label">% Alocado</span>
					<span className="metric-value gold">{percentualAlocado.toFixed(1)}%</span>
				</div>
			</div>
		</div>
	)
}
