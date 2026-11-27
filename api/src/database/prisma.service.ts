import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import type { VariaveisAmbiente } from '../config/env.validation.js';

const TEMPO_LIMITE_CONEXAO_MS = 5_000;

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(config: ConfigService<VariaveisAmbiente, true>) {
    const adapter = new PrismaPg({
      connectionString: config.get('DATABASE_URL', { infer: true }),
      connectionTimeoutMillis: TEMPO_LIMITE_CONEXAO_MS,
    });
    super({ adapter });
  }

  async onModuleInit() {
    await this.$queryRaw`SELECT 1`;
    this.logger.log('Conexão com o banco de dados estabelecida');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log('Conexão com o banco de dados encerrada');
  }
}
