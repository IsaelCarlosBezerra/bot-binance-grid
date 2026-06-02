/*
  Warnings:

  - Added the required column `botInstanceId` to the `trade_orders` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "Plan" AS ENUM ('FREE', 'PRO');

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');

-- AlterTable
ALTER TABLE "trade_orders" ADD COLUMN     "botInstanceId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "passwordHash" VARCHAR(255) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "plan" "Plan" NOT NULL DEFAULT 'FREE',
    "role" "Role" NOT NULL DEFAULT 'USER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bot_instances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "binanceApiKey" VARCHAR(512) NOT NULL,
    "binanceApiSecret" VARCHAR(512) NOT NULL,
    "testnet" BOOLEAN NOT NULL DEFAULT false,
    "symbol" VARCHAR(20) NOT NULL DEFAULT 'BTCUSDT',
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "cycleIntervalMs" INTEGER NOT NULL DEFAULT 5000,
    "buyPercentageOfBalance" DOUBLE PRECISION NOT NULL DEFAULT 0.1,
    "targetNetProfit" DOUBLE PRECISION NOT NULL DEFAULT 0.005,
    "grossTargetPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.008,
    "dropPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0.008,
    "buyReferenceMode" VARCHAR(30) NOT NULL DEFAULT 'LAST_BUY',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bot_instances_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "bot_instances_userId_key" ON "bot_instances"("userId");

-- AddForeignKey
ALTER TABLE "bot_instances" ADD CONSTRAINT "bot_instances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "trade_orders" ADD CONSTRAINT "trade_orders_botInstanceId_fkey" FOREIGN KEY ("botInstanceId") REFERENCES "bot_instances"("id") ON DELETE CASCADE ON UPDATE CASCADE;
