/*
  Warnings:

  - Added the required column `type` to the `SecurityLog` table without a default value. This is not possible if the table is not empty.

*/
-- First add the column with a default value
ALTER TABLE "SecurityLog" ADD COLUMN "type" TEXT NOT NULL DEFAULT 'SYSTEM_ALERT';

-- Then remove the default value constraint
ALTER TABLE "SecurityLog" ALTER COLUMN "type" DROP DEFAULT;
