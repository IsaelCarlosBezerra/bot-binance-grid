export default function FinancialSummary({ summary }) {
    if (!summary) {
        return (
            <div className="card">
                <h3>Resumo Financeiro</h3>
                <div>Carregando...</div>
            </div>
        )
    }

    const { compras, vendas, lucroLiquido, totalTaxas, totalIR } = summary

    return (
        <div className="card">
            <h3>Resumo Financeiro</h3>

            <div className="section">
                <strong>Compras</strong>
                <div>Quantidade: {compras.quantidade}</div>
                <div>Valor total: {compras.valorTotal.toFixed(2)} USDT</div>
            </div>

            <div className="section">
                <strong>Vendas</strong>
                <div>Quantidade: {vendas.quantidade}</div>
                <div>Valor total: {vendas.valorTotal.toFixed(2)} USDT</div>
            </div>

            <div className="section">
                <strong>Resultado</strong>
                <div>
                    Lucro líquido:{' '}
                    <span className={lucroLiquido >= 0 ? 'positive' : 'negative'}>
                        {lucroLiquido.toFixed(2)} USDT
                    </span>
                </div>
                <div>Taxas pagas: {totalTaxas.toFixed(2)} USDT</div>
                <div>IR estimado: {totalIR.toFixed(2)} USDT</div>
            </div>
        </div>
    )
}
