-- AlterTable
ALTER TABLE "businesses" ADD COLUMN     "custom_css" TEXT,
ADD COLUMN     "custom_js" TEXT,
ADD COLUMN     "developer_mode" BOOLEAN NOT NULL DEFAULT false;
