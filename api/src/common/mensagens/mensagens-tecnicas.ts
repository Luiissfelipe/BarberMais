import type { EntradaMensagem } from './entrada-mensagem.js';

export const MensagensTecnicas = {
  ERRO_INTERNO: {
    codigo: 'ERRO_INTERNO',
    status: 500,
    texto:
      'Não foi possível concluir a operação. Tente novamente em instantes.',
  },
  NAO_ENCONTRADO: {
    codigo: 'NAO_ENCONTRADO',
    status: 404,
    texto: 'Recurso não encontrado.',
  },
  REQUISICAO_INVALIDA: {
    codigo: 'REQUISICAO_INVALIDA',
    status: 400,
    texto: 'Requisição inválida.',
  },
  CAMPO_INVALIDO: {
    codigo: 'CAMPO_INVALIDO',
    status: 400,
    texto: 'Campo inválido.',
  },
  CAMPO_NAO_PERMITIDO: {
    codigo: 'CAMPO_NAO_PERMITIDO',
    status: 400,
    texto: 'Campo não permitido.',
  },
} as const satisfies Record<string, EntradaMensagem>;
