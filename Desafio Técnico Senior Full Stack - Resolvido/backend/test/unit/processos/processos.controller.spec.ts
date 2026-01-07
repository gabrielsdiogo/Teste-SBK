import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { ProcessosController } from '../../../src/processos/processos.controller';
import { ProcessosService } from '../../../src/processos/processos.service';
import { ListProcessosQueryDto } from '../../../src/processos/dto/list-processos-query.dto';
import { ListProcessosResponseDto } from '../../../src/processos/dto/list-processos-response.dto';
import { ProcessoDetailDto } from '../../../src/processos/dto/processo-detail.dto';

describe('ProcessosController', () => {
  let controller: ProcessosController;
  let service: ProcessosService;

  const mockProcessoSummary = {
    numeroProcesso: '0000001-00.0000.0.00.0000',
    siglaTribunal: 'TJSP',
    grauAtual: 'G1',
    classePrincipal: 'Procedimento Comum',
    assuntoPrincipal: 'Dano Material',
    ultimoMovimento: {
      dataHora: '2023-01-15T14:30:00Z',
      descricao: 'Juntada de documento',
      orgaoJulgador: '1ª Vara Cível',
      codigo: 300,
    },
    partesResumo: {
      ativo: ['João da Silva'],
      passivo: ['Maria Santos'],
    },
  };

  const mockListResponse: ListProcessosResponseDto = {
    items: [mockProcessoSummary],
    nextCursor: null,
  };

  const mockProcessoDetail: ProcessoDetailDto = {
    numeroProcesso: '0000001-00.0000.0.00.0000',
    siglaTribunal: 'TJSP',
    nivelSigilo: 0,
    tramitacaoAtual: 'Ativo',
    grau: {
      sigla: 'G1',
      nome: 'Primeira Instância',
      numero: 1,
    },
    orgaoJulgador: '1ª Vara Cível',
    classes: [
      {
        codigo: 100,
        descricao: 'Procedimento Comum',
      },
    ],
    assuntos: [
      {
        codigo: 200,
        descricao: 'Dano Material',
        hierarquia: '1.2.3',
      },
    ],
    datasRelevantes: {
      ajuizamento: '2023-01-01T10:00:00Z',
      ultimaDistribuicao: '2023-01-01T10:00:00Z',
    },
    partes: [
      {
        nome: 'João da Silva',
        tipoParte: 'Autor',
        polo: 'ATIVO',
        representantes: [],
      },
    ],
    ultimoMovimento: {
      data: '2023-01-15T14:30:00Z',
      descricao: 'Juntada de documento',
      orgaoJulgador: ['1ª Vara Cível'],
      codigo: 300,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProcessosController],
      providers: [
        {
          provide: ProcessosService,
          useValue: {
            listProcessos: jest.fn(),
            getProcessoDetail: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ProcessosController>(ProcessosController);
    service = module.get<ProcessosService>(ProcessosService);
  });

  describe('listProcessos', () => {
    it('deve retornar lista de processos sem filtros', () => {
      jest.spyOn(service, 'listProcessos').mockReturnValue(mockListResponse);

      const query: ListProcessosQueryDto = {};
      const result = controller.listProcessos(query);

      expect(service.listProcessos).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
      expect(result.items).toHaveLength(1);
      expect(result.items[0].numeroProcesso).toBe('0000001-00.0000.0.00.0000');
    });

    it('deve retornar lista de processos com filtro de busca', () => {
      jest.spyOn(service, 'listProcessos').mockReturnValue(mockListResponse);

      const query: ListProcessosQueryDto = { q: 'joão' };
      const result = controller.listProcessos(query);

      expect(service.listProcessos).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
    });

    it('deve retornar lista de processos com filtro de tribunal', () => {
      jest.spyOn(service, 'listProcessos').mockReturnValue(mockListResponse);

      const query: ListProcessosQueryDto = { tribunal: 'TJSP' };
      const result = controller.listProcessos(query);

      expect(service.listProcessos).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
    });

    it('deve retornar lista de processos com filtro de grau', () => {
      jest.spyOn(service, 'listProcessos').mockReturnValue(mockListResponse);

      const query: ListProcessosQueryDto = { grau: 'G1' };
      const result = controller.listProcessos(query);

      expect(service.listProcessos).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
    });

    it('deve retornar lista de processos com paginação', () => {
      jest.spyOn(service, 'listProcessos').mockReturnValue(mockListResponse);

      const query: ListProcessosQueryDto = {
        limit: 10,
        cursor: '0000001-00.0000.0.00.0000',
      };
      const result = controller.listProcessos(query);

      expect(service.listProcessos).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
    });

    it('deve retornar lista de processos com múltiplos filtros', () => {
      jest.spyOn(service, 'listProcessos').mockReturnValue(mockListResponse);

      const query: ListProcessosQueryDto = {
        q: 'joão',
        tribunal: 'TJSP',
        grau: 'G1',
        limit: 10,
      };
      const result = controller.listProcessos(query);

      expect(service.listProcessos).toHaveBeenCalledWith(query);
      expect(result).toEqual(mockListResponse);
    });

    it('deve lançar BadRequestException quando serviço lança erro', () => {
      jest.spyOn(service, 'listProcessos').mockImplementation(() => {
        throw new Error('Parâmetro inválido');
      });

      const query: ListProcessosQueryDto = { limit: -1 };

      expect(() => {
        controller.listProcessos(query);
      }).toThrow(BadRequestException);
    });

    it('deve lançar BadRequestException com código e mensagem corretos', () => {
      jest.spyOn(service, 'listProcessos').mockImplementation(() => {
        throw new Error('Parâmetro inválido');
      });

      const query: ListProcessosQueryDto = {};

      try {
        controller.listProcessos(query);
        fail('Deveria ter lançado exceção');
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        const response = (error as BadRequestException).getResponse();
        expect(response).toEqual({
          code: 'INVALID_PARAMETER',
          message: 'Parâmetro inválido',
        });
      }
    });

    it('deve retornar lista vazia quando não há processos', () => {
      const emptyResponse: ListProcessosResponseDto = {
        items: [],
        nextCursor: null,
      };
      jest.spyOn(service, 'listProcessos').mockReturnValue(emptyResponse);

      const query: ListProcessosQueryDto = {};
      const result = controller.listProcessos(query);

      expect(result.items).toHaveLength(0);
      expect(result.nextCursor).toBeNull();
    });

    it('deve retornar nextCursor quando há mais páginas', () => {
      const responseWithCursor: ListProcessosResponseDto = {
        items: [mockProcessoSummary],
        nextCursor: '0000001-00.0000.0.00.0000',
      };
      jest.spyOn(service, 'listProcessos').mockReturnValue(responseWithCursor);

      const query: ListProcessosQueryDto = { limit: 1 };
      const result = controller.listProcessos(query);

      expect(result.nextCursor).toBe('0000001-00.0000.0.00.0000');
    });
  });

  describe('getProcessoDetail', () => {
    it('deve retornar detalhes do processo quando existe', () => {
      jest.spyOn(service, 'getProcessoDetail').mockReturnValue(mockProcessoDetail);

      const result = controller.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(service.getProcessoDetail).toHaveBeenCalledWith('0000001-00.0000.0.00.0000');
      expect(result).toEqual(mockProcessoDetail);
      expect(result.numeroProcesso).toBe('0000001-00.0000.0.00.0000');
    });

    it('deve retornar todos os campos esperados do processo', () => {
      jest.spyOn(service, 'getProcessoDetail').mockReturnValue(mockProcessoDetail);

      const result = controller.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.numeroProcesso).toBeDefined();
      expect(result.siglaTribunal).toBeDefined();
      expect(result.nivelSigilo).toBeDefined();
      expect(result.tramitacaoAtual).toBeDefined();
      expect(result.grau).toBeDefined();
      expect(result.orgaoJulgador).toBeDefined();
      expect(result.classes).toBeDefined();
      expect(result.assuntos).toBeDefined();
      expect(result.datasRelevantes).toBeDefined();
      expect(result.partes).toBeDefined();
      expect(result.ultimoMovimento).toBeDefined();
    });

    it('deve lançar NotFoundException quando processo não existe', () => {
      jest.spyOn(service, 'getProcessoDetail').mockImplementation(() => {
        throw new NotFoundException({
          code: 'PROCESSO_NOT_FOUND',
          message: 'Processo 9999999-99.9999.9.99.9999 não encontrado',
        });
      });

      expect(() => {
        controller.getProcessoDetail('9999999-99.9999.9.99.9999');
      }).toThrow(NotFoundException);
    });

    it('deve lançar NotFoundException com código correto', () => {
      jest.spyOn(service, 'getProcessoDetail').mockImplementation(() => {
        throw new NotFoundException({
          code: 'PROCESSO_NOT_FOUND',
          message: 'Processo não encontrado',
        });
      });

      try {
        controller.getProcessoDetail('9999999-99.9999.9.99.9999');
        fail('Deveria ter lançado exceção');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        const response = (error as NotFoundException).getResponse();
        expect(response).toEqual({
          code: 'PROCESSO_NOT_FOUND',
          message: 'Processo não encontrado',
        });
      }
    });

    it('deve lançar NotFoundException quando processo não tem tramitações válidas', () => {
      jest.spyOn(service, 'getProcessoDetail').mockImplementation(() => {
        throw new NotFoundException({
          code: 'PROCESSO_INVALID',
          message: 'Processo não possui tramitações válidas',
        });
      });

      try {
        controller.getProcessoDetail('0000001-00.0000.0.00.0000');
        fail('Deveria ter lançado exceção');
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        const response = (error as NotFoundException).getResponse();
        expect(response).toEqual({
          code: 'PROCESSO_INVALID',
          message: 'Processo não possui tramitações válidas',
        });
      }
    });

    it('deve aceitar números de processo com diferentes formatos', () => {
      jest.spyOn(service, 'getProcessoDetail').mockReturnValue(mockProcessoDetail);

      const numeroProcesso = '1234567-89.0123.4.56.7890';
      controller.getProcessoDetail(numeroProcesso);

      expect(service.getProcessoDetail).toHaveBeenCalledWith(numeroProcesso);
    });

    it('deve retornar estrutura de dados relevantes correta', () => {
      jest.spyOn(service, 'getProcessoDetail').mockReturnValue(mockProcessoDetail);

      const result = controller.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.datasRelevantes).toHaveProperty('ajuizamento');
      expect(result.datasRelevantes).toHaveProperty('ultimaDistribuicao');
    });

    it('deve retornar partes com estrutura correta', () => {
      jest.spyOn(service, 'getProcessoDetail').mockReturnValue(mockProcessoDetail);

      const result = controller.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.partes).toBeInstanceOf(Array);
      expect(result.partes[0]).toHaveProperty('nome');
      expect(result.partes[0]).toHaveProperty('tipoParte');
      expect(result.partes[0]).toHaveProperty('polo');
      expect(result.partes[0]).toHaveProperty('representantes');
    });

    it('deve retornar ultimo movimento com estrutura correta', () => {
      jest.spyOn(service, 'getProcessoDetail').mockReturnValue(mockProcessoDetail);

      const result = controller.getProcessoDetail('0000001-00.0000.0.00.0000');

      expect(result.ultimoMovimento).toHaveProperty('data');
      expect(result.ultimoMovimento).toHaveProperty('descricao');
      expect(result.ultimoMovimento).toHaveProperty('orgaoJulgador');
      expect(result.ultimoMovimento).toHaveProperty('codigo');
    });
  });
});
