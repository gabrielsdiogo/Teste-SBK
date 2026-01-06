import { ProcessoSummaryDto } from './processo-summary.dto';

export class ListProcessosResponseDto {
  items: ProcessoSummaryDto[];
  nextCursor: string | null;
}
