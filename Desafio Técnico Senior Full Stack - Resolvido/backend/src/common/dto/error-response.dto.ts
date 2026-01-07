/**
 * DTO padronizado para respostas de erro
 * Utilizado em exceções HTTP para manter consistência nas mensagens de erro
 */
export class ErrorResponseDto {
  /**
   * Código de erro em formato snake_case
   * Exemplos: PROCESSO_NOT_FOUND, INVALID_PARAMETER
   */
  code: string;

  /**
   * Mensagem descritiva do erro em português
   * Deve ser legível para o usuário final
   */
  message: string;
}
