-- AlterTable (idempotente: seguro mesmo se as colunas já foram criadas manualmente)
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "processNumber" TEXT;
ALTER TABLE "Lead" ADD COLUMN IF NOT EXISTS "assistantName" TEXT;
