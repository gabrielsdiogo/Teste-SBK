import { Module } from '@nestjs/common';
import { ProcessosController } from './processos.controller';
import { ProcessosService } from './processos.service';
import { ProcessosRepository } from './processos.repository';

@Module({
  controllers: [ProcessosController],
  providers: [ProcessosService, ProcessosRepository],
})
export class ProcessosModule {}
