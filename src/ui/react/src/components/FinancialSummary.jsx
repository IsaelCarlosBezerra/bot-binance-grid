export default function FinancialSummary({ summary, balance, alocado, summaryPrevisto }) {
	if (!summary) {
		return (
			<div className="card">
				<h3>Resumo Financeiro</h3>
				<div>Carregando...</div>
			</div>
		)
	}

	const { compras, vendas, lucroLiquido, totalTaxas, totalIR } = summary
	const { valorAlocado, qtdAlocada } = alocado
	const saldoCarteira = valorAlocado + balance
	const percentualAlocado = (valorAlocado / saldoCarteira) * 100
	const { vendasAbertas, lucroLiquidoAberto, totalTaxasAberto, totalIRAberto } = summaryPrevisto

	return (
		<div className="card">
			<h3>Resumo Financeiro</h3>

			<div className="section">
				<strong>Compras Fechadas</strong>
				<div>Quantidade: {compras.quantidade}</div>
				<div>Valor total: {compras.valorTotal.toFixed(2)} USDT</div>
			</div>

			<div className="section">
				<strong>Vendas Fechadas</strong>
				<div>Quantidade: {vendas.quantidade}</div>
				<div>Valor total: {vendas.valorTotal.toFixed(2)} USDT</div>
			</div>

			<div className="section">
				<strong>Vendas Abertas</strong>
				<div>Quantidade: {vendasAbertas.quantidade}</div>
				<div>Valor total: {vendasAbertas.valorTotal.toFixed(2)} USDT</div>
			</div>

			<div className="section">
				<strong>Resultado Fechado</strong>
				<div>
					Lucro líquido:{" "}
					<span className={lucroLiquido >= 0 ? "positive" : "negative"}>
						{lucroLiquido.toFixed(2)} USDT
					</span>
				</div>
				<div>Taxas pagas: {totalTaxas.toFixed(2)} USDT</div>
				<div>IR estimado: {totalIR.toFixed(2)} USDT</div>
			</div>

			<div className="section">
				<strong>Resultado Aberto</strong>
				<div>
					Lucro líquido:{" "}
					<span className={lucroLiquidoAberto >= 0 ? "positive" : "negative"}>
						{lucroLiquidoAberto.toFixed(2)} USDT
					</span>
				</div>
				<div>Taxas pagas: {totalTaxasAberto.toFixed(2)} USDT</div>
				<div>IR estimado: {totalIRAberto.toFixed(2)} USDT</div>
			</div>

			<div className="section">
				<strong>Carteira</strong>
				<div>Saldo Total {saldoCarteira.toFixed(2)} USDT</div>
				<div>Saldo Livre {balance.toFixed(2)} USDT</div>
			</div>

			<div className="section">
				<strong>Alocado</strong>
				<div>Valor Alocado {valorAlocado.toFixed(2)} USDT</div>
				<div>Qtd. Alocada {qtdAlocada.toFixed(4)} USDT</div>
				<div>% Alocado {percentualAlocado.toFixed(2)}%</div>
			</div>
		</div>
	)
}
