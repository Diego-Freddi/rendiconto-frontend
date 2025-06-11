import React, { useState, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';

const FirmaManager = () => {
  const { user, uploadFirma, deleteFirma, loading } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [modalAction, setModalAction] = useState(''); // 'upload' o 'delete'
  const [password, setPassword] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  const fileInputRef = useRef(null);

  // Gestione selezione file
  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validazione client-side
      const allowedTypes = ['image/png', 'image/jpg', 'image/jpeg'];
      const maxSize = 2 * 1024 * 1024; // 2MB

      if (!allowedTypes.includes(file.type)) {
        alert('Formato file non supportato. Usa PNG, JPG o JPEG.');
        return;
      }

      if (file.size > maxSize) {
        alert('File troppo grande. Dimensione massima: 2MB');
        return;
      }

      setSelectedFile(file);
      
      // Crea preview
      const reader = new FileReader();
      reader.onload = (e) => setPreviewUrl(e.target.result);
      reader.readAsDataURL(file);
      
      // Apri modal per password
      setModalAction('upload');
      setShowPasswordModal(true);
    }
  };

  // Gestione drag & drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      // Simula il change dell'input file
      const event = { target: { files: [file] } };
      handleFileSelect(event);
    }
  };

  // Conferma azione con password
  const handlePasswordConfirm = async () => {
    if (!password.trim()) {
      alert('Inserisci la password');
      return;
    }

    // Debug: verifica token
    const token = localStorage.getItem('token');
    console.log('Token presente:', !!token);
    console.log('User autenticato:', !!user);

    setActionLoading(true);

    try {
      let result;
      
      if (modalAction === 'upload' && selectedFile) {
        console.log('Avvio upload firma...');
        result = await uploadFirma(selectedFile, password);
      } else if (modalAction === 'delete') {
        console.log('Avvio eliminazione firma...');
        result = await deleteFirma(password);
      }

      console.log('Risultato azione firma:', result);

      if (result && result.success) {
        handleCloseModal();
      } else {
        console.error('Errore azione firma:', result?.error || 'Errore sconosciuto');
      }
    } catch (error) {
      console.error('Errore azione firma:', error);
    } finally {
      setActionLoading(false);
    }
  };

  // Chiudi modal e reset
  const handleCloseModal = () => {
    setShowPasswordModal(false);
    setModalAction('');
    setPassword('');
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Avvia eliminazione firma
  const handleDeleteFirma = () => {
    setModalAction('delete');
    setShowPasswordModal(true);
  };

  return (
    <div className="card">
      <div className="card-header">
        <h6 className="card-title mb-0">
          <i className="bi bi-pen me-2"></i>
          Firma Digitale
        </h6>
      </div>
      <div className="card-body">
        {user?.firmaImmagine ? (
          // Firma esistente
          <div>
            <div className="text-center mb-3">
              <img
                src={user.firmaImmagine}
                alt="Firma"
                className="img-fluid border rounded"
                style={{ maxHeight: '150px', maxWidth: '100%' }}
                onError={(e) => {
                  console.error('Errore caricamento immagine firma:', e);
                  e.target.style.display = 'none';
                }}
              />
            </div>
            <div className="d-flex gap-2">
              <button
                className="btn btn-outline-primary btn-sm flex-fill"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                <i className="bi bi-arrow-repeat me-2"></i>
                Sostituisci Firma
              </button>
              <button
                className="btn btn-outline-danger btn-sm"
                onClick={handleDeleteFirma}
                disabled={loading}
              >
                <i className="bi bi-trash me-2"></i>
                Elimina
              </button>
            </div>
          </div>
        ) : (
          // Nessuna firma
          <div>
            <div
              className="border border-dashed rounded p-4 text-center"
              style={{ 
                borderColor: '#dee2e6',
                backgroundColor: '#f8f9fa',
                cursor: 'pointer',
                minHeight: '150px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center'
              }}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <i className="bi bi-cloud-upload display-4 text-muted mb-2"></i>
              <p className="mb-2">
                <strong>Carica la tua firma</strong>
              </p>
              <p className="text-muted small mb-0">
                Trascina un file qui o clicca per selezionare<br/>
                Formati supportati: PNG, JPG, JPEG (max 2MB)
              </p>
            </div>
          </div>
        )}

        {/* Input file nascosto */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpg,image/jpeg"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />

        {/* Informazioni */}
        <div className="mt-3">
          <div className="alert alert-info">
            <small>
              <i className="bi bi-info-circle me-2"></i>
              <strong>Nota:</strong> La firma verrà utilizzata per firmare digitalmente i rendiconti. 
              È richiesta la password per caricare o eliminare la firma per motivi di sicurezza.
            </small>
          </div>
        </div>
      </div>

      {/* Modal Password */}
      {showPasswordModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-shield-lock me-2"></i>
                  Conferma Password
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                ></button>
              </div>
              <div className="modal-body">
                {modalAction === 'upload' && previewUrl && (
                  <div className="text-center mb-3">
                    <p className="mb-2"><strong>Anteprima firma:</strong></p>
                    <img
                      src={previewUrl}
                      alt="Anteprima firma"
                      className="img-fluid border rounded"
                      style={{ maxHeight: '100px', maxWidth: '100%' }}
                    />
                  </div>
                )}
                
                <p>
                  {modalAction === 'upload' 
                    ? 'Inserisci la tua password per caricare la firma:'
                    : 'Inserisci la tua password per eliminare la firma:'
                  }
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
                    disabled={actionLoading}
                    onKeyPress={(e) => e.key === 'Enter' && handlePasswordConfirm()}
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={handleCloseModal}
                  disabled={actionLoading}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className={`btn ${modalAction === 'delete' ? 'btn-danger' : 'btn-primary'}`}
                  onClick={handlePasswordConfirm}
                  disabled={actionLoading || !password.trim()}
                >
                  {actionLoading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      {modalAction === 'upload' ? 'Caricando...' : 'Eliminando...'}
                    </>
                  ) : (
                    <>
                      <i className={`bi ${modalAction === 'delete' ? 'bi-trash' : 'bi-check-lg'} me-2`}></i>
                      {modalAction === 'upload' ? 'Carica Firma' : 'Elimina Firma'}
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

export default FirmaManager; 