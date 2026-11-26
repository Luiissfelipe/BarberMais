-- CreateIndex
CREATE INDEX "RegistroOperacao_idItem_dataHora_idx" ON "RegistroOperacao"("idItem", "dataHora");

-- CreateIndex
CREATE INDEX "RegistroOperacao_responsavelId_idx" ON "RegistroOperacao"("responsavelId");
