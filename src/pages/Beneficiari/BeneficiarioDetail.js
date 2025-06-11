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
      <div className="container-fluid">
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
    <div className="container-fluid">
      {/* Header con azioni */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Dettagli Beneficiario</h2>
              <p className="text-muted mb-0">
                {beneficiario.nome} {beneficiario.cognome} - {calcolaEta(beneficiario.dataNascita)} anni
              </p>
            </div>
            <div className="btn-group">
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
          </div>
        </div>
      </div>

      {/* Documento stile dettaglio */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          
          {/* SEZIONE 1: DATI ANAGRAFICI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa' }}>
              
              {/* INTESTAZIONE */}
              <div className="text-center mb-4">
                <div className="avatar-lg bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '80px', height: '80px', fontSize: '2rem' }}>
                  {beneficiario.nome.charAt(0)}{beneficiario.cognome.charAt(0)}
                </div>
                <h1 className="display-6 fw-bold text-primary mb-2">
                  {beneficiario.nome} {beneficiario.cognome}
                </h1>
                <div className="d-flex justify-content-center gap-3">
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
                <h3 className="border-bottom pb-2 mb-4 text-primary">
                  <i className="bi bi-person-badge me-2"></i>
                  Dati Anagrafici
                </h3>
                
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-body">
                        <table className="table table-borderless table-sm">
                          <tbody>
                            <tr>
                              <td className="fw-bold" style={{ width: '40%' }}>Nome:</td>
                              <td>{beneficiario.nome}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Cognome:</td>
                              <td>{beneficiario.cognome}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Codice Fiscale:</td>
                              <td><code className="text-dark">{beneficiario.codiceFiscale}</code></td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Data di Nascita:</td>
                              <td>{formatDate(beneficiario.dataNascita)}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Luogo di Nascita:</td>
                              <td>{beneficiario.luogoNascita || 'Non specificato'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Età:</td>
                              <td>{calcolaEta(beneficiario.dataNascita)} anni</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-3">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="card-title mb-0">
                          <i className="bi bi-geo-alt me-2"></i>
                          Indirizzo di Residenza
                        </h6>
                      </div>
                      <div className="card-body">
                        {beneficiario.indirizzo ? (
                          <div>
                            {beneficiario.indirizzo.via && (
                              <div className="mb-2">
                                <strong>Via:</strong> {beneficiario.indirizzo.via}
                              </div>
                            )}
                            <div className="row">
                              {beneficiario.indirizzo.cap && (
                                <div className="col-4">
                                  <strong>CAP:</strong> {beneficiario.indirizzo.cap}
                                </div>
                              )}
                              {beneficiario.indirizzo.citta && (
                                <div className="col-8">
                                  <strong>Città:</strong> {beneficiario.indirizzo.citta}
                                </div>
                              )}
                            </div>
                            {beneficiario.indirizzo.provincia && (
                              <div className="mt-2">
                                <strong>Provincia:</strong> {beneficiario.indirizzo.provincia}
                              </div>
                            )}
                          </div>
                        ) : (
                          <p className="text-muted fst-italic">Indirizzo non specificato</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Note */}
                {beneficiario.note && (
                  <div className="card mt-3">
                    <div className="card-header bg-light">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-sticky me-2"></i>
                        Note
                      </h6>
                    </div>
                    <div className="card-body">
                      <div style={{ whiteSpace: 'pre-wrap' }}>
                        {beneficiario.note}
                      </div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          </div>

          {/* SEZIONE 2: CONDIZIONI PERSONALI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-heart-pulse me-2"></i>
                Condizioni Personali
              </h3>
              <div className="card">
                <div className="card-body">
                  {beneficiario.condizioniPersonali ? (
                    <div className="text-justify" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                      {beneficiario.condizioniPersonali}
                    </div>
                  ) : (
                    <p className="text-muted fst-italic">Nessuna informazione inserita</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* SEZIONE 3: SITUAZIONE PATRIMONIALE */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-bank me-2"></i>
                Situazione Patrimoniale
              </h3>

              {/* Riepilogo Totali */}
              <div className="row mb-4">
                <div className="col-12">
                  <div className="card bg-light">
                    <div className="card-body">
                      <div className="row text-center">
                        <div className="col-md-3">
                          <div className="border-end">
                            <h4 className="text-primary mb-1">
                              {formatCurrency(calculateTotal(beneficiario.situazionePatrimoniale?.beniImmobili))}
                            </h4>
                            <small className="text-muted">Beni Immobili</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="border-end">
                            <h4 className="text-success mb-1">
                              {formatCurrency(calculateTotal(beneficiario.situazionePatrimoniale?.beniMobili))}
                            </h4>
                            <small className="text-muted">Beni Mobili</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <div className="border-end">
                            <h4 className="text-info mb-1">
                              {formatCurrency(calculateTotal(beneficiario.situazionePatrimoniale?.titoliConti))}
                            </h4>
                            <small className="text-muted">Titoli e Conti</small>
                          </div>
                        </div>
                        <div className="col-md-3">
                          <h4 className="text-warning mb-1">
                            {formatCurrency(
                              calculateTotal(beneficiario.situazionePatrimoniale?.beniImmobili) +
                              calculateTotal(beneficiario.situazionePatrimoniale?.beniMobili) +
                              calculateTotal(beneficiario.situazionePatrimoniale?.titoliConti)
                            )}
                          </h4>
                          <small className="text-muted">Totale Patrimonio</small>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Dettaglio Beni */}
              <div className="row">
                {/* Beni Immobili */}
                <div className="col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-primary text-white">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-house me-2"></i>
                        Beni Immobili
                      </h6>
                    </div>
                    <div className="card-body">
                      {beneficiario.situazionePatrimoniale?.beniImmobili?.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {beneficiario.situazionePatrimoniale.beniImmobili.map((bene, index) => (
                            <div key={index} className="list-group-item px-0">
                              <div className="d-flex justify-content-between">
                                <div className="flex-grow-1">
                                  <div className="fw-medium">{bene.descrizione}</div>
                                </div>
                                <div className="text-end">
                                  <div className="fw-bold text-primary">
                                    {formatCurrency(bene.valore)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted fst-italic">Nessun bene immobile</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Beni Mobili */}
                <div className="col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-success text-white">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-car-front me-2"></i>
                        Beni Mobili
                      </h6>
                    </div>
                    <div className="card-body">
                      {beneficiario.situazionePatrimoniale?.beniMobili?.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {beneficiario.situazionePatrimoniale.beniMobili.map((bene, index) => (
                            <div key={index} className="list-group-item px-0">
                              <div className="d-flex justify-content-between">
                                <div className="flex-grow-1">
                                  <div className="fw-medium">{bene.descrizione}</div>
                                </div>
                                <div className="text-end">
                                  <div className="fw-bold text-success">
                                    {formatCurrency(bene.valore)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted fst-italic">Nessun bene mobile</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Titoli e Conti */}
                <div className="col-md-4 mb-4">
                  <div className="card h-100">
                    <div className="card-header bg-info text-white">
                      <h6 className="card-title mb-0">
                        <i className="bi bi-bank me-2"></i>
                        Titoli e Conti
                      </h6>
                    </div>
                    <div className="card-body">
                      {beneficiario.situazionePatrimoniale?.titoliConti?.length > 0 ? (
                        <div className="list-group list-group-flush">
                          {beneficiario.situazionePatrimoniale.titoliConti.map((bene, index) => (
                            <div key={index} className="list-group-item px-0">
                              <div className="d-flex justify-content-between">
                                <div className="flex-grow-1">
                                  <div className="fw-medium">{bene.descrizione}</div>
                                </div>
                                <div className="text-end">
                                  <div className="fw-bold text-info">
                                    {formatCurrency(bene.valore)}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-muted fst-italic">Nessun titolo o conto</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* SEZIONE 4: RENDICONTI ASSOCIATI */}
          <div id="rendiconti-section" className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa' }}>
              <div className="d-flex justify-content-between align-items-center mb-4">
                <h3 className="text-primary mb-0">
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Rendiconti Associati
                </h3>
                <Link 
                  to={`/rendiconti/nuovo?beneficiario=${id}`} 
                  className="btn btn-primary btn-sm"
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Nuovo Rendiconto
                </Link>
              </div>

              {rendiconti.length > 0 ? (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead className="table-light">
                      <tr>
                        <th>Periodo</th>
                        <th>Anno</th>
                        <th>Stato</th>
                        <th>Totale Entrate</th>
                        <th>Totale Uscite</th>
                        <th>Saldo</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rendiconti.map((rendiconto) => {
                        const totaleEntrate = calculateTotal(rendiconto.contoEconomico?.entrate);
                        const totaleUscite = calculateTotal(rendiconto.contoEconomico?.uscite);
                        const saldo = totaleEntrate - totaleUscite;
                        
                        return (
                          <tr key={rendiconto._id}>
                            <td>
                              {rendiconto.periodoFormattato || 
                                (rendiconto.datiGenerali?.dataInizio && rendiconto.datiGenerali?.dataFine ? 
                                  `${formatDate(rendiconto.datiGenerali.dataInizio)} - ${formatDate(rendiconto.datiGenerali.dataFine)}` : 
                                  'N/A'
                                )
                              }
                            </td>
                            <td>{rendiconto.datiGenerali?.anno || rendiconto.anno}</td>
                            <td>
                              <span className={`badge ${
                                rendiconto.stato === 'completato' ? 'bg-success' :
                                rendiconto.stato === 'inviato' ? 'bg-primary' :
                                'bg-warning text-dark'
                              }`}>
                                {rendiconto.stato}
                              </span>
                            </td>
                            <td className="text-success fw-bold">
                              {formatCurrency(totaleEntrate)}
                            </td>
                            <td className="text-danger fw-bold">
                              {formatCurrency(totaleUscite)}
                            </td>
                            <td className={`fw-bold ${saldo >= 0 ? 'text-success' : 'text-danger'}`}>
                              {formatCurrency(saldo)}
                            </td>
                            <td>
                              <Link
                                to={`/rendiconti/${rendiconto._id}`}
                                className="btn btn-sm btn-outline-primary"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Visualizza
                              </Link>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-file-earmark-text display-1 text-muted"></i>
                  <h5 className="mt-3 text-muted">Nessun rendiconto trovato</h5>
                  <p className="text-muted">
                    Non ci sono ancora rendiconti associati a questo beneficiario.
                  </p>
                  <Link 
                    to={`/rendiconti/nuovo?beneficiario=${id}`} 
                    className="btn btn-primary"
                  >
                    <i className="bi bi-plus-circle me-2"></i>
                    Crea il primo rendiconto
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER CON INFO */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className="row align-items-center">
                <div className="col">
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Beneficiario creato il {formatDate(beneficiario.createdAt)} - 
                    Ultima modifica: {formatDate(beneficiario.updatedAt)}
                  </small>
                </div>
                                 <div className="col-auto">
                   <Link 
                     to={`/beneficiari/${id}/modifica`} 
                     className="btn btn-outline-primary btn-sm"
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
    </div>
  );
};

export default BeneficiarioDetail; 