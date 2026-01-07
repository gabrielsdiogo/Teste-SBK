import { IsOptional, IsString, IsInt, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

/**
 * DTO para parâmetros de query na listagem de processos
 *
 * Todos os campos são opcionais e aplicados como filtros
 */
export class ListProcessosQueryDto {
  /**
   * Termo de busca textual
   * Pesquisa em: número do processo, nome das partes, classe e assunto
   */
  @IsOptional()
  @IsString()
  q?: string;

  /**
   * Sigla do tribunal para filtrar
   * Exemplo: TJSP, TJRJ, STF
   */
  @IsOptional()
  @IsString()
  tribunal?: string;

  /**
   * Sigla do grau para filtrar
   * Exemplo: G1 (primeira instância), G2 (segunda instância)
   */
  @IsOptional()
  @IsString()
  grau?: string;

  /**
   * Quantidade de itens por página
   * Mínimo: 1, Máximo: 100, Padrão: 20
   */
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  /**
   * Cursor para paginação
   * Deve ser o número do processo do último item da página anterior
   */
  @IsOptional()
  @IsString()
  cursor?: string;
}
