import { Injectable } from '@nestjs/common';

/**
 * Serviço principal da aplicação
 * Contém lógica de negócio básica para endpoints raiz
 */
@Injectable()
export class AppService {
  /**
   * Retorna uma mensagem de boas-vindas
   * @returns String com mensagem "Hello World!"
   */
  getHello(): string {
    return 'Hello World!';
  }
}
