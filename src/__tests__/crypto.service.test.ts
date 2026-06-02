import { encrypt, decrypt } from "../auth/crypto.service.js"

describe("crypto.service", () => {
	it("criptografa e descriptografa corretamente", () => {
		const original = "minha-api-key-super-secreta"
		const encrypted = encrypt(original)
		expect(decrypt(encrypted)).toBe(original)
	})

	it("gera textos criptografados diferentes a cada chamada (IV aleatório)", () => {
		const text = "mesma-chave"
		expect(encrypt(text)).not.toBe(encrypt(text))
	})

	it("descriptografado é idêntico ao original", () => {
		const key = "BINANCE_API_KEY_1234567890ABCDEF"
		expect(decrypt(encrypt(key))).toBe(key)
	})

	it("lança erro com formato inválido", () => {
		expect(() => decrypt("formato-invalido")).toThrow("Formato de dado criptografado inválido")
	})

	it("lança erro com dado corrompido", () => {
		const encrypted = encrypt("valor")
		const corrupted = encrypted.slice(0, -4) + "0000"
		expect(() => decrypt(corrupted)).toThrow()
	})
})
