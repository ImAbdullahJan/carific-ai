/*
  Warnings:

  - A unique constraint covering the columns `[resumeId]` on the table `tailoring_chat` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "tailoring_chat_resumeId_idx";

-- CreateIndex
CREATE UNIQUE INDEX "tailoring_chat_resumeId_key" ON "tailoring_chat"("resumeId");
