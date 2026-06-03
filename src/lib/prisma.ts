import { PrismaClient } from "@prisma/client"

// Singleton — uma única instância compartilhada por toda a aplicação.
// Evita múltiplos pools de conexão que esgotam o limite do banco.
const prisma = new PrismaClient()

export default prisma
