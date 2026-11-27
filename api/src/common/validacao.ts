import { ValidationPipe } from '@nestjs/common';
import type { ValidationError } from 'class-validator';
import { ErroDeValidacao } from './erros/erro-de-validacao.js';
import type { ItemErroValidacaoDto } from './erros/resposta-erro.dto.js';
import type { EntradaMensagem } from './mensagens/entrada-mensagem.js';
import { buscarMensagem } from './mensagens/mensagens.js';
import { MensagensTecnicas } from './mensagens/mensagens-tecnicas.js';

function resolverMensagem(regra?: string, texto?: string): EntradaMensagem {
  if (regra === 'whitelistValidation') {
    return MensagensTecnicas.CAMPO_NAO_PERMITIDO;
  }
  const encontrada = texto === undefined ? undefined : buscarMensagem(texto);
  return encontrada ?? MensagensTecnicas.CAMPO_INVALIDO;
}

function converterRegra(
  campo: string,
  constraints: Record<string, string>,
): ItemErroValidacaoDto {
  const [regra, texto] = Object.entries(constraints)[0] ?? [];
  const mensagem = resolverMensagem(regra, texto);
  return { campo, codigo: mensagem.codigo, message: mensagem.texto };
}

function achatar(
  erros: ValidationError[],
  prefixo?: string,
): ItemErroValidacaoDto[] {
  return erros.flatMap((erro) => {
    const campo = prefixo ? `${prefixo}.${erro.property}` : erro.property;
    const proprios = erro.constraints
      ? [converterRegra(campo, erro.constraints)]
      : [];
    return [...proprios, ...achatar(erro.children ?? [], campo)];
  });
}

export function criarPipeValidacao(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    stopAtFirstError: true,
    exceptionFactory: (erros) =>
      new ErroDeValidacao(
        achatar(erros).sort(
          (a, b) =>
            Number(a.codigo === MensagensTecnicas.CAMPO_NAO_PERMITIDO.codigo) -
            Number(b.codigo === MensagensTecnicas.CAMPO_NAO_PERMITIDO.codigo),
        ),
      ),
  });
}
