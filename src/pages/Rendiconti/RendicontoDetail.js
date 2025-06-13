import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRendiconto } from '../../contexts/RendicontoContext';
import { useAuth } from '../../contexts/AuthContext';
import { useResponsive } from '../../hooks/useResponsive';
import { toast } from 'react-toastify';
import { pdf } from '@react-pdf/renderer';
import RendicontoPDF from '../../components/PDF/RendicontoPDF';
import { raggruppaPerCategoria } from '../../utils/categoriaUtils';

const RendicontoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isMobile } = useResponsive();
  const { fetchRendiconto, loading } = useRendiconto();
  const [rendiconto, setRendiconto] = useState(null);

  useEffect(() => {
    const loadRendiconto = async () => {
      if (id) {
        try {
          const data = await fetchRendiconto(id);
          if (data) {
            setRendiconto(data);
          } else {
            toast.error('Rendiconto non trovato');
            navigate('/rendiconti');
          }
        } catch (error) {
          console.error('Errore caricamento rendiconto:', error);
          toast.error('Errore durante il caricamento del rendiconto');
          navigate('/rendiconti');
        }
      }
    };

    loadRendiconto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // Solo 'id' come dipendenza per evitare loop infiniti

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

  // Funzione per generare e scaricare il PDF
  const handleDownloadPDF = async () => {
    try {
      toast.info('Generazione PDF in corso...');
      
      // Genera il PDF
      const blob = await pdf(<RendicontoPDF rendiconto={rendiconto} amministratore={user} />).toBlob();
      
      // Crea il nome del file
      const fileName = `Rendiconto_${rendiconto.beneficiarioId?.cognome || 'Sconosciuto'}_${datiGenerali?.anno || 'XXXX'}.pdf`;
      
      // Crea il link per il download
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('PDF generato e scaricato con successo!');
    } catch (error) {
      console.error('Errore generazione PDF:', error);
      toast.error('Errore durante la generazione del PDF');
    }
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

  if (!rendiconto) {
    return (
      <div className="container-fluid">
        <div className="alert alert-warning">
          <h4>Rendiconto non trovato</h4>
          <p>Il rendiconto richiesto non esiste o non hai i permessi per visualizzarlo.</p>
          <Link to="/rendiconti" className="btn btn-primary">
            Torna alla lista
          </Link>
        </div>
      </div>
    );
  }

  const { datiGenerali, contoEconomico, firma } = rendiconto;

  // Raggruppa le voci per categoria
  const entrateRaggruppate = raggruppaPerCategoria(contoEconomico?.entrate || []);
  const usciteRaggruppate = raggruppaPerCategoria(contoEconomico?.uscite || []);

  return (
    <div>
      {/* PATTERN D: Header responsive */}
      <div className={`d-flex ${isMobile ? 'flex-column gap-3' : 'justify-content-between align-items-center'} mb-4`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className="mb-1">Dettagli Rendiconto</h2>
          <p className="text-muted mb-0">
            {rendiconto.beneficiarioId?.nome} {rendiconto.beneficiarioId?.cognome} - 
            {rendiconto.periodoFormattato || 
              (datiGenerali?.dataInizio && datiGenerali?.dataFine ? 
                `${formatDate(datiGenerali.dataInizio)} - ${formatDate(datiGenerali.dataFine)}` : 
                `Anno ${datiGenerali?.anno || 'N/A'}`
              )
            }
          </p>
        </div>
        
        {/* PATTERN C: Azioni responsive */}
        <div className={`${isMobile ? 'd-grid gap-2' : 'btn-group'}`}>
          <Link 
            to="/rendiconti" 
            className="btn btn-outline-secondary"
          >
            <i className="bi bi-arrow-left me-2"></i>
            Indietro
          </Link>
          {rendiconto.stato !== 'inviato' && (
            <Link 
              to={`/rendiconti/${id}/modifica`} 
              className="btn btn-primary"
            >
              <i className="bi bi-pencil me-2"></i>
              Modifica
            </Link>
          )}
          <button 
            className="btn btn-success"
            onClick={handleDownloadPDF}
          >
            <i className="bi bi-file-pdf me-2"></i>
            Esporta PDF
          </button>
        </div>
      </div>

      {/* Documento responsive */}
      <div className="row justify-content-center">
        <div className={`${isMobile ? 'col-12' : 'col-12 col-lg-10 col-xl-8'}`}>
          
          {/* PAGINA 1: DATI GENERALI */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa', minHeight: isMobile ? 'auto' : '800px' }}>
              
              {/* INTESTAZIONE RESPONSIVE */}
              <div className="text-center mb-4">
                <h1 className={`${isMobile ? 'h3' : 'display-6'} fw-bold text-primary mb-3`}>
                  MODELLO DI RENDICONTO
                </h1>
                <div className="border-top border-bottom py-3">
                  <h4 className={`${isMobile ? 'h5' : 'h4'} mb-1`}>
                    Amministrazione di sostegno/tutela: R.G. n. {datiGenerali?.rg_numero || '_______________'}
                  </h4>
                  <p className={`text-muted mb-0 ${isMobile ? 'small' : ''}`}>
                    Periodo: {rendiconto.periodoFormattato || 
                      (datiGenerali?.dataInizio && datiGenerali?.dataFine ? 
                        `${formatDate(datiGenerali.dataInizio)} - ${formatDate(datiGenerali.dataFine)}` : 
                        `Anno ${datiGenerali?.anno || '____'}`
                      )
                    }
                  </p>
                </div>
              </div>

              {/* DATI GENERALI - Layout responsive */}
              <div className="row mb-4">
                <div className="col-12">
                  <h5 className="text-primary border-bottom pb-2 mb-3">
                    <i className="bi bi-person-badge me-2"></i>
                    Dati Generali
                  </h5>
                </div>
              </div>

              <div className="row g-3 mb-4">
                <div className={`${isMobile ? 'col-12' : 'col-md-6'}`}>
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-person me-2"></i>
                        Beneficiario
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-2">
                        <strong>Nome:</strong> {rendiconto.beneficiarioId?.nome || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Cognome:</strong> {rendiconto.beneficiarioId?.cognome || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Codice Fiscale:</strong> 
                        <code className="ms-2">{rendiconto.beneficiarioId?.codiceFiscale || 'N/A'}</code>
                      </p>
                      <p className="mb-2">
                        <strong>Data di nascita:</strong> {formatDate(rendiconto.beneficiarioId?.dataNascita)}
                      </p>
                      <p className="mb-0">
                        <strong>Luogo di nascita:</strong> {rendiconto.beneficiarioId?.luogoNascita || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className={`${isMobile ? 'col-12' : 'col-md-6'}`}>
                  <div className="card h-100">
                    <div className="card-header bg-light">
                      <h6 className="mb-0">
                        <i className="bi bi-shield-check me-2"></i>
                        Amministratore
                      </h6>
                    </div>
                    <div className="card-body">
                      <p className="mb-2">
                        <strong>Nome:</strong> {user?.nome || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Cognome:</strong> {user?.cognome || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Email:</strong> {user?.email || 'N/A'}
                      </p>
                      <p className="mb-2">
                        <strong>Telefono:</strong> {user?.telefono || 'N/A'}
                      </p>
                      <p className="mb-0">
                        <strong>Indirizzo:</strong> {formatAddress(user?.indirizzo) || 'N/A'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONDIZIONI PERSONALI */}
              <div className="row mb-4">
                <div className="col-12">
                  <h5 className="text-primary border-bottom pb-2 mb-3">
                    <i className="bi bi-heart me-2"></i>
                    Condizioni Personali del Beneficiario
                  </h5>
                  <div className="card">
                    <div className="card-body">
                      {rendiconto.beneficiarioId?.condizioniPersonali ? (
                        <div 
                          className="text-justify" 
                          style={{ 
                            whiteSpace: 'pre-wrap', 
                            lineHeight: '1.6',
                            fontSize: isMobile ? '0.9rem' : '1rem'
                          }}
                        >
                          {rendiconto.beneficiarioId.condizioniPersonali}
                        </div>
                      ) : (
                        <p className="text-muted fst-italic">Nessuna informazione inserita</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* PAGINA 2: BENI IMMOBILI */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-house me-2"></i>
                3. SITUAZIONE PATRIMONIALE - BENI IMMOBILI
              </h3>
              
              {rendiconto.beneficiarioId?.situazionePatrimoniale?.beniImmobili?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {rendiconto.beneficiarioId.situazionePatrimoniale.beniImmobili.map((bene, index) => (
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
                <div className="text-center text-muted fst-italic py-5">
                  Nessun bene immobile inserito
                </div>
              )}
              
              <div className="border-top pt-3 mt-3">
                <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'} align-items-center`}>
                  <h5 className="mb-0 text-primary">TOTALE BENI IMMOBILI</h5>
                  <h4 className="mb-0 fw-bold text-primary">
                    {formatCurrency(calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.beniImmobili))}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* PAGINA 3: BENI MOBILI */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-car-front me-2"></i>
                3. SITUAZIONE PATRIMONIALE - BENI MOBILI
              </h3>
              
              {rendiconto.beneficiarioId?.situazionePatrimoniale?.beniMobili?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {rendiconto.beneficiarioId.situazionePatrimoniale.beniMobili.map((bene, index) => (
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
                <div className="text-center text-muted fst-italic py-5">
                  Nessun bene mobile inserito
                </div>
              )}
              
              <div className="border-top pt-3 mt-3">
                <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'} align-items-center`}>
                  <h5 className="mb-0 text-success">TOTALE BENI MOBILI</h5>
                  <h4 className="mb-0 fw-bold text-success">
                    {formatCurrency(calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.beniMobili))}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* PAGINA 4: TITOLI, FONDI E CONTI */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-bank me-2"></i>
                3. SITUAZIONE PATRIMONIALE - TITOLI, FONDI E CONTI CORRENTI
              </h3>
              
              {rendiconto.beneficiarioId?.situazionePatrimoniale?.titoliConti?.length > 0 ? (
                <div className="list-group list-group-flush">
                  {rendiconto.beneficiarioId.situazionePatrimoniale.titoliConti.map((bene, index) => (
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
                <div className="text-center text-muted fst-italic py-5">
                  Nessun titolo o conto inserito
                </div>
              )}
              
              <div className="border-top pt-3 mt-3">
                <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'} align-items-center`}>
                  <h5 className="mb-0 text-info">TOTALE TITOLI E CONTI</h5>
                  <h4 className="mb-0 fw-bold text-info">
                    {formatCurrency(calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.titoliConti))}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* PAGINA 5: ENTRATE */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-plus-circle me-2"></i>
                4. CONTO ECONOMICO - ENTRATE
              </h3>
              
              {entrateRaggruppate.length > 0 ? (
                <div className="list-group list-group-flush">
                  {entrateRaggruppate.map((entrata, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div className={`d-flex ${isMobile ? 'flex-column gap-2' : 'justify-content-between align-items-start'}`}>
                        <div className="flex-grow-1">
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <span className="badge bg-success bg-opacity-25 text-success">
                              {entrata.categoria}
                            </span>
                            {entrata.numeroVoci > 1 && (
                              <small className="text-muted">
                                ({entrata.numeroVoci} voci)
                              </small>
                            )}
                          </div>
                          <div className="fw-medium">{entrata.descrizioneCompleta}</div>
                          {entrata.numeroVoci > 1 && (
                            <small className="text-muted">
                              Subtotale di {entrata.numeroVoci} voci
                            </small>
                          )}
                        </div>
                        <div className={`${isMobile ? 'align-self-end' : 'text-end'}`}>
                          <div className="fw-bold text-success fs-5">
                            {formatCurrency(entrata.importo)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted fst-italic py-5">
                  Nessuna entrata inserita
                </div>
              )}
              
              <div className="border-top pt-3 mt-3">
                <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'} align-items-center`}>
                  <h5 className="mb-0 text-success">TOTALE ENTRATE</h5>
                  <h4 className="mb-0 fw-bold text-success">
                    {formatCurrency(calculateTotal(contoEconomico?.entrate))}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* PAGINA 6: USCITE */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-dash-circle me-2"></i>
                4. CONTO ECONOMICO - USCITE
              </h3>
              
              {usciteRaggruppate.length > 0 ? (
                <div className="list-group list-group-flush">
                  {usciteRaggruppate.map((uscita, index) => (
                    <div key={index} className="list-group-item px-0">
                      <div className={`d-flex ${isMobile ? 'flex-column gap-2' : 'justify-content-between align-items-start'}`}>
                        <div className="flex-grow-1">
                          <div className="d-flex flex-wrap align-items-center gap-2 mb-1">
                            <span className="badge bg-danger bg-opacity-25 text-danger">
                              {uscita.categoria}
                            </span>
                            {uscita.numeroVoci > 1 && (
                              <small className="text-muted">
                                ({uscita.numeroVoci} voci)
                              </small>
                            )}
                          </div>
                          <div className="fw-medium">{uscita.descrizioneCompleta}</div>
                          {uscita.numeroVoci > 1 && (
                            <small className="text-muted">
                              Subtotale di {uscita.numeroVoci} voci
                            </small>
                          )}
                        </div>
                        <div className={`${isMobile ? 'align-self-end' : 'text-end'}`}>
                          <div className="fw-bold text-danger fs-5">
                            {formatCurrency(uscita.importo)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center text-muted fst-italic py-5">
                  Nessuna uscita inserita
                </div>
              )}
              
              <div className="border-top pt-3 mt-3">
                <div className={`d-flex ${isMobile ? 'flex-column' : 'justify-content-between'} align-items-center`}>
                  <h5 className="mb-0 text-danger">TOTALE USCITE</h5>
                  <h4 className="mb-0 fw-bold text-danger">
                    {formatCurrency(calculateTotal(contoEconomico?.uscite))}
                  </h4>
                </div>
              </div>
            </div>
          </div>

          {/* PAGINA 7: SITUAZIONE COMPLESSIVA E FIRMA */}
          <div className="card shadow-sm mb-4">
            <div className={`card-body ${isMobile ? 'p-3' : 'p-4'}`} style={{ backgroundColor: '#fafafa', minHeight: isMobile ? 'auto' : '800px' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-calculator me-2"></i>
                5. SITUAZIONE COMPLESSIVA
              </h3>

              {/* Riepilogo Totali */}
              <div className="row mb-5">
                <div className="col-12">
                  {/* Desktop: Tabella completa */}
                  {!isMobile && (
                    <div className="table-responsive">
                      <table className="table table-bordered table-lg">
                        <tbody>
                          <tr className="table-info">
                            <td className="fw-bold fs-5">VALORE TOTALE DEL PATRIMONIO</td>
                            <td className="text-end fw-bold fs-5">
                              {formatCurrency(
                                                calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.beniImmobili) +
                  calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.beniMobili) +
                  calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.titoliConti)
                              )}
                            </td>
                          </tr>
                          <tr className="table-success">
                            <td className="fw-bold fs-5">TOTALE ENTRATE</td>
                            <td className="text-end fw-bold fs-5 text-success">
                              {formatCurrency(calculateTotal(contoEconomico?.entrate))}
                            </td>
                          </tr>
                          <tr className="table-danger">
                            <td className="fw-bold fs-5">TOTALE USCITE</td>
                            <td className="text-end fw-bold fs-5 text-danger">
                              {formatCurrency(calculateTotal(contoEconomico?.uscite))}
                            </td>
                          </tr>
                          <tr className={`table-${
                            (calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite)) >= 0 
                              ? 'success' 
                              : 'danger'
                          }`}>
                            <td className="fw-bold fs-4">SALDO (Entrate - Uscite)</td>
                            <td className={`text-end fw-bold fs-4 ${
                              (calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite)) >= 0 
                                ? 'text-success' 
                                : 'text-danger'
                            }`}>
                              {formatCurrency(
                                calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite)
                              )}
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Mobile: Card stack */}
                  {isMobile && (
                    <div className="d-grid gap-3">
                      <div className="card border-info">
                        <div className="card-body bg-info bg-opacity-10">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="card-title mb-0 fw-bold">VALORE TOTALE DEL PATRIMONIO</h6>
                            <span className="fw-bold fs-5">
                              {formatCurrency(
                                                calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.beniImmobili) +
                  calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.beniMobili) +
                  calculateTotal(rendiconto.beneficiarioId?.situazionePatrimoniale?.titoliConti)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card border-success">
                        <div className="card-body bg-success bg-opacity-10">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="card-title mb-0 fw-bold">TOTALE ENTRATE</h6>
                            <span className="fw-bold fs-5 text-success">
                              {formatCurrency(calculateTotal(contoEconomico?.entrate))}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className="card border-danger">
                        <div className="card-body bg-danger bg-opacity-10">
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="card-title mb-0 fw-bold">TOTALE USCITE</h6>
                            <span className="fw-bold fs-5 text-danger">
                              {formatCurrency(calculateTotal(contoEconomico?.uscite))}
                            </span>
                          </div>
                        </div>
                      </div>
                      
                      <div className={`card border-${
                        (calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite)) >= 0 
                          ? 'success' 
                          : 'danger'
                      }`}>
                        <div className={`card-body bg-${
                          (calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite)) >= 0 
                            ? 'success' 
                            : 'danger'
                        } bg-opacity-10`}>
                          <div className="d-flex justify-content-between align-items-center">
                            <h5 className="card-title mb-0 fw-bold">SALDO (Entrate - Uscite)</h5>
                            <span className={`fw-bold fs-4 ${
                              (calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite)) >= 0 
                                ? 'text-success' 
                                : 'text-danger'
                            }`}>
                              {formatCurrency(
                                calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite)
                              )}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* SEZIONE FIRMA */}
              <div className="mt-5">
                <h4 className="border-bottom pb-2 mb-4 text-primary">
                  <i className="bi bi-pen me-2"></i>
                  FIRMA
                </h4>
                
                <div className="card">
                  <div className="card-body">
                    {/* Luogo e Data */}
                    <div className="row mb-5">
                      <div className={`${isMobile ? 'col-12 mb-3' : 'col-md-6'}`}>
                        <label className={`form-label fw-bold ${isMobile ? 'fs-6' : 'fs-5'}`}>Luogo:</label>
                        <p className={`border-bottom pb-2 ${isMobile ? 'fs-6' : 'fs-5'}`} style={{ minHeight: isMobile ? '30px' : '40px' }}>
                          {firma?.luogo || '_'.repeat(30)}
                        </p>
                      </div>
                      <div className={`${isMobile ? 'col-12' : 'col-md-6'}`}>
                        <label className={`form-label fw-bold ${isMobile ? 'fs-6' : 'fs-5'}`}>Data:</label>
                        <p className={`border-bottom pb-2 ${isMobile ? 'fs-6' : 'fs-5'}`} style={{ minHeight: isMobile ? '30px' : '40px' }}>
                          {formatDate(firma?.data) || '_'.repeat(20)}
                        </p>
                      </div>
                    </div>

                    {/* Note aggiuntive */}
                    {firma?.noteAggiuntive && (
                      <div className="mb-5">
                        <label className={`form-label fw-bold ${isMobile ? 'fs-6' : 'fs-5'}`}>Note aggiuntive:</label>
                        <div className="border rounded p-3 bg-light" style={{ minHeight: '100px' }}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {firma.noteAggiuntive}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Firma Digitale */}
                    <div className="mt-5">
                      <label className={`form-label fw-bold ${isMobile ? 'fs-6' : 'fs-5'} mb-3`}>Firma dell'Amministratore:</label>
                      
                      {firma?.firmaDigitale ? (
                        // Firma digitale presente - visualizzazione read-only
                        <div className="border rounded p-3 bg-light">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <h6 className="mb-0">
                              <i className="bi bi-check-circle-fill text-success me-2"></i>
                              Firma Applicata
                            </h6>
                          </div>
                          
                          <div className="text-center mb-3">
                            <img
                              src={firma.firmaDigitale.immagine}
                              alt="Firma applicata"
                              className="img-fluid"
                              style={{ maxHeight: isMobile ? '60px' : '80px', maxWidth: '200px' }}
                            />
                          </div>
                        </div>
                      ) : (
                        // Nessuna firma digitale presente
                        <div className="border-bottom pb-3 mb-3" style={{ minHeight: isMobile ? '80px' : '100px' }}>
                          <div className={`text-center text-muted fst-italic pt-4 ${isMobile ? 'small' : ''}`}>
                            {firma?.firmaAmministratore ? 'Firma confermata (non digitale)' : 'Firma non presente'}
                          </div>
                        </div>
                      )}
                      
                      <div className={`text-end mt-3 ${isMobile ? 'fs-6' : 'fs-5'} fw-bold`}>
                        {user?.nome} {user?.cognome}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER CON INFO STATO - Responsive */}
              <div className="border-top pt-3 mt-4">
                <div className={`${isMobile ? 'text-center' : 'row align-items-center'}`}>
                  <div className={isMobile ? 'mb-2' : 'col'}>
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Documento creato il {formatDate(rendiconto.createdAt)}
                      {!isMobile && ` - Ultima modifica: ${formatDate(rendiconto.updatedAt)}`}
                    </small>
                    {isMobile && (
                      <small className="text-muted d-block">
                        Ultima modifica: {formatDate(rendiconto.updatedAt)}
                      </small>
                    )}
                  </div>
                  <div className={isMobile ? '' : 'col-auto'}>
                    <span className={`badge fs-6 ${
                      rendiconto.stato === 'completato' ? 'bg-success' :
                      rendiconto.stato === 'inviato' ? 'bg-primary' :
                      'bg-warning text-dark'
                    }`}>
                      <i className={`bi ${
                        rendiconto.stato === 'completato' ? 'bi-check-circle' :
                        rendiconto.stato === 'inviato' ? 'bi-send' :
                        'bi-pencil'
                      } me-1`}></i>
                      {rendiconto.stato.toUpperCase()}
                    </span>
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

export default RendicontoDetail;