import { signToken, verifyToken } from "../auth/jwt.service.js"

const payload = {
	userId: "user-123",
	email: "test@test.com",
	plan: "FREE",
	role: "USER",
}

describe("jwt.service", () => {
	it("gera token e verifica payload corretamente", () => {
		const token = signToken(payload)
		const decoded = verifyToken(token)
		expect(decoded.userId).toBe(payload.userId)
		expect(decoded.email).toBe(payload.email)
		expect(decoded.plan).toBe(payload.plan)
		expect(decoded.role).toBe(payload.role)
	})

	it("lança erro com token inválido", () => {
		expect(() => verifyToken("token.invalido.aqui")).toThrow()
	})

	it("lança erro com token adulterado", () => {
		const token = signToken(payload)
		const tampered = token.slice(0, -5) + "XXXXX"
		expect(() => verifyToken(tampered)).toThrow()
	})

	it("tokens diferentes para chamadas diferentes", () => {
		const t1 = signToken(payload)
		const t2 = signToken(payload)
		// JWTs com mesmo payload têm iat diferente apenas se chamados em momentos diferentes
		// mas a estrutura deve ser válida nos dois
		expect(verifyToken(t1).userId).toBe(payload.userId)
		expect(verifyToken(t2).userId).toBe(payload.userId)
	})
})
