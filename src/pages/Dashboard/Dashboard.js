import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useRendiconto } from '../../contexts/RendicontoContext';
import { useResponsive } from '../../hooks/useResponsive';

const Dashboard = () => {
  const { user } = useAuth();
  const { rendiconti, fetchRendiconti, loading } = useRendiconto();
  const { isMobile } = useResponsive();
  const [stats, setStats] = useState({
    totaleRendiconti: 0,
    bozze: 0,
    completati: 0,
    inviati: 0
  });

  useEffect(() => {
    // Carica i rendiconti al mount
    fetchRendiconti();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchRendiconti non incluso nelle dipendenze per evitare loop infiniti

  useEffect(() => {
    // Calcola le statistiche quando cambiano i rendiconti
    if (rendiconti.length > 0) {
      const newStats = {
        totaleRendiconti: rendiconti.length,
        bozze: rendiconti.filter(r => r.stato === 'bozza').length,
        completati: rendiconti.filter(r => r.stato === 'completato').length,
        inviati: rendiconti.filter(r => r.stato === 'inviato').length
      };
      setStats(newStats);
    }
  }, [rendiconti]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Buongiorno';
    if (hour < 18) return 'Buon pomeriggio';
    return 'Buonasera';
  };

  const recentRendiconti = rendiconti.slice(0, 5);

  return (
    <div>
      {/* PATTERN D: Header responsive */}
      <div className={`d-flex ${isMobile ? 'flex-column gap-3' : 'justify-content-between align-items-center'} mb-4`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h1 className="h3 mb-1">
            {getGreeting()}, {user?.nome}!
          </h1>
          <p className="text-muted mb-0">
            Ecco un riepilogo dei tuoi rendiconti
          </p>
        </div>
        <Link 
          to="/rendiconti/nuovo" 
          className={`btn btn-primary ${isMobile ? 'mobile-full-width' : ''}`}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nuovo Rendiconto
        </Link>
      </div>

      {/* PATTERN A: Statistiche responsive - 2 colonne mobile, 4 desktop */}
      <div className="row mb-4">
        <div className="col-6 col-md-3 mb-3">
          <div className="card bg-primary text-white">
            <div className={`card-body ${isMobile ? 'mobile-p-2' : ''}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className={`mb-0 ${isMobile ? 'h5' : ''}`}>{stats.totaleRendiconti}</h4>
                  <p className={`mb-0 ${isMobile ? 'small' : ''}`}>Totale Rendiconti</p>
                </div>
                <i className="bi bi-file-earmark-text" style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 mb-3">
          <div className="card bg-warning text-white">
            <div className={`card-body ${isMobile ? 'mobile-p-2' : ''}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className={`mb-0 ${isMobile ? 'h5' : ''}`}>{stats.bozze}</h4>
                  <p className={`mb-0 ${isMobile ? 'small' : ''}`}>Bozze</p>
                </div>
                <i className="bi bi-pencil-square" style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 mb-3">
          <div className="card bg-success text-white">
            <div className={`card-body ${isMobile ? 'mobile-p-2' : ''}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className={`mb-0 ${isMobile ? 'h5' : ''}`}>{stats.completati}</h4>
                  <p className={`mb-0 ${isMobile ? 'small' : ''}`}>Completati</p>
                </div>
                <i className="bi bi-check-circle" style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}></i>
              </div>
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3 mb-3">
          <div className="card bg-info text-white">
            <div className={`card-body ${isMobile ? 'mobile-p-2' : ''}`}>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h4 className={`mb-0 ${isMobile ? 'h5' : ''}`}>{stats.inviati}</h4>
                  <p className={`mb-0 ${isMobile ? 'small' : ''}`}>Inviati</p>
                </div>
                <i className="bi bi-send" style={{ fontSize: isMobile ? '1.5rem' : '2rem' }}></i>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* PATTERN B: Tabella responsive */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Rendiconti Recenti</h5>
              <Link to="/rendiconti" className="btn btn-outline-primary btn-sm">
                Vedi tutti
              </Link>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                  </div>
                </div>
              ) : recentRendiconti.length > 0 ? (
                <>
                  {/* Desktop: Tabella completa */}
                  {!isMobile && (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Beneficiario</th>
                            <th>Anno</th>
                            <th>Stato</th>
                            <th>Ultima modifica</th>
                            <th>Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {recentRendiconti.map((rendiconto) => (
                            <tr key={rendiconto._id}>
                              <td>
                                <strong>{rendiconto.beneficiarioId?.nome} {rendiconto.beneficiarioId?.cognome}</strong>
                              </td>
                              <td>{rendiconto.datiGenerali?.anno}</td>
                              <td>
                                <span className={`badge ${
                                  rendiconto.stato === 'bozza' ? 'bg-warning' :
                                  rendiconto.stato === 'completato' ? 'bg-success' :
                                  rendiconto.stato === 'inviato' ? 'bg-info' : 'bg-secondary'
                                }`}>
                                  {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                                </span>
                              </td>
                              <td>
                                {new Date(rendiconto.updatedAt).toLocaleDateString('it-IT')}
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <Link
                                    to={`/rendiconti/${rendiconto._id}`}
                                    className="btn btn-outline-primary"
                                    title="Visualizza"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </Link>
                                  {rendiconto.stato !== 'inviato' && (
                                    <Link
                                      to={`/rendiconti/${rendiconto._id}/modifica`}
                                      className="btn btn-outline-secondary"
                                      title="Modifica"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </Link>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Mobile: Card stack */}
                  {isMobile && (
                    <div className="row">
                      {recentRendiconti.map((rendiconto) => (
                        <div key={rendiconto._id} className="col-12 mb-3">
                          <div className="card mobile-card-compact">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="card-title mb-1">
                                    {rendiconto.beneficiarioId?.nome} {rendiconto.beneficiarioId?.cognome}
                                  </h6>
                                  <small className="text-muted">Anno {rendiconto.datiGenerali?.anno}</small>
                                </div>
                                <span className={`badge ${
                                  rendiconto.stato === 'bozza' ? 'bg-warning' :
                                  rendiconto.stato === 'completato' ? 'bg-success' :
                                  rendiconto.stato === 'inviato' ? 'bg-info' : 'bg-secondary'
                                }`}>
                                  {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                                </span>
                              </div>
                              <p className="card-text small text-muted mb-2">
                                Ultima modifica: {new Date(rendiconto.updatedAt).toLocaleDateString('it-IT')}
                              </p>
                              <div className="d-flex gap-2">
                                <Link
                                  to={`/rendiconti/${rendiconto._id}`}
                                  className="btn btn-outline-primary btn-sm flex-fill"
                                >
                                  <i className="bi bi-eye me-1"></i>
                                  Visualizza
                                </Link>
                                {rendiconto.stato !== 'inviato' && (
                                  <Link
                                    to={`/rendiconti/${rendiconto._id}/modifica`}
                                    className="btn btn-outline-secondary btn-sm flex-fill"
                                  >
                                    <i className="bi bi-pencil me-1"></i>
                                    Modifica
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-muted">Nessun rendiconto trovato</h5>
                  <p className="text-muted">Inizia creando il tuo primo rendiconto</p>
                  <Link to="/rendiconti/nuovo" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crea Rendiconto
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 