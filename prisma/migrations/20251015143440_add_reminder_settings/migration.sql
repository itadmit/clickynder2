-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "confirmation_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "confirmation_hours_before" INTEGER NOT NULL DEFAULT 24,
ADD COLUMN     "reminder_enabled" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "reminder_hours_before" INTEGER NOT NULL DEFAULT 24;
