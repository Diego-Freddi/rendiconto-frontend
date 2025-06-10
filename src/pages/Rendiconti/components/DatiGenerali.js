import React from 'react';
import { useFormContext } from 'react-hook-form';

const DatiGenerali = () => {
  const { 
    register, 
    formState: { errors }, 
    watch 
  } = useFormContext();

  const mesi = [
    'Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno',
    'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'
  ];

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 10 }, (_, i) => currentYear - i);

  return (
    <div className="row">
      {/* Sezione Periodo e R.G. */}
      <div className="col-12 mb-4">
        <h6 className="text-primary mb-3">
          <i className="bi bi-calendar3 me-2"></i>
          Periodo di Riferimento
        </h6>
        <div className="row">
          <div className="col-md-4 mb-3">
            <label htmlFor="anno" className="form-label">
              Anno *
            </label>
            <select
              className={`form-select ${errors.datiGenerali?.anno ? 'is-invalid' : ''}`}
              {...register('datiGenerali.anno')}
            >
              <option value="">Seleziona anno</option>
              {years.map(year => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
            {errors.datiGenerali?.anno && (
              <div className="invalid-feedback">
                {errors.datiGenerali.anno.message}
              </div>
            )}
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="mese" className="form-label">
              Mese *
            </label>
            <select
              className={`form-select ${errors.datiGenerali?.mese ? 'is-invalid' : ''}`}
              {...register('datiGenerali.mese')}
            >
              <option value="">Seleziona mese</option>
              {mesi.map(mese => (
                <option key={mese} value={mese}>{mese}</option>
              ))}
            </select>
            {errors.datiGenerali?.mese && (
              <div className="invalid-feedback">
                {errors.datiGenerali.mese.message}
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

      {/* Sezione Beneficiario */}
      <div className="col-12 mb-4">
        <h6 className="text-primary mb-3">
          <i className="bi bi-person me-2"></i>
          Dati del Beneficiario/Interdetto
        </h6>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="beneficiario_nome" className="form-label">
              Nome *
            </label>
            <input
              type="text"
              className={`form-control ${errors.datiGenerali?.beneficiario?.nome ? 'is-invalid' : ''}`}
              placeholder="Nome del beneficiario"
              {...register('datiGenerali.beneficiario.nome')}
            />
            {errors.datiGenerali?.beneficiario?.nome && (
              <div className="invalid-feedback">
                {errors.datiGenerali.beneficiario.nome.message}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="beneficiario_cognome" className="form-label">
              Cognome *
            </label>
            <input
              type="text"
              className={`form-control ${errors.datiGenerali?.beneficiario?.cognome ? 'is-invalid' : ''}`}
              placeholder="Cognome del beneficiario"
              {...register('datiGenerali.beneficiario.cognome')}
            />
            {errors.datiGenerali?.beneficiario?.cognome && (
              <div className="invalid-feedback">
                {errors.datiGenerali.beneficiario.cognome.message}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="beneficiario_codiceFiscale" className="form-label">
              Codice Fiscale *
            </label>
            <input
              type="text"
              className={`form-control ${errors.datiGenerali?.beneficiario?.codiceFiscale ? 'is-invalid' : ''}`}
              placeholder="RSSMRA80A01H501Z"
              style={{ textTransform: 'uppercase' }}
              {...register('datiGenerali.beneficiario.codiceFiscale')}
            />
            {errors.datiGenerali?.beneficiario?.codiceFiscale && (
              <div className="invalid-feedback">
                {errors.datiGenerali.beneficiario.codiceFiscale.message}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="beneficiario_dataNascita" className="form-label">
              Data di Nascita *
            </label>
            <input
              type="date"
              className={`form-control ${errors.datiGenerali?.beneficiario?.dataNascita ? 'is-invalid' : ''}`}
              {...register('datiGenerali.beneficiario.dataNascita')}
            />
            {errors.datiGenerali?.beneficiario?.dataNascita && (
              <div className="invalid-feedback">
                {errors.datiGenerali.beneficiario.dataNascita.message}
              </div>
            )}
          </div>

          <div className="col-md-12 mb-3">
            <label htmlFor="beneficiario_luogoNascita" className="form-label">
              Luogo di Nascita
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Città di nascita"
              {...register('datiGenerali.beneficiario.luogoNascita')}
            />
          </div>
        </div>

        {/* Indirizzo Beneficiario */}
        <h6 className="text-secondary mb-3 mt-4">Indirizzo di Residenza</h6>
        <div className="row">
          <div className="col-md-8 mb-3">
            <label htmlFor="beneficiario_via" className="form-label">
              Via/Piazza
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Via, numero civico"
              {...register('datiGenerali.beneficiario.indirizzo.via')}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="beneficiario_cap" className="form-label">
              CAP
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="00000"
              {...register('datiGenerali.beneficiario.indirizzo.cap')}
            />
          </div>

          <div className="col-md-8 mb-3">
            <label htmlFor="beneficiario_citta" className="form-label">
              Città
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Città"
              {...register('datiGenerali.beneficiario.indirizzo.citta')}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="beneficiario_provincia" className="form-label">
              Provincia
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="XX"
              style={{ textTransform: 'uppercase' }}
              maxLength="2"
              {...register('datiGenerali.beneficiario.indirizzo.provincia')}
            />
          </div>
        </div>
      </div>

      {/* Sezione Amministratore */}
      <div className="col-12 mb-4">
        <h6 className="text-primary mb-3">
          <i className="bi bi-person-badge me-2"></i>
          Dati dell'Amministratore di Sostegno/Tutore
        </h6>
        <div className="row">
          <div className="col-md-6 mb-3">
            <label htmlFor="amministratore_nome" className="form-label">
              Nome *
            </label>
            <input
              type="text"
              className={`form-control ${errors.datiGenerali?.amministratore?.nome ? 'is-invalid' : ''}`}
              placeholder="Nome dell'amministratore"
              {...register('datiGenerali.amministratore.nome')}
            />
            {errors.datiGenerali?.amministratore?.nome && (
              <div className="invalid-feedback">
                {errors.datiGenerali.amministratore.nome.message}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="amministratore_cognome" className="form-label">
              Cognome *
            </label>
            <input
              type="text"
              className={`form-control ${errors.datiGenerali?.amministratore?.cognome ? 'is-invalid' : ''}`}
              placeholder="Cognome dell'amministratore"
              {...register('datiGenerali.amministratore.cognome')}
            />
            {errors.datiGenerali?.amministratore?.cognome && (
              <div className="invalid-feedback">
                {errors.datiGenerali.amministratore.cognome.message}
              </div>
            )}
          </div>

          <div className="col-md-6 mb-3">
            <label htmlFor="amministratore_codiceFiscale" className="form-label">
              Codice Fiscale *
            </label>
            <input
              type="text"
              className={`form-control ${errors.datiGenerali?.amministratore?.codiceFiscale ? 'is-invalid' : ''}`}
              placeholder="RSSMRA80A01H501Z"
              style={{ textTransform: 'uppercase' }}
              {...register('datiGenerali.amministratore.codiceFiscale')}
            />
            {errors.datiGenerali?.amministratore?.codiceFiscale && (
              <div className="invalid-feedback">
                {errors.datiGenerali.amministratore.codiceFiscale.message}
              </div>
            )}
          </div>
        </div>

        {/* Indirizzo Amministratore */}
        <h6 className="text-secondary mb-3 mt-4">Indirizzo di Residenza</h6>
        <div className="row">
          <div className="col-md-8 mb-3">
            <label htmlFor="amministratore_via" className="form-label">
              Via/Piazza
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Via, numero civico"
              {...register('datiGenerali.amministratore.indirizzo.via')}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="amministratore_cap" className="form-label">
              CAP
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="00000"
              {...register('datiGenerali.amministratore.indirizzo.cap')}
            />
          </div>

          <div className="col-md-8 mb-3">
            <label htmlFor="amministratore_citta" className="form-label">
              Città
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="Città"
              {...register('datiGenerali.amministratore.indirizzo.citta')}
            />
          </div>

          <div className="col-md-4 mb-3">
            <label htmlFor="amministratore_provincia" className="form-label">
              Provincia
            </label>
            <input
              type="text"
              className="form-control"
              placeholder="XX"
              style={{ textTransform: 'uppercase' }}
              maxLength="2"
              {...register('datiGenerali.amministratore.indirizzo.provincia')}
            />
          </div>
        </div>
      </div>

      {/* Info Helper */}
      <div className="col-12">
        <div className="alert alert-info">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Nota:</strong> I campi contrassegnati con * sono obbligatori. 
          I dati dell'amministratore sono stati precompilati con le informazioni del tuo profilo.
        </div>
      </div>
    </div>
  );
};

export default DatiGenerali; 