import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ItemErroValidacaoDto {
  @ApiProperty({ example: 'nome' })
  campo!: string;

  @ApiProperty({ example: 'MSGE-01' })
  codigo!: string;

  @ApiProperty({ example: 'Informe o nome do profissional.' })
  message!: string;
}

export class RespostaErroDto {
  @ApiProperty({ example: 400 })
  statusCode!: number;

  @ApiProperty({
    example: 'MSGE-01',
    description: 'Código MSGE da documentação ou código técnico',
  })
  codigo!: string;

  @ApiProperty({ example: 'Informe o nome do profissional.' })
  message!: string;

  @ApiPropertyOptional({ format: 'uuid' })
  requestId?: string;

  @ApiPropertyOptional({
    type: [ItemErroValidacaoDto],
    description: 'Presente só nos erros de validação, um item por campo',
  })
  erros?: ItemErroValidacaoDto[];
}
