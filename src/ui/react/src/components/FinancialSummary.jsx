function fmt(n) {
	return (n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

export default function FinancialSummary({ summary, balance, alocado, summaryPrevisto }) {
	if (!summary || !summaryPrevisto) {
		return (
			<div className="card">
				<div className="card-title">Financeiro</div>
				<div style={{ color: "var(--text-3)", fontSize: 14 }}>Carregando...</div>
			</div>
		)
	}

	const { compras, vendas, lucroLiquido, totalTaxas, totalIR } = summary
	const { valorAlocado, qtdAlocada } = alocado ?? { valorAlocado: 0, qtdAlocada: 0 }
	const bal = balance ?? 0
	const saldoCarteira = valorAlocado + bal
	const percentualAlocado = saldoCarteira > 0 ? (valorAlocado / saldoCarteira) * 100 : 0
	const { lucroLiquidoAberto, totalTaxasAberto, totalIRAberto } = summaryPrevisto
	const lucroTotal = lucroLiquido + lucroLiquidoAberto

	return (
		<div className="card">
			<div className="card-title">Financeiro</div>

			<div className="metrics-grid">
				<div className="metric highlight">
					<span className="metric-label">Lucro Total</span>
					<span className={`metric-value ${lucroTotal >= 0 ? "positive" : "negative"}`}>
						{lucroTotal >= 0 ? "+" : ""}{fmt(lucroTotal)}
					</span>
				</div>
				<div className="metric">
					<span className="metric-label">Realizado</span>
					<span className={`metric-value ${lucroLiquido >= 0 ? "positive" : "negative"}`}>
						{lucroLiquido >= 0 ? "+" : ""}{fmt(lucroLiquido)}
					</span>
				</div>
				<div className="metric">
					<span className="metric-label">Em aberto</span>
					<span className={`metric-value ${lucroLiquidoAberto >= 0 ? "positive" : "negative"}`}>
						{lucroLiquidoAberto >= 0 ? "+" : ""}{fmt(lucroLiquidoAberto)}
					</span>
				</div>
			</div>

			<div className="divider" />

			<div className="metrics-grid" style={{ gridTemplateColumns: "1fr 1fr 1fr" }}>
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

			<div className="divider" />

			<div className="stat-row">
				<span className="stat-label">Compras realizadas</span>
				<span className="stat-value">{compras.quantidade} · {fmt(compras.valorTotal)} USDT</span>
			</div>
			<div className="stat-row">
				<span className="stat-label">Vendas realizadas</span>
				<span className="stat-value">{vendas.quantidade} · {fmt(vendas.valorTotal)} USDT</span>
			</div>
			<div className="stat-row">
				<span className="stat-label">Qtd. alocada</span>
				<span className="stat-value">{qtdAlocada.toFixed(6)} BTC</span>
			</div>
			<div className="stat-row">
				<span className="stat-label">Taxas pagas</span>
				<span className="stat-value">{fmt(totalTaxas + totalTaxasAberto)} USDT</span>
			</div>
			<div className="stat-row">
				<span className="stat-label">IR estimado</span>
				<span className="stat-value">{fmt(totalIR + totalIRAberto)} USDT</span>
			</div>
		</div>
	)
}
