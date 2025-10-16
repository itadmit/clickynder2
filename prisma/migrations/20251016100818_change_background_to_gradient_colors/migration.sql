/*
  Warnings:

  - You are about to drop the column `background_color` on the `businesses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "businesses" DROP COLUMN "background_color",
ADD COLUMN     "background_color_end" TEXT DEFAULT '#dbeafe',
ADD COLUMN     "background_color_start" TEXT DEFAULT '#eff6ff',
ALTER COLUMN "primary_color" SET DEFAULT '#3b82f6';
