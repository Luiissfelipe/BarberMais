import type { EntradaMensagem } from './entrada-mensagem.js';

const mensagem = (
  codigo: string,
  status: number,
  texto: string,
): EntradaMensagem => ({ codigo, status, texto });

export const Mensagens = {
  MSGE_01: mensagem('MSGE-01', 400, 'Informe o nome do profissional.'),
  MSGE_02: mensagem('MSGE-02', 400, 'Informe a especialidade do profissional.'),
  MSGE_03: mensagem(
    'MSGE-03',
    400,
    'Informe o percentual de comissão, entre 0 e 100.',
  ),
  MSGE_04: mensagem('MSGE-04', 400, 'Informe um e-mail válido.'),
  MSGE_05: mensagem(
    'MSGE-05',
    409,
    'Já existe um profissional cadastrado com este e-mail.',
  ),
  MSGE_06: mensagem(
    'MSGE-06',
    400,
    'Informe uma senha com no mínimo 8 caracteres.',
  ),
  MSGE_07: mensagem(
    'MSGE-07',
    400,
    'Selecione ao menos um dia de atendimento.',
  ),
  MSGE_08: mensagem(
    'MSGE-08',
    400,
    'Informe o horário de início e de término de cada dia selecionado, no formato HH:MM, com o término posterior ao início.',
  ),
  MSGE_09: (dia: string, abertura: string, fechamento: string) =>
    mensagem(
      'MSGE-09',
      422,
      `O horário de ${dia} deve estar dentro do horário de funcionamento da barbearia (${abertura} às ${fechamento}).`,
    ),
  MSGE_10: (dia: string) =>
    mensagem(
      'MSGE-10',
      400,
      `Informe o início e o término da pausa de ${dia}, no formato HH:MM, ou deixe os dois campos em branco.`,
    ),
  MSGE_11: (dia: string) =>
    mensagem(
      'MSGE-11',
      422,
      `A pausa de ${dia} deve estar dentro do horário de atendimento do dia, com o término posterior ao início.`,
    ),
  MSGE_12: mensagem(
    'MSGE-12',
    404,
    'Nenhum profissional encontrado para a pesquisa informada.',
  ),
  MSGE_13: mensagem('MSGE-13', 400, 'Informe o nome do cliente.'),
  MSGE_14: mensagem('MSGE-14', 400, 'Informe um telefone válido, com DDD.'),
  MSGE_15: mensagem(
    'MSGE-15',
    409,
    'Já existe um cliente cadastrado com este telefone.',
  ),
  MSGE_16: mensagem(
    'MSGE-16',
    400,
    'Informe uma data de solicitação válida, que não seja posterior a hoje.',
  ),
  MSGE_17: mensagem(
    'MSGE-17',
    422,
    'Não é possível excluir este cliente: ele possui agendamento futuro, assinatura ativa ou vaga reservada na lista de espera.',
  ),
  MSGE_18: mensagem(
    'MSGE-18',
    404,
    'Nenhum cliente encontrado para a pesquisa informada.',
  ),
  MSGE_19: mensagem('MSGE-19', 400, 'Informe o nome do serviço.'),
  MSGE_20: mensagem(
    'MSGE-20',
    400,
    'Informe a duração do serviço em minutos, múltipla de 15, entre 15 e 480.',
  ),
  MSGE_21: mensagem('MSGE-21', 400, 'Informe um preço válido, maior que zero.'),
  MSGE_22: mensagem(
    'MSGE-22',
    409,
    'Já existe um serviço cadastrado com este nome.',
  ),
  MSGE_23: mensagem(
    'MSGE-23',
    404,
    'Nenhum serviço encontrado para a pesquisa informada.',
  ),
  MSGE_24: mensagem('MSGE-24', 400, 'Informe o nome do plano.'),
  MSGE_25: mensagem(
    'MSGE-25',
    400,
    'Selecione ao menos um serviço incluso no plano.',
  ),
  MSGE_26: mensagem(
    'MSGE-26',
    409,
    'Já existe um plano cadastrado com este nome.',
  ),
  MSGE_27: mensagem(
    'MSGE-27',
    404,
    'Nenhum plano encontrado para a pesquisa informada.',
  ),
  MSGE_28: mensagem('MSGE-28', 400, 'Informe um CEP válido, com 8 dígitos.'),
  MSGE_29: mensagem('MSGE-29', 400, 'Informe o logradouro.'),
  MSGE_30: mensagem('MSGE-30', 400, 'Informe o número do endereço ou S/N.'),
  MSGE_31: mensagem('MSGE-31', 400, 'Informe o bairro.'),
  MSGE_32: mensagem('MSGE-32', 400, 'Informe a cidade.'),
  MSGE_33: mensagem('MSGE-33', 400, 'Selecione o estado (UF).'),
  MSGE_34: (dia: string) =>
    mensagem(
      'MSGE-34',
      400,
      `Informe o horário de abertura e de fechamento de ${dia}.`,
    ),
  MSGE_35: (dia: string) =>
    mensagem(
      'MSGE-35',
      400,
      `O horário de fechamento de ${dia} deve ser posterior ao de abertura.`,
    ),
  MSGE_36: mensagem(
    'MSGE-36',
    400,
    'Mantenha ao menos um dia de funcionamento aberto.',
  ),
  MSGE_37: mensagem('MSGE-37', 400, 'Informe o e-mail.'),
  MSGE_38: mensagem('MSGE-38', 400, 'Informe a senha.'),
  MSGE_39: mensagem('MSGE-39', 401, 'E-mail ou senha inválidos.'),
  MSGE_40: (minutos: number) =>
    mensagem(
      'MSGE-40',
      429,
      `Acesso temporariamente bloqueado por excesso de tentativas. Tente novamente em ${minutos} minuto(s).`,
    ),
  MSGE_41: mensagem('MSGE-41', 400, 'Informe a senha atual.'),
  MSGE_42: mensagem('MSGE-42', 400, 'Informe a nova senha.'),
  MSGE_43: mensagem('MSGE-43', 400, 'Confirme a nova senha.'),
  MSGE_44: mensagem('MSGE-44', 422, 'A senha atual está incorreta.'),
  MSGE_45: mensagem(
    'MSGE-45',
    422,
    'A nova senha deve ser diferente da senha atual.',
  ),
  MSGE_46: mensagem(
    'MSGE-46',
    400,
    'A confirmação não confere com a nova senha.',
  ),
  MSGE_47: mensagem(
    'MSGE-47',
    403,
    'Você não tem permissão para acessar esta funcionalidade.',
  ),
  MSGE_48: mensagem(
    'MSGE-48',
    401,
    'Sua sessão expirou. Entre novamente para continuar.',
  ),
  MSGE_49: mensagem(
    'MSGE-49',
    403,
    'Seu acesso está inativo. Procure o Administrador.',
  ),
} as const;

const mensagensFixas = Object.values(Mensagens).filter(
  (m): m is EntradaMensagem => typeof m !== 'function',
);
const mensagensPorCodigo = new Map(mensagensFixas.map((m) => [m.codigo, m]));

export function buscarMensagem(codigo: string): EntradaMensagem | undefined {
  return mensagensPorCodigo.get(codigo);
}
