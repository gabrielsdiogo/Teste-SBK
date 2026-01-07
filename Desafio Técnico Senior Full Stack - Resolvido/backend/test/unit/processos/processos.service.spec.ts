import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProcessosService } from '../../../src/processos/processos.service';
import { ProcessosRepository } from '../../../src/processos/processos.repository';
import { Processo, Tramitacao } from '../../../src/processos/types/processo.types';

describe('ProcessosService', () => {
  let service: ProcessosService;
  let repository: ProcessosRepository;

  const createMockTramitacao = (overrides: Partial<Tramitacao> = {}): Tramitacao => ({
    idCodex: 1,
    dataHoraAjuizamento: '2023-01-01T10:00:00Z',
    tribunal: {
      sigla: 'TJSP',
      nome: 'Tribunal de Justiça de São Paulo',
      segmento: 'JUS',
      jtr: '02',
    },
    grau: {
      sigla: 'G1',
      nome: 'Primeira Instância',
      numero: 1,
    },
    liminar: false,
    nivelSigilo: 0,
    valorAcao: 10000,
    dataHoraUltimaDistribuicao: '2023-01-01T10:00:00Z',
    classe: [
      {
        codigo: 100,
        descricao: 'Procedimento Comum',
      },
    ],
    assunto: [
      {
        codigo: 200,
        descricao: 'Dano Material',
        hierarquia: '1.2.3',
      },
    ],
    ultimoMovimento: {
      sequencia: 1,
      dataHora: '2023-01-15T14:30:00Z',
      codigo: 300,
      descricao: 'Juntada de documento',
      idCodex: 1,
      idMovimentoOrigem: 'mov-001',
      idDistribuicaoCodex: 1,
      orgaoJulgador: [
        {
          id: 1,
          nome: '1ª Vara Cível',
        },
      ],
    },
    partes: [
      {
        polo: 'ATIVO',
        tipoParte: 'Autor',
        nome: 'João da Silva',
        sigilosa: false,
        representantes: [
          {
            tipoRepresentacao: 'Advogado',
            nome: 'Dr. José Oliveira',
            situacao: 'Ativo',
          },
        ],
      },
      {
        polo: 'PASSIVO',
        tipoParte: 'Réu',
        nome: 'Maria Santos',
        sigilosa: false,
        representantes: [],
      },
    ],
    ativo: true,
    ...overrides,
  });

  const createMockProcesso = (overrides: Partial<Processo> = {}): Processo => ({
    numeroProcesso: '0000001-00.0000.0.00.0000',
    nivelSigilo: 0,
    idCodexTribunal: 1,
    siglaTribunal: 'TJSP',
    tramitacoes: [createMockTramitacao()],
    ...overrides,
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProcessosService,
        {
          provide: ProcessosRepository,
          useValue: {
            findAll: jest.fn(),
            findByNumeroProcesso: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<ProcessosService>(ProcessosService);
    repository = module.get<ProcessosRepository>(ProcessosRepository);
  });

  describe('getTramitacaoAtual (private method tested indirectly)', () => {
    it('deve retornar tramitação ativa com data mais recente', () => {
      const tramitacao1 = createMockTramitacao({
        ativo: true,
        dataHoraUltimaDistribuicao: '2023-01-01T10:00:00Z',
        grau: { sigla: 'G1', nome: 'Primeira Instância', numero: 1 },
      });

      const tramitacao2 = createMockTramitacao({
        ativo: true,
        dataHoraUltimaDistribuicao: '2023-06-01T10:00:00Z',
        grau: { sigla: 'G2', nome: 'Segunda Instância', numero: 2 },
      });

      const processo = createMockProcesso({
        tramitacoes: [tramitacao1, tramitacao2],
      });

      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      // A tramitação com data mais recente deve ser escolhida
      expect(result.grau.sigla).toBe('G2');
    });

    it('deve priorizar tramitação ativa sobre inativa', () => {
      const tramitacaoInativa = createMockTramitacao({
        ativo: false,
        dataHoraUltimaDistribuicao: '2023-06-01T10:00:00Z',
        grau: { sigla: 'G2', nome: 'Segunda Instância', numero: 2 },
      });

      const tramitacaoAtiva = createMockTramitacao({
        ativo: true,
        dataHoraUltimaDistribuicao: '2023-01-01T10:00:00Z',
        grau: { sigla: 'G1', nome: 'Primeira Instância', numero: 1 },
      });

      const processo = createMockProcesso({
        tramitacoes: [tramitacaoInativa, tramitacaoAtiva],
      });

      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      // Tramitação ativa deve ser escolhida mesmo sendo mais antiga
      expect(result.grau.sigla).toBe('G1');
      expect(result.tramitacaoAtual).toBe('Ativo');
    });

    it('deve usar grau como critério de desempate quando datas são iguais', () => {
      const tramitacao1 = createMockTramitacao({
        ativo: true,
        dataHoraUltimaDistribuicao: '2023-01-01T10:00:00Z',
        grau: { sigla: 'G1', nome: 'Primeira Instância', numero: 1 },
      });

      const tramitacao2 = createMockTramitacao({
        ativo: true,
        dataHoraUltimaDistribuicao: '2023-01-01T10:00:00Z',
        grau: { sigla: 'G2', nome: 'Segunda Instância', numero: 2 },
      });

      const processo = createMockProcesso({
        tramitacoes: [tramitacao1, tramitacao2],
      });

      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      // Deve escolher a tramitação de maior grau
      expect(result.grau.sigla).toBe('G2');
    });
  });

  describe('listProcessos', () => {
    it('deve retornar lista de processos com paginação padrão', () => {
      const processos = [createMockProcesso(), createMockProcesso({ numeroProcesso: '0000002-00.0000.0.00.0000' })];
      jest.spyOn(repository, 'findAll').mockReturnValue(processos);

      const result = service.listProcessos({});

      expect(result.items).toHaveLength(2);
      expect(result.nextCursor).toBeNull();
    });

    it('deve filtrar por termo de busca (q) - número do processo', () => {
      const processo1 = createMockProcesso({ numeroProcesso: '0000001-00.0000.0.00.0000' });
      const processo2 = createMockProcesso({ numeroProcesso: '0000002-00.0000.0.00.0000' });
      jest.spyOn(repository, 'findAll').mockReturnValue([processo1, processo2]);

      const result = service.listProcessos({ q: '0000001' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].numeroProcesso).toBe('0000001-00.0000.0.00.0000');
    });

    it('deve filtrar por termo de busca (q) - nome da parte', () => {
      const processo = createMockProcesso();
      jest.spyOn(repository, 'findAll').mockReturnValue([processo]);

      const result = service.listProcessos({ q: 'joão' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].partesResumo.ativo).toContain('João da Silva');
    });

    it('deve filtrar por termo de busca (q) - classe', () => {
      const processo = createMockProcesso();
      jest.spyOn(repository, 'findAll').mockReturnValue([processo]);

      const result = service.listProcessos({ q: 'procedimento comum' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].classePrincipal).toBe('Procedimento Comum');
    });

    it('deve filtrar por termo de busca (q) - assunto', () => {
      const processo = createMockProcesso();
      jest.spyOn(repository, 'findAll').mockReturnValue([processo]);

      const result = service.listProcessos({ q: 'dano material' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].assuntoPrincipal).toBe('Dano Material');
    });

    it('deve filtrar por tribunal', () => {
      const processo1 = createMockProcesso({ siglaTribunal: 'TJSP' });
      const processo2 = createMockProcesso({
        numeroProcesso: '0000002-00.0000.0.00.0000',
        siglaTribunal: 'TJRJ'
      });
      jest.spyOn(repository, 'findAll').mockReturnValue([processo1, processo2]);

      const result = service.listProcessos({ tribunal: 'TJSP' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].siglaTribunal).toBe('TJSP');
    });

    it('deve filtrar por grau', () => {
      const tramitacaoG1 = createMockTramitacao({
        grau: { sigla: 'G1', nome: 'Primeira Instância', numero: 1 },
      });
      const tramitacaoG2 = createMockTramitacao({
        grau: { sigla: 'G2', nome: 'Segunda Instância', numero: 2 },
      });

      const processo1 = createMockProcesso({
        numeroProcesso: '0000001-00.0000.0.00.0000',
        tramitacoes: [tramitacaoG1]
      });
      const processo2 = createMockProcesso({
        numeroProcesso: '0000002-00.0000.0.00.0000',
        tramitacoes: [tramitacaoG2]
      });

      jest.spyOn(repository, 'findAll').mockReturnValue([processo1, processo2]);

      const result = service.listProcessos({ grau: 'G2' });

      expect(result.items).toHaveLength(1);
      expect(result.items[0].grauAtual).toBe('G2');
    });

    it('deve aplicar paginação com limit', () => {
      const processos = Array.from({ length: 30 }, (_, i) =>
        createMockProcesso({ numeroProcesso: `000000${i}-00.0000.0.00.0000` })
      );
      jest.spyOn(repository, 'findAll').mockReturnValue(processos);

      const result = service.listProcessos({ limit: 10 });

      expect(result.items).toHaveLength(10);
      expect(result.nextCursor).toBe('0000009-00.0000.0.00.0000');
    });

    it('deve aplicar paginação com cursor', () => {
      const processos = Array.from({ length: 30 }, (_, i) =>
        createMockProcesso({ numeroProcesso: `000000${i}-00.0000.0.00.0000` })
      );
      jest.spyOn(repository, 'findAll').mockReturnValue(processos);

      const result = service.listProcessos({
        cursor: '0000009-00.0000.0.00.0000',
        limit: 10
      });

      expect(result.items).toHaveLength(10);
      expect(result.items[0].numeroProcesso).toBe('00000010-00.0000.0.00.0000');
      expect(result.nextCursor).toBe('00000019-00.0000.0.00.0000');
    });

    it('deve retornar nextCursor null quando não há mais páginas', () => {
      const processos = [createMockProcesso()];
      jest.spyOn(repository, 'findAll').mockReturnValue(processos);

      const result = service.listProcessos({ limit: 20 });

      expect(result.items).toHaveLength(1);
      expect(result.nextCursor).toBeNull();
    });

    it('deve filtrar processos sem tramitações válidas', () => {
      const processoValido = createMockProcesso();
      const processoSemTramitacao = createMockProcesso({
        numeroProcesso: '0000002-00.0000.0.00.0000',
        tramitacoes: [],
      });
      const processoSemUltimoMovimento = createMockProcesso({
        numeroProcesso: '0000003-00.0000.0.00.0000',
        tramitacoes: [createMockTramitacao({ ultimoMovimento: null as any })],
      });

      jest.spyOn(repository, 'findAll').mockReturnValue([
        processoValido,
        processoSemTramitacao,
        processoSemUltimoMovimento,
      ]);

      const result = service.listProcessos({});

      expect(result.items).toHaveLength(1);
      expect(result.items[0].numeroProcesso).toBe('0000001-00.0000.0.00.0000');
    });

    it('deve usar limit padrão de 20 quando não informado', () => {
      const processos = Array.from({ length: 25 }, (_, i) =>
        createMockProcesso({ numeroProcesso: `000000${i}-00.0000.0.00.0000` })
      );
      jest.spyOn(repository, 'findAll').mockReturnValue(processos);

      const result = service.listProcessos({});

      expect(result.items).toHaveLength(20);
    });
  });

  describe('getProcessoDetail', () => {
    it('deve retornar detalhes do processo', () => {
      const processo = createMockProcesso();
      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.numeroProcesso).toBe('0000001-00.0000.0.00.0000');
      expect(result.siglaTribunal).toBe('TJSP');
      expect(result.grau.sigla).toBe('G1');
      expect(result.tramitacaoAtual).toBe('Ativo');
    });

    it('deve lançar NotFoundException quando processo não existe', () => {
      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(undefined);

      expect(() => {
        service.getProcessoDetail('9999999-99.9999.9.99.9999');
      }).toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException quando processo não tem tramitações válidas', () => {
      const processo = createMockProcesso({ tramitacoes: [] });
      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      expect(() => {
        service.getProcessoDetail('0000001-00.0000.0.00.0000');
      }).toThrow(NotFoundException);
    });

    it('deve retornar partes com representantes limitados a 5', () => {
      const representantes = Array.from({ length: 10 }, (_, i) => ({
        tipoRepresentacao: 'Advogado',
        nome: `Dr. Advogado ${i}`,
        situacao: 'Ativo',
      }));

      const tramitacao = createMockTramitacao({
        partes: [
          {
            polo: 'ATIVO',
            tipoParte: 'Autor',
            nome: 'João da Silva',
            sigilosa: false,
            representantes,
          },
        ],
      });

      const processo = createMockProcesso({ tramitacoes: [tramitacao] });
      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.partes[0].representantes).toHaveLength(5);
    });

    it('deve mapear corretamente os dados relevantes do processo', () => {
      const processo = createMockProcesso();
      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.nivelSigilo).toBe(0);
      expect(result.classes).toHaveLength(1);
      expect(result.classes[0].descricao).toBe('Procedimento Comum');
      expect(result.assuntos).toHaveLength(1);
      expect(result.assuntos[0].descricao).toBe('Dano Material');
      expect(result.datasRelevantes.ajuizamento).toBe('2023-01-01T10:00:00Z');
      expect(result.datasRelevantes.ultimaDistribuicao).toBe('2023-01-01T10:00:00Z');
      expect(result.ultimoMovimento.descricao).toBe('Juntada de documento');
    });

    it('deve retornar órgão julgador concatenado', () => {
      const tramitacao = createMockTramitacao({
        ultimoMovimento: {
          sequencia: 1,
          dataHora: '2023-01-15T14:30:00Z',
          codigo: 300,
          descricao: 'Juntada de documento',
          idCodex: 1,
          idMovimentoOrigem: 'mov-001',
          idDistribuicaoCodex: 1,
          orgaoJulgador: [
            { id: 1, nome: '1ª Vara Cível' },
            { id: 2, nome: '2ª Vara Cível' },
          ],
        },
      });

      const processo = createMockProcesso({ tramitacoes: [tramitacao] });
      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.orgaoJulgador).toBe('1ª Vara Cível, 2ª Vara Cível');
    });

    it('deve retornar string vazia quando não há órgão julgador', () => {
      const tramitacao = createMockTramitacao({
        ultimoMovimento: {
          sequencia: 1,
          dataHora: '2023-01-15T14:30:00Z',
          codigo: 300,
          descricao: 'Juntada de documento',
          idCodex: 1,
          idMovimentoOrigem: 'mov-001',
          idDistribuicaoCodex: 1,
          orgaoJulgador: [],
        },
      });

      const processo = createMockProcesso({ tramitacoes: [tramitacao] });
      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.orgaoJulgador).toBe('');
    });

    it('deve separar partes por polo corretamente', () => {
      const processo = createMockProcesso();
      jest.spyOn(repository, 'findByNumeroProcesso').mockReturnValue(processo);

      const result = service.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.partes).toHaveLength(2);
      expect(result.partes.find((p) => p.polo === 'ATIVO')?.nome).toBe('João da Silva');
      expect(result.partes.find((p) => p.polo === 'PASSIVO')?.nome).toBe('Maria Santos');
    });
  });
});
