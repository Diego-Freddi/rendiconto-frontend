import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useBeneficiario } from '../../contexts/BeneficiarioContext';
import { useResponsive } from '../../hooks/useResponsive';
import { toast } from 'react-toastify';

const BeneficiarioDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
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
      {/* PATTERN D: Header responsive */}
      <div className={`d-flex ${isMobile ? 'flex-column gap-3' : 'justify-content-between align-items-center'} mb-4`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className="mb-1">Dettagli Beneficiario</h2>
          <p className="text-muted mb-0">
            {beneficiario.nome} {beneficiario.cognome} - {calcolaEta(beneficiario.dataNascita)} anni
          </p>
        </div>
        
        {/* PATTERN C: Azioni responsive */}
        <div className={`${isMobile ? 'd-grid gap-2' : 'btn-group'}`}>
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

      {/* Documento responsive */}
      <div className="row justify-content-center">
        <div className={`${isMobile ? 'col-12' : 'col-12 col-lg-10 col-xl-8'}`}>
          
          {/* SEZIONE 1: DATI ANAGRAFICI */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              
              {/* INTESTAZIONE RESPONSIVE */}
              <div className="text-center mb-4">
                <div 
                  className="avatar-lg bg-primary text-white rounded-circle d-inline-flex align-items-center justify-content-center mb-3"
                  style={{ 
                    width: isMobile ? '60px' : '80px', 
                    height: isMobile ? '60px' : '80px', 
                    fontSize: isMobile ? '1.5rem' : '2rem' 
                  }}
                >
                  {beneficiario.nome.charAt(0)}{beneficiario.cognome.charAt(0)}
                </div>
                <h1 className={`${isMobile ? 'h3' : 'display-6'} fw-bold text-primary mb-2`}>
                  {beneficiario.nome} {beneficiario.cognome}
                </h1>
                <div className={`d-flex ${isMobile ? 'flex-column gap-2' : 'justify-content-center gap-3'}`}>
                  <span className={`badge ${isMobile ? 'fs-6' : 'fs-6'} ${beneficiario.isActive ? 'bg-success' : 'bg-danger'}`}>
                    <i className={`bi ${beneficiario.isActive ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                    {beneficiario.isActive ? 'ATTIVO' : 'INATTIVO'}
                  </span>
                  <span className={`badge bg-info ${isMobile ? 'fs-6' : 'fs-6'}`}>
                    <i className="bi bi-calendar me-1"></i>
                    {calcolaEta(beneficiario.dataNascita)} anni
                  </span>
                </div>
              </div>

              {/* DATI ANAGRAFICI - Layout responsive */}
              <div className="mb-4">
                <h5 className="text-primary border-bottom pb-2 mb-3">
                  <i className="bi bi-person-badge me-2"></i>
                  Dati Anagrafici
                </h5>
                
                <div className="row g-3">
                  <div className={`${isMobile ? 'col-12' : 'col-md-6'}`}>
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-person me-2"></i>
                          Informazioni Personali
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="row g-2">
                          <div className="col-6">
                            <strong>Nome:</strong>
                          </div>
                          <div className="col-6">
                            {beneficiario.nome || 'N/A'}
                          </div>
                          <div className="col-6">
                            <strong>Cognome:</strong>
                          </div>
                          <div className="col-6">
                            {beneficiario.cognome || 'N/A'}
                          </div>
                          <div className="col-6">
                            <strong>Codice Fiscale:</strong>
                          </div>
                          <div className="col-6">
                            <code className="small">{beneficiario.codiceFiscale || 'N/A'}</code>
                          </div>
                          <div className="col-6">
                            <strong>Data di nascita:</strong>
                          </div>
                          <div className="col-6">
                            {formatDate(beneficiario.dataNascita)}
                          </div>
                          <div className="col-6">
                            <strong>Luogo di nascita:</strong>
                          </div>
                          <div className="col-6">
                            {beneficiario.luogoNascita || 'N/A'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className={`${isMobile ? 'col-12' : 'col-md-6'}`}>
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-geo-alt me-2"></i>
                          Indirizzo di Residenza
                        </h6>
                      </div>
                      <div className="card-body">
                        {beneficiario.indirizzo ? (
                          <div className="row g-2">
                            <div className="col-6">
                              <strong>Via:</strong>
                            </div>
                            <div className="col-6">
                              {beneficiario.indirizzo.via || 'N/A'}
                            </div>
                            <div className="col-6">
                              <strong>Città:</strong>
                            </div>
                            <div className="col-6">
                              {beneficiario.indirizzo.citta || 'N/A'}
                            </div>
                            <div className="col-6">
                              <strong>CAP:</strong>
                            </div>
                            <div className="col-6">
                              {beneficiario.indirizzo.cap || 'N/A'}
                            </div>
                            <div className="col-6">
                              <strong>Provincia:</strong>
                            </div>
                            <div className="col-6">
                              {beneficiario.indirizzo.provincia || 'N/A'}
                            </div>
                            <div className="col-12 mt-2">
                              <strong>Indirizzo completo:</strong>
                              <div className="text-muted small">
                                {formatAddress(beneficiario.indirizzo) || 'Indirizzo non completo'}
                              </div>
                            </div>
                          </div>
                        ) : (
                          <p className="text-muted fst-italic">Nessun indirizzo inserito</p>
                        )}
                      </div>
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
                    <div style={{ whiteSpace: 'pre-wrap', fontSize: isMobile ? '0.9rem' : '1rem' }}>
                      {beneficiario.note}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SEZIONE 2: CONDIZIONI PERSONALI */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              <h5 className="text-primary border-bottom pb-2 mb-3">
                <i className="bi bi-heart-pulse me-2"></i>
                Condizioni Personali
              </h5>
              <div className="card">
                <div className="card-body">
                  {beneficiario.condizioniPersonali ? (
                    <div 
                      className="text-justify" 
                      style={{ 
                        whiteSpace: 'pre-wrap', 
                        lineHeight: '1.6',
                        fontSize: isMobile ? '0.9rem' : '1rem'
                      }}
                    >
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
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              <h5 className="text-primary border-bottom pb-2 mb-3">
                <i className="bi bi-bank me-2"></i>
                Situazione Patrimoniale
              </h5>

              {/* Riepilogo Totali - Responsive */}
              <div className="row mb-4">
                <div className="col-12">
                  {!isMobile ? (
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
                  ) : (
                    <div className="d-grid gap-2">
                      <div className="card border-primary">
                        <div className="card-body text-center py-2">
                          <h6 className="text-primary mb-1">Beni Immobili</h6>
                          <h5 className="text-primary mb-0">
                            {formatCurrency(calculateTotal(beneficiario.situazionePatrimoniale?.beniImmobili))}
                          </h5>
                        </div>
                      </div>
                      <div className="card border-success">
                        <div className="card-body text-center py-2">
                          <h6 className="text-success mb-1">Beni Mobili</h6>
                          <h5 className="text-success mb-0">
                            {formatCurrency(calculateTotal(beneficiario.situazionePatrimoniale?.beniMobili))}
                          </h5>
                        </div>
                      </div>
                      <div className="card border-info">
                        <div className="card-body text-center py-2">
                          <h6 className="text-info mb-1">Titoli e Conti</h6>
                          <h5 className="text-info mb-0">
                            {formatCurrency(calculateTotal(beneficiario.situazionePatrimoniale?.titoliConti))}
                          </h5>
                        </div>
                      </div>
                      <div className="card border-warning bg-warning bg-opacity-10">
                        <div className="card-body text-center py-2">
                          <h6 className="text-warning mb-1">TOTALE PATRIMONIO</h6>
                          <h4 className="text-warning mb-0 fw-bold">
                            {formatCurrency(
                              calculateTotal(beneficiario.situazionePatrimoniale?.beniImmobili) +
                              calculateTotal(beneficiario.situazionePatrimoniale?.beniMobili) +
                              calculateTotal(beneficiario.situazionePatrimoniale?.titoliConti)
                            )}
                          </h4>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Dettaglio Beni - Responsive */}
              <div className="row">
                {/* Beni Immobili */}
                <div className={`${isMobile ? 'col-12 mb-3' : 'col-md-4 mb-4'}`}>
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
                              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'}`}>
                                <div className="flex-grow-1">
                                  <div className="fw-medium">{bene.descrizione}</div>
                                </div>
                                <div className={`${isMobile ? 'mt-1' : 'text-end'}`}>
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
                <div className={`${isMobile ? 'col-12 mb-3' : 'col-md-4 mb-4'}`}>
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
                              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'}`}>
                                <div className="flex-grow-1">
                                  <div className="fw-medium">{bene.descrizione}</div>
                                </div>
                                <div className={`${isMobile ? 'mt-1' : 'text-end'}`}>
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
                <div className={`${isMobile ? 'col-12 mb-3' : 'col-md-4 mb-4'}`}>
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
                              <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'}`}>
                                <div className="flex-grow-1">
                                  <div className="fw-medium">{bene.descrizione}</div>
                                </div>
                                <div className={`${isMobile ? 'mt-1' : 'text-end'}`}>
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
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              <div className={`d-flex ${isMobile ? 'flex-column gap-3' : 'justify-content-between align-items-center'} mb-4`}>
                <h5 className={`text-primary mb-0 ${isMobile ? 'text-center' : ''}`}>
                  <i className="bi bi-file-earmark-text me-2"></i>
                  Rendiconti Associati
                </h5>
                <Link 
                  to={`/rendiconti/nuovo?beneficiario=${id}`} 
                  className={`btn btn-primary ${isMobile ? 'mobile-full-width' : 'btn-sm'}`}
                >
                  <i className="bi bi-plus-circle me-2"></i>
                  Nuovo Rendiconto
                </Link>
              </div>

              {rendiconti.length > 0 ? (
                <>
                  {/* Desktop: Tabella completa */}
                  {!isMobile && (
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
                  )}

                  {/* Mobile: Card stack */}
                  {isMobile && (
                    <div>
                      {rendiconti.map((rendiconto) => {
                        const totaleEntrate = calculateTotal(rendiconto.contoEconomico?.entrate);
                        const totaleUscite = calculateTotal(rendiconto.contoEconomico?.uscite);
                        const saldo = totaleEntrate - totaleUscite;
                        
                        return (
                          <div key={rendiconto._id} className="card mb-3 mobile-card-compact">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="card-title mb-1">
                                    Anno {rendiconto.datiGenerali?.anno || rendiconto.anno}
                                  </h6>
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
                                  rendiconto.stato === 'completato' ? 'bg-success' :
                                  rendiconto.stato === 'inviato' ? 'bg-primary' :
                                  'bg-warning text-dark'
                                }`}>
                                  {rendiconto.stato}
                                </span>
                              </div>
                              
                              <div className="row g-2 mb-3">
                                <div className="col-4 text-center">
                                  <small className="text-muted d-block">Entrate</small>
                                  <strong className="text-success">{formatCurrency(totaleEntrate)}</strong>
                                </div>
                                <div className="col-4 text-center">
                                  <small className="text-muted d-block">Uscite</small>
                                  <strong className="text-danger">{formatCurrency(totaleUscite)}</strong>
                                </div>
                                <div className="col-4 text-center">
                                  <small className="text-muted d-block">Saldo</small>
                                  <strong className={saldo >= 0 ? 'text-success' : 'text-danger'}>
                                    {formatCurrency(saldo)}
                                  </strong>
                                </div>
                              </div>

                              <Link
                                to={`/rendiconti/${rendiconto._id}`}
                                className="btn btn-outline-primary btn-sm mobile-full-width"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Visualizza Rendiconto
                              </Link>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
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
                    Crea il primo rendiconto
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* FOOTER CON INFO - Responsive */}
          <div className="card shadow-sm mb-4">
            <div className="card-body">
              <div className={`${isMobile ? 'text-center' : 'row align-items-center'}`}>
                <div className={isMobile ? 'mb-3' : 'col'}>
                  <small className="text-muted">
                    <i className="bi bi-info-circle me-1"></i>
                    Beneficiario creato il {formatDate(beneficiario.createdAt)}
                    {!isMobile && ` - Ultima modifica: ${formatDate(beneficiario.updatedAt)}`}
                  </small>
                  {isMobile && (
                    <small className="text-muted d-block">
                      Ultima modifica: {formatDate(beneficiario.updatedAt)}
                    </small>
                  )}
                </div>
                <div className={isMobile ? '' : 'col-auto'}>
                  <Link 
                    to={`/beneficiari/${id}/modifica`} 
                    className={`btn btn-outline-primary ${isMobile ? 'mobile-full-width' : 'btn-sm'}`}
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