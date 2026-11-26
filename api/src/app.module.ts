import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validarVariaveisAmbiente } from './config/env.validation.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validarVariaveisAmbiente,
    }),
  ],
})
export class AppModule {}
