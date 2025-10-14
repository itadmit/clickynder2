-- CreateEnum
CREATE TYPE "DashboardNotificationType" AS ENUM ('new_appointment', 'cancelled_appointment', 'reminder', 'system');

-- CreateTable
CREATE TABLE "dashboard_notifications" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "customer_id" TEXT,
    "type" "DashboardNotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "dashboard_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "dashboard_notifications_business_id_read_created_at_idx" ON "dashboard_notifications"("business_id", "read", "created_at");

-- AddForeignKey
ALTER TABLE "dashboard_notifications" ADD CONSTRAINT "dashboard_notifications_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_notifications" ADD CONSTRAINT "dashboard_notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "dashboard_notifications" ADD CONSTRAINT "dashboard_notifications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
