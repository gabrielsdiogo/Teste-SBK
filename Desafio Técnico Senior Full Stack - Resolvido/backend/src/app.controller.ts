import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

/**
 * Controller raiz da aplicação
 * Responsável por endpoints básicos da API
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * Endpoint GET /
   * Retorna uma mensagem de boas-vindas simples
   * Útil para verificar se a API está funcionando
   */
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
