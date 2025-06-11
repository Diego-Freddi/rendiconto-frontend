import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRendiconto } from '../../contexts/RendicontoContext';
import { useAuth } from '../../contexts/AuthContext';
import { toast } from 'react-toastify';
import { pdf } from '@react-pdf/renderer';
import RendicontoPDF from '../../components/PDF/RendicontoPDF';
import { raggruppaPerCategoria } from '../../utils/categoriaUtils';

const RendicontoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
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
      <div>
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

  const { datiGenerali, condizioniPersonali, situazionePatrimoniale, contoEconomico, firma } = rendiconto;

  // Raggruppa le voci per categoria
  const entrateRaggruppate = raggruppaPerCategoria(contoEconomico?.entrate || []);
  const usciteRaggruppate = raggruppaPerCategoria(contoEconomico?.uscite || []);

  return (
    <div>
      {/* Header con azioni */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div className="flex-grow-1">
              <h2 className="mb-1">Dettagli Rendiconto</h2>
              <p className="text-muted mb-0">
                <span className="d-block d-sm-inline">
                  {rendiconto.beneficiarioId?.nome} {rendiconto.beneficiarioId?.cognome}
                </span>
                <span className="d-none d-sm-inline"> - </span>
                <span className="d-block d-sm-inline">
                  {rendiconto.periodoFormattato || 
                    (datiGenerali?.dataInizio && datiGenerali?.dataFine ? 
                      `${formatDate(datiGenerali.dataInizio)} - ${formatDate(datiGenerali.dataFine)}` : 
                      `Anno ${datiGenerali?.anno || 'N/A'}`
                    )
                  }
                </span>
              </p>
            </div>
            
            {/* Azioni Desktop */}
            <div className="d-none d-md-flex btn-group">
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

            {/* Azioni Mobile */}
            <div className="d-md-none w-100">
              <div className="row g-2">
                <div className="col-6">
                  <Link 
                    to="/rendiconti" 
                    className="btn btn-outline-secondary w-100"
                  >
                    <i className="bi bi-arrow-left me-1"></i>
                    Indietro
                  </Link>
                </div>
                <div className="col-6">
                  <button 
                    className="btn btn-success w-100"
                    onClick={handleDownloadPDF}
                  >
                    <i className="bi bi-file-pdf me-1"></i>
                    PDF
                  </button>
                </div>
                {rendiconto.stato !== 'inviato' && (
                  <div className="col-12">
                    <Link 
                      to={`/rendiconti/${id}/modifica`} 
                      className="btn btn-primary w-100"
                    >
                      <i className="bi bi-pencil me-2"></i>
                      Modifica Rendiconto
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Documento stile PDF */}
      <div className="row justify-content-center">
        <div className="col-12">
          
          {/* PAGINA 1: DATI GENERALI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              
              {/* INTESTAZIONE */}
              <div className="text-center mb-4 mb-md-5">
                <h1 className="h3 h-md-1 fw-bold text-primary mb-3">
                  MODELLO DI RENDICONTO
                </h1>
                <div className="border-top border-bottom py-3">
                  <h4 className="h5 h-md-4 mb-1">
                    Amministrazione di sostegno/tutela: R.G. n. {datiGenerali?.rg_numero || '_______________'}
                  </h4>
                  <p className="text-muted mb-0 small">
                    Periodo: {rendiconto.periodoFormattato || 
                      (datiGenerali?.dataInizio && datiGenerali?.dataFine ? 
                        `${formatDate(datiGenerali.dataInizio)} - ${formatDate(datiGenerali.dataFine)}` : 
                        `Anno ${datiGenerali?.anno || '____'}`
                      )
                    }
                  </p>
                </div>
              </div>

              {/* DATI GENERALI */}
              <div className="mb-4">
                <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-primary">
                  <i className="bi bi-info-circle me-2"></i>
                  Dati Generali
                </h3>
                
                <div className="row">
                  {/* Beneficiario */}
                  <div className="col-12 col-lg-6 mb-3">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-person me-2"></i>
                          Beneficiario
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-borderless table-sm mb-0">
                            <tbody>
                              <tr>
                                <td className="fw-medium text-muted">Nome:</td>
                                <td>{rendiconto.beneficiarioId?.nome || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Cognome:</td>
                                <td>{rendiconto.beneficiarioId?.cognome || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Codice Fiscale:</td>
                                <td>
                                  <code className="small">{rendiconto.beneficiarioId?.codiceFiscale || 'N/A'}</code>
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Data di nascita:</td>
                                <td>{formatDate(rendiconto.beneficiarioId?.dataNascita)}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Luogo di nascita:</td>
                                <td>{rendiconto.beneficiarioId?.luogoNascita || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Indirizzo:</td>
                                <td className="small">{formatAddress(rendiconto.beneficiarioId?.indirizzo)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Amministratore */}
                  <div className="col-12 col-lg-6 mb-3">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h6 className="mb-0">
                          <i className="bi bi-person-badge me-2"></i>
                          Amministratore
                        </h6>
                      </div>
                      <div className="card-body">
                        <div className="table-responsive">
                          <table className="table table-borderless table-sm mb-0">
                            <tbody>
                              <tr>
                                <td className="fw-medium text-muted">Nome:</td>
                                <td>{user?.nome || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Cognome:</td>
                                <td>{user?.cognome || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Codice Fiscale:</td>
                                <td>
                                  <code className="small">{user?.codiceFiscale || 'N/A'}</code>
                                </td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Data di nascita:</td>
                                <td>{formatDate(user?.dataNascita)}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Luogo di nascita:</td>
                                <td>{user?.luogoNascita || 'N/A'}</td>
                              </tr>
                              <tr>
                                <td className="fw-medium text-muted">Indirizzo:</td>
                                <td className="small">{formatAddress(user?.indirizzo)}</td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* CONDIZIONI PERSONALI */}
              <div className="mb-4">
                <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-primary">
                  <i className="bi bi-heart me-2"></i>
                  Condizioni Personali del Beneficiario
                </h3>
                <div className="card">
                  <div className="card-body">
                    {condizioniPersonali?.descrizione ? (
                      <div className="text-justify" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {condizioniPersonali.descrizione}
                      </div>
                    ) : (
                      <p className="text-muted fst-italic">Nessuna descrizione inserita</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* PAGINA 2: BENI IMMOBILI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-primary">
                <i className="bi bi-house me-2"></i>
                Situazione Patrimoniale - Beni Immobili
              </h3>
              
              {situazionePatrimoniale?.beniImmobili?.length > 0 ? (
                <>
                  {/* Vista Desktop */}
                  <div className="d-none d-md-block">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Descrizione</th>
                            <th>Ubicazione</th>
                            <th className="text-end">Valore</th>
                          </tr>
                        </thead>
                        <tbody>
                          {situazionePatrimoniale.beniImmobili.map((bene, index) => (
                            <tr key={index}>
                              <td>{bene.descrizione}</td>
                              <td className="small">{bene.ubicazione}</td>
                              <td className="text-end fw-bold">{formatCurrency(bene.valore)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <th colSpan="2" className="text-end">TOTALE BENI IMMOBILI:</th>
                            <th className="text-end text-primary">
                              {formatCurrency(calculateTotal(situazionePatrimoniale.beniImmobili))}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Vista Mobile */}
                  <div className="d-md-none">
                    <div className="row">
                      {situazionePatrimoniale.beniImmobili.map((bene, index) => (
                        <div key={index} className="col-12 mb-3">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">{bene.descrizione}</h6>
                              <p className="card-text small text-muted mb-2">{bene.ubicazione}</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Valore:</span>
                                <span className="fw-bold text-primary">{formatCurrency(bene.valore)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>TOTALE BENI IMMOBILI:</strong>
                          <strong className="text-primary">
                            {formatCurrency(calculateTotal(situazionePatrimoniale.beniImmobili))}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-house text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">Nessun bene immobile registrato</p>
                </div>
              )}
            </div>
          </div>

          {/* PAGINA 3: BENI MOBILI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-primary">
                <i className="bi bi-car-front me-2"></i>
                Situazione Patrimoniale - Beni Mobili
              </h3>
              
              {situazionePatrimoniale?.beniMobili?.length > 0 ? (
                <>
                  {/* Vista Desktop */}
                  <div className="d-none d-md-block">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Descrizione</th>
                            <th className="text-end">Valore</th>
                          </tr>
                        </thead>
                        <tbody>
                          {situazionePatrimoniale.beniMobili.map((bene, index) => (
                            <tr key={index}>
                              <td>{bene.descrizione}</td>
                              <td className="text-end fw-bold">{formatCurrency(bene.valore)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <th className="text-end">TOTALE BENI MOBILI:</th>
                            <th className="text-end text-primary">
                              {formatCurrency(calculateTotal(situazionePatrimoniale.beniMobili))}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Vista Mobile */}
                  <div className="d-md-none">
                    <div className="row">
                      {situazionePatrimoniale.beniMobili.map((bene, index) => (
                        <div key={index} className="col-12 mb-3">
                          <div className="card">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="card-title mb-0">{bene.descrizione}</h6>
                                <span className="fw-bold text-primary">{formatCurrency(bene.valore)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>TOTALE BENI MOBILI:</strong>
                          <strong className="text-primary">
                            {formatCurrency(calculateTotal(situazionePatrimoniale.beniMobili))}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-car-front text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">Nessun bene mobile registrato</p>
                </div>
              )}
            </div>
          </div>

          {/* PAGINA 4: TITOLI E CONTI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-primary">
                <i className="bi bi-bank me-2"></i>
                Situazione Patrimoniale - Titoli, Fondi e Conti Correnti
              </h3>
              
              {situazionePatrimoniale?.titoliConti?.length > 0 ? (
                <>
                  {/* Vista Desktop */}
                  <div className="d-none d-md-block">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-dark">
                          <tr>
                            <th>Descrizione</th>
                            <th>Istituto</th>
                            <th className="text-end">Valore</th>
                          </tr>
                        </thead>
                        <tbody>
                          {situazionePatrimoniale.titoliConti.map((titolo, index) => (
                            <tr key={index}>
                              <td>{titolo.descrizione}</td>
                              <td>{titolo.istituto || 'N/A'}</td>
                              <td className="text-end fw-bold">{formatCurrency(titolo.valore)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <th colSpan="2" className="text-end">TOTALE TITOLI E CONTI:</th>
                            <th className="text-end text-primary">
                              {formatCurrency(calculateTotal(situazionePatrimoniale.titoliConti))}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Vista Mobile */}
                  <div className="d-md-none">
                    <div className="row">
                      {situazionePatrimoniale.titoliConti.map((titolo, index) => (
                        <div key={index} className="col-12 mb-3">
                          <div className="card">
                            <div className="card-body">
                              <h6 className="card-title">{titolo.descrizione}</h6>
                              <p className="card-text small text-muted mb-2">{titolo.istituto || 'N/A'}</p>
                              <div className="d-flex justify-content-between align-items-center">
                                <span className="text-muted">Valore:</span>
                                <span className="fw-bold text-primary">{formatCurrency(titolo.valore)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card bg-light">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>TOTALE TITOLI E CONTI:</strong>
                          <strong className="text-primary">
                            {formatCurrency(calculateTotal(situazionePatrimoniale.titoliConti))}
                          </strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-bank text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">Nessun titolo o conto registrato</p>
                </div>
              )}
            </div>
          </div>

          {/* PAGINA 5: ENTRATE */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-success">
                <i className="bi bi-arrow-down-circle me-2"></i>
                Conto Economico - Entrate
              </h3>
              
              {contoEconomico?.entrate?.length > 0 ? (
                <>
                  {/* Vista Desktop */}
                  <div className="d-none d-md-block">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-success">
                          <tr>
                            <th>Descrizione</th>
                            <th className="text-end">Importo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contoEconomico.entrate.map((entrata, index) => (
                            <tr key={index}>
                              <td>{entrata.descrizione}</td>
                              <td className="text-end fw-bold text-success">{formatCurrency(entrata.importo)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <th className="text-end">TOTALE ENTRATE:</th>
                            <th className="text-end text-success">
                              {formatCurrency(calculateTotal(contoEconomico.entrate))}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Vista Mobile */}
                  <div className="d-md-none">
                    <div className="row">
                      {contoEconomico.entrate.map((entrata, index) => (
                        <div key={index} className="col-12 mb-3">
                          <div className="card border-success">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-center">
                                <h6 className="card-title mb-0">{entrata.descrizione}</h6>
                                <span className="fw-bold text-success">{formatCurrency(entrata.importo)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card bg-success text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>TOTALE ENTRATE:</strong>
                          <strong>{formatCurrency(calculateTotal(contoEconomico.entrate))}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-arrow-down-circle text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">Nessuna entrata registrata</p>
                </div>
              )}
            </div>
          </div>

          {/* PAGINA 6: USCITE */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="h5 h-md-4 border-bottom pb-2 mb-3 text-danger">
                <i className="bi bi-arrow-up-circle me-2"></i>
                Conto Economico - Uscite
              </h3>
              
              {contoEconomico?.uscite?.length > 0 ? (
                <>
                  {/* Vista Desktop */}
                  <div className="d-none d-md-block">
                    <div className="table-responsive">
                      <table className="table table-striped table-hover">
                        <thead className="table-danger">
                          <tr>
                            <th>Categoria</th>
                            <th>Descrizione</th>
                            <th className="text-end">Importo</th>
                          </tr>
                        </thead>
                        <tbody>
                          {contoEconomico.uscite.map((uscita, index) => (
                            <tr key={index}>
                              <td>
                                <span className="badge bg-secondary">{uscita.categoria}</span>
                              </td>
                              <td>{uscita.descrizione}</td>
                              <td className="text-end fw-bold text-danger">{formatCurrency(uscita.importo)}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <th colSpan="2" className="text-end">TOTALE USCITE:</th>
                            <th className="text-end text-danger">
                              {formatCurrency(calculateTotal(contoEconomico.uscite))}
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                  {/* Vista Mobile */}
                  <div className="d-md-none">
                    <div className="row">
                      {contoEconomico.uscite.map((uscita, index) => (
                        <div key={index} className="col-12 mb-3">
                          <div className="card border-danger">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <h6 className="card-title mb-0">{uscita.descrizione}</h6>
                                <span className="fw-bold text-danger">{formatCurrency(uscita.importo)}</span>
                              </div>
                              <span className="badge bg-secondary">{uscita.categoria}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="card bg-danger text-white">
                      <div className="card-body">
                        <div className="d-flex justify-content-between align-items-center">
                          <strong>TOTALE USCITE:</strong>
                          <strong>{formatCurrency(calculateTotal(contoEconomico.uscite))}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4">
                  <i className="bi bi-arrow-up-circle text-muted" style={{ fontSize: '3rem' }}></i>
                  <p className="text-muted mt-2">Nessuna uscita registrata</p>
                </div>
              )}
            </div>
          </div>

          {/* PAGINA 7: SITUAZIONE COMPLESSIVA E FIRMA */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-3 p-md-4" style={{ backgroundColor: '#fafafa' }}>
              <h3 className="h5 h-md-4 border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-calculator me-2"></i>
                Situazione Economica Complessiva
              </h3>
              
              {/* Riepilogo Totali */}
              <div className="row mb-4">
                <div className="col-12 col-md-6 col-lg-3 mb-3">
                  <div className="card bg-info text-white h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-house-fill mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6 className="card-title">Totale Patrimonio</h6>
                      <h4 className="mb-0">
                        {formatCurrency(
                          calculateTotal(situazionePatrimoniale?.beniImmobili) +
                          calculateTotal(situazionePatrimoniale?.beniMobili) +
                          calculateTotal(situazionePatrimoniale?.titoliConti)
                        )}
                      </h4>
                    </div>
                  </div>
                </div>
                
                <div className="col-12 col-md-6 col-lg-3 mb-3">
                  <div className="card bg-success text-white h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-arrow-down-circle-fill mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6 className="card-title">Totale Entrate</h6>
                      <h4 className="mb-0">{formatCurrency(calculateTotal(contoEconomico?.entrate))}</h4>
                    </div>
                  </div>
                </div>
                
                <div className="col-12 col-md-6 col-lg-3 mb-3">
                  <div className="card bg-danger text-white h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-arrow-up-circle-fill mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6 className="card-title">Totale Uscite</h6>
                      <h4 className="mb-0">{formatCurrency(calculateTotal(contoEconomico?.uscite))}</h4>
                    </div>
                  </div>
                </div>
                
                <div className="col-12 col-md-6 col-lg-3 mb-3">
                  <div className={`card text-white h-100 ${
                    (calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite)) >= 0 
                      ? 'bg-primary' 
                      : 'bg-warning'
                  }`}>
                    <div className="card-body text-center">
                      <i className="bi bi-calculator-fill mb-2" style={{ fontSize: '2rem' }}></i>
                      <h6 className="card-title">Saldo</h6>
                      <h4 className="mb-0">
                        {formatCurrency(calculateTotal(contoEconomico?.entrate) - calculateTotal(contoEconomico?.uscite))}
                      </h4>
                    </div>
                  </div>
                </div>
              </div>

              {/* Sezione Firma */}
              <div className="border-top pt-4">
                <h4 className="h6 h-md-5 mb-3 text-primary">
                  <i className="bi bi-pen me-2"></i>
                  Firma e Dichiarazioni
                </h4>
                
                <div className="row">
                  <div className="col-12 col-md-6 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">Luogo e Data</h6>
                        <p className="mb-0">
                          {firma?.luogo || '_________________'}, {formatDate(firma?.data) || '_______________'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-12 col-md-6 mb-3">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">Stato Rendiconto</h6>
                        <span className={`badge fs-6 ${
                          rendiconto.stato === 'bozza' ? 'bg-warning text-dark' :
                          rendiconto.stato === 'completato' ? 'bg-success' :
                          rendiconto.stato === 'inviato' ? 'bg-info' : 'bg-secondary'
                        }`}>
                          {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Firma digitale */}
                {user?.firmaDigitale && (
                  <div className="text-center mt-4">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">Firma Digitale</h6>
                        <img 
                          src={user.firmaDigitale} 
                          alt="Firma digitale" 
                          className="img-fluid"
                          style={{ 
                            maxHeight: '100px', 
                            maxWidth: '300px',
                            backgroundColor: 'white',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '5px'
                          }}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Note aggiuntive */}
                {firma?.note && (
                  <div className="mt-4">
                    <div className="card">
                      <div className="card-body">
                        <h6 className="card-title">Note Aggiuntive</h6>
                        <p className="mb-0" style={{ whiteSpace: 'pre-wrap' }}>
                          {firma.note}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RendicontoDetail;