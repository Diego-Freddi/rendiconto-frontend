import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBeneficiario } from '../../contexts/BeneficiarioContext';

const BeneficiariList = () => {
  const navigate = useNavigate();
  const {
    beneficiari,
    loading,
    pagination,
    fetchBeneficiari,
    deleteBeneficiario,
    attivaBeneficiario,
    searchBeneficiari,
    fetchBeneficiariAttivi
  } = useBeneficiario();

  const [filters, setFilters] = useState({
    search: '',
    attivi: 'tutti',
    page: 1
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [beneficiarioToDelete, setBeneficiarioToDelete] = useState(null);

  // Carica beneficiari al mount
  useEffect(() => {
    fetchBeneficiari();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // fetchBeneficiari non incluso nelle dipendenze per evitare loop infiniti

  // Gestione ricerca
  const handleSearch = (e) => {
    e.preventDefault();
    const searchFilters = {
      ...filters,
      page: 1
    };
    setFilters(searchFilters);
    
    if (searchFilters.search.trim()) {
      searchBeneficiari(searchFilters.search.trim());
    } else if (searchFilters.attivi !== 'tutti') {
      fetchBeneficiariAttivi(searchFilters.attivi === 'true');
    } else {
      fetchBeneficiari(searchFilters);
    }
  };

  // Reset filtri
  const handleResetFilters = () => {
    setFilters({
      search: '',
      attivi: 'tutti',
      page: 1
    });
    fetchBeneficiari();
  };

  // Gestione filtro attivi/inattivi
  const handleFilterAttivi = (value) => {
    const newFilters = {
      ...filters,
      attivi: value,
      page: 1
    };
    setFilters(newFilters);

    if (value === 'tutti') {
      fetchBeneficiari({ page: 1 });
    } else {
      fetchBeneficiariAttivi(value === 'true');
    }
  };

  // Paginazione
  const handlePageChange = (newPage) => {
    const newFilters = { ...filters, page: newPage };
    setFilters(newFilters);
    fetchBeneficiari(newFilters);
  };

  // Conferma eliminazione
  const handleDeleteClick = (beneficiario) => {
    setBeneficiarioToDelete(beneficiario);
    setShowDeleteModal(true);
  };

  // Elimina beneficiario
  const handleDeleteConfirm = async () => {
    if (beneficiarioToDelete) {
      const result = await deleteBeneficiario(beneficiarioToDelete._id);
      if (result.success) {
        setShowDeleteModal(false);
        setBeneficiarioToDelete(null);
      }
    }
  };

  // Riattiva beneficiario
  const handleAttiva = async (id) => {
    await attivaBeneficiario(id);
  };

  // Calcola età
  const calcolaEta = (dataNascita) => {
    if (!dataNascita) return 'N/A';
    const oggi = new Date();
    const nascita = new Date(dataNascita);
    let eta = oggi.getFullYear() - nascita.getFullYear();
    const mese = oggi.getMonth() - nascita.getMonth();
    if (mese < 0 || (mese === 0 && oggi.getDate() < nascita.getDate())) {
      eta--;
    }
    return eta;
  };

  return (
    <div className="container-fluid">
      <div className="row">
        <div className="col-12">
          {/* Header */}
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">
              <i className="bi bi-people me-2"></i>
              Gestione Beneficiari
            </h2>
            <Link to="/beneficiari/nuovo" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              Nuovo Beneficiario
            </Link>
          </div>

          {/* Filtri e Ricerca */}
          <div className="card mb-4">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="search" className="form-label">Ricerca</label>
                    <input
                      type="text"
                      className="form-control"
                      id="search"
                      placeholder="Cerca per nome, cognome o codice fiscale..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                  </div>
                  
                  <div className="col-md-3">
                    <label htmlFor="attivi" className="form-label">Stato</label>
                    <select
                      className="form-select"
                      id="attivi"
                      value={filters.attivi}
                      onChange={(e) => handleFilterAttivi(e.target.value)}
                    >
                      <option value="tutti">Tutti</option>
                      <option value="true">Solo Attivi</option>
                      <option value="false">Solo Inattivi</option>
                    </select>
                  </div>

                  <div className="col-md-3 d-flex align-items-end gap-2">
                    <button type="submit" className="btn btn-outline-primary">
                      <i className="bi bi-search me-2"></i>
                      Cerca
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary"
                      onClick={handleResetFilters}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      Reset
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>

          {/* Lista Beneficiari */}
          <div className="card">
            <div className="card-header">
              <h5 className="card-title mb-0">
                <i className="bi bi-list me-2"></i>
                Lista Beneficiari
                {pagination.totalItems > 0 && (
                  <span className="badge bg-primary ms-2">{pagination.totalItems}</span>
                )}
              </h5>
            </div>
            <div className="card-body">
              {loading ? (
                <div className="text-center py-4">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Caricamento...</span>
                  </div>
                  <p className="mt-2 text-muted">Caricamento beneficiari...</p>
                </div>
              ) : beneficiari.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-people display-1 text-muted"></i>
                  <h4 className="mt-3 text-muted">Nessun beneficiario trovato</h4>
                  <p className="text-muted">
                    {filters.search || filters.attivi !== 'tutti' 
                      ? 'Prova a modificare i filtri di ricerca'
                      : 'Inizia aggiungendo il tuo primo beneficiario'
                    }
                  </p>
                  {!filters.search && filters.attivi === 'tutti' && (
                    <Link to="/beneficiari/nuovo" className="btn btn-primary">
                      <i className="bi bi-plus-lg me-2"></i>
                      Aggiungi Beneficiario
                    </Link>
                  )}
                </div>
              ) : (
                <>
                  {/* Tabella Beneficiari */}
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead className="table-light">
                        <tr>
                          <th>Nome Completo</th>
                          <th>Codice Fiscale</th>
                          <th>Età</th>
                          <th>Luogo Nascita</th>
                          <th>Stato</th>
                          <th>Rendiconti</th>
                          <th>Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beneficiari.map((beneficiario) => (
                          <tr key={beneficiario._id}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className="avatar-sm bg-primary text-white rounded-circle d-flex align-items-center justify-content-center me-3">
                                  {beneficiario.nome.charAt(0)}{beneficiario.cognome.charAt(0)}
                                </div>
                                <div>
                                  <div className="fw-medium">
                                    {beneficiario.nome} {beneficiario.cognome}
                                  </div>
                                  {beneficiario.note && (
                                    <small className="text-muted">
                                      <i className="bi bi-sticky me-1"></i>
                                      {beneficiario.note.substring(0, 50)}
                                      {beneficiario.note.length > 50 ? '...' : ''}
                                    </small>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td>
                              <code className="text-dark">{beneficiario.codiceFiscale}</code>
                            </td>
                            <td>
                              {calcolaEta(beneficiario.dataNascita)} anni
                            </td>
                            <td>{beneficiario.luogoNascita || 'N/A'}</td>
                            <td>
                              <span className={`badge ${beneficiario.isActive ? 'bg-success' : 'bg-danger'}`}>
                                {beneficiario.isActive ? 'Attivo' : 'Inattivo'}
                              </span>
                            </td>
                            <td>
                              <Link 
                                to="/rendiconti"
                                className="btn btn-sm btn-outline-info"
                              >
                                <i className="bi bi-file-earmark-text me-1"></i>
                                Visualizza
                              </Link>
                            </td>
                            <td>
                              <div className="btn-group" role="group">
                                <Link
                                  to={`/beneficiari/${beneficiario._id}`}
                                  className="btn btn-sm btn-outline-primary"
                                  title="Visualizza dettagli"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                                <Link
                                  to={`/beneficiari/${beneficiario._id}/modifica`}
                                  className="btn btn-sm btn-outline-warning"
                                  title="Modifica"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                                {!beneficiario.isActive ? (
                                  <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={() => handleAttiva(beneficiario._id)}
                                    title="Riattiva"
                                  >
                                    <i className="bi bi-check-circle"></i>
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => handleDeleteClick(beneficiario)}
                                    title="Elimina"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Paginazione */}
                  {pagination.totalPages > 1 && (
                    <nav aria-label="Paginazione beneficiari" className="mt-4">
                      <ul className="pagination justify-content-center">
                        <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.currentPage - 1)}
                            disabled={pagination.currentPage === 1}
                          >
                            <i className="bi bi-chevron-left"></i>
                          </button>
                        </li>
                        
                        {[...Array(pagination.totalPages)].map((_, index) => {
                          const pageNumber = index + 1;
                          return (
                            <li
                              key={pageNumber}
                              className={`page-item ${pagination.currentPage === pageNumber ? 'active' : ''}`}
                            >
                              <button
                                className="page-link"
                                onClick={() => handlePageChange(pageNumber)}
                              >
                                {pageNumber}
                              </button>
                            </li>
                          );
                        })}
                        
                        <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                          <button
                            className="page-link"
                            onClick={() => handlePageChange(pagination.currentPage + 1)}
                            disabled={pagination.currentPage === pagination.totalPages}
                          >
                            <i className="bi bi-chevron-right"></i>
                          </button>
                        </li>
                      </ul>
                    </nav>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal Conferma Eliminazione */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-exclamation-triangle text-warning me-2"></i>
                  Conferma Eliminazione
                </h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Sei sicuro di voler eliminare il beneficiario{' '}
                  <strong>
                    {beneficiarioToDelete?.nome} {beneficiarioToDelete?.cognome}
                  </strong>?
                </p>
                <div className="alert alert-warning">
                  <i className="bi bi-info-circle me-2"></i>
                  <strong>Attenzione:</strong> Se il beneficiario ha rendiconti associati,
                  verrà disattivato invece di essere eliminato definitivamente.
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowDeleteModal(false)}
                >
                  Annulla
                </button>
                <button
                  type="button"
                  className="btn btn-danger"
                  onClick={handleDeleteConfirm}
                >
                  <i className="bi bi-trash me-2"></i>
                  Elimina
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BeneficiariList; 