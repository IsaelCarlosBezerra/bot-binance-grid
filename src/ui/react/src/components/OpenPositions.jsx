export default function OpenPositions({ positions }) {
    if (!positions || positions.length === 0) {
        return (
            <div className="card">
                <h3>Posições Abertas</h3>
                <div className="no-positions">Nenhuma posição aberta no momento.</div>
            </div>
        )
    }

    return (
        <div className="card">
            <h3>Posições Abertas</h3>

            <table>
                <thead>
                    <tr>
                        <th>Status</th>
                        <th>Compra</th>
                        <th>Venda alvo</th>
                        <th>Quantidade</th>
                        <th>Investido</th>
                        <th>Lucro esp.</th>
                    </tr>
                </thead>
                <tbody>
                    {positions.map((position, index) => {
                        const invested = position.buyPrice * position.quantity
                        const expectedProfit =
                            (position.sellPrice - position.buyPrice) * position.quantity

                        return (
                            <tr key={index}>
                                <td>{position.status}</td>
                                <td>{position.buyPrice.toFixed(2)}</td>
                                <td>{position.sellPrice.toFixed(2)}</td>
                                <td>{position.quantity}</td>
                                <td>{invested.toFixed(2)} USDT</td>
                                <td className={expectedProfit >= 0 ? 'positive' : 'negative'}>
                                    {expectedProfit >= 0 ? '+' : ''}
                                    {expectedProfit.toFixed(2)} USDT
                                </td>
                            </tr>
                        )
                    })}
                </tbody>
            </table>
        </div>
    )
}
