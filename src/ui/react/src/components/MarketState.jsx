import StatusIndicator from "./StatusIndicator"
import Controls from "./Controls"

export default function MarketState({ strategy, enabled, onStart, onStop, price, symbol }) {
	const { currentPrice, nextBuyPrice, nextSellPrice } = strategy ?? {}
	const marketSymbol = symbol ?? "BTCUSDT"

	return (
		<div className="card market-card">
			<div className="card-title">Mercado</div>

			<div className="market-header">
				<div>
					<div className="market-symbol">{marketSymbol}</div>
					<div className="market-subtitle">Preço atual, pontos de grid e ação do bot</div>
				</div>
				<StatusIndicator enabled={enabled} />
			</div>

			<div className="price-display">
				<div className="price-symbol">{marketSymbol}</div>
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

			<div className="divider" />

			<Controls
				onStart={onStart}
				onStop={onStop}
				price={price}
				symbol={marketSymbol}
			/>
		</div>
	)
}
