import { priceBuffer } from "../price-buffer.js"

export function verificaBuffer(): boolean {
	return priceBuffer.isReady()
}
