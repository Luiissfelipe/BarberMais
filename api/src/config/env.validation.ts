import { plainToInstance } from 'class-transformer';
import { IsEnum, IsInt, Max, Min, validateSync } from 'class-validator';

export enum Ambiente {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

export class VariaveisAmbiente {
  @IsEnum(Ambiente)
  NODE_ENV!: Ambiente;

  @IsInt()
  @Min(1)
  @Max(65535)
  PORT!: number;
}

export function validarVariaveisAmbiente(
  config: Record<string, unknown>,
): VariaveisAmbiente {
  const variaveis = plainToInstance(VariaveisAmbiente, config, {
    enableImplicitConversion: true,
  });
  const erros = validateSync(variaveis, { skipMissingProperties: false });

  if (erros.length > 0) {
    const detalhes = erros
      .map((erro) => {
        const regras = Object.values(erro.constraints ?? {}).join('; ');
        return `  - ${erro.property}: ${regras}`;
      })
      .join('\n');
    throw new Error(
      `Variáveis de ambiente ausentes ou inválidas. Confira o arquivo .env (modelo em .env.example):\n${detalhes}`,
    );
  }

  return variaveis;
}
