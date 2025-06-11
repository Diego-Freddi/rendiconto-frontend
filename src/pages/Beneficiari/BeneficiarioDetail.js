import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBeneficiario } from '../../contexts/BeneficiarioContext';
import { toast } from 'react-toastify';

const BeneficiarioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { fetchBeneficiario, fetchRendicontiBeneficiario, loading } = useBeneficiario();
  const [beneficiario, setBeneficiario] = useState(null);
  const [rendiconti, setRendiconti] = useState([]);

  useEffect(() => {
    const loadBeneficiario = async () => {
      if (id) {
        try {
          const data = await fetchBeneficiario(id);
          if (data) {
            setBeneficiario(data);
            // Carica anche i rendiconti del beneficiario
            try {
              const rendicontiResult = await fetchRendicontiBeneficiario(id);
              if (rendicontiResult && rendicontiResult.success) {
                setRendiconti(rendicontiResult.rendiconti || []);
              } else {
                setRendiconti([]);
              }
            } catch (error) {
              console.error('Errore nel caricamento rendiconti:', error);
              setRendiconti([]);
            }
          } else {
            toast.error('Beneficiario non trovato');
            navigate('/beneficiari');
          }
        } catch (error) {
          console.error('Errore caricamento beneficiario:', error);
          toast.error('Errore durante il caricamento del beneficiario');
          navigate('/beneficiari');
        }
      }
    };

    loadBeneficiario();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // Scroll automatico alla sezione rendiconti se presente nell'hash
  useEffect(() => {
    if (window.location.hash === '#rendiconti') {
      setTimeout(() => {
        const element = document.getElementById('rendiconti-section');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 500); // Aspetta che la pagina sia caricata
    }
  }, [beneficiario]);

  // Funzioni di utilità per formattazione
  const formatCurrency = (amount) => {
    if (!amount && amount !== 0) return '€ 0,00';
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('it-IT');
  };

  const formatAddress = (indirizzo) => {
    if (!indirizzo) return '';
    const parts = [];
    if (indirizzo.via) parts.push(indirizzo.via);
    if (indirizzo.cap && indirizzo.citta) {
      parts.push(`${indirizzo.cap} ${indirizzo.citta}`);
    } else if (indirizzo.citta) {
      parts.push(indirizzo.citta);
    }
    if (indirizzo.provincia) parts.push(`(${indirizzo.provincia})`);
    return parts.join(', ');
  };

  const calculateTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.valore || item.importo || 0), 0);
  };

  const calcolaEta = (dataNascita) => {
    if (!dataNascita) return 'N/A';
    const oggi = new Date();
    const nascita = new Date(dataNascita);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const mese = oggi.getMonth() - nascita.getMonth();
    if (mese < 0 || (mese === 0 && oggi.getDate() < nascita.getDate())) {
      eta--;
    }
    return eta;
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  if (!beneficiario) {
    return (
      <div>
        <div className="alert alert-warning">
          <h4>Beneficiario non trovato</h4>
          <p>Il beneficiario richiesto non esiste o non hai i permessi per visualizzarlo.</p>
          <Link to="/beneficiari" className="btn btn-primary">
            Torna alla lista
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header con azioni */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div className="flex-grow-1">
              <h2 className="mb-1">Dettagli Beneficiario</h2>
              <p className="text-muted mb-0">
                <span className="d-block d-sm-inline">
                  {beneficiario.nome} {beneficiario.cognome}
                </span>
                <span className="d-none d-sm-inline"> - </span>
                <span className="d-block d-sm-inline">
                  {calcolaEta(beneficiario.dataNascita)} anni
                </span>
              </p>
            </div>
            
            {/* Azioni Desktop */}
            <div className="d-none d-md-flex btn-group">
              <Link 
                to="/beneficiari" 
                className="btn btn-outline-secondary"
              >
                <i className="bi bi-arrow-left me-2"></i>
                Indietro
              </Link>
              <Link 
                to={`/beneficiari/${id}/modifica`} 
                className="btn btn-primary"
              >
                <i className="bi bi-pencil me-2"></i>
                Modifica
              </Link>
            </div>

            {/* Azioni Mobile */}
            <div className="d-md-none w-100">
              <div className="row g-2">
                <div className="col-6">
                  <Link 
                    to="/beneficiari" 
                    className="btn btn-outline-secondary w-100"
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Indietro
                  </Link>
                </div>
                <div className="col-6">
                  <Link 
                    to={`/beneficiari/${id}/modifica`} 
                    className="btn btn-primary w-100"
                  >
                    <i className="bi bi-pencil me-1"></i>
                    Modifica
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documento stile dettaglio */}
      <div className="row justify-content-center">
        <div className="col-12">
          
          {/* SEZIONE 1: DATI ANAGRAFICI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              
              {/* INTESTAZIONE */}
              <div className="text-center mb-4">
                <div className="avatar-lg bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px', fontSize: '1.5rem' }}>
                  {beneficiario.nome.charAt(0)}{beneficiario.cognome.charAt(0)}
                </div>
                <h1 className="h3 h-md-2 fw-bold text-primary mb-2">
                  {beneficiario.nome} {beneficiario.cognome}
                </h1>
                <div className="d-flex flex-column flex-sm-row justify-content-center gap-2 gap-sm-3">
                  <span className={`badge fs-6 ${beneficiario.isActive ? 'bg-success' : 'bg-danger'}`}>
                    <i className={`bi ${beneficiario.isActive ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                    {beneficiario.isActive ? 'ATTIVO' : 'INATTIVO'}
                  </span>
                  <span className="badge bg-info fs-6">
                    <i className="bi bi-calendar me-1"></i>
                    {calcolaEta(beneficiario.dataNascita)} anni
                  </span>
                </div>
              </div>

              {/* DATI ANAGRAFICI */}
              <div className="mb-4">
                <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-primary">
                  <i className="bi bi-person-badge me-2"></i>
                  Dati Anagrafici
                </h3>
                
                <div className="row">
                  <div className="col-12 col-lg-6 mb-3">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-person me-2"></i>
                          Informazioni Personali
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-borderless table-sm mb-0">
                            <tbody>
                              <tr>
                                <td className="fw-medium text-muted">Nome:</td>
                                <td>{beneficiario.nome}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Cognome:</td>
                                <td>{beneficiario.cognome}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Codice Fiscale:</td>
                                <td>
                                  <code className="small">{beneficiario.codiceFiscale}</code>
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Data di nascita:</td>
                                <td>{formatDate(beneficiario.dataNascita)}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Luogo di nascita:</td>
                                <td>{beneficiario.luogoNascita || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Età:</td>
                                <td>
                                  <span className="badge bg-info">{calcolaEta(beneficiario.dataNascita)} anni</span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="col-12 col-lg-6 mb-3">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-geo-alt me-2"></i>
                          Indirizzo di Residenza
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-borderless table-sm mb-0">
                            <tbody>
                              <tr>
                                <td className="fw-medium text-muted">Via:</td>
                                <td>{beneficiario.indirizzo?.via || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Città:</td>
                                <td>{beneficiario.indirizzo?.citta || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">CAP:</td>
                                <td>{beneficiario.indirizzo?.cap || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Provincia:</td>
                                <td>{beneficiario.indirizzo?.provincia || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Indirizzo completo:</td>
                                <td className="small">{formatAddress(beneficiario.indirizzo) || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Stato:</td>
                                <td>
                                  <span className={`badge ${beneficiario.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                    {beneficiario.isActive ? 'Attivo' : 'Inattivo'}
                                  </span>
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* NOTE */}
              {beneficiario.note && (
                <div className="mb-4">
                  <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-primary">
                    <i className="bi bi-sticky me-2"></i>
                    Note
                  </h3>
                  <div className="card">
                    <div className="card-body">
                      <p className="mb-0" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {beneficiario.note}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEZIONE 2: RENDICONTI ASSOCIATI */}
          <div className="card shadow-sm mb-4" id="rendiconti-section">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center mb-3 gap-2">
                <h3 className="h5 h-md-4 text-primary mb-0">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Rendiconti Associati
                  {rendiconti.length > 0 && (
                    <span className="badge bg-primary ms-2">{rendiconti.length}</span>
                  )}
                </h3>
                <Link 
                  to={`/rendiconti/nuovo?beneficiario=${id}`}
                  className="btn btn-success btn-sm"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  <span className="d-none d-sm-inline">Nuovo Rendiconto</span>
                  <span className="d-sm-none">Nuovo</span>
                </Link>
              </div>

              {rendiconti.length > 0 ? (
                <>
                  {/* Vista Desktop */}
                  <div className="d-none d-md-block">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-primary">
                          <tr>
                            <th>Anno</th>
                            <th>Periodo</th>
                            <th>Stato</th>
                            <th className="text-end">Entrate</th>
                            <th className="text-end">Uscite</th>
                            <th className="text-end">Saldo</th>
                            <th>Ultima modifica</th>
                            <th className="text-center">Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rendiconti.map((rendiconto) => {
                            const saldo = (rendiconto.totaleEntrate || 0) - (rendiconto.totaleUscite || 0);
                            return (
                              <tr key={rendiconto._id}>
                                <td>
                                  <strong>{rendiconto.datiGenerali?.anno}</strong>
                                </td>
                                <td className="small">
                                  {rendiconto.periodoFormattato || 
                                    (rendiconto.datiGenerali?.dataInizio && rendiconto.datiGenerali?.dataFine ? 
                                      `${formatDate(rendiconto.datiGenerali.dataInizio)} - ${formatDate(rendiconto.datiGenerali.dataFine)}` : 
                                      'N/A'
                                    )
                                  }
                                </td>
                                <td>
                                  <span className={`badge ${
                                    rendiconto.stato === 'bozza' ? 'bg-warning text-dark' :
                                    rendiconto.stato === 'completato' ? 'bg-success' :
                                    rendiconto.stato === 'inviato' ? 'bg-info' : 'bg-secondary'
                                  }`}>
                                    {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                                  </span>
                                </td>
                                <td className="text-end text-success fw-bold">
                                  {formatCurrency(rendiconto.totaleEntrate)}
                                </td>
                                <td className="text-end text-danger fw-bold">
                                  {formatCurrency(rendiconto.totaleUscite)}
                                </td>
                                <td className={`text-end fw-bold ${saldo >= 0 ? 'text-success' : 'text-danger'}`}>
                                  {formatCurrency(saldo)}
                                </td>
                                <td className="small">
                                  {formatDate(rendiconto.updatedAt)}
                                </td>
                                <td className="text-center">
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
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Vista Mobile */}
                  <div className="d-md-none">
                    <div className="row">
                      {rendiconti.map((rendiconto) => {
                        const saldo = (rendiconto.totaleEntrate || 0) - (rendiconto.totaleUscite || 0);
                        return (
                          <div key={rendiconto._id} className="col-12 mb-3">
                            <div className="card">
                              <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                  <div>
                                    <h6 className="card-title mb-1">Anno {rendiconto.datiGenerali?.anno}</h6>
                                    <small className="text-muted">
                                      {rendiconto.periodoFormattato || 
                                        (rendiconto.datiGenerali?.dataInizio && rendiconto.datiGenerali?.dataFine ? 
                                          `${formatDate(rendiconto.datiGenerali.dataInizio)} - ${formatDate(rendiconto.datiGenerali.dataFine)}` : 
                                          'N/A'
                                        )
                                      }
                                    </small>
                                  </div>
                                  <span className={`badge ${
                                    rendiconto.stato === 'bozza' ? 'bg-warning text-dark' :
                                    rendiconto.stato === 'completato' ? 'bg-success' :
                                    rendiconto.stato === 'inviato' ? 'bg-info' : 'bg-secondary'
                                  }`}>
                                    {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                                  </span>
                                </div>
                                
                                <div className="row text-sm mb-2">
                                  <div className="col-4">
                                    <small className="text-muted d-block">Entrate</small>
                                    <span className="text-success fw-bold small">
                                      {formatCurrency(rendiconto.totaleEntrate)}
                                    </span>
                                  </div>
                                  <div className="col-4">
                                    <small className="text-muted d-block">Uscite</small>
                                    <span className="text-danger fw-bold small">
                                      {formatCurrency(rendiconto.totaleUscite)}
                                    </span>
                                  </div>
                                  <div className="col-4">
                                    <small className="text-muted d-block">Saldo</small>
                                    <span className={`fw-bold small ${saldo >= 0 ? 'text-success' : 'text-danger'}`}>
                                      {formatCurrency(saldo)}
                                    </span>
                                  </div>
                                </div>
                                
                                <small className="text-muted d-block mb-2">
                                  Aggiornato il {formatDate(rendiconto.updatedAt)}
                                </small>
                                
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
                        );
                      })}
                    </div>
                  </div>

                  {/* Statistiche Rendiconti */}
                  <div className="row mt-4">
                    <div className="col-12">
                      <div className="card bg-light">
                        <div className="card-body">
                          <h6 className="card-title">
                            <i className="bi bi-graph-up me-2"></i>
                            Statistiche Rendiconti
                          </h6>
                          <div className="row text-center">
                            <div className="col-6 col-md-3">
                              <div className="border-end border-md-0">
                                <div className="h5 mb-0 text-primary">{rendiconti.length}</div>
                                <small className="text-muted">Totale</small>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="border-end border-md-0">
                                <div className="h5 mb-0 text-warning">
                                  {rendiconti.filter(r => r.stato === 'bozza').length}
                                </div>
                                <small className="text-muted">Bozze</small>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="border-end border-md-0">
                                <div className="h5 mb-0 text-success">
                                  {rendiconti.filter(r => r.stato === 'completato').length}
                                </div>
                                <small className="text-muted">Completati</small>
                              </div>
                            </div>
                            <div className="col-6 col-md-3">
                              <div className="h5 mb-0 text-info">
                                {rendiconti.filter(r => r.stato === 'inviato').length}
                              </div>
                              <small className="text-muted">Inviati</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-muted">Nessun rendiconto trovato</h5>
                  <p className="text-muted">
                    Non ci sono ancora rendiconti associati a questo beneficiario.
                  </p>
                  <Link 
                    to={`/rendiconti/nuovo?beneficiario=${id}`}
                    className="btn btn-primary"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Crea Primo Rendiconto
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* SEZIONE 3: INFORMAZIONI SISTEMA */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-primary">
                <i className="bi bi-info-circle me-2"></i>
                Informazioni Sistema
              </h3>
              
              <div className="row">
                <div className="col-12 col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-calendar-plus me-2"></i>
                        Data Creazione
                      </h6>
                      <p className="mb-0">{formatDate(beneficiario.createdAt)}</p>
                    </div>
                  </div>
                </div>
                
                <div className="col-12 col-md-6 mb-3">
                  <div className="card">
                    <div className="card-body">
                      <h6 className="card-title">
                        <i className="bi bi-calendar-check me-2"></i>
                        Ultima Modifica
                      </h6>
                      <p className="mb-0">{formatDate(beneficiario.updatedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BeneficiarioDetail; 