import type { ClsStore } from 'nestjs-cls';

export interface ContextoRequisicao extends ClsStore {
  usuarioId?: string;
}
