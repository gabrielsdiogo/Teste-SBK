import { Injectable, OnModuleInit } from '@nestjs/common';
import { ProcessosData, Processo } from './types/processo.types';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ProcessosRepository implements OnModuleInit {
  private processos: Processo[] = [];

  onModuleInit() {
    this.loadData();
  }

  private loadData() {
    const dataPath = path.join(__dirname, '..', 'data', 'itau.json');
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const data: ProcessosData = JSON.parse(rawData);
    this.processos = data.content;
    console.log(`Loaded ${this.processos.length} processos from JSON file`);
  }

  findAll(): Processo[] {
    return this.processos;
  }

  findByNumeroProcesso(numeroProcesso: string): Processo | undefined {
    return this.processos.find(
      (p) => p.numeroProcesso === numeroProcesso
    );
  }
}
