import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validarVariaveisAmbiente } from './config/env.validation.js';
import { DatabaseModule } from './database/database.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validarVariaveisAmbiente,
    }),
    DatabaseModule,
  ],
})
export class AppModule {}
