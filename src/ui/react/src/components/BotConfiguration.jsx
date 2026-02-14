import { useState, useEffect } from 'react'

export default function BotConfiguration({ config, onSave }) {
    const [buyPct, setBuyPct] = useState('')
    const [netProfit, setNetProfit] = useState('')
    const [grossProfit, setGrossProfit] = useState('')
    const [cycleMs, setCycleMs] = useState('')

    useEffect(() => {
        if (config) {
            setBuyPct(config.buyPercentageOfBalance || '')
            setNetProfit(((config.targetNetProfit || 0) * 100).toFixed(2))
            setGrossProfit(((config.grossTargetPercentage || 0) * 100).toFixed(2))
            setCycleMs(config.cycleIntervalMs || '')
        }
    }, [config])

    const handleSave = () => {
        const configData = {
            buyPercentageOfBalance: Number(buyPct),
            targetNetProfit: Number(netProfit) / 100,
            grossTargetPercentage: Number(grossProfit) / 100,
            cycleIntervalMs: Number(cycleMs)
        }
        onSave(configData)
    }

    return (
        <div className="card">
            <h3>Configuração do Bot</h3>

            <label>% do saldo por compra</label>
            <input
                type="number"
                step="0.01"
                value={buyPct}
                onChange={(e) => setBuyPct(e.target.value)}
            />

            <label>Lucro líquido alvo (%)</label>
            <input
                type="number"
                step="0.01"
                value={netProfit}
                onChange={(e) => setNetProfit(e.target.value)}
            />

            <label>Lucro bruto (%)</label>
            <input
                type="number"
                step="0.01"
                value={grossProfit}
                onChange={(e) => setGrossProfit(e.target.value)}
            />

            <label>Intervalo do ciclo (ms)</label>
            <input
                type="number"
                step="1000"
                value={cycleMs}
                onChange={(e) => setCycleMs(e.target.value)}
            />

            <button className="start mt" onClick={handleSave}>
                💾 Salvar Configuração
            </button>
        </div>
    )
}
