export interface TradeSummary {
    compras: {
        quantidade: number;
        valorTotal: number;
    };
    vendas: {
        quantidade: number;
        valorTotal: number;
    };
    lucroLiquido: number;
    totalTaxas: number;
    totalIR: number;
}
export interface TradeSummaryAbertos {
    comprasAbertas: {
        quantidade: number;
        valorTotal: number;
    };
    vendasAbertas: {
        quantidade: number;
        valorTotal: number;
    };
    lucroLiquidoAberto: number;
    totalTaxasAberto: number;
    totalIRAberto: number;
}
export declare function generateTradeSummary(): TradeSummary;
export declare function generateTradeSummaryOpen(): TradeSummaryAbertos;
//# sourceMappingURL=trade-report.d.ts.map