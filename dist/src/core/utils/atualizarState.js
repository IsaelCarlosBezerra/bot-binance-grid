import { strategyState } from "../strategy-state.js";
import { buscarDadosParaState } from "./buscarDadosParaState.js";
import { calcularNovoPrecoCompra } from "./calcularNovoPrecoCompra.js";
import { calcularNovoPrecoVenda } from "./calcularNovoPrecoVenda.js";
export function atualizarState(balance) {
    const { precoAtual, ultimaPosicaoAberta } = buscarDadosParaState();
    const { newPrecoCompra } = calcularNovoPrecoCompra(ultimaPosicaoAberta, precoAtual);
    const { newPrecoVenda } = calcularNovoPrecoVenda(ultimaPosicaoAberta);
    strategyState.currentPrice = precoAtual;
    strategyState.nextBuyPrice = newPrecoCompra;
    strategyState.nextSellPrice = newPrecoVenda;
    strategyState.ultimaPosicaoAberta = ultimaPosicaoAberta;
    strategyState.balance = balance;
}
//# sourceMappingURL=atualizarState.js.map