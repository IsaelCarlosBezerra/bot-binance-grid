-- CreateTable
CREATE TABLE "trade_orders" (
    "id" TEXT NOT NULL,
    "symbol" VARCHAR(20) NOT NULL,
    "buyPrice" DECIMAL(18,8) NOT NULL,
    "quantity" DECIMAL(18,8) NOT NULL,
    "sellPrice" DECIMAL(18,8),
    "expectedNetProfit" DECIMAL(18,8) NOT NULL,
    "status" VARCHAR(20) NOT NULL DEFAULT 'OPEN',
    "createdAt" BIGINT NOT NULL,

    CONSTRAINT "trade_orders_pkey" PRIMARY KEY ("id")
);
