/*
  Warnings:

  - You are about to drop the column `amount` on the `Expense` table. All the data in the column will be lost.
  - Added the required column `amountINR` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `amountMYR` to the `Expense` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Expense" DROP COLUMN "amount",
ADD COLUMN     "amountINR" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "amountMYR" DECIMAL(10,2) NOT NULL;

-- CreateTable
CREATE TABLE "Income" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "date" TIMESTAMP(3) NOT NULL,
    "amountINR" DECIMAL(10,2) NOT NULL,
    "amountMYR" DECIMAL(10,2) NOT NULL,
    "createdById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Income_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Income" ADD CONSTRAINT "Income_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
