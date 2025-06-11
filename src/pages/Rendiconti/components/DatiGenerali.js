import React, { useState, useEffect } from 'react';
import { useFormContext } from 'react-hook-form';
import { useBeneficiario } from '../../../contexts/BeneficiarioContext';
import { useAuth } from '../../../contexts/AuthContext';

const DatiGenerali = () => {
  const { 
    register, 
    formState: { errors }, 
    watch,
    setValue,
    getValues
  } = useFormContext();

  const { user } = useAuth();
  const { beneficiari, fetchBeneficiari, loading: loadingBeneficiari } = useBeneficiario();
  const [selectedBeneficiario, setSelectedBeneficiario] = useState(null);

  // Watch del beneficiario selezionato
  const beneficiarioId = watch('beneficiarioId');

  // Carica beneficiari se non già caricati
  useEffect(() => {
    if (!beneficiari || beneficiari.length === 0) {
      fetchBeneficiari();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Aggiorna beneficiario selezionato quando cambia l'ID
  useEffect(() => {
    if (beneficiarioId && beneficiari && beneficiari.length > 0) {
      const beneficiario = beneficiari.find(b => b._id === beneficiarioId);
      setSelectedBeneficiario(beneficiario || null);
    } else {
      setSelectedBeneficiario(null);
    }
  }, [beneficiarioId, beneficiari]);

  // Calcola età del beneficiario
  const calcolaEta = (dataNascita) => {
    if (!dataNascita) return '';
    const oggi = new Date();
    const nascita = new Date(dataNascita);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const mese = oggi.getMonth() - nascita.getMonth();
    if (mese < 0 || (mese === 0 && oggi.getDate() < nascita.getDate())) {
      eta--;
    }
    return eta;
  };

  // Formatta indirizzo completo
  const formatIndirizzo = (indirizzo) => {
    if (!indirizzo) return '';
    const parti = [];
    if (indirizzo.via) parti.push(indirizzo.via);
    if (indirizzo.cap) parti.push(indirizzo.cap);
    if (indirizzo.citta) parti.push(indirizzo.citta);
    if (indirizzo.provincia) parti.push(`(${indirizzo.provincia})`);
    return parti.join(', ');
  };

  return (
    <div className="row">
      {/* Sezione Selezione Beneficiario */}
      <div className="col-12 mb-4">
        <h6 className="text-primary mb-3">
          <i className="bi bi-person-check me-2"></i>
          Selezione Beneficiario
        </h6>
        
        <div className="row">
          <div className="col-md-8 mb-3">
            <label htmlFor="beneficiarioId" className="form-label">
              Beneficiario/Interdetto *
            </label>
            <select
              className={`form-select ${errors.beneficiarioId ? 'is-invalid' : ''}`}
              {...register('beneficiarioId')}
              disabled={loadingBeneficiari}
            >
              <option value="">
                {loadingBeneficiari ? 'Caricamento...' : 'Seleziona beneficiario'}
              </option>
              {beneficiari && beneficiari.filter(b => b.isActive).map(beneficiario => (
                <option key={beneficiario._id} value={beneficiario._id}>
                  {beneficiario.nome} {beneficiario.cognome} - {beneficiario.codiceFiscale}
                </option>
              ))}
            </select>
            {errors.beneficiarioId && (
              <div className="invalid-feedback">
                {errors.beneficiarioId.message}
              </div>
            )}
            {!loadingBeneficiari && beneficiari && beneficiari.filter(b => b.isActive).length === 0 && (
              <div className="form-text text-warning">
                <i className="bi bi-exclamation-triangle me-1"></i>
                Nessun beneficiario attivo trovato. 
                <a href="/beneficiari/nuovo" className="ms-1">Crea nuovo beneficiario</a>
              </div>
            )}
          </div>

          <div className="col-md-4 mb-3 d-flex align-items-end">
            <a 
              href="/beneficiari/nuovo" 
              className="btn btn-outline-primary"
              target="_blank"
              rel="noopener noreferrer"
            >
              <i className="bi bi-plus-circle me-2"></i>
              Nuovo Beneficiario
            </a>
          </div>
        </div>

        {/* Dati Beneficiario Selezionato (Read-only) */}
        {selectedBeneficiario && (
          <div className="card bg-light mt-3">
            <div className="card-body">
              <h6 className="card-title text-secondary mb-3">
                <i className="bi bi-info-circle me-2"></i>
                Dati del Beneficiario Selezionato
              </h6>
              
              <div className="row">
                <div className="col-md-6">
                  <p className="mb-2">
                    <strong>Nome Completo:</strong> {selectedBeneficiario.nome} {selectedBeneficiario.cognome}
                  </p>
                  <p className="mb-2">
                    <strong>Codice Fiscale:</strong> {selectedBeneficiario.codiceFiscale}
                  </p>
                  <p className="mb-2">
                    <strong>Data di Nascita:</strong> {' '}
                    {selectedBeneficiario.dataNascita ? 
                      new Date(selectedBeneficiario.dataNascita).toLocaleDateString('it-IT') : 'Non specificata'
                    }
                    {selectedBeneficiario.dataNascita && (
                      <span className="text-muted ms-2">
                        (età: {calcolaEta(selectedBeneficiario.dataNascita)} anni)
                      </span>
                    )}
                  </p>
                </div>
                <div className="col-md-6">
                  {selectedBeneficiario.luogoNascita && (
                    <p className="mb-2">
                      <strong>Luogo di Nascita:</strong> {selectedBeneficiario.luogoNascita}
                    </p>
                  )}
                  {selectedBeneficiario.indirizzo && (
                    <p className="mb-2">
                      <strong>Indirizzo:</strong> {formatIndirizzo(selectedBeneficiario.indirizzo)}
                    </p>
                  )}
                  <p className="mb-0">
                    <strong>Patrimonio Totale:</strong> {' '}
                    <span className="text-success fw-bold">
                      €{selectedBeneficiario.totalePatrimonio?.toLocaleString('it-IT') || '0,00'}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Sezione Periodo di Riferimento */}
      <div className="col-12 mb-4">
        <h6 className="text-primary mb-3">
          <i className="bi bi-calendar-range me-2"></i>
          Periodo di Riferimento
        </h6>
        
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="dataInizio" className="form-label">
              Data Inizio Periodo *
            </label>
            <input
              type="date"
              className={`form-control ${errors.datiGenerali?.dataInizio ? 'is-invalid' : ''}`}
              {...register('datiGenerali.dataInizio')}
            />
            {errors.datiGenerali?.dataInizio && (
              <div className="invalid-feedback">
                {errors.datiGenerali.dataInizio.message}
              </div>
            )}
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="dataFine" className="form-label">
              Data Fine Periodo *
            </label>
            <input
              type="date"
              className={`form-control ${errors.datiGenerali?.dataFine ? 'is-invalid' : ''}`}
              {...register('datiGenerali.dataFine')}
            />
            {errors.datiGenerali?.dataFine && (
              <div className="invalid-feedback">
                {errors.datiGenerali.dataFine.message}
              </div>
            )}
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="rg_numero" className="form-label">
              Numero R.G. *
            </label>
            <input
              type="text"
              className={`form-control ${errors.datiGenerali?.rg_numero ? 'is-invalid' : ''}`}
              placeholder="es. 12345/2024"
              {...register('datiGenerali.rg_numero')}
            />
            {errors.datiGenerali?.rg_numero && (
              <div className="invalid-feedback">
                {errors.datiGenerali.rg_numero.message}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sezione Amministratore (Read-only) */}
      <div className="col-12 mb-4">
        <h6 className="text-primary mb-3">
          <i className="bi bi-person-badge me-2"></i>
          Dati dell'Amministratore di Sostegno
        </h6>
        
        <div className="card bg-light">
          <div className="card-body">
        <div className="row">
              <div className="col-md-6">
                <p className="mb-2">
                  <strong>Nome Completo:</strong> {user?.nome} {user?.cognome}
                </p>
                <p className="mb-2">
                  <strong>Codice Fiscale:</strong> {user?.codiceFiscale || 'Non specificato'}
                </p>
                <p className="mb-2">
                  <strong>Email:</strong> {user?.email}
                </p>
              </div>
              <div className="col-md-6">
                {user?.dataNascita && (
                  <p className="mb-2">
                    <strong>Data di Nascita:</strong> {' '}
                    {new Date(user.dataNascita).toLocaleDateString('it-IT')}
                  </p>
                )}
                {user?.luogoNascita && (
                  <p className="mb-2">
                    <strong>Luogo di Nascita:</strong> {user.luogoNascita}
                  </p>
                )}
                {user?.professione && (
                  <p className="mb-2">
                    <strong>Professione:</strong> {user.professione}
                  </p>
                )}
                {user?.numeroAlbo && (
                  <p className="mb-0">
                    <strong>Numero Albo:</strong> {user.numeroAlbo}
                  </p>
            )}
          </div>
        </div>

            <div className="mt-2">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                I dati dell'amministratore possono essere modificati nella 
                <a href="/profile" className="ms-1">pagina profilo</a>
              </small>
          </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatiGenerali; 