import React, { useState } from 'react';
import { useFormContext } from 'react-hook-form';

const CondizioniPersonali = () => {
  const { 
    register, 
    formState: { errors }, 
    watch 
  } = useFormContext();

  const condizioniPersonali = watch('condizioniPersonali') || '';
  const [charCount, setCharCount] = useState(condizioniPersonali.length);
  const maxChars = 5000;

  const handleTextChange = (e) => {
    setCharCount(e.target.value.length);
  };

  return (
    <div className="row">
      <div className="col-12">
        <div className="mb-4">
          <h6 className="text-primary mb-3">
            <i className="bi bi-heart-pulse me-2"></i>
            Condizioni Personali del Beneficiario
          </h6>
          
          <div className="alert alert-info mb-3">
            <i className="bi bi-info-circle me-2"></i>
            <strong>Istruzioni:</strong> Descrivi dettagliatamente le condizioni personali, di salute e sociali del beneficiario. 
            Includi informazioni su:
            <ul className="mb-0 mt-2">
              <li>Stato di salute generale</li>
              <li>Capacità cognitive e fisiche</li>
              <li>Autonomia nella vita quotidiana</li>
              <li>Relazioni sociali e familiari</li>
              <li>Necessità di assistenza</li>
              <li>Eventuali terapie o trattamenti in corso</li>
            </ul>
          </div>

          <div className="mb-3">
            <label htmlFor="condizioniPersonali" className="form-label">
              Descrizione delle Condizioni Personali
            </label>
            <textarea
              className={`form-control ${errors.condizioniPersonali ? 'is-invalid' : ''}`}
              rows="12"
              placeholder="Inserisci una descrizione dettagliata delle condizioni personali del beneficiario..."
              {...register('condizioniPersonali', {
                onChange: handleTextChange
              })}
            />
            {errors.condizioniPersonali && (
              <div className="invalid-feedback">
                {errors.condizioniPersonali.message}
              </div>
            )}
            
            {/* Contatore caratteri */}
            <div className="form-text d-flex justify-content-between">
              <span>
                Caratteri utilizzati: 
                <span className={charCount > maxChars * 0.9 ? 'text-warning' : 'text-muted'}>
                  {charCount}
                </span>
                /{maxChars}
              </span>
              {charCount > maxChars * 0.8 && (
                <span className={charCount > maxChars * 0.9 ? 'text-warning' : 'text-info'}>
                  <i className="bi bi-exclamation-triangle me-1"></i>
                  {charCount > maxChars * 0.9 ? 'Limite quasi raggiunto' : 'Stai raggiungendo il limite'}
                </span>
              )}
            </div>
          </div>

          {/* Suggerimenti per la compilazione */}
          <div className="card bg-light">
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-lightbulb me-2"></i>
                Suggerimenti per la Compilazione
              </h6>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6 className="text-primary">Aspetti da includere:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle text-success me-2"></i>Condizioni di salute attuali</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Livello di autonomia</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Capacità decisionali</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Supporto familiare</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Attività quotidiane</li>
                  </ul>
                </div>
                <div className="col-md-6">
                  <h6 className="text-primary">Informazioni utili:</h6>
                  <ul className="list-unstyled">
                    <li><i className="bi bi-check-circle text-success me-2"></i>Terapie mediche in corso</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Servizi sociali utilizzati</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Cambiamenti nel periodo</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Progetti futuri</li>
                    <li><i className="bi bi-check-circle text-success me-2"></i>Criticità emerse</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Template di esempio */}
          <div className="mt-3">
            <button 
              type="button" 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                const template = `Durante il periodo di riferimento, il beneficiario ha mantenuto [descrivere stato generale].

CONDIZIONI DI SALUTE:
- Stato fisico: [descrivere condizioni fisiche]
- Stato cognitivo: [descrivere capacità cognitive]
- Terapie in corso: [elencare eventuali terapie]

AUTONOMIA E CAPACITÀ:
- Gestione della vita quotidiana: [descrivere livello di autonomia]
- Capacità decisionali: [valutare capacità di prendere decisioni]
- Mobilità: [descrivere capacità di movimento]

RELAZIONI SOCIALI:
- Rapporti familiari: [descrivere relazioni con la famiglia]
- Vita sociale: [descrivere attività sociali e relazioni]
- Supporto ricevuto: [descrivere aiuti ricevuti]

SERVIZI E ASSISTENZA:
- Servizi sanitari: [elencare servizi medici utilizzati]
- Servizi sociali: [elencare servizi sociali]
- Assistenza domiciliare: [descrivere eventuali assistenze]

OSSERVAZIONI:
[Aggiungere eventuali osservazioni specifiche, cambiamenti significativi o progetti per il futuro]`;
                
                const textarea = document.querySelector('textarea[name="condizioniPersonali"]');
                if (textarea && !textarea.value.trim()) {
                  textarea.value = template;
                  textarea.dispatchEvent(new Event('input', { bubbles: true }));
                  setCharCount(template.length);
                }
              }}
            >
              <i className="bi bi-file-text me-2"></i>
              Usa Template di Esempio
            </button>
            <small className="text-muted ms-2">
              Clicca per inserire un template di base da personalizzare
            </small>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CondizioniPersonali; 