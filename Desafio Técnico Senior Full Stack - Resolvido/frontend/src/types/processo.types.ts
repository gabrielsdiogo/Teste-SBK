export interface UltimoMovimento {
  dataHora: string;
  descricao: string;
  orgaoJulgador: string;
  codigo?: number;
}

export interface PartesResumo {
  ativo: string[];
  passivo: string[];
}

export interface ProcessoSummary {
  numeroProcesso: string;
  siglaTribunal: string;
  grauAtual: string;
  classePrincipal: string;
  assuntoPrincipal: string;
  ultimoMovimento: UltimoMovimento;
  partesResumo: PartesResumo;
}

export interface ListProcessosResponse {
  items: ProcessoSummary[];
  nextCursor: string | null;
}

export interface Grau {
  sigla: string;
  nome: string;
  numero: number;
}

export interface Classe {
  codigo: number;
  descricao: string;
}

export interface Assunto {
  codigo: number;
  descricao: string;
  hierarquia: string;
}

export interface UltimoMovimentoDetail {
  data: string;
  descricao: string;
  orgaoJulgador: string[];
  codigo?: number;
}

export interface Representante {
  tipoRepresentacao: string;
  nome: string;
  situacao: string;
}

export interface Parte {
  nome: string;
  tipoParte: string;
  polo: string;
  representantes: Representante[];
}

export interface DatasRelevantes {
  ajuizamento: string;
  ultimaDistribuicao: string;
}

export interface ProcessoDetail {
  numeroProcesso: string;
  siglaTribunal: string;
  nivelSigilo: number;
  tramitacaoAtual: string;
  grau: Grau;
  orgaoJulgador: string;
  classes: Classe[];
  assuntos: Assunto[];
  datasRelevantes: DatasRelevantes;
  partes: Parte[];
  ultimoMovimento: UltimoMovimentoDetail;
}

export interface ErrorResponse {
  code: string;
  message: string;
}
