export default function MarketState({ strategy }) {
    if (!strategy) {
        return (
            <div className="card">
                <h3>Estado de Mercado</h3>
                <div>Carregando...</div>
            </div>
        )
    }

    const { currentPrice, nextBuyPrice, nextSellPrice } = strategy

    return (
        <div className="card">
            <h3>Estado de Mercado</h3>

            <div className="section">
                <strong>Mercado</strong>
                <div>
                    Preço atual: {currentPrice ? `${currentPrice.toFixed(2)} USDT` : '-'}
                </div>
            </div>

            <div className="section">
                <strong>Próxima ação</strong>
                <div>
                    Compra esperada em:{' '}
                    {nextBuyPrice ? `${nextBuyPrice.toFixed(2)} USDT` : '-'}
                </div>
                <div>
                    Venda esperada em:{' '}
                    {nextSellPrice
                        ? `${nextSellPrice.toFixed(2)} USDT`
                        : 'Não existe venda em aberto.'}
                </div>
            </div>
        </div>
    )
}
