export function calcularNovoPrecoVenda(ultimaOrdemAberta) {
    return {
        newPrecoVenda: ultimaOrdemAberta && ultimaOrdemAberta?.sellPrice > 0
            ? ultimaOrdemAberta?.sellPrice
            : 0,
    };
}
//# sourceMappingURL=calcularNovoPrecoVenda.js.map