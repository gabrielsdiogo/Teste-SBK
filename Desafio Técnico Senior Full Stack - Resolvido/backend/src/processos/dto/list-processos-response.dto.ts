import { ProcessoSummaryDto } from './processo-summary.dto';

/**
 * DTO de resposta para listagem paginada de processos
 */
export class ListProcessosResponseDto {
  /** Array com os processos da página atual em formato resumido */
  items: ProcessoSummaryDto[];

  /**
   * Cursor para próxima página
   * - String: número do processo para buscar próxima página
   * - null: não há mais páginas disponíveis
   */
  nextCursor: string | null;
}
