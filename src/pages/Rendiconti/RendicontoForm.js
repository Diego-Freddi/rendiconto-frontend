import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRendiconto } from '../../contexts/RendicontoContext';
import { useAuth } from '../../contexts/AuthContext';

// Componenti delle sezioni
import DatiGenerali from './components/DatiGenerali';
import CondizioniPersonali from './components/CondizioniPersonali';
import SituazionePatrimoniale from './components/SituazionePatrimoniale';
import ContoEconomico from './components/ContoEconomico';
import Firma from './components/Firma';

// Schema di validazione completo
const schema = yup.object({
  // Dati Generali
  datiGenerali: yup.object({
    anno: yup
      .number()
      .required('Anno richiesto')
      .min(2000, 'Anno non valido')
      .max(new Date().getFullYear() + 1, 'Anno non può essere futuro'),
    mese: yup
      .string()
      .required('Mese richiesto')
      .oneOf(['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 
              'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre']),
    rg_numero: yup
      .string()
      .required('Numero R.G. richiesto')
      .max(50, 'Numero R.G. troppo lungo'),
    
    // Beneficiario
    beneficiario: yup.object({
      nome: yup.string().required('Nome beneficiario richiesto').max(50),
      cognome: yup.string().required('Cognome beneficiario richiesto').max(50),
      codiceFiscale: yup
        .string()
        .required('Codice fiscale beneficiario richiesto')
        .matches(/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/, 'Codice fiscale non valido'),
      dataNascita: yup.date().required('Data di nascita richiesta'),
      luogoNascita: yup.string().max(100),
      indirizzo: yup.object({
        via: yup.string(),
        citta: yup.string(),
        cap: yup.string(),
        provincia: yup.string()
      })
    }),
    
    // Amministratore
    amministratore: yup.object({
      nome: yup.string().required('Nome amministratore richiesto').max(50),
      cognome: yup.string().required('Cognome amministratore richiesto').max(50),
      codiceFiscale: yup
        .string()
        .required('Codice fiscale amministratore richiesto')
        .matches(/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/, 'Codice fiscale non valido'),
      indirizzo: yup.object({
        via: yup.string(),
        citta: yup.string(),
        cap: yup.string(),
        provincia: yup.string()
      })
    })
  }),
  
  // Condizioni Personali
  condizioniPersonali: yup.string().max(5000, 'Testo troppo lungo'),
  
  // Situazione Patrimoniale
  situazionePatrimoniale: yup.object({
    beniImmobili: yup.array().of(
      yup.object({
        descrizione: yup.string().required('Descrizione richiesta'),
        valore: yup.number().min(0, 'Valore non può essere negativo').required('Valore richiesto')
      })
    ),
    beniMobili: yup.array().of(
      yup.object({
        descrizione: yup.string().required('Descrizione richiesta'),
        valore: yup.number().min(0, 'Valore non può essere negativo').required('Valore richiesto')
      })
    ),
    titoliConti: yup.array().of(
      yup.object({
        descrizione: yup.string().required('Descrizione richiesta'),
        valore: yup.number().min(0, 'Valore non può essere negativo').required('Valore richiesto')
      })
    )
  }),
  
  // Conto Economico
  contoEconomico: yup.object({
    entrate: yup.array().of(
      yup.object({
        categoria: yup.string().required('Categoria richiesta'),
        descrizione: yup.string().required('Descrizione richiesta'),
        importo: yup.number().min(0, 'Importo non può essere negativo').required('Importo richiesto')
      })
    ),
    uscite: yup.array().of(
      yup.object({
        categoria: yup.string().required('Categoria richiesta'),
        descrizione: yup.string().required('Descrizione richiesta'),
        importo: yup.number().min(0, 'Importo non può essere negativo').required('Importo richiesto')
      })
    )
  }),
  
  // Firma
  firma: yup.object({
    dichiarazioneVeridicita: yup.boolean().oneOf([true], 'Dichiarazione di veridicità obbligatoria'),
    consensoTrattamento: yup.boolean().oneOf([true], 'Consenso al trattamento dati obbligatorio'),
    firmaAmministratore: yup.boolean().oneOf([true], 'Firma dell\'amministratore obbligatoria'),
    luogo: yup.string().required('Luogo richiesto').max(100),
    data: yup.date().required('Data richiesta'),
    noteAggiuntive: yup.string().max(1000, 'Massimo 1000 caratteri'),
    tipoSalvataggio: yup.string().oneOf(['bozza', 'definitivo', 'pdf'])
  })
});

const RendicontoForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { 
    currentRendiconto, 
    createRendiconto, 
    updateRendiconto, 
    fetchRendiconto,
    loading 
  } = useRendiconto();

  const [currentStep, setCurrentStep] = useState(0);
  const [isEditing, setIsEditing] = useState(false);

  // Configurazione steps
  const steps = [
    { 
      id: 'datiGenerali', 
      title: 'Dati Generali', 
      component: DatiGenerali,
      icon: 'bi-person-badge'
    },
    { 
      id: 'condizioniPersonali', 
      title: 'Condizioni Personali', 
      component: CondizioniPersonali,
      icon: 'bi-heart-pulse'
    },
    { 
      id: 'situazionePatrimoniale', 
      title: 'Situazione Patrimoniale', 
      component: SituazionePatrimoniale,
      icon: 'bi-house'
    },
    { 
      id: 'contoEconomico', 
      title: 'Conto Economico', 
      component: ContoEconomico,
      icon: 'bi-calculator'
    },
    { 
      id: 'firma', 
      title: 'Firma', 
      component: Firma,
      icon: 'bi-pen'
    }
  ];

  // Valori di default
  const defaultValues = {
    datiGenerali: {
      anno: new Date().getFullYear(),
      mese: '',
      rg_numero: '',
      beneficiario: {
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
        }
      },
      amministratore: {
        nome: user?.nome || '',
        cognome: user?.cognome || '',
        codiceFiscale: user?.codiceFiscale || '',
        indirizzo: {
          via: '',
          citta: '',
          cap: '',
          provincia: ''
        }
      }
    },
    condizioniPersonali: '',
    situazionePatrimoniale: {
      beniImmobili: [],
      beniMobili: [],
      titoliConti: []
    },
    contoEconomico: {
      entrate: [],
      uscite: []
    },
    firma: {
      dichiarazioneVeridicita: false,
      consensoTrattamento: false,
      firmaAmministratore: false,
      luogo: '',
      data: '',
      noteAggiuntive: '',
      tipoSalvataggio: ''
    }
  };

  // Setup form
  const methods = useForm({
    resolver: yupResolver(schema),
    defaultValues,
    mode: 'onChange'
  });

  const { handleSubmit, reset, watch, formState: { isDirty } } = methods;

  // Carica rendiconto se in modalità modifica
  useEffect(() => {
    console.log('RendicontoForm useEffect triggered with id:', id);
    if (id && id !== 'nuovo') {
      setIsEditing(true);
      const loadRendiconto = async () => {
        try {
          console.log('Loading rendiconto with id:', id);
          const rendiconto = await fetchRendiconto(id);
          if (rendiconto) {
            console.log('Rendiconto loaded:', rendiconto);
            // Funzione per convertire date ISO in formato YYYY-MM-DD
            const formatDateForInput = (dateString) => {
              if (!dateString) return '';
              const date = new Date(dateString);
              return date.toISOString().split('T')[0];
            };

            // Assicurati che la struttura sia corretta e converti le date
            const formData = {
              ...defaultValues,
              ...rendiconto,
              datiGenerali: {
                ...defaultValues.datiGenerali,
                ...rendiconto.datiGenerali,
                beneficiario: {
                  ...defaultValues.datiGenerali.beneficiario,
                  ...rendiconto.datiGenerali?.beneficiario,
                  dataNascita: formatDateForInput(rendiconto.datiGenerali?.beneficiario?.dataNascita)
                },
                amministratore: {
                  ...defaultValues.datiGenerali.amministratore,
                  ...rendiconto.datiGenerali?.amministratore
                }
              },
              situazionePatrimoniale: {
                ...defaultValues.situazionePatrimoniale,
                ...rendiconto.situazionePatrimoniale
              },
              contoEconomico: {
                ...defaultValues.contoEconomico,
                ...rendiconto.contoEconomico
              },
              firma: {
                ...defaultValues.firma,
                ...rendiconto.firma,
                data: formatDateForInput(rendiconto.firma?.data)
              }
            };
            console.log('Resetting form with data:', formData);
            reset(formData);
          }
        } catch (error) {
          console.error('Errore caricamento rendiconto:', error);
          navigate('/rendiconti');
        }
      };
      loadRendiconto();
    } else {
      console.log('Setting editing to false');
      setIsEditing(false);
    }
  }, [id]);

  // Auto-save disabilitato temporaneamente per debug
  // useEffect(() => {
  //   if (!isDirty || !isEditing || !id || id === 'nuovo') return;

  //   const interval = setInterval(() => {
  //     const formData = methods.getValues();
  //     if (formData && isDirty) {
  //       onAutoSave(formData);
  //     }
  //   }, 30000);

  //   return () => clearInterval(interval);
  // }, [isDirty, isEditing, id, methods]);

  // Auto-save
  const onAutoSave = async (data) => {
    if (isEditing && currentRendiconto?._id) {
      await updateRendiconto(currentRendiconto._id, data);
    }
  };

  // Submit finale
  const onSubmit = async (data) => {
    try {
      // Determina il tipo di salvataggio
      const tipoSalvataggio = data.firma?.tipoSalvataggio || 'bozza';
      
      // Prepara i dati con stato appropriato
      const dataToSave = {
        ...data,
        stato: tipoSalvataggio === 'bozza' ? 'bozza' : 'completato',
        dataCreazione: new Date(),
        dataUltimaModifica: new Date()
      };

      let result;
      if (isEditing && currentRendiconto?._id) {
        result = await updateRendiconto(currentRendiconto._id, dataToSave);
      } else {
        result = await createRendiconto(dataToSave);
      }

      if (result.success) {
        // Gestisci diversi tipi di salvataggio
        switch (tipoSalvataggio) {
          case 'bozza':
            alert('Rendiconto salvato come bozza');
            navigate('/rendiconti');
            break;
          case 'definitivo':
            alert('Rendiconto salvato definitivamente');
            navigate(`/rendiconti/${result.rendiconto?._id || currentRendiconto._id}`);
            break;
          case 'pdf':
            alert('Rendiconto salvato. Generazione PDF in corso...');
            // TODO: Implementare generazione PDF
            navigate(`/rendiconti/${result.rendiconto?._id || currentRendiconto._id}`);
            break;
          default:
            navigate('/rendiconti');
        }
      }
    } catch (error) {
      console.error('Errore salvataggio:', error);
      alert('Errore durante il salvataggio. Riprova.');
    }
  };

  // Navigazione tra step
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const goToStep = (stepIndex) => {
    setCurrentStep(stepIndex);
  };

  // Salva come bozza
  const saveDraft = async () => {
    const data = methods.getValues();
    await onSubmit(data);
  };

  const CurrentStepComponent = steps[currentStep].component;

  if (loading) {
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
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                {isEditing ? 'Modifica Rendiconto' : 'Nuovo Rendiconto'}
              </h2>
              <p className="text-muted mb-0">
                {isEditing && currentRendiconto 
                  ? `${currentRendiconto.datiGenerali?.beneficiario?.nome} ${currentRendiconto.datiGenerali?.beneficiario?.cognome} - ${currentRendiconto.datiGenerali?.anno}`
                  : 'Compila tutti i campi richiesti per creare il rendiconto'
                }
              </p>
            </div>
            <div>
              <button 
                type="button" 
                className="btn btn-outline-secondary me-2"
                onClick={saveDraft}
                disabled={loading}
              >
                <i className="bi bi-save me-2"></i>
                Salva Bozza
              </button>
              <button 
                type="button" 
                className="btn btn-outline-danger"
                onClick={() => navigate('/rendiconti')}
              >
                <i className="bi bi-x-lg me-2"></i>
                Annulla
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body py-3">
              <div className="d-flex justify-content-between align-items-center">
                {steps.map((step, index) => (
                  <div 
                    key={step.id}
                    className={`d-flex flex-column align-items-center cursor-pointer ${
                      index === currentStep ? 'text-primary' : 
                      index < currentStep ? 'text-success' : 'text-muted'
                    }`}
                    onClick={() => goToStep(index)}
                    style={{ cursor: 'pointer', flex: 1 }}
                  >
                    <div 
                      className={`rounded-circle d-flex align-items-center justify-content-center mb-2 ${
                        index === currentStep ? 'bg-primary text-white' :
                        index < currentStep ? 'bg-success text-white' : 'bg-light text-muted'
                      }`}
                      style={{ width: '40px', height: '40px' }}
                    >
                      {index < currentStep ? (
                        <i className="bi bi-check-lg"></i>
                      ) : (
                        <i className={step.icon}></i>
                      )}
                    </div>
                    <small className="text-center">{step.title}</small>
                    {index < steps.length - 1 && (
                      <div 
                        className={`position-absolute ${
                          index < currentStep ? 'bg-success' : 'bg-light'
                        }`}
                        style={{
                          height: '2px',
                          width: 'calc(100% / 5)',
                          top: '20px',
                          left: `calc(${(index + 1) * 20}% - 20px)`,
                          zIndex: -1
                        }}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Content */}
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="row">
            <div className="col-12">
              <div className="card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className={`${steps[currentStep].icon} me-2`}></i>
                    {steps[currentStep].title}
                  </h5>
                </div>
                <div className="card-body">
                  <CurrentStepComponent />
                </div>
                <div className="card-footer">
                  <div className="d-flex justify-content-between">
                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      onClick={prevStep}
                      disabled={currentStep === 0}
                    >
                      <i className="bi bi-arrow-left me-2"></i>
                      Precedente
                    </button>
                    
                    <div>
                      {currentStep === steps.length - 1 ? (
                        <div className="text-muted">
                          <small>
                            <i className="bi bi-info-circle me-1"></i>
                            Utilizza le opzioni di salvataggio nella sezione sopra
                          </small>
                        </div>
                      ) : (
                        <button
                          type="button"
                          className="btn btn-primary"
                          onClick={nextStep}
                        >
                          Successivo
                          <i className="bi bi-arrow-right ms-2"></i>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
};

export default RendicontoForm; 