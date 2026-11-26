import { HttpException, HttpStatus } from '@nestjs/common';
import type { ItemErroValidacaoDto } from './resposta-erro.dto.js';

export class ErroDeValidacao extends HttpException {
  constructor(readonly erros: ItemErroValidacaoDto[]) {
    super(erros[0]?.message ?? 'Requisição inválida.', HttpStatus.BAD_REQUEST);
  }
}
