import { Module } from '@nestjs/common';
import { RegistroOperacaoRepository } from './registro-operacao.repository.js';
import { RegistroOperacaoService } from './registro-operacao.service.js';

@Module({
  providers: [RegistroOperacaoRepository, RegistroOperacaoService],
  exports: [RegistroOperacaoService],
})
export class RegistroOperacaoModule {}
