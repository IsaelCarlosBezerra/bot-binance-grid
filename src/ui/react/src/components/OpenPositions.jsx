function fmt(n) {
	return (n ?? 0).toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const BINANCE_FEE_RATE = 0.001
const IR_RATE = 0.15

function PositionCard({ pos }) {
	const invested = pos.buyPrice * pos.quantity
	const buyValue = pos.buyPrice * pos.quantity
	const sellValue = pos.sellPrice * pos.quantity
	const grossProfit = sellValue - buyValue
	const fees = buyValue * BINANCE_FEE_RATE + sellValue * BINANCE_FEE_RATE
	const ir = grossProfit > 0 ? grossProfit * IR_RATE : 0
	const profit = grossProfit - fees - ir

	return (
		<div className="position-mobile-card">
			<div className="position-mobile-top">
				<span className="status-badge">OPEN</span>
				<div className="position-mobile-profit-block">
					<span className="position-mobile-profit-label">Lucro esp. líquido</span>
					<span className={`position-mobile-profit ${profit >= 0 ? "positive" : "negative"}`}>
						{profit >= 0 ? "+" : ""}{fmt(profit)}
					</span>
				</div>
			</div>

			<div className="position-mobile-grid">
				<div>
					<span className="position-mobile-label">Compra</span>
					<span className="position-mobile-value">{fmt(pos.buyPrice)}</span>
				</div>
				<div>
					<span className="position-mobile-label">Alvo</span>
					<span className="position-mobile-value">{fmt(pos.sellPrice)}</span>
				</div>
				<div>
					<span className="position-mobile-label">Qtd</span>
					<span className="position-mobile-value">{pos.quantity}</span>
				</div>
				<div>
					<span className="position-mobile-label">Investido</span>
					<span className="position-mobile-value">{fmt(invested)} USDT</span>
				</div>
			</div>
		</div>
	)
}

export default function OpenPositions({ positions }) {
	if (!positions || positions.length === 0) {
		return (
			<div className="card">
				<div className="card-title">Posições Abertas</div>
				<div className="no-positions">Nenhuma posição aberta</div>
			</div>
		)
	}

	return (
		<div className="card">
			<div className="card-title">Posições Abertas · {positions.length}</div>

			<div className="table-wrap positions-table">
				<table>
					<thead>
						<tr>
							<th>Status</th>
							<th>Compra</th>
							<th>Alvo</th>
							<th>Qtd</th>
							<th>Investido</th>
							<th>Lucro esp. líquido</th>
						</tr>
					</thead>
					<tbody>
						{positions.map((pos) => {
							const invested = pos.buyPrice * pos.quantity
							const buyValue = pos.buyPrice * pos.quantity
							const sellValue = pos.sellPrice * pos.quantity
							const grossProfit = sellValue - buyValue
							const fees = buyValue * BINANCE_FEE_RATE + sellValue * BINANCE_FEE_RATE
							const ir = grossProfit > 0 ? grossProfit * IR_RATE : 0
							const profit = grossProfit - fees - ir
							return (
								<tr key={pos.id}>
									<td>
										<span className="status-badge">OPEN</span>
									</td>
									<td>{fmt(pos.buyPrice)}</td>
									<td>{fmt(pos.sellPrice)}</td>
									<td>{pos.quantity}</td>
									<td>{fmt(invested)}</td>
									<td className={profit >= 0 ? "positive" : "negative"}>
										{profit >= 0 ? "+" : ""}{fmt(profit)}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>

			<div className="positions-mobile-list">
				{positions.map((pos) => (
					<PositionCard key={pos.id} pos={pos} />
				))}
			</div>
		</div>
	)
}
