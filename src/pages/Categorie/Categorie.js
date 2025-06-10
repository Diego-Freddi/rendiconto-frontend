import React, { useState, useEffect } from 'react';
import { useCategorie } from '../../contexts/CategoriaContext';
import { toast } from 'react-toastify';

const Categorie = () => {
  const { 
    categorie, 
    categorieDefault, 
    loading, 
    createCategoria, 
    updateCategoria, 
    deleteCategoria,
    fetchCategorie 
  } = useCategorie();

  const [showModal, setShowModal] = useState(false);
  const [editingCategoria, setEditingCategoria] = useState(null);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'USCITE',
    descrizione: '',
    colore: '#6c757d'
  });

  // Reset form
  const resetForm = () => {
    setFormData({
      nome: '',
      tipo: 'USCITE',
      descrizione: '',
      colore: '#6c757d'
    });
    setEditingCategoria(null);
  };

  // Apri modal per nuova categoria
  const handleNuovaCategoria = () => {
    resetForm();
    setShowModal(true);
  };

  // Apri modal per modifica categoria
  const handleModificaCategoria = (categoria) => {
    setFormData({
      nome: categoria.nome,
      tipo: categoria.tipo || 'USCITE',
      descrizione: categoria.descrizione || '',
      colore: categoria.colore || '#6c757d'
    });
    setEditingCategoria(categoria);
    setShowModal(true);
  };

  // Chiudi modal
  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  // Salva categoria
  const handleSalvaCategoria = async (e) => {
    e.preventDefault();
    
    if (!formData.nome.trim()) {
      toast.error('Il nome della categoria è obbligatorio');
      return;
    }

    try {
      let result;
      if (editingCategoria) {
        result = await updateCategoria(editingCategoria._id, formData);
      } else {
        result = await createCategoria(formData);
      }

      if (result.success) {
        handleCloseModal();
      }
    } catch (error) {
      console.error('Errore salvataggio categoria:', error);
    }
  };

  // Elimina categoria
  const handleEliminaCategoria = async (categoria) => {
    if (window.confirm(`Sei sicuro di voler eliminare la categoria "${categoria.nome}"?`)) {
      const result = await deleteCategoria(categoria._id);
      if (result.success) {
        // Categoria eliminata con successo
      }
    }
  };

  // Filtra categorie per tipo
  const categoriePersonalizzate = categorie.filter(cat => !cat.isDefault);
  const categorieUscite = categoriePersonalizzate.filter(cat => cat.tipo === 'USCITE');
  const categorieEntrate = categoriePersonalizzate.filter(cat => cat.tipo === 'ENTRATE');

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-tags me-2"></i>
                Gestione Categorie
              </h2>
              <p className="text-muted mb-0">
                Gestisci le categorie personalizzate per entrate e uscite
              </p>
            </div>
            <button
              className="btn btn-primary"
              onClick={handleNuovaCategoria}
              disabled={loading}
            >
              <i className="bi bi-plus-circle me-2"></i>
              Nuova Categoria
            </button>
          </div>

          {/* Categorie Default */}
          <div className="row mb-4">
            {/* Categorie Default Entrate */}
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-header bg-success text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-shield-check me-2"></i>
                    Categorie Entrate Predefinite
                  </h6>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3 small">
                    Sempre disponibili, non modificabili.
                  </p>
                  <div className="row">
                    {categorieDefault.filter(cat => cat.tipo === 'ENTRATE').map((categoria, index) => (
                      <div key={index} className="col-12 mb-2">
                        <div className="badge bg-success-subtle text-success border p-2 w-100 text-start">
                          <i className="bi bi-arrow-up-circle me-2"></i>
                          {categoria.nome}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Categorie Default Uscite */}
            <div className="col-md-6 mb-3">
              <div className="card">
                <div className="card-header bg-danger text-white">
                  <h6 className="mb-0">
                    <i className="bi bi-shield-check me-2"></i>
                    Categorie Uscite Predefinite
                  </h6>
                </div>
                <div className="card-body">
                  <p className="text-muted mb-3 small">
                    Sempre disponibili, non modificabili.
                  </p>
                  <div className="row">
                    {categorieDefault.filter(cat => cat.tipo === 'USCITE').map((categoria, index) => (
                      <div key={index} className="col-12 mb-2">
                        <div className="badge bg-danger-subtle text-danger border p-2 w-100 text-start">
                          <i className="bi bi-arrow-down-circle me-2"></i>
                          {categoria.nome}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Categorie Personalizzate */}
          <div className="row">
            {/* Categorie Entrate Personalizzate */}
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-arrow-up-circle me-2"></i>
                    Categorie Entrate Personalizzate ({categorieEntrate.length})
                  </h5>
                </div>
                <div className="card-body">
                  {categorieEntrate.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-tags" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-2 mb-0">Nessuna categoria personalizzata per le entrate</p>
                      <button
                        className="btn btn-outline-success btn-sm mt-2"
                        onClick={handleNuovaCategoria}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Crea categoria entrata
                      </button>
                    </div>
                  ) : (
                    <div className="row">
                      {categorieEntrate.map((categoria) => (
                        <div key={categoria._id} className="col-12 mb-3">
                          <div className="card border-success">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="card-title mb-0 text-success">{categoria.nome}</h6>
                                  <span className="badge bg-success-subtle text-success">ENTRATA</span>
                                </div>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => handleModificaCategoria(categoria)}
                                    title="Modifica"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleEliminaCategoria(categoria)}
                                    title="Elimina"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                              {categoria.descrizione && (
                                <p className="card-text text-muted small mb-2">{categoria.descrizione}</p>
                              )}
                              <small className="text-muted">
                                <i className="bi bi-calendar3 me-1"></i>
                                {new Date(categoria.createdAt).toLocaleDateString('it-IT')}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Categorie Uscite Personalizzate */}
            <div className="col-md-6 mb-4">
              <div className="card h-100">
                <div className="card-header bg-danger text-white">
                  <h5 className="mb-0">
                    <i className="bi bi-arrow-down-circle me-2"></i>
                    Categorie Uscite Personalizzate ({categorieUscite.length})
                  </h5>
                </div>
                <div className="card-body">
                  {categorieUscite.length === 0 ? (
                    <div className="text-center text-muted py-4">
                      <i className="bi bi-tags" style={{ fontSize: '3rem' }}></i>
                      <p className="mt-2 mb-0">Nessuna categoria personalizzata per le uscite</p>
                      <button
                        className="btn btn-outline-danger btn-sm mt-2"
                        onClick={handleNuovaCategoria}
                      >
                        <i className="bi bi-plus-circle me-2"></i>
                        Crea categoria uscita
                      </button>
                    </div>
                  ) : (
                    <div className="row">
                      {categorieUscite.map((categoria) => (
                        <div key={categoria._id} className="col-12 mb-3">
                          <div className="card border-danger">
                            <div className="card-body">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="card-title mb-0 text-danger">{categoria.nome}</h6>
                                  <span className="badge bg-danger-subtle text-danger">USCITA</span>
                                </div>
                                <div className="btn-group btn-group-sm">
                                  <button
                                    className="btn btn-outline-primary"
                                    onClick={() => handleModificaCategoria(categoria)}
                                    title="Modifica"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleEliminaCategoria(categoria)}
                                    title="Elimina"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                </div>
                              </div>
                              {categoria.descrizione && (
                                <p className="card-text text-muted small mb-2">{categoria.descrizione}</p>
                              )}
                              <small className="text-muted">
                                <i className="bi bi-calendar3 me-1"></i>
                                {new Date(categoria.createdAt).toLocaleDateString('it-IT')}
                              </small>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="row">
            <div className="col-12">
              <div className="alert alert-info">
                <h6 className="alert-heading">
                  <i className="bi bi-info-circle me-2"></i>
                  Come funzionano le categorie
                </h6>
                <ul className="mb-0">
                  <li><strong>Categorie Predefinite:</strong> Sempre disponibili, non modificabili</li>
                  <li><strong>Categorie Personalizzate:</strong> Create da te, modificabili ed eliminabili</li>
                  <li><strong>Utilizzo:</strong> Le categorie appaiono nei menu a tendina durante l'inserimento di entrate e uscite</li>
                  <li><strong>Eliminazione:</strong> Puoi eliminare solo categorie non utilizzate in nessun rendiconto</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Categoria */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  {editingCategoria ? 'Modifica Categoria' : 'Nuova Categoria'}
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={handleCloseModal}
                ></button>
              </div>
              <form onSubmit={handleSalvaCategoria}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label">Nome Categoria *</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.nome}
                      onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                      placeholder="Es. Spese veterinarie"
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Tipo *</label>
                    <select
                      className="form-select"
                      value={formData.tipo}
                      onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                      required
                    >
                      <option value="ENTRATE">Entrate</option>
                      <option value="USCITE">Uscite</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Descrizione</label>
                    <textarea
                      className="form-control"
                      rows="2"
                      value={formData.descrizione}
                      onChange={(e) => setFormData({ ...formData, descrizione: e.target.value })}
                      placeholder="Descrizione opzionale della categoria"
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Colore</label>
                    <input
                      type="color"
                      className="form-control form-control-color"
                      value={formData.colore}
                      onChange={(e) => setFormData({ ...formData, colore: e.target.value })}
                      title="Scegli un colore per la categoria"
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={handleCloseModal}
                  >
                    Annulla
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Salvataggio...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        {editingCategoria ? 'Aggiorna' : 'Crea'}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Categorie; 