import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ProcessosModule } from './processos/processos.module';

@Module({
  imports: [ProcessosModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
