export const BotConfig = {
    // intervalo do ciclo principal (ms)
    cycleIntervalMs: 5000,
    // percentual do saldo usado em cada compra (10%)
    buyPercentageOfBalance: 0.1,
    // lucro líquido desejado (0,5%)
    targetNetProfit: 0.005,
    // percentual real usado no cálculo (≈ 0,8%)
    grossTargetPercentage: 0.008,
    //percentual de queda para disparar compra
    dropPercentage: 0.008,
    // par operado (inicialmente fixo)
    symbol: "BTCUSDT",
    // 🔴 NOVO (modo de referência de compra)
    buyReferenceMode: "LAST_BUY",
    // habilita/desabilita o bot
    enabled: true,
};
//# sourceMappingURL=bot.config.js.map