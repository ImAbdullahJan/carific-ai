/*
  Warnings:

  - Added the required column `updatedAt` to the `tailoring_chat` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "TailoringStepStatus" AS ENUM ('pending', 'in_progress', 'completed', 'skipped');

-- AlterTable
ALTER TABLE "tailoring_chat" ADD COLUMN     "targetJobDescription" TEXT,
ADD COLUMN     "targetJobTitle" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "tailoring_plan_step" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "stepId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "order" INTEGER NOT NULL,
    "experienceId" TEXT,
    "status" "TailoringStepStatus" NOT NULL DEFAULT 'pending',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tailoring_plan_step_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tailoring_plan_step_chatId_idx" ON "tailoring_plan_step"("chatId");

-- CreateIndex
CREATE INDEX "tailoring_plan_step_chatId_order_idx" ON "tailoring_plan_step"("chatId", "order");

-- CreateIndex
CREATE UNIQUE INDEX "tailoring_plan_step_chatId_stepId_key" ON "tailoring_plan_step"("chatId", "stepId");

-- AddForeignKey
ALTER TABLE "tailoring_plan_step" ADD CONSTRAINT "tailoring_plan_step_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "tailoring_chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;
