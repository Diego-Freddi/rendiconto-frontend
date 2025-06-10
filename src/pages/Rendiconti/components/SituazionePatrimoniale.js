import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

// Componente per singolo bene - SPOSTATO FUORI per evitare re-render
const BeneItem = ({ fieldName, index, onRemove, errors, placeholder, register }) => (
  <div className="card mb-3">
    <div className="card-body">
      <div className="row align-items-end">
        <div className="col-md-8 mb-3">
          <label className="form-label">Descrizione *</label>
          <input
            type="text"
            className={`form-control ${errors?.[index]?.descrizione ? 'is-invalid' : ''}`}
            placeholder={placeholder}
            {...register(`${fieldName}.${index}.descrizione`)}
          />
          {errors?.[index]?.descrizione && (
            <div className="invalid-feedback">
              {errors[index].descrizione.message}
            </div>
          )}
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label">Valore (€) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-control ${errors?.[index]?.valore ? 'is-invalid' : ''}`}
            placeholder="0,00"
            {...register(`${fieldName}.${index}.valore`, {
              valueAsNumber: true
            })}
          />
          {errors?.[index]?.valore && (
            <div className="invalid-feedback">
              {errors[index].valore.message}
            </div>
          )}
        </div>
        <div className="col-md-1 mb-3">
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => onRemove(index)}
            title="Rimuovi"
          >
            <i className="bi bi-trash"></i>
          </button>
        </div>
      </div>
    </div>
  </div>
);

const SituazionePatrimoniale = () => {
  const { 
    register, 
    control,
    formState: { errors }, 
    watch 
  } = useFormContext();

  // Field arrays per gestire liste dinamiche
  const { fields: beniImmobili, append: appendImmobile, remove: removeImmobile } = useFieldArray({
    control,
    name: 'situazionePatrimoniale.beniImmobili'
  });

  const { fields: beniMobili, append: appendMobile, remove: removeMobile } = useFieldArray({
    control,
    name: 'situazionePatrimoniale.beniMobili'
  });

  const { fields: titoliConti, append: appendTitolo, remove: removeTitolo } = useFieldArray({
    control,
    name: 'situazionePatrimoniale.titoliConti'
  });

  // Watch per calcoli automatici
  const watchedImmobili = watch('situazionePatrimoniale.beniImmobili') || [];
  const watchedMobili = watch('situazionePatrimoniale.beniMobili') || [];
  const watchedTitoli = watch('situazionePatrimoniale.titoliConti') || [];

  // Calcoli totali
  const totaleImmobili = watchedImmobili.reduce((sum, bene) => sum + (parseFloat(bene?.valore) || 0), 0);
  const totaleMobili = watchedMobili.reduce((sum, bene) => sum + (parseFloat(bene?.valore) || 0), 0);
  const totaleTitoli = watchedTitoli.reduce((sum, bene) => sum + (parseFloat(bene?.valore) || 0), 0);
  const totalePatrimonio = totaleImmobili + totaleMobili + totaleTitoli;

  return (
    <div className="row">
      {/* Riepilogo Totali */}
      <div className="col-12 mb-4">
        <div className="card bg-light">
          <div className="card-body">
            <h6 className="card-title">
              <i className="bi bi-calculator me-2"></i>
              Riepilogo Patrimonio
            </h6>
            <div className="row">
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h5 text-primary mb-0">€ {totaleImmobili.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <small className="text-muted">Beni Immobili</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h5 text-info mb-0">€ {totaleMobili.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <small className="text-muted">Beni Mobili</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h5 text-warning mb-0">€ {totaleTitoli.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <small className="text-muted">Titoli/Conti</small>
                </div>
              </div>
              <div className="col-md-3">
                <div className="text-center">
                  <div className="h4 text-success mb-0">€ {totalePatrimonio.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <small className="text-muted"><strong>Totale Patrimonio</strong></small>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Beni Immobili */}
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-primary mb-0">
            <i className="bi bi-house me-2"></i>
            Beni Immobili
          </h6>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => appendImmobile({ descrizione: '', valore: 0 })}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Aggiungi Immobile
          </button>
        </div>

        {beniImmobili.length === 0 ? (
          <div className="alert alert-light text-center">
            <i className="bi bi-house text-muted" style={{ fontSize: '2rem' }}></i>
            <p className="mb-2 mt-2">Nessun bene immobile inserito</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => appendImmobile({ descrizione: '', valore: 0 })}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Aggiungi il primo immobile
            </button>
          </div>
        ) : (
          beniImmobili.map((field, index) => (
            <BeneItem
              key={field.id}
              fieldName="situazionePatrimoniale.beniImmobili"
              index={index}
              onRemove={removeImmobile}
              errors={errors.situazionePatrimoniale?.beniImmobili}
              placeholder="es. Appartamento in Via Roma 123, Milano"
              register={register}
            />
          ))
        )}

        <div className="alert alert-info">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Esempi:</strong> Casa di abitazione, appartamenti, terreni, box auto, cantine, negozi, uffici, etc.
          </small>
        </div>
      </div>

      {/* Beni Mobili */}
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-primary mb-0">
            <i className="bi bi-car-front me-2"></i>
            Beni Mobili
          </h6>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => appendMobile({ descrizione: '', valore: 0 })}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Aggiungi Bene Mobile
          </button>
        </div>

        {beniMobili.length === 0 ? (
          <div className="alert alert-light text-center">
            <i className="bi bi-car-front text-muted" style={{ fontSize: '2rem' }}></i>
            <p className="mb-2 mt-2">Nessun bene mobile inserito</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => appendMobile({ descrizione: '', valore: 0 })}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Aggiungi il primo bene mobile
            </button>
          </div>
        ) : (
          beniMobili.map((field, index) => (
            <BeneItem
              key={field.id}
              fieldName="situazionePatrimoniale.beniMobili"
              index={index}
              onRemove={removeMobile}
              errors={errors.situazionePatrimoniale?.beniMobili}
              placeholder="es. Automobile Fiat Panda, Gioielli, Mobili"
              register={register}
            />
          ))
        )}

        <div className="alert alert-info">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Esempi:</strong> Automobili, motocicli, gioielli, opere d'arte, mobili di valore, strumenti musicali, etc.
          </small>
        </div>
      </div>

      {/* Titoli e Conti */}
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-primary mb-0">
            <i className="bi bi-bank me-2"></i>
            Titoli, Fondi e Conti Correnti
          </h6>
          <button
            type="button"
            className="btn btn-outline-primary btn-sm"
            onClick={() => appendTitolo({ descrizione: '', valore: 0 })}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Aggiungi Titolo/Conto
          </button>
        </div>

        {titoliConti.length === 0 ? (
          <div className="alert alert-light text-center">
            <i className="bi bi-bank text-muted" style={{ fontSize: '2rem' }}></i>
            <p className="mb-2 mt-2">Nessun titolo o conto inserito</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              onClick={() => appendTitolo({ descrizione: '', valore: 0 })}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Aggiungi il primo titolo/conto
            </button>
          </div>
        ) : (
          titoliConti.map((field, index) => (
            <BeneItem
              key={field.id}
              fieldName="situazionePatrimoniale.titoliConti"
              index={index}
              onRemove={removeTitolo}
              errors={errors.situazionePatrimoniale?.titoliConti}
              placeholder="es. Conto Corrente Banca Intesa, BTP, Azioni Enel"
              register={register}
            />
          ))
        )}

        <div className="alert alert-info">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Esempi:</strong> Conti correnti, libretti di risparmio, BTP, CCT, azioni, obbligazioni, fondi comuni, polizze vita, etc.
          </small>
        </div>
      </div>

      {/* Note Informative */}
      <div className="col-12">
        <div className="alert alert-warning">
          <h6 className="alert-heading">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Note Importanti
          </h6>
          <ul className="mb-0">
            <li>Inserire il <strong>valore di mercato attuale</strong> dei beni</li>
            <li>Per gli immobili, fare riferimento ai <strong>valori catastali</strong> o perizie recenti</li>
            <li>Per titoli e investimenti, indicare il <strong>valore al 31 dicembre</strong> dell'anno di riferimento</li>
            <li>I totali vengono <strong>calcolati automaticamente</strong></li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default SituazionePatrimoniale; 