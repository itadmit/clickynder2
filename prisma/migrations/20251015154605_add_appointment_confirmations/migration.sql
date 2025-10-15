-- CreateEnum
CREATE TYPE "ConfirmationStatus" AS ENUM ('pending', 'confirmed', 'canceled', 'expired');

-- AlterEnum
ALTER TYPE "NotificationEvent" ADD VALUE 'appointment_confirmation';

-- CreateTable
CREATE TABLE "appointment_confirmations" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "confirmation_token" TEXT NOT NULL,
    "status" "ConfirmationStatus" NOT NULL DEFAULT 'pending',
    "confirmed_at" TIMESTAMP(3),
    "canceled_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_confirmations_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "appointment_confirmations_confirmation_token_key" ON "appointment_confirmations"("confirmation_token");

-- CreateIndex
CREATE INDEX "appointment_confirmations_appointment_id_status_idx" ON "appointment_confirmations"("appointment_id", "status");

-- CreateIndex
CREATE INDEX "appointment_confirmations_confirmation_token_idx" ON "appointment_confirmations"("confirmation_token");

-- AddForeignKey
ALTER TABLE "appointment_confirmations" ADD CONSTRAINT "appointment_confirmations_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
