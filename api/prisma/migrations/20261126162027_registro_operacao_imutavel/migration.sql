CREATE FUNCTION "bloquearAlteracaoRegistroOperacao"()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'RegistroOperacao não pode ser alterado nem apagado (%)', TG_OP
    USING ERRCODE = 'restrict_violation';
END;
$$;

CREATE TRIGGER "RegistroOperacao_bloquearAlteracao"
BEFORE UPDATE OR DELETE ON "RegistroOperacao"
FOR EACH ROW
EXECUTE FUNCTION "bloquearAlteracaoRegistroOperacao"();

CREATE TRIGGER "RegistroOperacao_bloquearLimpeza"
BEFORE TRUNCATE ON "RegistroOperacao"
FOR EACH STATEMENT
EXECUTE FUNCTION "bloquearAlteracaoRegistroOperacao"();
