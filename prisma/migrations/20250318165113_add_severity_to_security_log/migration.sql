/*
  Warnings:

  - Added the required column `severity` to the `SecurityLog` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SecurityLog" ADD COLUMN     "severity" TEXT NOT NULL;
