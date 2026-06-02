export default function MarketState({ strategy }) {
	const { currentPrice, nextBuyPrice, nextSellPrice } = strategy ?? {}

	return (
		<div className="card">
			<div className="card-title">Mercado</div>

			<div className="price-display">
				<div className="price-symbol">BTCUSDT</div>
				<div className="price-current">
					{currentPrice ? currentPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : "—"}
				</div>
				<div className="price-unit">USDT</div>
			</div>

			<div className="price-targets">
				<div className="price-target">
					<span className="target-label">Próxima Compra</span>
					{nextBuyPrice
						? <span className="target-value buy">{nextBuyPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
						: <span className="target-value none">aguardando</span>
					}
				</div>
				<div className="price-target">
					<span className="target-label">Próxima Venda</span>
					{nextSellPrice
						? <span className="target-value sell">{nextSellPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</span>
						: <span className="target-value none">sem posição</span>
					}
				</div>
			</div>
		</div>
	)
}
