import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

/**
 * Função principal de inicialização da aplicação
 *
 * Responsabilidades:
 * - Criar instância da aplicação NestJS
 * - Configurar CORS para permitir acesso do frontend
 * - Configurar validação global de DTOs
 * - Iniciar servidor HTTP na porta configurada
 */
async function bootstrap() {
  // Cria instância da aplicação NestJS
  const app = await NestFactory.create(AppModule);

  // Habilita CORS para permitir requisições do frontend
  // Configurado para aceitar requisições do Vite (porta padrão 5173)
  app.enableCors({
    origin: 'http://localhost:5173', // Porta padrão do Vite
    credentials: true, // Permite envio de cookies e credenciais
  });

  // Configura validação global usando class-validator
  // Aplicado automaticamente a todos os DTOs da aplicação
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true, // Transforma payloads em instâncias de DTO
      whitelist: true, // Remove propriedades não definidas no DTO
      forbidNonWhitelisted: true, // Retorna erro se houver propriedades não permitidas
    }),
  );

  // Inicia o servidor na porta 3000 (ou variável de ambiente PORT)
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:3000`);
}

// Executa a função de bootstrap
bootstrap();
