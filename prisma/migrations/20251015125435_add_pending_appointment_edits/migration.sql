-- CreateEnum
CREATE TYPE "PendingEditStatus" AS ENUM ('pending', 'confirmed', 'rejected', 'expired');

-- CreateTable
CREATE TABLE "pending_appointment_edits" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "new_start_at" TIMESTAMP(3) NOT NULL,
    "new_end_at" TIMESTAMP(3) NOT NULL,
    "new_service_id" TEXT NOT NULL,
    "new_staff_id" TEXT NOT NULL,
    "confirmation_token" TEXT NOT NULL,
    "status" "PendingEditStatus" NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "confirmed_at" TIMESTAMP(3),
    "rejected_at" TIMESTAMP(3),

    CONSTRAINT "pending_appointment_edits_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "pending_appointment_edits_confirmation_token_key" ON "pending_appointment_edits"("confirmation_token");

-- CreateIndex
CREATE INDEX "pending_appointment_edits_appointment_id_status_idx" ON "pending_appointment_edits"("appointment_id", "status");

-- CreateIndex
CREATE INDEX "pending_appointment_edits_confirmation_token_idx" ON "pending_appointment_edits"("confirmation_token");

-- AddForeignKey
ALTER TABLE "pending_appointment_edits" ADD CONSTRAINT "pending_appointment_edits_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
