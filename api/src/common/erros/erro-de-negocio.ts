import { HttpException } from '@nestjs/common';
import type { EntradaMensagem } from '../mensagens/entrada-mensagem.js';

export class ErroDeNegocio extends HttpException {
  constructor(readonly mensagem: EntradaMensagem) {
    super(mensagem.texto, mensagem.status);
  }
}
