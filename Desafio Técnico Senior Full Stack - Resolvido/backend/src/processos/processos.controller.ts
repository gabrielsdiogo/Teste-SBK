import {
  Controller,
  Get,
  Param,
  Query,
  ValidationPipe,
  UsePipes,
  BadRequestException,
} from '@nestjs/common';
import { ProcessosService } from './processos.service';
import { ListProcessosQueryDto } from './dto/list-processos-query.dto';
import { ListProcessosResponseDto } from './dto/list-processos-response.dto';
import { ProcessoDetailDto } from './dto/processo-detail.dto';

/**
 * Controller responsável pelos endpoints relacionados a processos
 * Rota base: /processos
 *
 * Endpoints disponíveis:
 * - GET /processos - Lista processos com filtros e paginação
 * - GET /processos/:numeroProcesso - Busca detalhes de um processo específico
 */
@Controller('processos')
export class ProcessosController {
  constructor(private readonly processosService: ProcessosService) {}

  /**
   * Lista processos com filtros e paginação
   *
   * Endpoint: GET /processos
   *
   * Query Parameters:
   * - q (opcional): Termo de busca textual
   * - tribunal (opcional): Sigla do tribunal (ex: TJSP)
   * - grau (opcional): Sigla do grau (ex: G1, G2)
   * - limit (opcional): Quantidade de itens por página (padrão: 20)
   * - cursor (opcional): Cursor para paginação
   *
   * Validações:
   * - Usa ValidationPipe para validar e transformar query params
   * - Whitelist ativado para ignorar campos não definidos no DTO
   *
   * @param query - Parâmetros de filtro e paginação
   * @returns Lista paginada de processos
   * @throws BadRequestException se houver erro nos parâmetros
   */
  @Get()
  @UsePipes(new ValidationPipe({ transform: true, whitelist: true }))
  listProcessos(
    @Query() query: ListProcessosQueryDto,
  ): ListProcessosResponseDto {
    try {
      return this.processosService.listProcessos(query);
    } catch (error) {
      throw new BadRequestException({
        code: 'INVALID_PARAMETER',
        message: error.message,
      });
    }
  }

  /**
   * Busca detalhes completos de um processo específico
   *
   * Endpoint: GET /processos/:numeroProcesso
   *
   * Path Parameters:
   * - numeroProcesso: Número completo do processo (ex: 0000001-00.0000.0.00.0000)
   *
   * @param numeroProcesso - Número do processo extraído da URL
   * @returns Detalhes completos do processo
   * @throws NotFoundException se processo não existir (lançado pelo service)
   */
  @Get(':numeroProcesso')
  getProcessoDetail(
    @Param('numeroProcesso') numeroProcesso: string,
  ): ProcessoDetailDto {
    return this.processosService.getProcessoDetail(numeroProcesso);
  }
}
