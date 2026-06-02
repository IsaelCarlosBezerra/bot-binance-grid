import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from "crypto"

const ALGORITHM = "aes-256-gcm"
const KEY = scryptSync(process.env.ENCRYPTION_SECRET ?? "fallback-secret-change-me", "salt", 32)

export function encrypt(text: string): string {
	const iv = randomBytes(12)
	const cipher = createCipheriv(ALGORITHM, KEY, iv)
	const encrypted = Buffer.concat([cipher.update(text, "utf8"), cipher.final()])
	const tag = cipher.getAuthTag()
	return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`
}

export function decrypt(encoded: string): string {
	const parts = encoded.split(":")
	if (parts.length !== 3) throw new Error("Formato de dado criptografado inválido")
	const [ivHex, tagHex, encryptedHex] = parts as [string, string, string]
	const iv = Buffer.from(ivHex, "hex")
	const tag = Buffer.from(tagHex, "hex")
	const encrypted = Buffer.from(encryptedHex, "hex")
	const decipher = createDecipheriv(ALGORITHM, KEY, iv)
	decipher.setAuthTag(tag)
	return decipher.update(encrypted) + decipher.final("utf8")
}
