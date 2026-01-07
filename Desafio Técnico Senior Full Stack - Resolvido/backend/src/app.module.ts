import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcessosModule } from './processos/processos.module';

/**
 * Módulo raiz da aplicação
 * Responsável por organizar e importar todos os módulos da aplicação
 *
 * Imports: Módulos externos (ProcessosModule)
 * Controllers: Controllers raiz (AppController)
 * Providers: Serviços raiz (AppService)
 */
@Module({
  imports: [ProcessosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
