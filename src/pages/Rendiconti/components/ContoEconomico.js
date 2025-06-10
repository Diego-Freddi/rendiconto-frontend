import React from 'react';
import { useFormContext, useFieldArray } from 'react-hook-form';

// Componente per singola voce economica - SPOSTATO FUORI per evitare re-render
const VoceEconomica = ({ fieldName, index, onRemove, errors, categorie, tipo, register }) => (
  <div className="card mb-3">
    <div className="card-body">
      <div className="row align-items-end">
        <div className="col-md-4 mb-3">
          <label className="form-label">Categoria *</label>
          <select
            className={`form-select ${errors?.[index]?.categoria ? 'is-invalid' : ''}`}
            {...register(`${fieldName}.${index}.categoria`)}
          >
            <option value="">Seleziona categoria</option>
            {categorie.map((cat, idx) => (
              <option key={idx} value={cat}>{cat}</option>
            ))}
          </select>
          {errors?.[index]?.categoria && (
            <div className="invalid-feedback">
              {errors[index].categoria.message}
            </div>
          )}
        </div>
        <div className="col-md-4 mb-3">
          <label className="form-label">Descrizione *</label>
          <input
            type="text"
            className={`form-control ${errors?.[index]?.descrizione ? 'is-invalid' : ''}`}
            placeholder={`Descrizione ${tipo.toLowerCase()}`}
            {...register(`${fieldName}.${index}.descrizione`)}
          />
          {errors?.[index]?.descrizione && (
            <div className="invalid-feedback">
              {errors[index].descrizione.message}
            </div>
          )}
        </div>
        <div className="col-md-3 mb-3">
          <label className="form-label">Importo (€) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            className={`form-control ${errors?.[index]?.importo ? 'is-invalid' : ''}`}
            placeholder="0,00"
            {...register(`${fieldName}.${index}.importo`, {
              valueAsNumber: true
            })}
          />
          {errors?.[index]?.importo && (
            <div className="invalid-feedback">
              {errors[index].importo.message}
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

const ContoEconomico = () => {
  const { 
    register, 
    control,
    formState: { errors }, 
    watch 
  } = useFormContext();

  // Field arrays per gestire liste dinamiche
  const { fields: entrate, append: appendEntrata, remove: removeEntrata } = useFieldArray({
    control,
    name: 'contoEconomico.entrate'
  });

  const { fields: uscite, append: appendUscita, remove: removeUscita } = useFieldArray({
    control,
    name: 'contoEconomico.uscite'
  });

  // Watch per calcoli automatici
  const watchedEntrate = watch('contoEconomico.entrate') || [];
  const watchedUscite = watch('contoEconomico.uscite') || [];

  // Calcoli totali
  const totaleEntrate = watchedEntrate.reduce((sum, item) => sum + (parseFloat(item?.importo) || 0), 0);
  const totaleUscite = watchedUscite.reduce((sum, item) => sum + (parseFloat(item?.importo) || 0), 0);
  const saldo = totaleEntrate - totaleUscite;

  // Categorie predefinite per entrate
  const categorieEntrate = [
    'Pensione',
    'Stipendio/Salario',
    'Rendite immobiliari',
    'Dividendi/Interessi',
    'Vendita beni',
    'Rimborsi',
    'Donazioni ricevute',
    'Altro'
  ];

  // Categorie predefinite per uscite
  const categorieUscite = [
    'Spese mediche',
    'Farmaci',
    'Alimentari',
    'Abbigliamento',
    'Casa e utenze',
    'Trasporti',
    'Assicurazioni',
    'Tasse e imposte',
    'Spese legali',
    'Cultura e svago',
    'Donazioni erogate',
    'Altro'
  ];

  return (
    <div className="row">
      {/* Riepilogo Economico */}
      <div className="col-12 mb-4">
        <div className="card bg-light">
          <div className="card-body">
            <h6 className="card-title">
              <i className="bi bi-calculator me-2"></i>
              Riepilogo Economico
            </h6>
            <div className="row">
              <div className="col-md-4">
                <div className="text-center">
                  <div className="h5 text-success mb-0">€ {totaleEntrate.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <small className="text-muted">Totale Entrate</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className="h5 text-danger mb-0">€ {totaleUscite.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</div>
                  <small className="text-muted">Totale Uscite</small>
                </div>
              </div>
              <div className="col-md-4">
                <div className="text-center">
                  <div className={`h4 mb-0 ${saldo >= 0 ? 'text-success' : 'text-danger'}`}>
                    {saldo >= 0 ? '+' : ''}€ {saldo.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                  </div>
                  <small className="text-muted"><strong>Saldo</strong></small>
                </div>
              </div>
            </div>
            {saldo < 0 && (
              <div className="alert alert-warning mt-3 mb-0">
                <i className="bi bi-exclamation-triangle me-2"></i>
                <strong>Attenzione:</strong> Il saldo è negativo. Verificare le voci inserite.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Entrate */}
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-success mb-0">
            <i className="bi bi-arrow-up-circle me-2"></i>
            Entrate
          </h6>
          <button
            type="button"
            className="btn btn-outline-success btn-sm"
            onClick={() => appendEntrata({ categoria: '', descrizione: '', importo: 0 })}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Aggiungi Entrata
          </button>
        </div>

        {entrate.length === 0 ? (
          <div className="alert alert-light text-center">
            <i className="bi bi-arrow-up-circle text-muted" style={{ fontSize: '2rem' }}></i>
            <p className="mb-2 mt-2">Nessuna entrata inserita</p>
            <button
              type="button"
              className="btn btn-success btn-sm"
              onClick={() => appendEntrata({ categoria: '', descrizione: '', importo: 0 })}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Aggiungi la prima entrata
            </button>
          </div>
        ) : (
          entrate.map((field, index) => (
            <VoceEconomica
              key={field.id}
              fieldName="contoEconomico.entrate"
              index={index}
              onRemove={removeEntrata}
              errors={errors.contoEconomico?.entrate}
              categorie={categorieEntrate}
              tipo="Entrata"
              register={register}
            />
          ))
        )}

        <div className="alert alert-info">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Esempi di entrate:</strong> Pensioni, stipendi, affitti ricevuti, interessi bancari, dividendi, vendite, rimborsi, etc.
          </small>
        </div>
      </div>

      {/* Uscite */}
      <div className="col-12 mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h6 className="text-danger mb-0">
            <i className="bi bi-arrow-down-circle me-2"></i>
            Uscite
          </h6>
          <button
            type="button"
            className="btn btn-outline-danger btn-sm"
            onClick={() => appendUscita({ categoria: '', descrizione: '', importo: 0 })}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Aggiungi Uscita
          </button>
        </div>

        {uscite.length === 0 ? (
          <div className="alert alert-light text-center">
            <i className="bi bi-arrow-down-circle text-muted" style={{ fontSize: '2rem' }}></i>
            <p className="mb-2 mt-2">Nessuna uscita inserita</p>
            <button
              type="button"
              className="btn btn-danger btn-sm"
              onClick={() => appendUscita({ categoria: '', descrizione: '', importo: 0 })}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Aggiungi la prima uscita
            </button>
          </div>
        ) : (
          uscite.map((field, index) => (
            <VoceEconomica
              key={field.id}
              fieldName="contoEconomico.uscite"
              index={index}
              onRemove={removeUscita}
              errors={errors.contoEconomico?.uscite}
              categorie={categorieUscite}
              tipo="Uscita"
              register={register}
            />
          ))
        )}

        <div className="alert alert-info">
          <small>
            <i className="bi bi-info-circle me-2"></i>
            <strong>Esempi di uscite:</strong> Spese mediche, farmaci, alimentari, bollette, utenze, trasporti, assicurazioni, tasse, etc.
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
            <li>Inserire <strong>tutti i movimenti economici</strong> del periodo di riferimento</li>
            <li>Gli importi devono essere <strong>al netto di IVA</strong> quando applicabile</li>
            <li>Per le spese ricorrenti (es. bollette), inserire il <strong>totale del periodo</strong></li>
            <li>Conservare sempre le <strong>ricevute e documentazione</strong> di supporto</li>
            <li>Il saldo viene <strong>calcolato automaticamente</strong> (Entrate - Uscite)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ContoEconomico; 