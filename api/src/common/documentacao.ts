import type { INestApplication } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import {
  ItemErroValidacaoDto,
  RespostaErroDto,
} from './erros/resposta-erro.dto.js';

export function configurarDocumentacao(app: INestApplication): void {
  const configuracao = new DocumentBuilder()
    .setTitle('API BarberMais')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  SwaggerModule.setup(
    'docs',
    app,
    () =>
      SwaggerModule.createDocument(app, configuracao, {
        extraModels: [RespostaErroDto, ItemErroValidacaoDto],
      }),
    { jsonDocumentUrl: 'docs/json' },
  );
}
