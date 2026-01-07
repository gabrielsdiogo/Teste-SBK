import { Module } from '@nestjs/common';
import { ProcessosController } from './processos.controller';
import { ProcessosService } from './processos.service';
import { ProcessosRepository } from './processos.repository';

/**
 * Módulo responsável pela funcionalidade de processos
 *
 * Organiza todos os componentes relacionados a processos:
 * - Controller: Endpoints HTTP
 * - Service: Lógica de negócio
 * - Repository: Acesso aos dados
 */
@Module({
  controllers: [ProcessosController],
  providers: [ProcessosService, ProcessosRepository],
})
export class ProcessosModule {}
