import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useBeneficiario } from '../../contexts/BeneficiarioContext';

const BeneficiarioForm = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEdit = Boolean(id);
  
  const {
    currentBeneficiario,
    loading,
    fetchBeneficiario,
    createBeneficiario,
    updateBeneficiario
  } = useBeneficiario();

  const [formData, setFormData] = useState({
    // Dati anagrafici
    nome: '',
    cognome: '',
    codiceFiscale: '',
    dataNascita: '',
    luogoNascita: '',
    indirizzo: {
      via: '',
      citta: '',
      cap: '',
      provincia: ''
    },
    note: '',
    
    // Condizioni personali
    condizioniPersonali: '',
    
    // Situazione patrimoniale
    situazionePatrimoniale: {
      beniImmobili: [],
      beniMobili: [],
      titoliConti: []
    }
  });

  const [activeTab, setActiveTab] = useState('anagrafica');
  const [formLoading, setFormLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Carica beneficiario se in modalità modifica
  useEffect(() => {
    if (isEdit && id) {
      const loadBeneficiario = async () => {
        try {
          const beneficiario = await fetchBeneficiario(id);
          if (beneficiario) {
            setFormData({
              nome: beneficiario.nome || '',
              cognome: beneficiario.cognome || '',
              codiceFiscale: beneficiario.codiceFiscale || '',
              dataNascita: beneficiario.dataNascita ? beneficiario.dataNascita.split('T')[0] : '',
              luogoNascita: beneficiario.luogoNascita || '',
              indirizzo: {
                via: beneficiario.indirizzo?.via || '',
                citta: beneficiario.indirizzo?.citta || '',
                cap: beneficiario.indirizzo?.cap || '',
                provincia: beneficiario.indirizzo?.provincia || ''
              },
              note: beneficiario.note || '',
              condizioniPersonali: beneficiario.condizioniPersonali || '',
              situazionePatrimoniale: {
                beniImmobili: beneficiario.situazionePatrimoniale?.beniImmobili || [],
                beniMobili: beneficiario.situazionePatrimoniale?.beniMobili || [],
                titoliConti: beneficiario.situazionePatrimoniale?.titoliConti || []
              }
            });
          }
        } catch (error) {
          console.error('Errore caricamento beneficiario:', error);
        }
      };
      loadBeneficiario();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isEdit, id]); // Rimuovo fetchBeneficiario dalle dipendenze per evitare loop infiniti

  // Gestione input generici
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    
    // Rimuovi errore se presente
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Gestione beni patrimoniali
  const handleAddBene = (categoria) => {
    setFormData(prev => ({
      ...prev,
      situazionePatrimoniale: {
        ...prev.situazionePatrimoniale,
        [categoria]: [
          ...prev.situazionePatrimoniale[categoria],
          { descrizione: '', valore: 0 }
        ]
      }
    }));
  };

  const handleRemoveBene = (categoria, index) => {
    setFormData(prev => ({
      ...prev,
      situazionePatrimoniale: {
        ...prev.situazionePatrimoniale,
        [categoria]: prev.situazionePatrimoniale[categoria].filter((_, i) => i !== index)
      }
    }));
  };

  const handleBeneChange = (categoria, index, field, value) => {
    setFormData(prev => ({
      ...prev,
      situazionePatrimoniale: {
        ...prev.situazionePatrimoniale,
        [categoria]: prev.situazionePatrimoniale[categoria].map((bene, i) =>
          i === index ? { ...bene, [field]: field === 'valore' ? parseFloat(value) || 0 : value } : bene
        )
      }
    }));
  };

  // Validazione form
  const validateForm = () => {
    const newErrors = {};

    // Validazioni obbligatorie
    if (!formData.nome.trim()) newErrors.nome = 'Il nome è obbligatorio';
    if (!formData.cognome.trim()) newErrors.cognome = 'Il cognome è obbligatorio';
    if (!formData.codiceFiscale.trim()) newErrors.codiceFiscale = 'Il codice fiscale è obbligatorio';
    if (!formData.dataNascita) newErrors.dataNascita = 'La data di nascita è obbligatoria';

    // Validazione codice fiscale
    const cfRegex = /^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/;
    if (formData.codiceFiscale && !cfRegex.test(formData.codiceFiscale.toUpperCase())) {
      newErrors.codiceFiscale = 'Formato codice fiscale non valido';
    }

    // Validazione CAP
    if (formData.indirizzo.cap && !/^[0-9]{5}$/.test(formData.indirizzo.cap)) {
      newErrors['indirizzo.cap'] = 'Il CAP deve essere di 5 cifre';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit form
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      setActiveTab('anagrafica'); // Torna alla prima tab se ci sono errori
      return;
    }

    setFormLoading(true);

    try {
      // Prepara i dati per l'invio
      const dataToSend = {
        ...formData,
        codiceFiscale: formData.codiceFiscale.toUpperCase(),
        indirizzo: formData.indirizzo.via || formData.indirizzo.citta ? formData.indirizzo : undefined
      };

      let result;
      if (isEdit) {
        result = await updateBeneficiario(id, dataToSend);
      } else {
        result = await createBeneficiario(dataToSend);
      }

      if (result.success) {
        navigate('/beneficiari');
      }
    } catch (error) {
      console.error('Errore salvataggio beneficiario:', error);
    } finally {
      setFormLoading(false);
    }
  };

  // Calcola totali patrimonio
  const calcolaTotale = (categoria) => {
    return formData.situazionePatrimoniale[categoria].reduce((sum, bene) => sum + (bene.valore || 0), 0);
  };

  const totalePatrimonio = calcolaTotale('beniImmobili') + calcolaTotale('beniMobili') + calcolaTotale('titoliConti');

  if (loading && isEdit) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <i className="bi bi-person-plus me-2"></i>
              {isEdit ? 'Modifica Beneficiario' : 'Nuovo Beneficiario'}
            </h2>
            <button
              type="button"
              className="btn btn-outline-secondary"
              onClick={() => navigate('/beneficiari')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Torna alla Lista
            </button>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-lg-9">
                {/* Tabs Navigation */}
                <ul className="nav nav-tabs mb-4">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'anagrafica' ? 'active' : ''}`}
                      onClick={() => setActiveTab('anagrafica')}
                    >
                      <i className="bi bi-person me-2"></i>
                      Dati Anagrafici
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'condizioni' ? 'active' : ''}`}
                      onClick={() => setActiveTab('condizioni')}
                    >
                      <i className="bi bi-file-text me-2"></i>
                      Condizioni Personali
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'patrimonio' ? 'active' : ''}`}
                      onClick={() => setActiveTab('patrimonio')}
                    >
                      <i className="bi bi-bank me-2"></i>
                      Situazione Patrimoniale
                    </button>
                  </li>
                </ul>

                {/* Tab Content */}
                <div className="card">
                  <div className="card-body">
                    {/* Tab Dati Anagrafici */}
                    {activeTab === 'anagrafica' && (
                      <div>
                        <h5 className="card-title mb-4">
                          <i className="bi bi-info-circle me-2"></i>
                          Informazioni Anagrafiche
                        </h5>
                        
                        <div className="row">
                          <div className="col-md-6 mb-3">
                            <label htmlFor="nome" className="form-label">
                              Nome <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                              id="nome"
                              name="nome"
                              value={formData.nome}
                              onChange={handleInputChange}
                              required
                            />
                            {errors.nome && <div className="invalid-feedback">{errors.nome}</div>}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="cognome" className="form-label">
                              Cognome <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors.cognome ? 'is-invalid' : ''}`}
                              id="cognome"
                              name="cognome"
                              value={formData.cognome}
                              onChange={handleInputChange}
                              required
                            />
                            {errors.cognome && <div className="invalid-feedback">{errors.cognome}</div>}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="codiceFiscale" className="form-label">
                              Codice Fiscale <span className="text-danger">*</span>
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors.codiceFiscale ? 'is-invalid' : ''}`}
                              id="codiceFiscale"
                              name="codiceFiscale"
                              value={formData.codiceFiscale}
                              onChange={handleInputChange}
                              style={{ textTransform: 'uppercase' }}
                              maxLength="16"
                              required
                            />
                            {errors.codiceFiscale && <div className="invalid-feedback">{errors.codiceFiscale}</div>}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="dataNascita" className="form-label">
                              Data di Nascita <span className="text-danger">*</span>
                            </label>
                            <input
                              type="date"
                              className={`form-control ${errors.dataNascita ? 'is-invalid' : ''}`}
                              id="dataNascita"
                              name="dataNascita"
                              value={formData.dataNascita}
                              onChange={handleInputChange}
                              required
                            />
                            {errors.dataNascita && <div className="invalid-feedback">{errors.dataNascita}</div>}
                          </div>

                          <div className="col-md-6 mb-3">
                            <label htmlFor="luogoNascita" className="form-label">
                              Luogo di Nascita
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="luogoNascita"
                              name="luogoNascita"
                              value={formData.luogoNascita}
                              onChange={handleInputChange}
                              placeholder="Città (Provincia)"
                            />
                          </div>

                          {/* Indirizzo */}
                          <div className="col-12 mt-3 mb-3">
                            <h6 className="text-muted border-bottom pb-2">
                              <i className="bi bi-geo-alt me-2"></i>
                              Indirizzo di Residenza
                            </h6>
                          </div>

                          <div className="col-md-8 mb-3">
                            <label htmlFor="indirizzo.via" className="form-label">
                              Via/Indirizzo
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="indirizzo.via"
                              name="indirizzo.via"
                              value={formData.indirizzo.via}
                              onChange={handleInputChange}
                              placeholder="Via, Numero civico"
                            />
                          </div>

                          <div className="col-md-4 mb-3">
                            <label htmlFor="indirizzo.cap" className="form-label">
                              CAP
                            </label>
                            <input
                              type="text"
                              className={`form-control ${errors['indirizzo.cap'] ? 'is-invalid' : ''}`}
                              id="indirizzo.cap"
                              name="indirizzo.cap"
                              value={formData.indirizzo.cap}
                              onChange={handleInputChange}
                              placeholder="12345"
                              maxLength="5"
                            />
                            {errors['indirizzo.cap'] && <div className="invalid-feedback">{errors['indirizzo.cap']}</div>}
                          </div>

                          <div className="col-md-8 mb-3">
                            <label htmlFor="indirizzo.citta" className="form-label">
                              Città
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="indirizzo.citta"
                              name="indirizzo.citta"
                              value={formData.indirizzo.citta}
                              onChange={handleInputChange}
                            />
                          </div>

                          <div className="col-md-4 mb-3">
                            <label htmlFor="indirizzo.provincia" className="form-label">
                              Provincia
                            </label>
                            <input
                              type="text"
                              className="form-control"
                              id="indirizzo.provincia"
                              name="indirizzo.provincia"
                              value={formData.indirizzo.provincia}
                              onChange={handleInputChange}
                              style={{ textTransform: 'uppercase' }}
                              maxLength="2"
                              placeholder="MI"
                            />
                          </div>

                          <div className="col-12 mb-3">
                            <label htmlFor="note" className="form-label">
                              Note
                            </label>
                            <textarea
                              className="form-control"
                              id="note"
                              name="note"
                              rows="3"
                              value={formData.note}
                              onChange={handleInputChange}
                              placeholder="Note aggiuntive sul beneficiario..."
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Tab Condizioni Personali */}
                    {activeTab === 'condizioni' && (
                      <div>
                        <h5 className="card-title mb-4">
                          <i className="bi bi-file-text me-2"></i>
                          Condizioni Personali del Beneficiario
                        </h5>
                        
                        <div className="mb-3">
                          <label htmlFor="condizioniPersonali" className="form-label">
                            Descrizione delle Condizioni Personali
                          </label>
                          <textarea
                            className="form-control"
                            id="condizioniPersonali"
                            name="condizioniPersonali"
                            rows="10"
                            value={formData.condizioniPersonali}
                            onChange={handleInputChange}
                            placeholder="Descrivi le condizioni personali, di salute, sociali e familiari del beneficiario..."
                          />
                          <div className="form-text">
                            Caratteri: {formData.condizioniPersonali.length}/5000
                          </div>
                        </div>

                        <div className="alert alert-info">
                          <i className="bi bi-info-circle me-2"></i>
                          <strong>Suggerimento:</strong> Includi informazioni su stato di salute, 
                          autonomia, relazioni familiari, necessità di assistenza e qualsiasi altra 
                          informazione rilevante per la gestione dell'amministrazione di sostegno.
                        </div>
                      </div>
                    )}

                    {/* Tab Situazione Patrimoniale */}
                    {activeTab === 'patrimonio' && (
                      <div>
                        <h5 className="card-title mb-4">
                          <i className="bi bi-bank me-2"></i>
                          Situazione Patrimoniale
                        </h5>

                        {/* Beni Immobili */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">
                              <i className="bi bi-house me-2"></i>
                              Beni Immobili
                            </h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleAddBene('beniImmobili')}
                            >
                              <i className="bi bi-plus me-1"></i>
                              Aggiungi
                            </button>
                          </div>

                          {formData.situazionePatrimoniale.beniImmobili.map((bene, index) => (
                            <div key={index} className="row mb-2">
                              <div className="col-md-8">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Descrizione del bene immobile"
                                  value={bene.descrizione}
                                  onChange={(e) => handleBeneChange('beniImmobili', index, 'descrizione', e.target.value)}
                                />
                              </div>
                              <div className="col-md-3">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Valore €"
                                  min="0"
                                  step="0.01"
                                  value={bene.valore}
                                  onChange={(e) => handleBeneChange('beniImmobili', index, 'valore', e.target.value)}
                                />
                              </div>
                              <div className="col-md-1">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRemoveBene('beniImmobili', index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}

                          {formData.situazionePatrimoniale.beniImmobili.length > 0 && (
                            <div className="text-end">
                              <strong>Totale Immobili: €{calcolaTotale('beniImmobili').toLocaleString('it-IT', { minimumFractionDigits: 2 })}</strong>
                            </div>
                          )}
                        </div>

                        {/* Beni Mobili */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">
                              <i className="bi bi-car-front me-2"></i>
                              Beni Mobili
                            </h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleAddBene('beniMobili')}
                            >
                              <i className="bi bi-plus me-1"></i>
                              Aggiungi
                            </button>
                          </div>

                          {formData.situazionePatrimoniale.beniMobili.map((bene, index) => (
                            <div key={index} className="row mb-2">
                              <div className="col-md-8">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Descrizione del bene mobile"
                                  value={bene.descrizione}
                                  onChange={(e) => handleBeneChange('beniMobili', index, 'descrizione', e.target.value)}
                                />
                              </div>
                              <div className="col-md-3">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Valore €"
                                  min="0"
                                  step="0.01"
                                  value={bene.valore}
                                  onChange={(e) => handleBeneChange('beniMobili', index, 'valore', e.target.value)}
                                />
                              </div>
                              <div className="col-md-1">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRemoveBene('beniMobili', index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}

                          {formData.situazionePatrimoniale.beniMobili.length > 0 && (
                            <div className="text-end">
                              <strong>Totale Mobili: €{calcolaTotale('beniMobili').toLocaleString('it-IT', { minimumFractionDigits: 2 })}</strong>
                            </div>
                          )}
                        </div>

                        {/* Titoli e Conti */}
                        <div className="mb-4">
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h6 className="mb-0">
                              <i className="bi bi-credit-card me-2"></i>
                              Titoli, Fondi e Conti Correnti
                            </h6>
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-primary"
                              onClick={() => handleAddBene('titoliConti')}
                            >
                              <i className="bi bi-plus me-1"></i>
                              Aggiungi
                            </button>
                          </div>

                          {formData.situazionePatrimoniale.titoliConti.map((bene, index) => (
                            <div key={index} className="row mb-2">
                              <div className="col-md-8">
                                <input
                                  type="text"
                                  className="form-control"
                                  placeholder="Descrizione del titolo/conto"
                                  value={bene.descrizione}
                                  onChange={(e) => handleBeneChange('titoliConti', index, 'descrizione', e.target.value)}
                                />
                              </div>
                              <div className="col-md-3">
                                <input
                                  type="number"
                                  className="form-control"
                                  placeholder="Valore €"
                                  min="0"
                                  step="0.01"
                                  value={bene.valore}
                                  onChange={(e) => handleBeneChange('titoliConti', index, 'valore', e.target.value)}
                                />
                              </div>
                              <div className="col-md-1">
                                <button
                                  type="button"
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleRemoveBene('titoliConti', index)}
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </div>
                          ))}

                          {formData.situazionePatrimoniale.titoliConti.length > 0 && (
                            <div className="text-end">
                              <strong>Totale Titoli/Conti: €{calcolaTotale('titoliConti').toLocaleString('it-IT', { minimumFractionDigits: 2 })}</strong>
                            </div>
                          )}
                        </div>

                        {/* Totale Patrimonio */}
                        {totalePatrimonio > 0 && (
                          <div className="alert alert-success">
                            <div className="d-flex justify-content-between align-items-center">
                              <span><strong>Totale Patrimonio:</strong></span>
                              <span className="h5 mb-0">€{totalePatrimonio.toLocaleString('it-IT', { minimumFractionDigits: 2 })}</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="col-lg-3">
                <div className="card">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-check-circle me-2"></i>
                      Azioni
                    </h6>
                  </div>
                  <div className="card-body">
                    <button
                      type="submit"
                      className="btn btn-success w-100 mb-2"
                      disabled={formLoading}
                    >
                      {formLoading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Salvando...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check-lg me-2"></i>
                          {isEdit ? 'Aggiorna Beneficiario' : 'Crea Beneficiario'}
                        </>
                      )}
                    </button>
                    
                    <button
                      type="button"
                      className="btn btn-outline-secondary w-100"
                      onClick={() => navigate('/beneficiari')}
                      disabled={formLoading}
                    >
                      <i className="bi bi-x-lg me-2"></i>
                      Annulla
                    </button>
                  </div>
                </div>

                {/* Riepilogo */}
                <div className="card mt-3">
                  <div className="card-header">
                    <h6 className="card-title mb-0">
                      <i className="bi bi-info-circle me-2"></i>
                      Riepilogo
                    </h6>
                  </div>
                  <div className="card-body">
                    <div className="mb-2">
                      <small className="text-muted">Nome Completo</small>
                      <div className="fw-medium">
                        {formData.nome && formData.cognome 
                          ? `${formData.nome} ${formData.cognome}`
                          : 'Non specificato'
                        }
                      </div>
                    </div>
                    
                    <div className="mb-2">
                      <small className="text-muted">Codice Fiscale</small>
                      <div className="fw-medium">
                        {formData.codiceFiscale || 'Non specificato'}
                      </div>
                    </div>

                    {totalePatrimonio > 0 && (
                      <div className="mb-2">
                        <small className="text-muted">Patrimonio Totale</small>
                        <div className="fw-medium text-success">
                          €{totalePatrimonio.toLocaleString('it-IT', { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BeneficiarioForm; 