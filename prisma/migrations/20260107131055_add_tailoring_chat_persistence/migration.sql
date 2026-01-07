-- CreateTable
CREATE TABLE "tailoring_chat" (
    "id" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tailoring_chat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tailoring_message" (
    "id" TEXT NOT NULL,
    "chatId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tailoring_message_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tailoring_message_part" (
    "id" TEXT NOT NULL,
    "messageId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "text" TEXT,
    "reasoning" TEXT,
    "toolCallId" TEXT,
    "toolName" TEXT,
    "toolState" TEXT,
    "toolInput" JSONB,
    "toolOutput" JSONB,
    "toolError" TEXT,
    "providerMetadata" JSONB,

    CONSTRAINT "tailoring_message_part_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "tailoring_chat_resumeId_idx" ON "tailoring_chat"("resumeId");

-- CreateIndex
CREATE INDEX "tailoring_message_chatId_idx" ON "tailoring_message"("chatId");

-- CreateIndex
CREATE INDEX "tailoring_message_chatId_createdAt_idx" ON "tailoring_message"("chatId", "createdAt");

-- CreateIndex
CREATE INDEX "tailoring_message_part_messageId_idx" ON "tailoring_message_part"("messageId");

-- CreateIndex
CREATE INDEX "tailoring_message_part_messageId_order_idx" ON "tailoring_message_part"("messageId", "order");

-- AddForeignKey
ALTER TABLE "tailoring_chat" ADD CONSTRAINT "tailoring_chat_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "resume"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailoring_message" ADD CONSTRAINT "tailoring_message_chatId_fkey" FOREIGN KEY ("chatId") REFERENCES "tailoring_chat"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailoring_message_part" ADD CONSTRAINT "tailoring_message_part_messageId_fkey" FOREIGN KEY ("messageId") REFERENCES "tailoring_message"("id") ON DELETE CASCADE ON UPDATE CASCADE;
