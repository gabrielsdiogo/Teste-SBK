export interface Tribunal {
  sigla: string;
  nome: string;
  segmento: string;
  jtr: string;
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

export interface OrgaoJulgador {
  id: number;
  nome: string;
}

export interface UltimoMovimento {
  sequencia: number;
  dataHora: string;
  codigo?: number;
  descricao: string;
  idCodex: number;
  idMovimentoOrigem: string;
  idDistribuicaoCodex: number;
  classe?: Classe;
  orgaoJulgador: OrgaoJulgador[];
}

export interface Representante {
  tipoRepresentacao: string;
  nome: string;
  situacao: string;
}

export interface Parte {
  polo: string;
  tipoParte: string;
  nome: string;
  outrosNomes?: any[];
  tipoPessoa?: string;
  documentosPrincipais?: any[];
  sigilosa: boolean;
  representantes: Representante[];
}

export interface Tramitacao {
  idCodex: number;
  dataHoraAjuizamento: string;
  tribunal: Tribunal;
  grau: Grau;
  liminar: boolean;
  nivelSigilo: number;
  valorAcao: number;
  dataHoraUltimaDistribuicao: string;
  classe: Classe[];
  assunto: Assunto[];
  ultimoMovimento: UltimoMovimento;
  partes: Parte[];
  ativo: boolean;
}

export interface Processo {
  numeroProcesso: string;
  nivelSigilo: number;
  idCodexTribunal: number;
  siglaTribunal: string;
  tramitacoes: Tramitacao[];
}

export interface ProcessosData {
  content: Processo[];
}
