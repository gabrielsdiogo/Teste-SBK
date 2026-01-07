import { Injectable, NotFoundException } from '@nestjs/common';
import { ProcessosRepository } from './processos.repository';
import { ProcessoSummaryDto, PartesResumoDto, UltimoMovimentoDto } from './dto/processo-summary.dto';
import { ProcessoDetailDto, ParteDto, RepresentanteDto, UltimoMovimentoDetailDto, DatasRelevantesDto } from './dto/processo-detail.dto';
import { ListProcessosQueryDto } from './dto/list-processos-query.dto';
import { ListProcessosResponseDto } from './dto/list-processos-response.dto';
import { Processo, Tramitacao } from './types/processo.types';

/**
 * Serviço responsável pela lógica de negócio relacionada a processos
 *
 * Principais responsabilidades:
 * - Determinar a tramitação atual de um processo
 * - Transformar dados brutos em DTOs para resposta
 * - Aplicar filtros e paginação na listagem
 * - Validar e buscar processos por número
 */
@Injectable()
export class ProcessosService {
  constructor(private readonly repository: ProcessosRepository) {}

  /**
   * Determina qual é a tramitação atual de um processo
   *
   * Regras de priorização (nesta ordem):
   * 1. Priorizar tramitações com ativo = true
   * 2. Entre elas, escolher a com maior dataHoraUltimaDistribuicao (mais recente)
   * 3. Em caso de empate na data, escolher a de maior grau.numero (instância superior)
   *
   * @param processo - Processo com suas tramitações
   * @returns Tramitação atual ou null se não houver tramitações
   * @private
   */
  private getTramitacaoAtual(processo: Processo): Tramitacao | null {
    // Valida se existem tramitações
    if (!processo.tramitacoes || processo.tramitacoes.length === 0) {
      return null;
    }

    // Filtra apenas tramitações ativas
    const tramitacoesAtivas = processo.tramitacoes.filter((t) => t.ativo);

    // Se não há tramitações ativas, usa todas as tramitações
    if (tramitacoesAtivas.length === 0) {
      return processo.tramitacoes.sort((a, b) => {
        // Compara por data (mais recente primeiro)
        const dateCompare = new Date(b.dataHoraUltimaDistribuicao).getTime() - new Date(a.dataHoraUltimaDistribuicao).getTime();
        if (dateCompare !== 0) return dateCompare;
        // Em caso de empate, usa grau como critério
        return b.grau.numero - a.grau.numero;
      })[0];
    }

    // Ordena tramitações ativas usando mesmos critérios
    return tramitacoesAtivas.sort((a, b) => {
      const dateCompare = new Date(b.dataHoraUltimaDistribuicao).getTime() - new Date(a.dataHoraUltimaDistribuicao).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.grau.numero - a.grau.numero;
    })[0];
  }

  /**
   * Transforma um processo em formato resumido para listagem
   *
   * Extrai apenas as informações essenciais da tramitação atual:
   * - Dados básicos do processo
   * - Primeiro item de classe e assunto
   * - Partes separadas por polo (ativo/passivo)
   * - Último movimento processual
   *
   * @param processo - Processo completo
   * @returns ProcessoSummaryDto ou null se não houver tramitação válida
   * @private
   */
  private mapToSummary(processo: Processo): ProcessoSummaryDto | null {
    const tramitacaoAtual = this.getTramitacaoAtual(processo);

    // Verifica se há tramitação atual com último movimento
    if (!tramitacaoAtual || !tramitacaoAtual.ultimoMovimento) {
      return null;
    }

    // Separa nomes das partes por polo
    const partesAtivo = tramitacaoAtual.partes
      .filter((p) => p.polo === 'ATIVO')
      .map((p) => p.nome);

    const partesPassivo = tramitacaoAtual.partes
      .filter((p) => p.polo === 'PASSIVO')
      .map((p) => p.nome);

    const partesResumo: PartesResumoDto = {
      ativo: partesAtivo,
      passivo: partesPassivo,
    };

    // Monta informações do último movimento
    const ultimoMovimento: UltimoMovimentoDto = {
      dataHora: tramitacaoAtual.ultimoMovimento.dataHora,
      descricao: tramitacaoAtual.ultimoMovimento.descricao,
      orgaoJulgador: tramitacaoAtual.ultimoMovimento.orgaoJulgador?.map((o) => o.nome).join(', ') || '',
      codigo: tramitacaoAtual.ultimoMovimento.codigo,
    };

    // Retorna DTO resumido
    return {
      numeroProcesso: processo.numeroProcesso,
      siglaTribunal: processo.siglaTribunal,
      grauAtual: tramitacaoAtual.grau.sigla,
      classePrincipal: tramitacaoAtual.classe[0]?.descricao || '',
      assuntoPrincipal: tramitacaoAtual.assunto[0]?.descricao || '',
      ultimoMovimento,
      partesResumo,
    };
  }

  /**
   * Transforma um processo em formato detalhado para visualização individual
   *
   * Inclui todas as informações relevantes da tramitação atual:
   * - Todas as classes e assuntos (não apenas o principal)
   * - Todas as partes com até 5 representantes cada
   * - Datas relevantes (ajuizamento, última distribuição)
   * - Informações completas do último movimento
   *
   * @param processo - Processo completo
   * @returns ProcessoDetailDto ou null se não houver tramitação válida
   * @private
   */
  private mapToDetail(processo: Processo): ProcessoDetailDto | null {
    const tramitacaoAtual = this.getTramitacaoAtual(processo);

    // Verifica se há tramitação atual com último movimento
    if (!tramitacaoAtual || !tramitacaoAtual.ultimoMovimento) {
      return null;
    }

    // Mapeia todas as partes, limitando representantes a 5 por parte
    const partes: ParteDto[] = tramitacaoAtual.partes.map((p) => ({
      nome: p.nome,
      tipoParte: p.tipoParte,
      polo: p.polo,
      representantes: p.representantes?.slice(0, 5).map((r): RepresentanteDto => ({
        tipoRepresentacao: r.tipoRepresentacao,
        nome: r.nome,
        situacao: r.situacao,
      })) || [],
    }));

    // Monta informações detalhadas do último movimento
    const ultimoMovimento: UltimoMovimentoDetailDto = {
      data: tramitacaoAtual.ultimoMovimento.dataHora,
      descricao: tramitacaoAtual.ultimoMovimento.descricao,
      orgaoJulgador: tramitacaoAtual.ultimoMovimento.orgaoJulgador?.map((o) => o.nome) || [],
      codigo: tramitacaoAtual.ultimoMovimento.codigo,
    };

    // Agrupa datas relevantes
    const datasRelevantes: DatasRelevantesDto = {
      ajuizamento: tramitacaoAtual.dataHoraAjuizamento,
      ultimaDistribuicao: tramitacaoAtual.dataHoraUltimaDistribuicao,
    };

    // Retorna DTO completo
    return {
      numeroProcesso: processo.numeroProcesso,
      siglaTribunal: processo.siglaTribunal,
      nivelSigilo: processo.nivelSigilo,
      tramitacaoAtual: tramitacaoAtual.ativo ? 'Ativo' : 'Inativo',
      grau: tramitacaoAtual.grau,
      orgaoJulgador: tramitacaoAtual.ultimoMovimento.orgaoJulgador?.map((o) => o.nome).join(', ') || '',
      classes: tramitacaoAtual.classe,
      assuntos: tramitacaoAtual.assunto,
      datasRelevantes,
      partes,
      ultimoMovimento,
    };
  }

  /**
   * Lista processos com filtros e paginação
   *
   * Funcionalidades:
   * - Busca textual (q): Pesquisa em número do processo, partes, classe e assunto
   * - Filtro por tribunal: Filtra por sigla do tribunal (ex: TJSP)
   * - Filtro por grau: Filtra por sigla do grau (ex: G1, G2)
   * - Paginação baseada em cursor: Usa número do processo como cursor
   *
   * @param query - Parâmetros de filtro e paginação
   * @returns Lista paginada de processos em formato resumido
   */
  listProcessos(query: ListProcessosQueryDto): ListProcessosResponseDto {
    let processos = this.repository.findAll();

    // Filtrar processos sem tramitações válidas (sem tramitação ou sem último movimento)
    processos = processos.filter((p) => this.getTramitacaoAtual(p) !== null);

    // Aplicar filtro de busca textual (case-insensitive)
    if (query.q) {
      const searchTerm = query.q.toLowerCase();
      processos = processos.filter((p) => {
        const tramitacaoAtual = this.getTramitacaoAtual(p);
        if (!tramitacaoAtual) return false;

        // Buscar em múltiplos campos
        const matchNumero = p.numeroProcesso.toLowerCase().includes(searchTerm);
        const matchPartes = tramitacaoAtual.partes.some((parte) =>
          parte.nome.toLowerCase().includes(searchTerm)
        );
        const matchClasse = tramitacaoAtual.classe.some((c) =>
          c.descricao.toLowerCase().includes(searchTerm)
        );
        const matchAssunto = tramitacaoAtual.assunto.some((a) =>
          a.descricao.toLowerCase().includes(searchTerm)
        );

        return matchNumero || matchPartes || matchClasse || matchAssunto;
      });
    }

    // Aplicar filtro por tribunal
    if (query.tribunal) {
      processos = processos.filter((p) => p.siglaTribunal === query.tribunal);
    }

    // Aplicar filtro por grau
    if (query.grau) {
      processos = processos.filter((p) => {
        const tramitacaoAtual = this.getTramitacaoAtual(p);
        return tramitacaoAtual && tramitacaoAtual.grau.sigla === query.grau;
      });
    }

    // Implementar paginação baseada em cursor
    const limit = query.limit || 20; // Padrão: 20 itens por página
    let startIndex = 0;

    if (query.cursor) {
      // Cursor é o número do processo do último item da página anterior
      const cursorIndex = processos.findIndex((p) => p.numeroProcesso === query.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1; // Próximo item após o cursor
      }
    }

    // Aplicar paginação
    const paginatedProcessos = processos.slice(startIndex, startIndex + limit);

    // Determinar próximo cursor (se houver mais páginas)
    const nextCursor = paginatedProcessos.length === limit && startIndex + limit < processos.length
      ? paginatedProcessos[paginatedProcessos.length - 1].numeroProcesso
      : null;

    // Transformar processos em DTOs resumidos
    const items = paginatedProcessos
      .map((p) => this.mapToSummary(p))
      .filter((item): item is ProcessoSummaryDto => item !== null);

    return {
      items,
      nextCursor,
    };
  }

  /**
   * Busca detalhes completos de um processo específico
   *
   * Validações:
   * - Verifica se o processo existe
   * - Verifica se possui tramitações válidas
   *
   * @param numeroProcesso - Número completo do processo
   * @returns Detalhes completos do processo
   * @throws NotFoundException se processo não existir ou não tiver tramitações válidas
   */
  getProcessoDetail(numeroProcesso: string): ProcessoDetailDto {
    // Busca processo no repositório
    const processo = this.repository.findByNumeroProcesso(numeroProcesso);

    // Valida existência do processo
    if (!processo) {
      throw new NotFoundException({
        code: 'PROCESSO_NOT_FOUND',
        message: `Processo ${numeroProcesso} não encontrado`,
      });
    }

    // Transforma em DTO detalhado
    const detail = this.mapToDetail(processo);

    // Valida se processo tem tramitações válidas
    if (!detail) {
      throw new NotFoundException({
        code: 'PROCESSO_INVALID',
        message: `Processo ${numeroProcesso} não possui tramitações válidas`,
      });
    }

    return detail;
  }
}
