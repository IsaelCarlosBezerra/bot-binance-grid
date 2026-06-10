function fmt(n) {
	return (n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function metricClass(value) {
	return value >= 0 ? "positive" : "negative"
}

export default function FinancialSummary({ summary, summaryPrevisto }) {
	if (!summary || !summaryPrevisto) {
		return (
			<div className="card">
				<div className="card-title">Resultados</div>
				<div style={{ color: "var(--text-3)", fontSize: 14 }}>Carregando...</div>
			</div>
		)
	}

	const { compras, vendas, lucroLiquido, totalTaxas, totalIR } = summary
	const { lucroLiquidoAberto } = summaryPrevisto
	const lucroTotal = lucroLiquido + lucroLiquidoAberto

	return (
		<div className="card finance-card">
			<div className="card-title">Resultados</div>

			<div className="metrics-grid finance-results-grid">
				<div className="metric highlight">
					<span className="metric-label">Lucro Total</span>
					<span className={`metric-value ${metricClass(lucroTotal)}`}>
						{lucroTotal >= 0 ? "+" : ""}{fmt(lucroTotal)}
					</span>
				</div>
				<div className="metric">
					<span className="metric-label">Realizado</span>
					<span className={`metric-value ${metricClass(lucroLiquido)}`}>
						{lucroLiquido >= 0 ? "+" : ""}{fmt(lucroLiquido)}
					</span>
				</div>
				<div className="metric">
					<span className="metric-label">Em aberto</span>
					<span className={`metric-value ${metricClass(lucroLiquidoAberto)}`}>
						{lucroLiquidoAberto >= 0 ? "+" : ""}{fmt(lucroLiquidoAberto)}
					</span>
				</div>
			</div>

			<div className="finance-section finance-details">
				<div className="finance-section-header">
					<h3>Detalhes</h3>
				</div>

				<div className="metrics-grid finance-details-grid">
					<div className="metric">
						<span className="metric-label">Compras realizadas</span>
						<span className="metric-value">{compras?.quantidade ?? 0}</span>
					</div>
					<div className="metric">
						<span className="metric-label">Vendas realizadas</span>
						<span className="metric-value">{vendas?.quantidade ?? 0}</span>
					</div>
					<div className="metric">
						<span className="metric-label">Taxas pagas</span>
						<span className="metric-value">{fmt(totalTaxas)}</span>
					</div>
					<div className="metric">
						<span className="metric-label">IR estimado</span>
						<span className="metric-value">{fmt(totalIR)}</span>
					</div>
				</div>
			</div>
		</div>
	)
}
