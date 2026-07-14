-- CPF passa a ser opcional (NULL) em vez de obrigatório.
-- Motivo: cpf é @unique; leads sem CPF eram salvos com '' (string vazia),
-- e a partir do segundo lead sem CPF o banco rejeitava o cadastro.
-- NULL não conflita com NULL em índices únicos do Postgres.
ALTER TABLE "Lead" ALTER COLUMN "cpf" DROP NOT NULL;

-- Converte CPFs vazios existentes para NULL
UPDATE "Lead" SET "cpf" = NULL WHERE "cpf" = '';
