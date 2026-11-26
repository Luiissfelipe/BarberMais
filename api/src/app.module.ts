import { randomUUID } from 'node:crypto';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClsPluginTransactional } from '@nestjs-cls/transactional';
import { TransactionalAdapterPrisma } from '@nestjs-cls/transactional-adapter-prisma';
import { ClsModule, ClsService } from 'nestjs-cls';
import type { ContextoRequisicao } from './common/contexto-requisicao.js';
import { registrarRequisicao } from './common/log-requisicao.js';
import { validarVariaveisAmbiente } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';
import { PrismaService } from './database/prisma.service.js';
import { RegistroOperacaoModule } from './registro-operacao/registro-operacao.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validarVariaveisAmbiente,
    }),
    DatabaseModule,
    ClsModule.forRoot({
      global: true,
      middleware: {
        mount: true,
        generateId: true,
        idGenerator: () => randomUUID(),
        setup: (cls, req, res) =>
          registrarRequisicao(cls as ClsService<ContextoRequisicao>, req, res),
      },
      plugins: [
        new ClsPluginTransactional({
          imports: [DatabaseModule],
          adapter: new TransactionalAdapterPrisma({
            prismaInjectionToken: PrismaService,
          }),
        }),
      ],
    }),
    RegistroOperacaoModule,
  ],
})
export class AppModule {}
