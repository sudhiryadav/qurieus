-- CreateEnum
CREATE TYPE "ChatStatus" AS ENUM ('AI Chat', 'Escalated', 'Resolved', 'Closed');

-- CreateEnum
CREATE TYPE "AgentChatStatus" AS ENUM ('Pending', 'Active', 'On Hold', 'Resolved', 'Closed');

-- CreateEnum
CREATE TYPE "ChatPriority" AS ENUM ('Low', 'Normal', 'High', 'Urgent');

-- CreateEnum
CREATE TYPE "TicketPriority" AS ENUM ('Low', 'Medium', 'High', 'Urgent');

-- CreateEnum
CREATE TYPE "TicketStatus" AS ENUM ('Open', 'In Progress', 'Pending', 'Resolved', 'Closed');

-- AlterEnum
ALTER TYPE "UserRole" ADD VALUE 'Agent';

-- AlterTable
ALTER TABLE "ChatConversation" ADD COLUMN     "escalatedAt" TIMESTAMP(3),
ADD COLUMN     "escalationReason" TEXT,
ADD COLUMN     "status" "ChatStatus" NOT NULL DEFAULT 'AI Chat';

-- AlterTable
ALTER TABLE "ChatMessage" ADD COLUMN     "agentId" TEXT;

-- CreateTable
CREATE TABLE "Agent" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "bio" TEXT,
    "avatar" TEXT,
    "specialties" TEXT[],
    "languages" TEXT[],
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "maxConcurrentChats" INTEGER NOT NULL DEFAULT 5,
    "currentChats" INTEGER NOT NULL DEFAULT 0,
    "totalChatsHandled" INTEGER NOT NULL DEFAULT 0,
    "avgResponseTime" DOUBLE PRECISION,
    "satisfactionRating" DOUBLE PRECISION,
    "autoAcceptChats" BOOLEAN NOT NULL DEFAULT true,
    "workingHours" JSONB,
    "timezone" TEXT NOT NULL DEFAULT 'UTC',
    "lastActiveAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Agent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AgentChat" (
    "id" TEXT NOT NULL,
    "conversationId" TEXT NOT NULL,
    "agentId" TEXT NOT NULL,
    "status" "AgentChatStatus" NOT NULL DEFAULT 'Active',
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "priority" "ChatPriority" NOT NULL DEFAULT 'Normal',
    "tags" TEXT[],
    "notes" TEXT,
    "firstResponseTime" INTEGER,
    "resolutionTime" INTEGER,
    "satisfactionRating" INTEGER,

    CONSTRAINT "AgentChat_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SupportTicket" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "TicketPriority" NOT NULL DEFAULT 'Medium',
    "status" "TicketStatus" NOT NULL DEFAULT 'Open',
    "category" TEXT NOT NULL,
    "visitorId" TEXT,
    "createdById" TEXT,
    "assignedToId" TEXT,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "assignedAt" TIMESTAMP(3),
    "resolvedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "source" TEXT NOT NULL DEFAULT 'contact_form',
    "tags" TEXT[],
    "notes" TEXT,

    CONSTRAINT "SupportTicket_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Agent_userId_key" ON "Agent"("userId");

-- CreateIndex
CREATE INDEX "Agent_isOnline_isAvailable_idx" ON "Agent"("isOnline", "isAvailable");

-- CreateIndex
CREATE INDEX "Agent_specialties_idx" ON "Agent"("specialties");

-- CreateIndex
CREATE UNIQUE INDEX "AgentChat_conversationId_key" ON "AgentChat"("conversationId");

-- CreateIndex
CREATE INDEX "AgentChat_agentId_status_idx" ON "AgentChat"("agentId", "status");

-- CreateIndex
CREATE INDEX "AgentChat_status_priority_idx" ON "AgentChat"("status", "priority");

-- CreateIndex
CREATE INDEX "SupportTicket_status_priority_idx" ON "SupportTicket"("status", "priority");

-- CreateIndex
CREATE INDEX "SupportTicket_assignedToId_idx" ON "SupportTicket"("assignedToId");

-- CreateIndex
CREATE INDEX "SupportTicket_createdAt_idx" ON "SupportTicket"("createdAt");

-- AddForeignKey
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Agent" ADD CONSTRAINT "Agent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "Users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentChat" ADD CONSTRAINT "AgentChat_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "ChatConversation"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AgentChat" ADD CONSTRAINT "AgentChat_agentId_fkey" FOREIGN KEY ("agentId") REFERENCES "Users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_visitorId_fkey" FOREIGN KEY ("visitorId") REFERENCES "VisitorInfo"("visitorId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SupportTicket" ADD CONSTRAINT "SupportTicket_assignedToId_fkey" FOREIGN KEY ("assignedToId") REFERENCES "Users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
