import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useBeneficiario } from '../../contexts/BeneficiarioContext';
import { useResponsive } from '../../hooks/useResponsive';

const BeneficiariList = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
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

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  return (
    <div>
      {/* PATTERN D: Header responsive */}
      <div className={`d-flex ${isMobile ? 'flex-column gap-3' : 'justify-content-between align-items-center'} mb-4`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className="mb-1">
            <i className="bi bi-people me-2"></i>
            Gestione Beneficiari
          </h2>
          <p className="text-muted mb-0">
            Visualizza e gestisci tutti i beneficiari
          </p>
        </div>
        <Link 
          to="/beneficiari/nuovo" 
          className={`btn btn-primary ${isMobile ? 'mobile-full-width' : ''}`}
        >
          <i className="bi bi-plus-lg me-2"></i>
          Nuovo Beneficiario
        </Link>
      </div>

      {/* Filtri responsive */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className={`${isMobile ? 'col-12' : 'col-md-6'}`}>
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
                  
                  <div className={`${isMobile ? 'col-6' : 'col-md-3'}`}>
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

                  <div className={`${isMobile ? 'col-6' : 'col-md-3'} d-flex align-items-end ${isMobile ? 'flex-column' : 'gap-2'}`}>
                    <button 
                      type="submit" 
                      className={`btn btn-outline-primary ${isMobile ? 'mobile-full-width mb-2' : ''}`}
                    >
                      <i className="bi bi-search me-2"></i>
                      Cerca
                    </button>
                    <button 
                      type="button" 
                      className={`btn btn-outline-secondary ${isMobile ? 'mobile-full-width' : ''}`}
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
        </div>
      </div>

      {/* PATTERN B: Tabella responsive */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Lista Beneficiari
                {pagination.totalItems > 0 && (
                  <span className="badge bg-primary ms-2">{pagination.totalItems}</span>
                )}
              </h5>
              {loading && (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
              )}
            </div>
            <div className="card-body p-0">
              {beneficiari.length > 0 ? (
                <>
                  {/* Desktop: Tabella completa */}
                  {!isMobile && (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
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
                  )}

                  {/* Mobile: Card stack */}
                  {isMobile && (
                    <div className="p-3">
                      {beneficiari.map((beneficiario) => (
                        <div key={beneficiario._id} className="card mb-3 mobile-card-compact">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="card-title mb-1">
                                  {beneficiario.nome} {beneficiario.cognome}
                                </h6>
                                <small className="text-muted d-block">
                                  {beneficiario.codiceFiscale}
                                </small>
                                <small className="text-muted">
                                  {calcolaEta(beneficiario.dataNascita)} anni
                                  {beneficiario.luogoNascita && ` • ${beneficiario.luogoNascita}`}
                                </small>
                              </div>
                              <div className="text-end">
                                <span className={`badge ${beneficiario.isActive ? 'bg-success' : 'bg-danger'} d-block mb-1`}>
                                  {beneficiario.isActive ? 'Attivo' : 'Inattivo'}
                                </span>
                              </div>
                            </div>
                            


                            <div className="d-flex gap-2">
                              <Link
                                to={`/beneficiari/${beneficiario._id}`}
                                className="btn btn-outline-primary btn-sm flex-fill"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Visualizza
                              </Link>
                              <Link
                                to={`/beneficiari/${beneficiario._id}/modifica`}
                                className="btn btn-outline-secondary btn-sm flex-fill"
                              >
                                <i className="bi bi-pencil me-1"></i>
                                Modifica
                              </Link>
                              {!beneficiario.isActive ? (
                                <button
                                  className="btn btn-outline-success btn-sm"
                                  onClick={() => handleAttiva(beneficiario._id)}
                                  title="Riattiva"
                                >
                                  <i className="bi bi-check-circle"></i>
                                </button>
                              ) : (
                                <button
                                  className="btn btn-outline-danger btn-sm"
                                  onClick={() => handleDeleteClick(beneficiario)}
                                  title="Elimina"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-muted">Nessun beneficiario trovato</h5>
                  <p className="text-muted">
                    {filters.search || filters.attivi !== 'tutti' ? 
                      'Prova a modificare i filtri di ricerca' : 
                      'Inizia aggiungendo il tuo primo beneficiario'
                    }
                  </p>
                  <Link to="/beneficiari/nuovo" className="btn btn-primary">
                    <i className="bi bi-plus-lg me-2"></i>
                    Aggiungi Beneficiario
                  </Link>
                </div>
              )}
            </div>

            {/* Paginazione */}
            {pagination.totalPages > 1 && (
              <div className="card-footer">
                <nav aria-label="Paginazione beneficiari">
                  <ul className={`pagination ${isMobile ? 'pagination-sm justify-content-center' : 'justify-content-between align-items-center'} mb-0`}>
                    {!isMobile && (
                      <li className="page-item">
                        <span className="page-link text-muted">
                          Pagina {pagination.currentPage} di {pagination.totalPages} 
                          ({pagination.totalItems} totali)
                        </span>
                      </li>
                    )}
                    
                    <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage - 1)}
                        disabled={pagination.currentPage === 1}
                      >
                        <i className="bi bi-chevron-left"></i>
                        {!isMobile && ' Precedente'}
                      </button>
                    </li>
                    
                    {isMobile && (
                      <li className="page-item">
                        <span className="page-link text-muted">
                          {pagination.currentPage}/{pagination.totalPages}
                        </span>
                      </li>
                    )}
                    
                    <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                      <button
                        className="page-link"
                        onClick={() => handlePageChange(pagination.currentPage + 1)}
                        disabled={pagination.currentPage === pagination.totalPages}
                      >
                        {!isMobile && 'Successiva '}
                        <i className="bi bi-chevron-right"></i>
                      </button>
                    </li>
                  </ul>
                </nav>
              </div>
            )}
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