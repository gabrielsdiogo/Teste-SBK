/**
 * DTO para informações do último movimento processual (formato resumido)
 */
export class UltimoMovimentoDto {
  /** Data e hora do movimento no formato ISO 8601 */
  dataHora: string;

  /** Descrição textual do movimento */
  descricao: string;

  /** Nome(s) do(s) órgão(s) julgador(es) concatenados com vírgula */
  orgaoJulgador: string;

  /** Código do movimento (opcional) */
  codigo?: number;
}

/**
 * DTO para resumo das partes do processo
 * Agrupa partes por polo (ativo/passivo)
 */
export class PartesResumoDto {
  /** Nomes das partes no polo ativo (autores, requerentes, etc.) */
  ativo: string[];

  /** Nomes das partes no polo passivo (réus, requeridos, etc.) */
  passivo: string[];
}

/**
 * DTO com informações resumidas de um processo
 * Usado na listagem de processos para exibir dados essenciais
 */
export class ProcessoSummaryDto {
  /** Número completo do processo */
  numeroProcesso: string;

  /** Sigla do tribunal (ex: TJSP, TJRJ) */
  siglaTribunal: string;

  /** Sigla do grau atual da tramitação (ex: G1, G2) */
  grauAtual: string;

  /** Descrição da primeira classe do processo */
  classePrincipal: string;

  /** Descrição do primeiro assunto do processo */
  assuntoPrincipal: string;

  /** Informações do último movimento processual */
  ultimoMovimento: UltimoMovimentoDto;

  /** Resumo das partes agrupadas por polo */
  partesResumo: PartesResumoDto;
}
