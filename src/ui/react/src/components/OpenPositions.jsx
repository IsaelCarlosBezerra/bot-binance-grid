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
			<div className="table-wrap">
				<table>
					<thead>
						<tr>
							<th>Status</th>
							<th>Compra</th>
							<th>Alvo</th>
							<th>Qtd</th>
							<th>Investido</th>
							<th>Lucro esp.</th>
						</tr>
					</thead>
					<tbody>
						{positions.map((pos, i) => {
							const invested = pos.buyPrice * pos.quantity
							const profit = (pos.sellPrice - pos.buyPrice) * pos.quantity
							return (
								<tr key={i}>
									<td>
										<span className="status-badge">OPEN</span>
									</td>
									<td>{pos.buyPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
									<td>{pos.sellPrice.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</td>
									<td>{pos.quantity}</td>
									<td>{invested.toFixed(2)}</td>
									<td className={profit >= 0 ? "positive" : "negative"}>
										{profit >= 0 ? "+" : ""}{profit.toFixed(2)}
									</td>
								</tr>
							)
						})}
					</tbody>
				</table>
			</div>
		</div>
	)
}
