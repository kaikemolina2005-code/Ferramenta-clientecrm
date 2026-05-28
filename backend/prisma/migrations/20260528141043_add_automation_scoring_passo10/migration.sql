-- CreateEnum
CREATE TYPE "AutomationTrigger" AS ENUM ('LEAD_CREATED', 'LEAD_SCORE_ABOVE', 'LEAD_SCORE_BELOW', 'LEAD_CONVERTED', 'DAYS_WITHOUT_ACTION', 'CATEGORY_MATCH', 'STATUS_CHANGE', 'MANUAL');

-- CreateEnum
CREATE TYPE "AutomationAction" AS ENUM ('ASSIGN_TO_USER', 'SEND_EMAIL', 'TRIGGER_SEQUENCE', 'UPDATE_STATUS', 'ADD_TO_KANBAN', 'NOTIFY_TEAM', 'MARK_FOR_REVIEW');

-- CreateEnum
CREATE TYPE "AutomationStatus" AS ENUM ('PENDING', 'EXECUTED', 'FAILED', 'CANCELLED');

-- AlterTable
ALTER TABLE "Lead" ADD COLUMN     "autoAssignedAt" TIMESTAMP(3),
ADD COLUMN     "daysWithoutActivity" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "lastActivityAt" TIMESTAMP(3),
ADD COLUMN     "score" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "scoreUpdatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "scoringFactors" TEXT;

-- CreateTable
CREATE TABLE "AutomationRule" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "trigger" "AutomationTrigger" NOT NULL,
    "triggerValue" TEXT,
    "scoreWeight" INTEGER NOT NULL DEFAULT 0,
    "assignmentRule" TEXT,
    "autoAssign" BOOLEAN NOT NULL DEFAULT false,
    "action" "AutomationAction" NOT NULL,
    "actionValue" TEXT,
    "sequenceId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "executionCount" INTEGER NOT NULL DEFAULT 0,
    "lastExecutedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationRule_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AutomationLog" (
    "id" TEXT NOT NULL,
    "ruleId" TEXT,
    "leadId" TEXT NOT NULL,
    "action" "AutomationAction" NOT NULL,
    "status" "AutomationStatus" NOT NULL DEFAULT 'PENDING',
    "scoreBefore" INTEGER,
    "scoreAfter" INTEGER,
    "details" TEXT,
    "error" TEXT,
    "executedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AutomationLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserWorkload" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "activeLeads" INTEGER NOT NULL DEFAULT 0,
    "maxCapacity" INTEGER NOT NULL DEFAULT 20,
    "specialties" TEXT NOT NULL,
    "utilization" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isAvailable" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserWorkload_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "AutomationRule_name_key" ON "AutomationRule"("name");

-- CreateIndex
CREATE UNIQUE INDEX "UserWorkload_userId_key" ON "UserWorkload"("userId");

-- AddForeignKey
ALTER TABLE "AutomationRule" ADD CONSTRAINT "AutomationRule_sequenceId_fkey" FOREIGN KEY ("sequenceId") REFERENCES "EmailSequence"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_ruleId_fkey" FOREIGN KEY ("ruleId") REFERENCES "AutomationRule"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AutomationLog" ADD CONSTRAINT "AutomationLog_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserWorkload" ADD CONSTRAINT "UserWorkload_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
