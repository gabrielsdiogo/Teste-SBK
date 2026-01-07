/**
 * Interface para informações do tribunal
 */
export interface Tribunal {
  /** Sigla do tribunal (ex: TJSP, TJRJ) */
  sigla: string;

  /** Nome completo do tribunal */
  nome: string;

  /** Segmento do tribunal */
  segmento: string;

  /** Código JTR (Justiça do Trabalho) */
  jtr: string;
}

/**
 * Interface para informações do grau de tramitação
 */
export interface Grau {
  /** Sigla do grau (ex: G1, G2) */
  sigla: string;

  /** Nome completo do grau */
  nome: string;

  /** Número do grau (1 = primeira instância, 2 = segunda instância, etc.) */
  numero: number;
}

/**
 * Interface para classe processual
 */
export interface Classe {
  /** Código identificador da classe */
  codigo: number;

  /** Descrição da classe (ex: "Procedimento Comum") */
  descricao: string;
}

/**
 * Interface para assunto processual
 */
export interface Assunto {
  /** Código identificador do assunto */
  codigo: number;

  /** Descrição do assunto (ex: "Dano Material") */
  descricao: string;

  /** Hierarquia do assunto no formato "1.2.3" */
  hierarquia: string;
}

/**
 * Interface para órgão julgador
 */
export interface OrgaoJulgador {
  /** ID único do órgão julgador */
  id: number;

  /** Nome do órgão julgador (ex: "1ª Vara Cível") */
  nome: string;
}

/**
 * Interface para último movimento processual
 */
export interface UltimoMovimento {
  /** Número sequencial do movimento */
  sequencia: number;

  /** Data e hora do movimento no formato ISO 8601 */
  dataHora: string;

  /** Código do movimento (opcional) */
  codigo?: number;

  /** Descrição textual do movimento */
  descricao: string;

  /** ID do movimento no sistema Codex */
  idCodex: number;

  /** ID de origem do movimento */
  idMovimentoOrigem: string;

  /** ID da distribuição no sistema Codex */
  idDistribuicaoCodex: number;

  /** Classe associada ao movimento (opcional) */
  classe?: Classe;

  /** Lista de órgãos julgadores relacionados ao movimento */
  orgaoJulgador: OrgaoJulgador[];
}

/**
 * Interface para representante legal de uma parte
 */
export interface Representante {
  /** Tipo de representação (ex: "Advogado", "Defensor Público") */
  tipoRepresentacao: string;

  /** Nome completo do representante */
  nome: string;

  /** Situação do representante (ex: "Ativo", "Inativo") */
  situacao: string;
}

/**
 * Interface para parte processual (autor, réu, etc.)
 */
export interface Parte {
  /** Polo da parte (ATIVO ou PASSIVO) */
  polo: string;

  /** Tipo da parte (ex: "Autor", "Réu") */
  tipoParte: string;

  /** Nome principal da parte */
  nome: string;

  /** Outros nomes/aliases da parte (opcional) */
  outrosNomes?: any[];

  /** Tipo de pessoa (física ou jurídica) (opcional) */
  tipoPessoa?: string;

  /** Documentos principais (CPF, CNPJ, etc.) (opcional) */
  documentosPrincipais?: any[];

  /** Indica se a parte é sigilosa */
  sigilosa: boolean;

  /** Lista de representantes legais da parte */
  representantes: Representante[];
}

/**
 * Interface para tramitação de processo
 * Um processo pode ter múltiplas tramitações em diferentes graus/instâncias
 */
export interface Tramitacao {
  /** ID da tramitação no sistema Codex */
  idCodex: number;

  /** Data e hora do ajuizamento no formato ISO 8601 */
  dataHoraAjuizamento: string;

  /** Informações do tribunal */
  tribunal: Tribunal;

  /** Informações do grau da tramitação */
  grau: Grau;

  /** Indica se há liminar no processo */
  liminar: boolean;

  /** Nível de sigilo (0 = sem sigilo) */
  nivelSigilo: number;

  /** Valor da ação em centavos */
  valorAcao: number;

  /** Data e hora da última distribuição no formato ISO 8601 */
  dataHoraUltimaDistribuicao: string;

  /** Lista de classes do processo */
  classe: Classe[];

  /** Lista de assuntos do processo */
  assunto: Assunto[];

  /** Informações do último movimento processual */
  ultimoMovimento: UltimoMovimento;

  /** Lista de todas as partes envolvidas */
  partes: Parte[];

  /** Indica se a tramitação está ativa */
  ativo: boolean;
}

/**
 * Interface principal para um processo judicial
 */
export interface Processo {
  /** Número único do processo no formato CNJ */
  numeroProcesso: string;

  /** Nível de sigilo do processo (0 = sem sigilo) */
  nivelSigilo: number;

  /** ID do tribunal no sistema Codex */
  idCodexTribunal: number;

  /** Sigla do tribunal (ex: TJSP, TJRJ) */
  siglaTribunal: string;

  /** Lista de todas as tramitações do processo */
  tramitacoes: Tramitacao[];
}

/**
 * Interface para o container de dados de processos
 * Estrutura raiz do arquivo JSON
 */
export interface ProcessosData {
  /** Array com todos os processos */
  content: Processo[];
}
