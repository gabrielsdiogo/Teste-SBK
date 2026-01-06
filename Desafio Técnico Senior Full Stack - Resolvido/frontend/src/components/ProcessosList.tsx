import { useState, useEffect, useCallback } from 'react';
import type { ProcessoSummary } from '../types/processo.types';
import { api, ApiError } from '../services/api';
import './ProcessosList.css';

interface ProcessosListProps {
  onSelectProcesso: (numeroProcesso: string) => void;
}

export function ProcessosList({ onSelectProcesso }: ProcessosListProps) {
  const [processos, setProcessos] = useState<ProcessoSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);

  // Filtros
  const [searchQuery, setSearchQuery] = useState('');
  const [tribunalFilter, setTribunalFilter] = useState('');
  const [grauFilter, setGrauFilter] = useState('');

  const loadProcessos = useCallback(async (cursor?: string) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.listProcessos({
        q: searchQuery || undefined,
        tribunal: tribunalFilter || undefined,
        grau: grauFilter || undefined,
        limit: 20,
        cursor,
      });

      if (cursor) {
        setProcessos((prev) => [...prev, ...response.items]);
      } else {
        setProcessos(response.items);
      }

      setNextCursor(response.nextCursor);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar processos');
      }
    } finally {
      setLoading(false);
    }
  }, [searchQuery, tribunalFilter, grauFilter]);

  useEffect(() => {
    loadProcessos();
  }, [loadProcessos]);

  const handleLoadMore = () => {
    if (nextCursor && !loading) {
      loadProcessos(nextCursor);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  return (
    <div className="processos-list-container">
      <h1>Processos Itaú</h1>

      <div className="filters">
        <input
          type="text"
          placeholder="Buscar por número, parte, classe ou assunto..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="filter-row">
          <select
            value={tribunalFilter}
            onChange={(e) => setTribunalFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os tribunais</option>
            <option value="TJMG">TJMG</option>
            <option value="TJSP">TJSP</option>
            <option value="TJRJ">TJRJ</option>
            <option value="TJRS">TJRS</option>
          </select>

          <select
            value={grauFilter}
            onChange={(e) => setGrauFilter(e.target.value)}
            className="filter-select"
          >
            <option value="">Todos os graus</option>
            <option value="G1">1º Grau</option>
            <option value="G2">2º Grau</option>
          </select>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {loading && processos.length === 0 ? (
        <div className="loading">Carregando processos...</div>
      ) : processos.length === 0 && !loading ? (
        <div className="empty-state">
          Nenhum processo encontrado com os filtros aplicados.
        </div>
      ) : (
        <>
          <table className="processos-table">
            <thead>
              <tr>
                <th>Número do Processo</th>
                <th>Tribunal</th>
                <th>Grau</th>
                <th>Classe</th>
                <th>Assunto</th>
                <th>Último Movimento</th>
              </tr>
            </thead>
            <tbody>
              {processos.map((processo) => (
                <tr
                  key={processo.numeroProcesso}
                  onClick={() => onSelectProcesso(processo.numeroProcesso)}
                  className="processo-row"
                >
                  <td className="processo-numero">
                    {processo.numeroProcesso}
                  </td>
                  <td>{processo.siglaTribunal}</td>
                  <td>{processo.grauAtual}</td>
                  <td>{processo.classePrincipal}</td>
                  <td>{processo.assuntoPrincipal}</td>
                  <td>
                    <div className="ultimo-movimento">
                      <div className="movimento-data">
                        {formatDate(processo.ultimoMovimento.dataHora)}
                      </div>
                      <div className="movimento-descricao">
                        {stripHtml(processo.ultimoMovimento.descricao)}
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {nextCursor && (
            <button
              onClick={handleLoadMore}
              disabled={loading}
              className="load-more-button"
            >
              {loading ? 'Carregando...' : 'Carregar mais'}
            </button>
          )}
        </>
      )}
    </div>
  );
}
