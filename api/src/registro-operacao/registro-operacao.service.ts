import { Injectable, Logger } from '@nestjs/common';
import { Propagation, Transactional } from '@nestjs-cls/transactional';
import { ClsService } from 'nestjs-cls';
import type { ContextoRequisicao } from '../common/contexto-requisicao.js';
import type { RegistroOperacao } from '../generated/prisma/client.js';
import type { DadosRegistroOperacao } from './operacao.js';
import { RegistroOperacaoRepository } from './registro-operacao.repository.js';

@Injectable()
export class RegistroOperacaoService {
  private readonly logger = new Logger(RegistroOperacaoService.name);

  constructor(
    private readonly registroOperacaoRepository: RegistroOperacaoRepository,
    private readonly cls: ClsService<ContextoRequisicao>,
  ) {}

  @Transactional(Propagation.Mandatory)
  async registrar(dados: DadosRegistroOperacao): Promise<RegistroOperacao> {
    const registro = await this.registroOperacaoRepository.criar({
      operacao: dados.operacao,
      entidade: dados.entidade,
      idItem: dados.idItem,
      valorAnterior: dados.valorAnterior ?? null,
      responsavelId: this.cls.get('usuarioId') ?? null,
    });
    this.logger.debug(
      `Registro de operação gravado na transação: ${registro.operacao}`,
      {
        entidade: registro.entidade,
        idItem: registro.idItem,
        responsavelId: registro.responsavelId,
      },
    );
    return registro;
  }

  listarPorItem(idItem: string): Promise<RegistroOperacao[]> {
    return this.registroOperacaoRepository.listarPorItem(idItem);
  }
}
