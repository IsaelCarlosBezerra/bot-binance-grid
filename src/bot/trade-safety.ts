export interface BuyValidationResult {
	valid: boolean
	quantity?: number
	reason?: string
}

export interface BuyPrecheckFailure {
	reason: "INSUFFICIENT_BALANCE" | "INVALID_ORDER"
	message: string
}

const RETRYABLE_ERROR_PATTERNS = [
	"ECONNRESET",
	"ETIMEDOUT",
	"EAI_AGAIN",
	"ENETUNREACH",
	"ECONNREFUSED",
	"socket hang up",
	"fetch failed",
	"timeout",
	"rate limit",
]

export function classifyBuyPrecheck(
	freeBalance: number,
	validation: BuyValidationResult,
): BuyPrecheckFailure | null {
	if (freeBalance <= 0) {
		return {
			reason: "INSUFFICIENT_BALANCE",
			message: "Saldo insuficiente para executar a compra",
		}
	}

	if (!validation.valid || !validation.quantity) {
		return {
			reason: "INVALID_ORDER",
			message: validation.reason ?? "Compra inválida",
		}
	}

	return null
}

export function isRetryableExecutionError(error: unknown): boolean {
	if (error instanceof Error) {
		const text = `${error.name} ${error.message} ${(error as Error & { code?: string }).code ?? ""}`.toLowerCase()
		return RETRYABLE_ERROR_PATTERNS.some((pattern) => text.includes(pattern.toLowerCase()))
	}

	return false
}

export async function retryOperation<T>(
	operation: () => Promise<T>,
	options: {
		attempts?: number
		delayMs?: number
		onRetry?: (attempt: number, error: unknown) => void
	} = {},
): Promise<T> {
	const attempts = options.attempts ?? 3
	const delayMs = options.delayMs ?? 250
	let lastError: unknown

	for (let attempt = 1; attempt <= attempts; attempt += 1) {
		try {
			return await operation()
		} catch (error) {
			lastError = error
			if (!isRetryableExecutionError(error) || attempt === attempts) {
				throw error
			}

			options.onRetry?.(attempt, error)
			await new Promise((resolve) => setTimeout(resolve, delayMs * attempt))
		}
	}

	throw lastError
}
