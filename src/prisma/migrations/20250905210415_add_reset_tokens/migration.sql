-- CreateTable
CREATE TABLE "public"."PaymentOrder" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentOrder_orderId_key" ON "public"."PaymentOrder"("orderId");
