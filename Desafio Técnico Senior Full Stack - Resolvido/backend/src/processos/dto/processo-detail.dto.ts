export class TribunalDto {
  sigla: string;
  nome: string;
  segmento: string;
  jtr: string;
}

export class GrauDto {
  sigla: string;
  nome: string;
  numero: number;
}

export class ClasseDto {
  codigo: number;
  descricao: string;
}

export class AssuntoDto {
  codigo: number;
  descricao: string;
  hierarquia: string;
}

export class OrgaoJulgadorDto {
  id: number;
  nome: string;
}

export class UltimoMovimentoDetailDto {
  data: string;
  descricao: string;
  orgaoJulgador: string[];
  codigo?: number;
}

export class RepresentanteDto {
  tipoRepresentacao: string;
  nome: string;
  situacao: string;
}

export class ParteDto {
  nome: string;
  tipoParte: string;
  polo: string;
  representantes: RepresentanteDto[];
}

export class DatasRelevantesDto {
  ajuizamento: string;
  ultimaDistribuicao: string;
}

export class ProcessoDetailDto {
  numeroProcesso: string;
  siglaTribunal: string;
  nivelSigilo: number;
  tramitacaoAtual: string;
  grau: GrauDto;
  orgaoJulgador: string;
  classes: ClasseDto[];
  assuntos: AssuntoDto[];
  datasRelevantes: DatasRelevantesDto;
  partes: ParteDto[];
  ultimoMovimento: UltimoMovimentoDetailDto;
}
