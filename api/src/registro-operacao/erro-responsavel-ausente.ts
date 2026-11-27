export class ErroResponsavelAusente extends Error {
  constructor() {
    super('Operação de usuário registrada sem usuário autenticado no contexto');
    this.name = 'ErroResponsavelAusente';
  }
}
