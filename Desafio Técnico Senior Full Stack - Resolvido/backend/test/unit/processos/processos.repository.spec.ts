import { ProcessosRepository } from '../../../src/processos/processos.repository';
import { Processo } from '../../../src/processos/types/processo.types';
import * as fs from 'fs';

jest.mock('fs');

describe('ProcessosRepository', () => {
  let repository: ProcessosRepository;
  const mockProcessos: Processo[] = [
    {
      numeroProcesso: '0000001-00.0000.0.00.0000',
      nivelSigilo: 0,
      idCodexTribunal: 1,
      siglaTribunal: 'TJSP',
      tramitacoes: [
        {
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
              representantes: [],
            },
          ],
          ativo: true,
        },
      ],
    },
    {
      numeroProcesso: '0000002-00.0000.0.00.0000',
      nivelSigilo: 0,
      idCodexTribunal: 2,
      siglaTribunal: 'TJRJ',
      tramitacoes: [],
    },
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    repository = new ProcessosRepository();

    // Mock da leitura do arquivo JSON
    (fs.readFileSync as jest.Mock).mockReturnValue(
      JSON.stringify({ content: mockProcessos })
    );
  });

  describe('onModuleInit', () => {
    it('deve carregar dados do arquivo JSON ao inicializar', () => {
      repository.onModuleInit();

      expect(fs.readFileSync).toHaveBeenCalled();
      const processos = repository.findAll();
      expect(processos).toHaveLength(2);
      expect(processos[0].numeroProcesso).toBe('0000001-00.0000.0.00.0000');
    });

    it('deve exibir log com quantidade de processos carregados', () => {
      const consoleSpy = jest.spyOn(console, 'log');
      repository.onModuleInit();

      expect(consoleSpy).toHaveBeenCalledWith(
        'Loaded 2 processos from JSON file'
      );
    });
  });

  describe('findAll', () => {
    beforeEach(() => {
      repository.onModuleInit();
    });

    it('deve retornar todos os processos', () => {
      const processos = repository.findAll();

      expect(processos).toHaveLength(2);
      expect(processos).toEqual(mockProcessos);
    });

    it('deve retornar array vazio quando não há processos', () => {
      (fs.readFileSync as jest.Mock).mockReturnValue(
        JSON.stringify({ content: [] })
      );
      repository.onModuleInit();

      const processos = repository.findAll();
      expect(processos).toEqual([]);
    });
  });

  describe('findByNumeroProcesso', () => {
    beforeEach(() => {
      repository.onModuleInit();
    });

    it('deve retornar processo quando número existe', () => {
      const processo = repository.findByNumeroProcesso('0000001-00.0000.0.00.0000');

      expect(processo).toBeDefined();
      expect(processo?.numeroProcesso).toBe('0000001-00.0000.0.00.0000');
      expect(processo?.siglaTribunal).toBe('TJSP');
    });

    it('deve retornar undefined quando número não existe', () => {
      const processo = repository.findByNumeroProcesso('9999999-99.9999.9.99.9999');

      expect(processo).toBeUndefined();
    });

    it('deve encontrar segundo processo', () => {
      const processo = repository.findByNumeroProcesso('0000002-00.0000.0.00.0000');

      expect(processo).toBeDefined();
      expect(processo?.numeroProcesso).toBe('0000002-00.0000.0.00.0000');
      expect(processo?.siglaTribunal).toBe('TJRJ');
    });
  });
});
