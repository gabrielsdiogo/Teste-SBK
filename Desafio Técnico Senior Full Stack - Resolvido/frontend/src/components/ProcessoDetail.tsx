import { useState, useEffect } from 'react';
import type { ProcessoDetail as ProcessoDetailType } from '../types/processo.types';
import { api, ApiError } from '../services/api';
import './ProcessoDetail.css';

interface ProcessoDetailProps {
  numeroProcesso: string;
  onBack: () => void;
}

export function ProcessoDetail({ numeroProcesso, onBack }: ProcessoDetailProps) {
  const [processo, setProcesso] = useState<ProcessoDetailType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProcesso();
  }, [numeroProcesso]);

  const loadProcesso = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await api.getProcessoDetail(numeroProcesso);
      setProcesso(data);
    } catch (err) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erro ao carregar detalhes do processo');
      }
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  if (loading) {
    return (
      <div className="processo-detail-container">
        <button onClick={onBack} className="back-button">
          ← Voltar
        </button>
        <div className="loading">Carregando detalhes do processo...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="processo-detail-container">
        <button onClick={onBack} className="back-button">
          ← Voltar
        </button>
        <div className="error-message">{error}</div>
      </div>
    );
  }

  if (!processo) {
    return null;
  }

  const partesAtivo = processo.partes.filter((p) => p.polo === 'ATIVO');
  const partesPassivo = processo.partes.filter((p) => p.polo === 'PASSIVO');

  return (
    <div className="processo-detail-container">
      <button onClick={onBack} className="back-button">
        ← Voltar
      </button>

      <div className="detail-header">
        <h1>Processo {processo.numeroProcesso}</h1>
        <span className={`status-badge ${processo.tramitacaoAtual === 'Ativo' ? 'active' : 'inactive'}`}>
          {processo.tramitacaoAtual}
        </span>
      </div>

      <div className="detail-section">
        <h2>Informações Gerais</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Tribunal:</strong> {processo.siglaTribunal}
          </div>
          <div className="info-item">
            <strong>Grau:</strong> {processo.grau.nome} ({processo.grau.sigla})
          </div>
          <div className="info-item">
            <strong>Nível de Sigilo:</strong> {processo.nivelSigilo}
          </div>
          <div className="info-item">
            <strong>Órgão Julgador:</strong> {processo.orgaoJulgador}
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h2>Datas Relevantes</h2>
        <div className="info-grid">
          <div className="info-item">
            <strong>Ajuizamento:</strong> {formatDate(processo.datasRelevantes.ajuizamento)}
          </div>
          <div className="info-item">
            <strong>Última Distribuição:</strong> {formatDate(processo.datasRelevantes.ultimaDistribuicao)}
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h2>Classes</h2>
        <ul className="list">
          {processo.classes.map((classe) => (
            <li key={classe.codigo}>
              {classe.descricao} (Código: {classe.codigo})
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-section">
        <h2>Assuntos</h2>
        <ul className="list">
          {processo.assuntos.map((assunto) => (
            <li key={assunto.codigo}>
              <div><strong>{assunto.descricao}</strong></div>
              <div className="hierarquia">{assunto.hierarquia}</div>
            </li>
          ))}
        </ul>
      </div>

      <div className="detail-section highlight">
        <h2>Último Movimento</h2>
        <div className="movimento-detail">
          <div className="movimento-header">
            <strong>Data:</strong> {formatDate(processo.ultimoMovimento.data)}
            {processo.ultimoMovimento.codigo && (
              <span className="movimento-codigo">Código: {processo.ultimoMovimento.codigo}</span>
            )}
          </div>
          <div
            className="movimento-descricao"
            dangerouslySetInnerHTML={{ __html: processo.ultimoMovimento.descricao }}
          />
          <div className="movimento-orgao">
            <strong>Órgão(s) Julgador(es):</strong>
            <ul>
              {processo.ultimoMovimento.orgaoJulgador.map((orgao, idx) => (
                <li key={idx}>{orgao}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <h2>Partes</h2>

        {partesAtivo.length > 0 && (
          <div className="partes-polo">
            <h3>Polo Ativo</h3>
            {partesAtivo.map((parte, idx) => (
              <div key={idx} className="parte-card">
                <div className="parte-header">
                  <strong>{parte.nome}</strong>
                  <span className="tipo-parte">{parte.tipoParte}</span>
                </div>
                {parte.representantes.length > 0 && (
                  <div className="representantes">
                    <strong>Representantes:</strong>
                    <ul>
                      {parte.representantes.map((rep, repIdx) => (
                        <li key={repIdx}>
                          {rep.nome} - {rep.tipoRepresentacao} ({rep.situacao})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {partesPassivo.length > 0 && (
          <div className="partes-polo">
            <h3>Polo Passivo</h3>
            {partesPassivo.map((parte, idx) => (
              <div key={idx} className="parte-card">
                <div className="parte-header">
                  <strong>{parte.nome}</strong>
                  <span className="tipo-parte">{parte.tipoParte}</span>
                </div>
                {parte.representantes.length > 0 && (
                  <div className="representantes">
                    <strong>Representantes:</strong>
                    <ul>
                      {parte.representantes.map((rep, repIdx) => (
                        <li key={repIdx}>
                          {rep.nome} - {rep.tipoRepresentacao} ({rep.situacao})
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
