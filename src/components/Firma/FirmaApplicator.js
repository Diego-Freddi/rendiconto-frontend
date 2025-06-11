import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FirmaApplicator = ({ onFirmaApplied, currentFirma = null }) => {
  const { user, verifyPassword } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Verifica se l'utente ha una firma caricata
  const hasFirma = user?.firmaImmagine;

  // Gestione applicazione firma
  const handleApplyFirma = () => {
    if (!hasFirma) {
      alert('Devi prima caricare una firma nel tuo profilo.');
      return;
    }
    setShowPasswordModal(true);
  };

  // Conferma con password
  const handlePasswordConfirm = async () => {
    if (!password.trim()) {
      alert('Inserisci la password');
      return;
    }

    setLoading(true);

    try {
      const result = await verifyPassword(password);
      
      if (result.success) {
        // Applica la firma
        const firmaData = {
          immagine: user.firmaImmagine,
          dataApplicazione: new Date().toISOString(),
          amministratore: `${user.nome} ${user.cognome}`
        };
        
        onFirmaApplied(firmaData);
        handleCloseModal();
      }
    } catch (error) {
      console.error('Errore verifica password:', error);
    } finally {
      setLoading(false);
    }
  };

  // Rimuovi firma
  const handleRemoveFirma = () => {
    onFirmaApplied(null);
  };

  // Chiudi modal
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setPassword('');
  };

  return (
    <div className="firma-applicator">
      {currentFirma ? (
        // Firma già applicata
        <div className="border rounded p-3 bg-light">
          <div className="d-flex justify-content-between align-items-start mb-2">
            <h6 className="mb-0">
              <i className="bi bi-check-circle-fill text-success me-2"></i>
              Firma Applicata
            </h6>
            <button
              type="button"
              className="btn btn-outline-danger btn-sm"
              onClick={handleRemoveFirma}
              title="Rimuovi firma"
            >
              <i className="bi bi-x-lg"></i>
            </button>
          </div>
          
          <div className="text-center mb-2">
            <img
              src={currentFirma.immagine}
              alt="Firma applicata"
              className="img-fluid"
              style={{ maxHeight: '80px', maxWidth: '200px' }}
            />
          </div>
          
          <div className="text-muted small">
            <div>
              <strong>Firmato da:</strong> {currentFirma.amministratore}
            </div>
            <div>
              <strong>Data:</strong> {new Date(currentFirma.dataApplicazione).toLocaleString('it-IT')}
            </div>
          </div>
        </div>
      ) : (
        // Nessuna firma applicata
        <div className="text-center">
          {hasFirma ? (
            <div>
              <p className="text-muted mb-3">
                <i className="bi bi-pen me-2"></i>
                Applica la tua firma digitale al rendiconto
              </p>
              <button
                type="button"
                className="btn btn-primary"
                onClick={handleApplyFirma}
              >
                <i className="bi bi-pen me-2"></i>
                Applica Firma
              </button>
            </div>
          ) : (
            <div className="alert alert-warning">
              <i className="bi bi-exclamation-triangle me-2"></i>
              <strong>Firma non disponibile</strong><br/>
              <small>
                Devi prima caricare una firma nel tuo profilo per poterla applicare ai rendiconti.
              </small>
            </div>
          )}
        </div>
      )}

      {/* Modal Password */}
      {showPasswordModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-shield-lock me-2"></i>
                  Conferma Applicazione Firma
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={loading}
                ></button>
              </div>
              <div className="modal-body">
                <div className="text-center mb-3">
                  <p className="mb-2"><strong>Anteprima firma da applicare:</strong></p>
                  <img
                    src={user.firmaImmagine}
                    alt="Anteprima firma"
                    className="img-fluid border rounded"
                    style={{ maxHeight: '100px', maxWidth: '100%' }}
                  />
                </div>
                
                <p>
                  Inserisci la tua password per applicare la firma al rendiconto:
                </p>
                
                <div className="mb-3">
                  <label htmlFor="password" className="form-label">Password</label>
                  <input
                    type="password"
                    className="form-control"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Inserisci la tua password"
                    disabled={loading}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordConfirm()}
                  />
                </div>

                <div className="alert alert-info">
                  <small>
                    <i className="bi bi-info-circle me-2"></i>
                    Una volta applicata, la firma sarà visibile nel PDF del rendiconto e certificherà 
                    l'autenticità del documento.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={handlePasswordConfirm}
                  disabled={loading || !password.trim()}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Applicando...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-pen me-2"></i>
                      Applica Firma
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FirmaApplicator; 