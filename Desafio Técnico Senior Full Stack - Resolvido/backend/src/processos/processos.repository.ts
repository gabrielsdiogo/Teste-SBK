import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProcessosData, Processo } from './types/processo.types';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Repository responsável pelo acesso aos dados de processos
 * Implementa OnModuleInit para carregar dados na inicialização do módulo
 *
 * Atualmente carrega dados de um arquivo JSON, mas pode ser facilmente
 * adaptado para trabalhar com banco de dados
 */
@Injectable()
export class ProcessosRepository implements OnModuleInit {
  /** Array em memória contendo todos os processos carregados */
  private processos: Processo[] = [];

  /**
   * Hook do ciclo de vida do NestJS
   * Executado automaticamente quando o módulo é inicializado
   */
  onModuleInit() {
    this.loadData();
  }

  /**
   * Carrega os dados do arquivo JSON para a memória
   * Lê o arquivo itau.json localizado em src/data/
   *
   * @private
   */
  private loadData() {
    const dataPath = path.join(__dirname, '..', 'data', 'itau.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: ProcessosData = JSON.parse(rawData);
    this.processos = data.content;
    console.log(`Loaded ${this.processos.length} processos from JSON file`);
  }

  /**
   * Retorna todos os processos disponíveis
   * @returns Array com todos os processos
   */
  findAll(): Processo[] {
    return this.processos;
  }

  /**
   * Busca um processo específico pelo número
   * @param numeroProcesso - Número completo do processo (ex: "0000001-00.0000.0.00.0000")
   * @returns Processo encontrado ou undefined se não existir
   */
  findByNumeroProcesso(numeroProcesso: string): Processo | undefined {
    return this.processos.find(
      (p) => p.numeroProcesso === numeroProcesso
    );
  }
}
