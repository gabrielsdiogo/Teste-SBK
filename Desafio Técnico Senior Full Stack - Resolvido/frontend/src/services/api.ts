import type { ListProcessosResponse, ProcessoDetail } from '../types/processo.types';

const API_BASE_URL = 'http://localhost:3000';

export interface ListProcessosParams {
  q?: string;
  tribunal?: string;
  grau?: string;
  limit?: number;
  cursor?: string;
}

export class ApiError extends Error {
  code: string;

  constructor(code: string, message: string) {
    super(message);
    this.code = code;
    this.name = 'ApiError';
  }
}

export const api = {
  async listProcessos(params: ListProcessosParams): Promise<ListProcessosResponse> {
    const queryParams = new URLSearchParams();

    if (params.q) queryParams.append('q', params.q);
    if (params.tribunal) queryParams.append('tribunal', params.tribunal);
    if (params.grau) queryParams.append('grau', params.grau);
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.cursor) queryParams.append('cursor', params.cursor);

    const response = await fetch(
      `${API_BASE_URL}/processos?${queryParams.toString()}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.code || 'UNKNOWN_ERROR', error.message || 'Erro desconhecido');
    }

    return response.json();
  },

  async getProcessoDetail(numeroProcesso: string): Promise<ProcessoDetail> {
    const response = await fetch(
      `${API_BASE_URL}/processos/${encodeURIComponent(numeroProcesso)}`,
    );

    if (!response.ok) {
      const error = await response.json();
      throw new ApiError(error.code || 'UNKNOWN_ERROR', error.message || 'Erro desconhecido');
    }

    return response.json();
  },
};
