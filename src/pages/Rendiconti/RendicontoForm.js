import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm, FormProvider } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useRendiconto } from '../../contexts/RendicontoContext';
import { useBeneficiario } from '../../contexts/BeneficiarioContext';

// Componenti delle sezioni
import DatiGenerali from './components/DatiGenerali';
import ContoEconomico from './components/ContoEconomico';
import Firma from './components/Firma';

// Schema di validazione completo
const schema = yup.object({
  // Beneficiario selezionato
  beneficiarioId: yup
    .string()
    .required('Beneficiario richiesto'),
  
  // Dati Generali
  datiGenerali: yup.object({
    dataInizio: yup
      .date()
      .required('Data di inizio richiesta'),
    dataFine: yup
      .date()
      .required('Data di fine richiesta')
      .test('data-fine-dopo-inizio', 'La data di fine deve essere successiva alla data di inizio', function(value) {
        const { dataInizio } = this.parent;
        return !dataInizio || !value || new Date(value) > new Date(dataInizio);
      }),
    rg_numero: yup
      .string()
      .required('Numero R.G. richiesto')
      .max(50, 'Numero R.G. troppo lungo')
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
  const { 
    currentRendiconto,
    createRendiconto, 
    updateRendiconto, 
    fetchRendiconto,
    loading 
  } = useRendiconto();
  const { 
    fetchBeneficiari
  } = useBeneficiario();

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
    beneficiarioId: '',
    datiGenerali: {
      dataInizio: '',
      dataFine: '',
      rg_numero: ''
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

  const { handleSubmit, reset } = methods;

  // Carica beneficiari all'avvio
  useEffect(() => {
    fetchBeneficiari();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
              beneficiarioId: rendiconto.beneficiarioId?._id || rendiconto.beneficiarioId || '',
              datiGenerali: {
                ...defaultValues.datiGenerali,
                ...rendiconto.datiGenerali,
                dataInizio: formatDateForInput(rendiconto.datiGenerali?.dataInizio),
                dataFine: formatDateForInput(rendiconto.datiGenerali?.dataFine)
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]); // fetchRendiconto non incluso nelle dipendenze per evitare loop infiniti

  // Auto-save
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
                  ? `${currentRendiconto.beneficiarioId?.nome} ${currentRendiconto.beneficiarioId?.cognome} - ${currentRendiconto.datiGenerali?.anno}`
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