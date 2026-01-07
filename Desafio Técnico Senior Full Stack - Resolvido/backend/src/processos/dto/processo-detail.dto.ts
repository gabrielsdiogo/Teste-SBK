/**
 * DTO para informações do tribunal
 */
export class TribunalDto {
  /** Sigla do tribunal (ex: TJSP) */
  sigla: string;

  /** Nome completo do tribunal */
  nome: string;

  /** Segmento (ex: JUS) */
  segmento: string;

  /** Código JTR */
  jtr: string;
}

/**
 * DTO para informações do grau de tramitação
 */
export class GrauDto {
  /** Sigla do grau (ex: G1, G2) */
  sigla: string;

  /** Nome do grau (ex: "Primeira Instância") */
  nome: string;

  /** Número do grau (1, 2, 3...) */
  numero: number;
}

/**
 * DTO para informações de classe processual
 */
export class ClasseDto {
  /** Código da classe */
  codigo: number;

  /** Descrição da classe (ex: "Procedimento Comum") */
  descricao: string;
}

/**
 * DTO para informações de assunto processual
 */
export class AssuntoDto {
  /** Código do assunto */
  codigo: number;

  /** Descrição do assunto (ex: "Dano Material") */
  descricao: string;

  /** Hierarquia do assunto (ex: "1.2.3") */
  hierarquia: string;
}

/**
 * DTO para informações do órgão julgador
 */
export class OrgaoJulgadorDto {
  /** ID do órgão julgador */
  id: number;

  /** Nome do órgão julgador (ex: "1ª Vara Cível") */
  nome: string;
}

/**
 * DTO para informações do último movimento (formato detalhado)
 */
export class UltimoMovimentoDetailDto {
  /** Data e hora do movimento no formato ISO 8601 */
  data: string;

  /** Descrição textual do movimento */
  descricao: string;

  /** Array com nomes dos órgãos julgadores */
  orgaoJulgador: string[];

  /** Código do movimento (opcional) */
  codigo?: number;
}

/**
 * DTO para informações de representante legal
 */
export class RepresentanteDto {
  /** Tipo de representação (ex: "Advogado", "Defensor Público") */
  tipoRepresentacao: string;

  /** Nome do representante */
  nome: string;

  /** Situação do representante (ex: "Ativo", "Inativo") */
  situacao: string;
}

/**
 * DTO para informações de parte processual
 * Limitado a 5 representantes por parte
 */
export class ParteDto {
  /** Nome da parte */
  nome: string;

  /** Tipo da parte (ex: "Autor", "Réu") */
  tipoParte: string;

  /** Polo da parte (ATIVO ou PASSIVO) */
  polo: string;

  /** Lista de representantes (máximo 5) */
  representantes: RepresentanteDto[];
}

/**
 * DTO para datas relevantes do processo
 */
export class DatasRelevantesDto {
  /** Data e hora de ajuizamento no formato ISO 8601 */
  ajuizamento: string;

  /** Data e hora da última distribuição no formato ISO 8601 */
  ultimaDistribuicao: string;
}

/**
 * DTO com informações detalhadas de um processo
 * Usado na visualização individual de processo
 * Contém todas as informações da tramitação atual
 */
export class ProcessoDetailDto {
  /** Número completo do processo */
  numeroProcesso: string;

  /** Sigla do tribunal */
  siglaTribunal: string;

  /** Nível de sigilo (0 = sem sigilo) */
  nivelSigilo: number;

  /** Status da tramitação ("Ativo" ou "Inativo") */
  tramitacaoAtual: string;

  /** Informações do grau da tramitação atual */
  grau: GrauDto;

  /** Nome(s) do(s) órgão(s) julgador(es) concatenados */
  orgaoJulgador: string;

  /** Lista com todas as classes do processo */
  classes: ClasseDto[];

  /** Lista com todos os assuntos do processo */
  assuntos: AssuntoDto[];

  /** Datas relevantes (ajuizamento e última distribuição) */
  datasRelevantes: DatasRelevantesDto;

  /** Lista com todas as partes do processo */
  partes: ParteDto[];

  /** Informações detalhadas do último movimento */
  ultimoMovimento: UltimoMovimentoDetailDto;
}
