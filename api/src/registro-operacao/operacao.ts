export enum Operacao {
  AlteracaoEmailProfissional = 'ALTERACAO_EMAIL_PROFISSIONAL',
  RedefinicaoSenhaProfissional = 'REDEFINICAO_SENHA_PROFISSIONAL',
  BloqueioCliente = 'BLOQUEIO_CLIENTE',
  LiberacaoCliente = 'LIBERACAO_CLIENTE',
  ExclusaoCliente = 'EXCLUSAO_CLIENTE',
}

export enum Entidade {
  Profissional = 'Profissional',
  Cliente = 'Cliente',
}

export enum Origem {
  Usuario = 'USUARIO',
  Sistema = 'SISTEMA',
}

export interface DadosRegistroOperacao {
  origem: Origem;
  operacao: Operacao;
  entidade: Entidade;
  idItem: string;
  valorAnterior?: string;
}
