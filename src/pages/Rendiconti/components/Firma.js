import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';
import FirmaApplicator from '../../../components/Firma/FirmaApplicator';

const Firma = () => {
  const { 
    register, 
    formState: { errors },
    watch,
    setValue
  } = useFormContext();

  const [showSaveOptions, setShowSaveOptions] = useState(false);

  // Watch per i checkbox di conferma
  const dichiarazioneVeridicita = watch('firma.dichiarazioneVeridicita');
  const consensoTrattamento = watch('firma.consensoTrattamento');
  const firmaAmministratore = watch('firma.firmaAmministratore');

  // Verifica se tutte le dichiarazioni sono confermate
  const tutteConfermate = dichiarazioneVeridicita && consensoTrattamento && firmaAmministratore;

  const handleShowSaveOptions = () => {
    if (tutteConfermate) {
      setShowSaveOptions(true);
    }
  };

  return (
    <div className="row">
      {/* Dichiarazioni */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header bg-primary text-white">
            <h6 className="mb-0">
              <i className="bi bi-shield-check me-2"></i>
              Dichiarazioni e Conferme
            </h6>
          </div>
          <div className="card-body">
            
            {/* Dichiarazione di Veridicità */}
            <div className="form-check mb-4">
              <input
                className={`form-check-input ${errors.firma?.dichiarazioneVeridicita ? 'is-invalid' : ''}`}
                type="checkbox"
                id="dichiarazioneVeridicita"
                {...register('firma.dichiarazioneVeridicita')}
              />
              <label className="form-check-label" htmlFor="dichiarazioneVeridicita">
                <strong>Dichiarazione di Veridicità</strong>
                <div className="text-muted mt-1">
                  Dichiaro che tutte le informazioni contenute nel presente rendiconto sono 
                  veritiere e corrispondenti alla reale situazione del beneficiario. 
                  Sono consapevole delle responsabilità civili e penali derivanti da 
                  dichiarazioni mendaci o incomplete.
                </div>
              </label>
              {errors.firma?.dichiarazioneVeridicita && (
                <div className="invalid-feedback d-block">
                  {errors.firma.dichiarazioneVeridicita.message}
                </div>
              )}
            </div>

            {/* Consenso Trattamento Dati */}
            <div className="form-check mb-4">
              <input
                className={`form-check-input ${errors.firma?.consensoTrattamento ? 'is-invalid' : ''}`}
                type="checkbox"
                id="consensoTrattamento"
                {...register('firma.consensoTrattamento')}
              />
              <label className="form-check-label" htmlFor="consensoTrattamento">
                <strong>Consenso al Trattamento dei Dati</strong>
                <div className="text-muted mt-1">
                  Autorizzo il trattamento dei dati personali contenuti nel presente 
                  rendiconto in conformità al Regolamento UE 2016/679 (GDPR) per le 
                  finalità connesse all'amministrazione di sostegno.
                </div>
              </label>
              {errors.firma?.consensoTrattamento && (
                <div className="invalid-feedback d-block">
                  {errors.firma.consensoTrattamento.message}
                </div>
              )}
            </div>

            {/* Firma Amministratore */}
            <div className="form-check mb-4">
              <input
                className={`form-check-input ${errors.firma?.firmaAmministratore ? 'is-invalid' : ''}`}
                type="checkbox"
                id="firmaAmministratore"
                {...register('firma.firmaAmministratore')}
              />
              <label className="form-check-label" htmlFor="firmaAmministratore">
                <strong>Firma dell'Amministratore di Sostegno</strong>
                <div className="text-muted mt-1">
                  Confermo di essere l'Amministratore di Sostegno nominato dal Giudice 
                  Tutelare competente e di sottoscrivere il presente rendiconto con 
                  piena consapevolezza delle mie responsabilità.
                </div>
              </label>
              {errors.firma?.firmaAmministratore && (
                <div className="invalid-feedback d-block">
                  {errors.firma.firmaAmministratore.message}
                </div>
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Data e Luogo */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-calendar-event me-2"></i>
              Data e Luogo di Sottoscrizione
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6 mb-3">
                <label className="form-label">Luogo *</label>
                <input
                  type="text"
                  className={`form-control ${errors.firma?.luogo ? 'is-invalid' : ''}`}
                  placeholder="es. Milano"
                  {...register('firma.luogo')}
                />
                {errors.firma?.luogo && (
                  <div className="invalid-feedback">
                    {errors.firma.luogo.message}
                  </div>
                )}
              </div>
              <div className="col-md-6 mb-3">
                <label className="form-label">Data *</label>
                <input
                  type="date"
                  className={`form-control ${errors.firma?.data ? 'is-invalid' : ''}`}
                  {...register('firma.data')}
                />
                {errors.firma?.data && (
                  <div className="invalid-feedback">
                    {errors.firma.data.message}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Note Aggiuntive */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-chat-text me-2"></i>
              Note Aggiuntive (Opzionale)
            </h6>
          </div>
          <div className="card-body">
            <textarea
              className="form-control"
              rows="4"
              placeholder="Eventuali note, osservazioni o chiarimenti aggiuntivi..."
              {...register('firma.noteAggiuntive')}
            />
            <div className="form-text">
              Spazio per eventuali chiarimenti o informazioni aggiuntive che si ritengono utili.
            </div>
          </div>
        </div>
      </div>

      {/* Firma Digitale */}
      <div className="col-12 mb-4">
        <div className="card">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-pen me-2"></i>
              Firma Digitale
            </h6>
          </div>
          <div className="card-body">
            <FirmaApplicator
              currentFirma={watch('firma.firmaDigitale')}
              onFirmaApplied={(firmaData) => setValue('firma.firmaDigitale', firmaData)}
            />
          </div>
        </div>
      </div>

      {/* Stato Validazione */}
      <div className="col-12 mb-4">
        <div className={`alert ${tutteConfermate ? 'alert-success' : 'alert-warning'}`}>
          <div className="d-flex align-items-center">
            <i className={`bi ${tutteConfermate ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-3`} 
               style={{ fontSize: '1.5rem' }}></i>
            <div className="flex-grow-1">
              {tutteConfermate ? (
                <>
                  <h6 className="mb-1">Rendiconto Pronto per il Salvataggio</h6>
                  <p className="mb-0">Tutte le dichiarazioni sono state confermate. È possibile procedere con il salvataggio.</p>
                </>
              ) : (
                <>
                  <h6 className="mb-1">Confermare le Dichiarazioni</h6>
                  <p className="mb-0">È necessario confermare tutte le dichiarazioni prima di poter salvare il rendiconto.</p>
                </>
              )}
            </div>
            {tutteConfermate && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleShowSaveOptions}
              >
                <i className="bi bi-save me-2"></i>
                Opzioni Salvataggio
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Opzioni di Salvataggio */}
      {showSaveOptions && (
        <div className="col-12">
          <div className="card border-success">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0">
                <i className="bi bi-save me-2"></i>
                Opzioni di Salvataggio
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                
                {/* Salva come Bozza */}
                <div className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-file-earmark-text text-warning" style={{ fontSize: '2rem' }}></i>
                      <h6 className="mt-2">Salva come Bozza</h6>
                      <p className="text-muted small">
                        Salva il rendiconto come bozza. Potrai modificarlo in seguito.
                      </p>
                                             <button
                         type="submit"
                         className="btn btn-outline-warning btn-sm"
                         onClick={() => setValue('firma.tipoSalvataggio', 'bozza')}
                       >
                         <i className="bi bi-pencil me-2"></i>
                         Salva Bozza
                       </button>
                    </div>
                  </div>
                </div>

                {/* Salva Definitivo */}
                <div className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-file-earmark-check text-success" style={{ fontSize: '2rem' }}></i>
                      <h6 className="mt-2">Salva Definitivo</h6>
                      <p className="text-muted small">
                        Salva il rendiconto in forma definitiva. Non sarà più modificabile.
                      </p>
                                             <button
                         type="submit"
                         className="btn btn-success btn-sm"
                         onClick={() => setValue('firma.tipoSalvataggio', 'definitivo')}
                       >
                         <i className="bi bi-check-circle me-2"></i>
                         Salva Definitivo
                       </button>
                    </div>
                  </div>
                </div>

                {/* Esporta PDF */}
                <div className="col-md-4 mb-3">
                  <div className="card h-100">
                    <div className="card-body text-center">
                      <i className="bi bi-file-earmark-pdf text-danger" style={{ fontSize: '2rem' }}></i>
                      <h6 className="mt-2">Esporta PDF</h6>
                      <p className="text-muted small">
                        Salva e genera automaticamente il PDF per la presentazione.
                      </p>
                                             <button
                         type="submit"
                         className="btn btn-outline-danger btn-sm"
                         onClick={() => setValue('firma.tipoSalvataggio', 'pdf')}
                       >
                         <i className="bi bi-download me-2"></i>
                         Genera PDF
                       </button>
                    </div>
                  </div>
                </div>

              </div>

              <div className="alert alert-info mt-3">
                <h6 className="alert-heading">
                  <i className="bi bi-info-circle me-2"></i>
                  Informazioni sui Tipi di Salvataggio
                </h6>
                <ul className="mb-0">
                  <li><strong>Bozza:</strong> Il rendiconto può essere modificato in qualsiasi momento</li>
                  <li><strong>Definitivo:</strong> Il rendiconto viene bloccato e non può più essere modificato</li>
                  <li><strong>PDF:</strong> Viene generato automaticamente il PDF ufficiale per la presentazione al Giudice Tutelare</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Avvisi Legali */}
      <div className="col-12 mt-4">
        <div className="alert alert-secondary">
          <h6 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Avvisi Importanti
          </h6>
          <ul className="mb-0 small">
            <li>Il presente rendiconto deve essere presentato al Giudice Tutelare entro i termini stabiliti</li>
            <li>La mancata presentazione o la presentazione di dati falsi comporta responsabilità civili e penali</li>
            <li>Conservare sempre copia del rendiconto e della documentazione di supporto</li>
            <li>In caso di dubbi, consultare sempre un legale specializzato in amministrazione di sostegno</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Firma; 