import { applyDecorators } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiInternalServerErrorResponse,
  ApiNotFoundResponse,
  ApiUnauthorizedResponse,
  ApiUnprocessableEntityResponse,
} from '@nestjs/swagger';
import { RespostaErroDto } from './resposta-erro.dto.js';

export function ApiErros() {
  return applyDecorators(
    ApiBadRequestResponse({
      description: 'Campo inválido ou requisição malformada',
      type: RespostaErroDto,
    }),
    ApiUnauthorizedResponse({
      description:
        'Sessão ausente, inválida ou expirada; credenciais inválidas',
      type: RespostaErroDto,
    }),
    ApiForbiddenResponse({
      description: 'Sem permissão para a funcionalidade ou acesso inativo',
      type: RespostaErroDto,
    }),
    ApiNotFoundResponse({
      description: 'Recurso não encontrado',
      type: RespostaErroDto,
    }),
    ApiConflictResponse({
      description: 'Valor já cadastrado',
      type: RespostaErroDto,
    }),
    ApiUnprocessableEntityResponse({
      description: 'Regra de negócio recusou a operação',
      type: RespostaErroDto,
    }),
    ApiInternalServerErrorResponse({
      description: 'Falha inesperada',
      type: RespostaErroDto,
    }),
  );
}
