-- AlterTable
ALTER TABLE "Company" ADD COLUMN     "additionalCost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
ADD COLUMN     "filesProcessed" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "usersCount" INTEGER NOT NULL DEFAULT 1;
