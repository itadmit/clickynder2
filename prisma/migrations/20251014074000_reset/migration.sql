-- CreateEnum
CREATE TYPE "MemberRole" AS ENUM ('owner', 'admin', 'manager', 'staff', 'viewer');

-- CreateEnum
CREATE TYPE "PackageCode" AS ENUM ('starter', 'pro', 'ultra', 'enterprise');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('active', 'past_due', 'canceled', 'trial');

-- CreateEnum
CREATE TYPE "CalendarProvider" AS ENUM ('none', 'google', 'outlook', 'apple');

-- CreateEnum
CREATE TYPE "AvailabilityRuleScope" AS ENUM ('business', 'branch', 'staff');

-- CreateEnum
CREATE TYPE "TimeOffScope" AS ENUM ('branch', 'staff');

-- CreateEnum
CREATE TYPE "RoundingStrategy" AS ENUM ('on_the_hour', 'every_15', 'every_30', 'continuous');

-- CreateEnum
CREATE TYPE "AppointmentStatus" AS ENUM ('pending', 'confirmed', 'canceled', 'no_show', 'completed');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('not_required', 'pending', 'paid', 'refunded');

-- CreateEnum
CREATE TYPE "AppointmentSource" AS ENUM ('public', 'admin', 'api');

-- CreateEnum
CREATE TYPE "PaymentStatusEnum" AS ENUM ('initiated', 'authorized', 'captured', 'failed', 'refunded');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('email', 'sms', 'whatsapp');

-- CreateEnum
CREATE TYPE "NotificationEvent" AS ENUM ('booking_confirmed', 'booking_reminder', 'booking_canceled', 'booking_rescheduled', 'admin_new_booking');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('queued', 'sent', 'failed');

-- CreateEnum
CREATE TYPE "IntegrationType" AS ENUM ('google_calendar', 'microsoft_outlook', 'apple_calendar', 'webhook');

-- CreateEnum
CREATE TYPE "IntegrationStatus" AS ENUM ('connected', 'error', 'disconnected');

-- CreateEnum
CREATE TYPE "TrackingEventType" AS ENUM ('view', 'select_branch', 'select_service', 'select_staff', 'slot_selected', 'form_submitted', 'booking_confirmed');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "last_login_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "businesses" (
    "id" TEXT NOT NULL,
    "owner_user_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "timezone" TEXT NOT NULL DEFAULT 'Asia/Jerusalem',
    "locale" TEXT NOT NULL DEFAULT 'he-IL',
    "logo_url" TEXT,
    "primary_color" TEXT DEFAULT '#0ea5e9',
    "secondary_color" TEXT DEFAULT '#d946ef',
    "font" TEXT NOT NULL DEFAULT 'Noto Sans Hebrew',
    "show_branches" BOOLEAN NOT NULL DEFAULT false,
    "show_staff" BOOLEAN NOT NULL DEFAULT true,
    "online_payment_enabled" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "businesses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "business_members" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "role" "MemberRole" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "business_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "packages" (
    "id" TEXT NOT NULL,
    "code" "PackageCode" NOT NULL,
    "name" TEXT NOT NULL,
    "max_branches" INTEGER NOT NULL,
    "max_staff" INTEGER NOT NULL,
    "monthly_appointments_cap" INTEGER NOT NULL,
    "price_cents" INTEGER NOT NULL,
    "features_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "packages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "subscriptions" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "package_id" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'payplus',
    "external_customer_id" TEXT,
    "external_mandate_token" TEXT,
    "current_period_start" TIMESTAMP(3) NOT NULL,
    "current_period_end" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subscriptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "usage_counters" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "period_month" DATE NOT NULL,
    "appointments_count" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "usage_counters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branches" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "phone" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "has_custom_hours" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "branches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "role_label" TEXT,
    "calendar_color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "calendar_provider" "CalendarProvider" NOT NULL DEFAULT 'none',
    "calendar_external_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "staff_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_categories" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "service_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "services" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "category_id" TEXT,
    "name" TEXT NOT NULL,
    "duration_min" INTEGER NOT NULL,
    "price_cents" INTEGER,
    "buffer_after_min" INTEGER NOT NULL DEFAULT 0,
    "description" TEXT,
    "color" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "services_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "service_staff" (
    "service_id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,

    CONSTRAINT "service_staff_pkey" PRIMARY KEY ("service_id","staff_id")
);

-- CreateTable
CREATE TABLE "business_hours" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "open_time" TEXT,
    "close_time" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "business_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "branch_hours" (
    "id" TEXT NOT NULL,
    "branch_id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "open_time" TEXT,
    "close_time" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "branch_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "staff_hours" (
    "id" TEXT NOT NULL,
    "staff_id" TEXT NOT NULL,
    "weekday" INTEGER NOT NULL,
    "open_time" TEXT,
    "close_time" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,

    CONSTRAINT "staff_hours_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "availability_rules" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "scope" "AvailabilityRuleScope" NOT NULL,
    "branch_id" TEXT,
    "staff_id" TEXT,
    "date" DATE NOT NULL,
    "open_time" TEXT,
    "close_time" TEXT,
    "is_open" BOOLEAN NOT NULL,

    CONSTRAINT "availability_rules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "time_off" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "scope" "TimeOffScope" NOT NULL,
    "branch_id" TEXT,
    "staff_id" TEXT,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "reason" TEXT,

    CONSTRAINT "time_off_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "slot_policies" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "default_duration_min" INTEGER NOT NULL DEFAULT 30,
    "default_gap_min" INTEGER NOT NULL DEFAULT 0,
    "advance_window_days" INTEGER NOT NULL DEFAULT 30,
    "same_day_booking" BOOLEAN NOT NULL DEFAULT true,
    "rounding_strategy" "RoundingStrategy" NOT NULL DEFAULT 'continuous',

    CONSTRAINT "slot_policies_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointments" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "branch_id" TEXT,
    "service_id" TEXT NOT NULL,
    "staff_id" TEXT,
    "customer_id" TEXT NOT NULL,
    "start_at" TIMESTAMP(3) NOT NULL,
    "end_at" TIMESTAMP(3) NOT NULL,
    "status" "AppointmentStatus" NOT NULL DEFAULT 'confirmed',
    "price_cents" INTEGER,
    "payment_status" "PaymentStatus" NOT NULL DEFAULT 'not_required',
    "payment_provider" TEXT,
    "confirmation_code" TEXT NOT NULL,
    "notes_internal" TEXT,
    "notes_customer" TEXT,
    "source" "AppointmentSource" NOT NULL DEFAULT 'public',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "canceled_at" TIMESTAMP(3),

    CONSTRAINT "appointments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "appointment_audit" (
    "id" TEXT NOT NULL,
    "appointment_id" TEXT NOT NULL,
    "changed_by_user_id" TEXT,
    "from_json" JSONB,
    "to_json" JSONB NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "appointment_audit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payments" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "provider" TEXT NOT NULL DEFAULT 'payplus',
    "external_payment_id" TEXT,
    "amount_cents" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ILS',
    "status" "PaymentStatusEnum" NOT NULL,
    "receipt_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_templates" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "channel" "NotificationChannel" NOT NULL,
    "event" "NotificationEvent" NOT NULL,
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "appointment_id" TEXT,
    "customer_id" TEXT,
    "channel" "NotificationChannel" NOT NULL,
    "event" "NotificationEvent" NOT NULL,
    "to_address" TEXT NOT NULL,
    "status" "NotificationStatus" NOT NULL,
    "provider_message_id" TEXT,
    "sent_at" TIMESTAMP(3),

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "integrations" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "type" "IntegrationType" NOT NULL,
    "credentials_json" JSONB NOT NULL,
    "status" "IntegrationStatus" NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhooks" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "secret" TEXT,
    "events" JSONB NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhooks_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "webhook_logs" (
    "id" TEXT NOT NULL,
    "webhook_id" TEXT NOT NULL,
    "event" TEXT NOT NULL,
    "payload_json" JSONB NOT NULL,
    "response_code" INTEGER,
    "error" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "webhook_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "public_pages" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "theme_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "public_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_tracking" (
    "id" TEXT NOT NULL,
    "business_id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "event" "TrackingEventType" NOT NULL,
    "meta_json" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_tracking_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "businesses_slug_key" ON "businesses"("slug");

-- CreateIndex
CREATE INDEX "businesses_slug_idx" ON "businesses"("slug");

-- CreateIndex
CREATE INDEX "businesses_owner_user_id_idx" ON "businesses"("owner_user_id");

-- CreateIndex
CREATE INDEX "business_members_business_id_idx" ON "business_members"("business_id");

-- CreateIndex
CREATE INDEX "business_members_user_id_idx" ON "business_members"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_members_business_id_user_id_key" ON "business_members"("business_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "packages_code_key" ON "packages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "subscriptions_business_id_key" ON "subscriptions"("business_id");

-- CreateIndex
CREATE INDEX "subscriptions_business_id_idx" ON "subscriptions"("business_id");

-- CreateIndex
CREATE INDEX "subscriptions_package_id_idx" ON "subscriptions"("package_id");

-- CreateIndex
CREATE INDEX "usage_counters_business_id_idx" ON "usage_counters"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "usage_counters_business_id_period_month_key" ON "usage_counters"("business_id", "period_month");

-- CreateIndex
CREATE INDEX "branches_business_id_active_idx" ON "branches"("business_id", "active");

-- CreateIndex
CREATE INDEX "staff_business_id_branch_id_active_idx" ON "staff"("business_id", "branch_id", "active");

-- CreateIndex
CREATE INDEX "service_categories_business_id_idx" ON "service_categories"("business_id");

-- CreateIndex
CREATE UNIQUE INDEX "service_categories_business_id_name_key" ON "service_categories"("business_id", "name");

-- CreateIndex
CREATE INDEX "services_business_id_active_category_id_idx" ON "services"("business_id", "active", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "business_hours_business_id_weekday_key" ON "business_hours"("business_id", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "branch_hours_branch_id_weekday_key" ON "branch_hours"("branch_id", "weekday");

-- CreateIndex
CREATE UNIQUE INDEX "staff_hours_staff_id_weekday_key" ON "staff_hours"("staff_id", "weekday");

-- CreateIndex
CREATE INDEX "availability_rules_business_id_scope_date_idx" ON "availability_rules"("business_id", "scope", "date");

-- CreateIndex
CREATE INDEX "time_off_business_id_start_at_end_at_idx" ON "time_off"("business_id", "start_at", "end_at");

-- CreateIndex
CREATE UNIQUE INDEX "slot_policies_business_id_key" ON "slot_policies"("business_id");

-- CreateIndex
CREATE INDEX "customers_business_id_phone_idx" ON "customers"("business_id", "phone");

-- CreateIndex
CREATE INDEX "customers_business_id_email_idx" ON "customers"("business_id", "email");

-- CreateIndex
CREATE UNIQUE INDEX "appointments_confirmation_code_key" ON "appointments"("confirmation_code");

-- CreateIndex
CREATE INDEX "appointments_business_id_start_at_idx" ON "appointments"("business_id", "start_at");

-- CreateIndex
CREATE INDEX "appointments_business_id_staff_id_start_at_idx" ON "appointments"("business_id", "staff_id", "start_at");

-- CreateIndex
CREATE INDEX "appointments_business_id_branch_id_start_at_idx" ON "appointments"("business_id", "branch_id", "start_at");

-- CreateIndex
CREATE INDEX "appointments_confirmation_code_idx" ON "appointments"("confirmation_code");

-- CreateIndex
CREATE INDEX "appointment_audit_appointment_id_changed_at_idx" ON "appointment_audit"("appointment_id", "changed_at");

-- CreateIndex
CREATE INDEX "payments_business_id_status_created_at_idx" ON "payments"("business_id", "status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_business_id_channel_event_key" ON "notification_templates"("business_id", "channel", "event");

-- CreateIndex
CREATE INDEX "notifications_business_id_event_status_sent_at_idx" ON "notifications"("business_id", "event", "status", "sent_at");

-- CreateIndex
CREATE INDEX "integrations_business_id_type_idx" ON "integrations"("business_id", "type");

-- CreateIndex
CREATE INDEX "webhooks_business_id_idx" ON "webhooks"("business_id");

-- CreateIndex
CREATE INDEX "webhook_logs_webhook_id_created_at_idx" ON "webhook_logs"("webhook_id", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "public_pages_business_id_slug_key" ON "public_pages"("business_id", "slug");

-- CreateIndex
CREATE INDEX "event_tracking_business_id_event_created_at_idx" ON "event_tracking"("business_id", "event", "created_at");

-- AddForeignKey
ALTER TABLE "businesses" ADD CONSTRAINT "businesses_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_members" ADD CONSTRAINT "business_members_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "subscriptions" ADD CONSTRAINT "subscriptions_package_id_fkey" FOREIGN KEY ("package_id") REFERENCES "packages"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "usage_counters" ADD CONSTRAINT "usage_counters_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branches" ADD CONSTRAINT "branches_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff" ADD CONSTRAINT "staff_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_categories" ADD CONSTRAINT "service_categories_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "services" ADD CONSTRAINT "services_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "service_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_staff" ADD CONSTRAINT "service_staff_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "service_staff" ADD CONSTRAINT "service_staff_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "business_hours" ADD CONSTRAINT "business_hours_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "branch_hours" ADD CONSTRAINT "branch_hours_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "staff_hours" ADD CONSTRAINT "staff_hours_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "availability_rules" ADD CONSTRAINT "availability_rules_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "time_off" ADD CONSTRAINT "time_off_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "slot_policies" ADD CONSTRAINT "slot_policies_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "customers" ADD CONSTRAINT "customers_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_branch_id_fkey" FOREIGN KEY ("branch_id") REFERENCES "branches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_service_id_fkey" FOREIGN KEY ("service_id") REFERENCES "services"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_staff_id_fkey" FOREIGN KEY ("staff_id") REFERENCES "staff"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointments" ADD CONSTRAINT "appointments_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "appointment_audit" ADD CONSTRAINT "appointment_audit_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payments" ADD CONSTRAINT "payments_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_templates" ADD CONSTRAINT "notification_templates_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_appointment_id_fkey" FOREIGN KEY ("appointment_id") REFERENCES "appointments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_customer_id_fkey" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "integrations" ADD CONSTRAINT "integrations_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhooks" ADD CONSTRAINT "webhooks_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "webhook_logs" ADD CONSTRAINT "webhook_logs_webhook_id_fkey" FOREIGN KEY ("webhook_id") REFERENCES "webhooks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "public_pages" ADD CONSTRAINT "public_pages_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_tracking" ADD CONSTRAINT "event_tracking_business_id_fkey" FOREIGN KEY ("business_id") REFERENCES "businesses"("id") ON DELETE CASCADE ON UPDATE CASCADE;
