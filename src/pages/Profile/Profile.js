import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import FirmaManager from '../../components/Firma/FirmaManager';

const Profile = () => {
  const { user, updateProfileCompleto, loading } = useAuth();
  const [formData, setFormData] = useState({
    nome: '',
    cognome: '',
    email: '',
    telefono: '',
    indirizzo: '',
    dataNascita: '',
    luogoNascita: '',
    professione: '',
    numeroAlbo: '',
    pec: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  // Carica i dati utente nel form
  useEffect(() => {
    if (user) {
      setFormData({
        nome: user.nome || '',
        cognome: user.cognome || '',
        email: user.email || '',
        telefono: user.telefono || '',
        indirizzo: user.indirizzo || '',
        dataNascita: user.dataNascita ? user.dataNascita.split('T')[0] : '',
        luogoNascita: user.luogoNascita || '',
        professione: user.professione || '',
        numeroAlbo: user.numeroAlbo || '',
        pec: user.pec || ''
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Rimuovi email dal form data (non modificabile)
      const { email, ...dataToUpdate } = formData;
      
      const result = await updateProfileCompleto(dataToUpdate);
      
      if (result.success) {
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Errore aggiornamento profilo:', error);
    } finally {
      setFormLoading(false);
    }
  };

  const handleCancel = () => {
    // Ripristina i dati originali
    if (user) {
      setFormData({
        nome: user.nome || '',
        cognome: user.cognome || '',
        email: user.email || '',
        telefono: user.telefono || '',
        indirizzo: user.indirizzo || '',
        dataNascita: user.dataNascita ? user.dataNascita.split('T')[0] : '',
        luogoNascita: user.luogoNascita || '',
        professione: user.professione || '',
        numeroAlbo: user.numeroAlbo || '',
        pec: user.pec || ''
      });
    }
    setIsEditing(false);
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

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <i className="bi bi-person-circle me-2"></i>
              Profilo Amministratore
            </h2>
            {!isEditing && (
              <button
                className="btn btn-primary"
                onClick={() => setIsEditing(true)}
              >
                <i className="bi bi-pencil me-2"></i>
                Modifica Profilo
              </button>
            )}
          </div>

          <div className="row">
            <div className="col-lg-8">
              <div className="card">
                <div className="card-header">
                  <h5 className="card-title mb-0">
                    <i className="bi bi-info-circle me-2"></i>
                    Informazioni Personali
                  </h5>
                </div>
                <div className="card-body">
                  <form onSubmit={handleSubmit}>
                    <div className="row">
                      {/* Dati Anagrafici */}
                      <div className="col-md-6 mb-3">
                        <label htmlFor="nome" className="form-label">
                          Nome <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="nome"
                          name="nome"
                          value={formData.nome}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="cognome" className="form-label">
                          Cognome <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="cognome"
                          name="cognome"
                          value={formData.cognome}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          required
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="email" className="form-label">
                          Email
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          disabled
                          title="L'email non può essere modificata"
                        />
                        <div className="form-text">
                          <i className="bi bi-info-circle me-1"></i>
                          L'email non può essere modificata
                        </div>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="telefono" className="form-label">
                          Telefono
                        </label>
                        <input
                          type="tel"
                          className="form-control"
                          id="telefono"
                          name="telefono"
                          value={formData.telefono}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="es. +39 123 456 7890"
                        />
                      </div>

                      <div className="col-12 mb-3">
                        <label htmlFor="indirizzo" className="form-label">
                          Indirizzo
                        </label>
                        <textarea
                          className="form-control"
                          id="indirizzo"
                          name="indirizzo"
                          rows="2"
                          value={formData.indirizzo}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Via, Città, CAP, Provincia"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="dataNascita" className="form-label">
                          Data di Nascita
                        </label>
                        <input
                          type="date"
                          className="form-control"
                          id="dataNascita"
                          name="dataNascita"
                          value={formData.dataNascita}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                        />
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
                          disabled={!isEditing}
                          placeholder="Città (Provincia)"
                        />
                      </div>

                      {/* Dati Professionali */}
                      <div className="col-12 mt-3 mb-3">
                        <h6 className="text-muted border-bottom pb-2">
                          <i className="bi bi-briefcase me-2"></i>
                          Informazioni Professionali
                        </h6>
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="professione" className="form-label">
                          Professione
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="professione"
                          name="professione"
                          value={formData.professione}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="es. Avvocato, Commercialista, ecc."
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="numeroAlbo" className="form-label">
                          Numero Albo
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="numeroAlbo"
                          name="numeroAlbo"
                          value={formData.numeroAlbo}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="Numero iscrizione albo professionale"
                        />
                      </div>

                      <div className="col-md-6 mb-3">
                        <label htmlFor="pec" className="form-label">
                          PEC (Posta Elettronica Certificata)
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="pec"
                          name="pec"
                          value={formData.pec}
                          onChange={handleInputChange}
                          disabled={!isEditing}
                          placeholder="nome@pec.it"
                        />
                      </div>
                    </div>

                    {/* Pulsanti di azione */}
                    {isEditing && (
                      <div className="d-flex gap-2 mt-4">
                        <button
                          type="submit"
                          className="btn btn-success"
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
                              Salva Modifiche
                            </>
                          )}
                        </button>
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={handleCancel}
                          disabled={formLoading}
                        >
                          <i className="bi bi-x-lg me-2"></i>
                          Annulla
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            </div>

            {/* Sidebar con informazioni aggiuntive */}
            <div className="col-lg-4">
              <div className="card">
                <div className="card-header">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-shield-check me-2"></i>
                    Informazioni Account
                  </h6>
                </div>
                <div className="card-body">
                  <div className="mb-3">
                    <small className="text-muted">Data Registrazione</small>
                    <div className="fw-medium">
                      {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('it-IT') : 'N/A'}
                    </div>
                  </div>
                  
                  <div className="mb-3">
                    <small className="text-muted">Ultimo Accesso</small>
                    <div className="fw-medium">
                      {user?.lastLogin ? new Date(user.lastLogin).toLocaleDateString('it-IT') : 'N/A'}
                    </div>
                  </div>

                  <div className="mb-3">
                    <small className="text-muted">Stato Account</small>
                    <div>
                      <span className={`badge ${user?.isActive ? 'bg-success' : 'bg-danger'}`}>
                        {user?.isActive ? 'Attivo' : 'Inattivo'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Componente Firma */}
              <FirmaManager />

              <div className="card mt-3">
                <div className="card-header">
                  <h6 className="card-title mb-0">
                    <i className="bi bi-lightbulb me-2"></i>
                    Suggerimenti
                  </h6>
                </div>
                <div className="card-body">
                  <div className="alert alert-info mb-0">
                    <small>
                      <strong>Completa il tuo profilo:</strong><br/>
                      Un profilo completo ti aiuterà nella compilazione automatica dei rendiconti.
                      Assicurati di inserire tutti i dati professionali richiesti.
                    </small>
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

export default Profile; 