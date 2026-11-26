-- CreateTable
CREATE TABLE "RegistroOperacao" (
    "id" UUID NOT NULL DEFAULT uuidv7(),
    "operacao" TEXT NOT NULL,
    "entidade" TEXT NOT NULL,
    "idItem" UUID NOT NULL,
    "valorAnterior" TEXT,
    "dataHora" TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "responsavelId" UUID,

    CONSTRAINT "RegistroOperacao_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RegistroOperacao" ADD CONSTRAINT "RegistroOperacao_responsavelId_fkey" FOREIGN KEY ("responsavelId") REFERENCES "Usuario"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
