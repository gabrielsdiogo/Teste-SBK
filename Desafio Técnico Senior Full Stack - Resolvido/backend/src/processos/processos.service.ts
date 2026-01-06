import { Injectable, NotFoundException } from '@nestjs/common';
import { ProcessosRepository } from './processos.repository';
import { ProcessoSummaryDto, PartesResumoDto, UltimoMovimentoDto } from './dto/processo-summary.dto';
import { ProcessoDetailDto, ParteDto, RepresentanteDto, UltimoMovimentoDetailDto, DatasRelevantesDto } from './dto/processo-detail.dto';
import { ListProcessosQueryDto } from './dto/list-processos-query.dto';
import { ListProcessosResponseDto } from './dto/list-processos-response.dto';
import { Processo, Tramitacao } from './types/processo.types';

@Injectable()
export class ProcessosService {
  constructor(private readonly repository: ProcessosRepository) {}

  /**
   * Regra para determinar a tramitação atual:
   * 1. Priorizar tramitações com ativo = true
   * 2. Entre elas, escolher a com maior dataHoraUltimaDistribuicao
   * 3. Em caso de empate, escolher a de maior grau.numero
   */
  private getTramitacaoAtual(processo: Processo): Tramitacao | null {
    if (!processo.tramitacoes || processo.tramitacoes.length === 0) {
      return null;
    }

    const tramitacoesAtivas = processo.tramitacoes.filter((t) => t.ativo);

    if (tramitacoesAtivas.length === 0) {
      // Se não há tramitações ativas, pega a mais recente
      return processo.tramitacoes.sort((a, b) => {
        const dateCompare = new Date(b.dataHoraUltimaDistribuicao).getTime() - new Date(a.dataHoraUltimaDistribuicao).getTime();
        if (dateCompare !== 0) return dateCompare;
        return b.grau.numero - a.grau.numero;
      })[0];
    }

    return tramitacoesAtivas.sort((a, b) => {
      const dateCompare = new Date(b.dataHoraUltimaDistribuicao).getTime() - new Date(a.dataHoraUltimaDistribuicao).getTime();
      if (dateCompare !== 0) return dateCompare;
      return b.grau.numero - a.grau.numero;
    })[0];
  }

  private mapToSummary(processo: Processo): ProcessoSummaryDto | null {
    const tramitacaoAtual = this.getTramitacaoAtual(processo);

    if (!tramitacaoAtual || !tramitacaoAtual.ultimoMovimento) {
      return null;
    }

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

    const ultimoMovimento: UltimoMovimentoDto = {
      dataHora: tramitacaoAtual.ultimoMovimento.dataHora,
      descricao: tramitacaoAtual.ultimoMovimento.descricao,
      orgaoJulgador: tramitacaoAtual.ultimoMovimento.orgaoJulgador?.map((o) => o.nome).join(', ') || '',
      codigo: tramitacaoAtual.ultimoMovimento.codigo,
    };

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

  private mapToDetail(processo: Processo): ProcessoDetailDto | null {
    const tramitacaoAtual = this.getTramitacaoAtual(processo);

    if (!tramitacaoAtual || !tramitacaoAtual.ultimoMovimento) {
      return null;
    }

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

    const ultimoMovimento: UltimoMovimentoDetailDto = {
      data: tramitacaoAtual.ultimoMovimento.dataHora,
      descricao: tramitacaoAtual.ultimoMovimento.descricao,
      orgaoJulgador: tramitacaoAtual.ultimoMovimento.orgaoJulgador?.map((o) => o.nome) || [],
      codigo: tramitacaoAtual.ultimoMovimento.codigo,
    };

    const datasRelevantes: DatasRelevantesDto = {
      ajuizamento: tramitacaoAtual.dataHoraAjuizamento,
      ultimaDistribuicao: tramitacaoAtual.dataHoraUltimaDistribuicao,
    };

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

  listProcessos(query: ListProcessosQueryDto): ListProcessosResponseDto {
    let processos = this.repository.findAll();

    // Filtrar processos sem tramitações válidas
    processos = processos.filter((p) => this.getTramitacaoAtual(p) !== null);

    // Aplicar filtros
    if (query.q) {
      const searchTerm = query.q.toLowerCase();
      processos = processos.filter((p) => {
        const tramitacaoAtual = this.getTramitacaoAtual(p);
        if (!tramitacaoAtual) return false;

        // Buscar em: número do processo, nome das partes, classe, assunto
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

    if (query.tribunal) {
      processos = processos.filter((p) => p.siglaTribunal === query.tribunal);
    }

    if (query.grau) {
      processos = processos.filter((p) => {
        const tramitacaoAtual = this.getTramitacaoAtual(p);
        return tramitacaoAtual && tramitacaoAtual.grau.sigla === query.grau;
      });
    }

    // Paginação com cursor
    const limit = query.limit || 20;
    let startIndex = 0;

    if (query.cursor) {
      // Cursor é o número do processo do último item da página anterior
      const cursorIndex = processos.findIndex((p) => p.numeroProcesso === query.cursor);
      if (cursorIndex !== -1) {
        startIndex = cursorIndex + 1;
      }
    }

    const paginatedProcessos = processos.slice(startIndex, startIndex + limit);
    const nextCursor = paginatedProcessos.length === limit && startIndex + limit < processos.length
      ? paginatedProcessos[paginatedProcessos.length - 1].numeroProcesso
      : null;

    const items = paginatedProcessos
      .map((p) => this.mapToSummary(p))
      .filter((item): item is ProcessoSummaryDto => item !== null);

    return {
      items,
      nextCursor,
    };
  }

  getProcessoDetail(numeroProcesso: string): ProcessoDetailDto {
    const processo = this.repository.findByNumeroProcesso(numeroProcesso);

    if (!processo) {
      throw new NotFoundException({
        code: 'PROCESSO_NOT_FOUND',
        message: `Processo ${numeroProcesso} não encontrado`,
      });
    }

    const detail = this.mapToDetail(processo);

    if (!detail) {
      throw new NotFoundException({
        code: 'PROCESSO_INVALID',
        message: `Processo ${numeroProcesso} não possui tramitações válidas`,
      });
    }

    return detail;
  }
}
