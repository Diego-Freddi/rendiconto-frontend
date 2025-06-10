import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useRendiconto } from '../../contexts/RendicontoContext';
import { toast } from 'react-toastify';
import { pdf } from '@react-pdf/renderer';
import RendicontoPDF from '../../components/PDF/RendicontoPDF';

const RendicontoDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
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
      const blob = await pdf(<RendicontoPDF rendiconto={rendiconto} />).toBlob();
      
      // Crea il nome del file
      const fileName = `Rendiconto_${datiGenerali?.beneficiario?.cognome || 'Sconosciuto'}_${datiGenerali?.mese || 'XX'}_${datiGenerali?.anno || 'XXXX'}.pdf`;
      
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

  const { datiGenerali, condizioniPersonali, situazionePatrimoniale, contoEconomico, firma } = rendiconto;

  return (
    <div className="container-fluid">
      {/* Header con azioni */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Dettagli Rendiconto</h2>
              <p className="text-muted mb-0">
                {datiGenerali?.beneficiario?.nome} {datiGenerali?.beneficiario?.cognome} - 
                {datiGenerali?.mese} {datiGenerali?.anno}
              </p>
            </div>
            <div className="btn-group">
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
        </div>
      </div>

      {/* Documento stile PDF */}
      <div className="row justify-content-center">
        <div className="col-12 col-lg-10 col-xl-8">
          
          {/* PAGINA 1: DATI GENERALI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa', minHeight: '800px' }}>
              
              {/* INTESTAZIONE */}
              <div className="text-center mb-5">
                <h1 className="display-6 fw-bold text-primary mb-3">
                  MODELLO DI RENDICONTO
                </h1>
                <div className="border-top border-bottom py-3">
                  <h4 className="mb-1">
                    Amministrazione di sostegno/tutela: R.G. n. {datiGenerali?.rg_numero || '_______________'}
                  </h4>
                  <p className="text-muted mb-0">
                    Periodo: {datiGenerali?.mese || '___'} {datiGenerali?.anno || '____'}
                  </p>
                </div>
              </div>

              {/* SEZIONE 1: DATI GENERALI */}
              <div className="mb-5">
                <h3 className="border-bottom pb-2 mb-4 text-primary">
                  <i className="bi bi-person-badge me-2"></i>
                  1. DATI GENERALI
                </h3>
                
                <div className="row">
                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-person me-2"></i>
                          Beneficiario/Interdetto
                        </h5>
                      </div>
                      <div className="card-body">
                        <table className="table table-borderless table-sm">
                          <tbody>
                            <tr>
                              <td className="fw-bold">Nome:</td>
                              <td>{datiGenerali?.beneficiario?.nome || 'Non specificato'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Cognome:</td>
                              <td>{datiGenerali?.beneficiario?.cognome || 'Non specificato'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Codice Fiscale:</td>
                              <td className="font-monospace">{datiGenerali?.beneficiario?.codiceFiscale || 'Non specificato'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Data di Nascita:</td>
                              <td>{formatDate(datiGenerali?.beneficiario?.dataNascita)}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Luogo di Nascita:</td>
                              <td>{datiGenerali?.beneficiario?.luogoNascita || 'Non specificato'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Indirizzo:</td>
                              <td>{formatAddress(datiGenerali?.beneficiario?.indirizzo) || 'Non specificato'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 mb-4">
                    <div className="card h-100">
                      <div className="card-header bg-light">
                        <h5 className="card-title mb-0">
                          <i className="bi bi-person-check me-2"></i>
                          Amministratore di Sostegno
                        </h5>
                      </div>
                      <div className="card-body">
                        <table className="table table-borderless table-sm">
                          <tbody>
                            <tr>
                              <td className="fw-bold">Nome:</td>
                              <td>{datiGenerali?.amministratore?.nome || 'Non specificato'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Cognome:</td>
                              <td>{datiGenerali?.amministratore?.cognome || 'Non specificato'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Codice Fiscale:</td>
                              <td className="font-monospace">{datiGenerali?.amministratore?.codiceFiscale || 'Non specificato'}</td>
                            </tr>
                            <tr>
                              <td className="fw-bold">Indirizzo:</td>
                              <td>{formatAddress(datiGenerali?.amministratore?.indirizzo) || 'Non specificato'}</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* SEZIONE 2: CONDIZIONI PERSONALI */}
              <div className="mb-5">
                <h3 className="border-bottom pb-2 mb-4 text-primary">
                  <i className="bi bi-heart-pulse me-2"></i>
                  2. CONDIZIONI PERSONALI DEL BENEFICIARIO
                </h3>
                <div className="card">
                  <div className="card-body">
                    {condizioniPersonali ? (
                      <div className="text-justify" style={{ whiteSpace: 'pre-wrap', lineHeight: '1.6' }}>
                        {condizioniPersonali}
                      </div>
                    ) : (
                      <p className="text-muted fst-italic">Nessuna informazione inserita</p>
                    )}
                  </div>
                </div>
              </div>

            </div>
          </div>

          {/* PAGINA 2: BENI IMMOBILI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa', minHeight: '800px' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-house me-2"></i>
                3. SITUAZIONE PATRIMONIALE - BENI IMMOBILI
              </h3>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '70%' }}>Descrizione</th>
                      <th className="text-end" style={{ width: '30%' }}>Valore</th>
                    </tr>
                  </thead>
                  <tbody>
                    {situazionePatrimoniale?.beniImmobili?.length > 0 ? (
                      situazionePatrimoniale.beniImmobili.map((bene, index) => (
                        <tr key={index}>
                          <td>{bene.descrizione}</td>
                          <td className="text-end fw-bold">{formatCurrency(bene.valore)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center text-muted fst-italic py-5">
                          Nessun bene immobile inserito
                        </td>
                      </tr>
                    )}
                    {/* Righe vuote per completare la pagina */}
                    {Array.from({ length: Math.max(0, 20 - (situazionePatrimoniale?.beniImmobili?.length || 0)) }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '40px' }}>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-secondary">
                    <tr>
                      <th>TOTALE BENI IMMOBILI</th>
                      <th className="text-end">
                        {formatCurrency(calculateTotal(situazionePatrimoniale?.beniImmobili))}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PAGINA 3: BENI MOBILI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa', minHeight: '800px' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-car-front me-2"></i>
                3. SITUAZIONE PATRIMONIALE - BENI MOBILI
              </h3>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '70%' }}>Descrizione</th>
                      <th className="text-end" style={{ width: '30%' }}>Valore</th>
                    </tr>
                  </thead>
                  <tbody>
                    {situazionePatrimoniale?.beniMobili?.length > 0 ? (
                      situazionePatrimoniale.beniMobili.map((bene, index) => (
                        <tr key={index}>
                          <td>{bene.descrizione}</td>
                          <td className="text-end fw-bold">{formatCurrency(bene.valore)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center text-muted fst-italic py-5">
                          Nessun bene mobile inserito
                        </td>
                      </tr>
                    )}
                    {/* Righe vuote per completare la pagina */}
                    {Array.from({ length: Math.max(0, 20 - (situazionePatrimoniale?.beniMobili?.length || 0)) }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '40px' }}>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-secondary">
                    <tr>
                      <th>TOTALE BENI MOBILI</th>
                      <th className="text-end">
                        {formatCurrency(calculateTotal(situazionePatrimoniale?.beniMobili))}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PAGINA 4: TITOLI, FONDI E CONTI */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa', minHeight: '800px' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-bank me-2"></i>
                3. SITUAZIONE PATRIMONIALE - TITOLI, FONDI E CONTI CORRENTI
              </h3>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '70%' }}>Descrizione</th>
                      <th className="text-end" style={{ width: '30%' }}>Valore</th>
                    </tr>
                  </thead>
                  <tbody>
                    {situazionePatrimoniale?.titoliConti?.length > 0 ? (
                      situazionePatrimoniale.titoliConti.map((bene, index) => (
                        <tr key={index}>
                          <td>{bene.descrizione}</td>
                          <td className="text-end fw-bold">{formatCurrency(bene.valore)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="2" className="text-center text-muted fst-italic py-5">
                          Nessun titolo o conto inserito
                        </td>
                      </tr>
                    )}
                    {/* Righe vuote per completare la pagina */}
                    {Array.from({ length: Math.max(0, 20 - (situazionePatrimoniale?.titoliConti?.length || 0)) }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '40px' }}>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-secondary">
                    <tr>
                      <th>TOTALE TITOLI E CONTI</th>
                      <th className="text-end">
                        {formatCurrency(calculateTotal(situazionePatrimoniale?.titoliConti))}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PAGINA 5: ENTRATE */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa', minHeight: '800px' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-plus-circle me-2"></i>
                4. CONTO ECONOMICO - ENTRATE
              </h3>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-success">
                    <tr>
                      <th style={{ width: '25%' }}>Categoria</th>
                      <th style={{ width: '45%' }}>Descrizione</th>
                      <th className="text-end" style={{ width: '30%' }}>Importo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contoEconomico?.entrate?.length > 0 ? (
                      contoEconomico.entrate.map((entrata, index) => (
                        <tr key={index}>
                          <td>
                            <span className="badge bg-success bg-opacity-25 text-success">
                              {entrata.categoria}
                            </span>
                          </td>
                          <td>{entrata.descrizione}</td>
                          <td className="text-end fw-bold text-success">
                            {formatCurrency(entrata.importo)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted fst-italic py-5">
                          Nessuna entrata inserita
                        </td>
                      </tr>
                    )}
                    {/* Righe vuote per completare la pagina */}
                    {Array.from({ length: Math.max(0, 20 - (contoEconomico?.entrate?.length || 0)) }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '40px' }}>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-success">
                    <tr>
                      <th colSpan="2">TOTALE ENTRATE</th>
                      <th className="text-end text-success">
                        {formatCurrency(calculateTotal(contoEconomico?.entrate))}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PAGINA 6: USCITE */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa', minHeight: '800px' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-dash-circle me-2"></i>
                4. CONTO ECONOMICO - USCITE
              </h3>
              
              <div className="table-responsive">
                <table className="table table-striped table-hover">
                  <thead className="table-danger">
                    <tr>
                      <th style={{ width: '25%' }}>Categoria</th>
                      <th style={{ width: '45%' }}>Descrizione</th>
                      <th className="text-end" style={{ width: '30%' }}>Importo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contoEconomico?.uscite?.length > 0 ? (
                      contoEconomico.uscite.map((uscita, index) => (
                        <tr key={index}>
                          <td>
                            <span className="badge bg-danger bg-opacity-25 text-danger">
                              {uscita.categoria}
                            </span>
                          </td>
                          <td>{uscita.descrizione || 'N/A'}</td>
                          <td className="text-end fw-bold text-danger">
                            {formatCurrency(uscita.importo)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan="3" className="text-center text-muted fst-italic py-5">
                          Nessuna uscita inserita
                        </td>
                      </tr>
                    )}
                    {/* Righe vuote per completare la pagina */}
                    {Array.from({ length: Math.max(0, 20 - (contoEconomico?.uscite?.length || 0)) }).map((_, index) => (
                      <tr key={`empty-${index}`} style={{ height: '40px' }}>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                        <td>&nbsp;</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="table-danger">
                    <tr>
                      <th colSpan="2">TOTALE USCITE</th>
                      <th className="text-end text-danger">
                        {formatCurrency(calculateTotal(contoEconomico?.uscite))}
                      </th>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </div>
          </div>

          {/* PAGINA 7: SITUAZIONE COMPLESSIVA E FIRMA */}
          <div className="card shadow-sm mb-4">
            <div className="card-body p-4" style={{ backgroundColor: '#fafafa', minHeight: '800px' }}>
              <h3 className="border-bottom pb-2 mb-4 text-primary">
                <i className="bi bi-calculator me-2"></i>
                5. SITUAZIONE COMPLESSIVA
              </h3>

              {/* Riepilogo Totali */}
              <div className="row mb-5">
                <div className="col-12">
                  <div className="table-responsive">
                    <table className="table table-bordered table-lg">
                      <tbody>
                        <tr className="table-info">
                          <td className="fw-bold fs-5">VALORE TOTALE DEL PATRIMONIO</td>
                          <td className="text-end fw-bold fs-5">
                            {formatCurrency(
                              calculateTotal(situazionePatrimoniale?.beniImmobili) +
                              calculateTotal(situazionePatrimoniale?.beniMobili) +
                              calculateTotal(situazionePatrimoniale?.titoliConti)
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
                      <div className="col-md-6">
                        <label className="form-label fw-bold fs-5">Luogo:</label>
                        <p className="border-bottom pb-2 fs-5" style={{ minHeight: '40px' }}>
                          {firma?.luogo || '_'.repeat(30)}
                        </p>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold fs-5">Data:</label>
                        <p className="border-bottom pb-2 fs-5" style={{ minHeight: '40px' }}>
                          {formatDate(firma?.data) || '_'.repeat(20)}
                        </p>
                      </div>
                    </div>

                    {/* Note aggiuntive */}
                    {firma?.noteAggiuntive && (
                      <div className="mb-5">
                        <label className="form-label fw-bold fs-5">Note aggiuntive:</label>
                        <div className="border rounded p-3 bg-light" style={{ minHeight: '100px' }}>
                          <div style={{ whiteSpace: 'pre-wrap' }}>
                            {firma.noteAggiuntive}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Firma */}
                    <div className="text-end mt-5">
                      <label className="form-label fw-bold fs-5">Firma dell'Amministratore:</label>
                      <div className="border-bottom pb-3 mb-3" style={{ minHeight: '100px' }}>
                        {/* Placeholder per firma - in futuro qui ci sarà l'immagine della firma */}
                        <div className="text-center text-muted fst-italic pt-4">
                          {firma?.firmaAmministratore ? 'Firma confermata' : 'Firma non presente'}
                        </div>
                      </div>
                      <div className="fs-5 fw-bold">
                        {datiGenerali?.amministratore?.nome} {datiGenerali?.amministratore?.cognome}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* FOOTER CON INFO STATO */}
              <div className="border-top pt-4 mt-5">
                <div className="row align-items-center">
                  <div className="col">
                    <small className="text-muted">
                      <i className="bi bi-info-circle me-1"></i>
                      Documento creato il {formatDate(rendiconto.createdAt)} - 
                      Ultima modifica: {formatDate(rendiconto.updatedAt)}
                    </small>
                  </div>
                  <div className="col-auto">
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