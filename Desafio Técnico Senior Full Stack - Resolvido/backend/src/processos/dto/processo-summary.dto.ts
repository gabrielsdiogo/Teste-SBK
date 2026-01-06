export class UltimoMovimentoDto {
  dataHora: string;
  descricao: string;
  orgaoJulgador: string;
  codigo?: number;
}

export class PartesResumoDto {
  ativo: string[];
  passivo: string[];
}

export class ProcessoSummaryDto {
  numeroProcesso: string;
  siglaTribunal: string;
  grauAtual: string;
  classePrincipal: string;
  assuntoPrincipal: string;
  ultimoMovimento: UltimoMovimentoDto;
  partesResumo: PartesResumoDto;
}
