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
    <div>
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-people me-2"></i>
                Gestione Beneficiari
              </h2>
              <p className="text-muted mb-0">
                Gestisci i beneficiari dei tuoi rendiconti
              </p>
            </div>
            <Link to="/beneficiari/nuovo" className="btn btn-primary">
              <i className="bi bi-plus-lg me-2"></i>
              <span className="d-none d-sm-inline">Nuovo Beneficiario</span>
              <span className="d-sm-none">Nuovo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filtri e Ricerca */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <form onSubmit={handleSearch}>
                <div className="row g-3">
                  <div className="col-12 col-md-6">
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
                  
                  <div className="col-6 col-md-3">
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

                  <div className="col-6 col-md-3 d-flex align-items-end gap-2">
                    <button type="submit" className="btn btn-outline-primary flex-fill">
                      <i className="bi bi-search me-2"></i>
                      <span className="d-none d-sm-inline">Cerca</span>
                    </button>
                    <button 
                      type="button" 
                      className="btn btn-outline-secondary flex-fill"
                      onClick={handleResetFilters}
                    >
                      <i className="bi bi-arrow-clockwise me-2"></i>
                      <span className="d-none d-sm-inline">Reset</span>
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Beneficiari */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="card-title mb-0">
                <i className="bi bi-list me-2"></i>
                Lista Beneficiari
                {pagination?.totalItems > 0 && (
                  <span className="badge bg-primary ms-2">{pagination.totalItems}</span>
                )}
              </h5>
              {loading && (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
              )}
            </div>
            
            {beneficiari.length > 0 ? (
              <>
                {/* Vista Desktop - Tabella */}
                <div className="d-none d-lg-block">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">Nome Completo</th>
                          <th className="border-0">Codice Fiscale</th>
                          <th className="border-0">Età</th>
                          <th className="border-0">Città</th>
                          <th className="border-0">Stato</th>
                          <th className="border-0">Rendiconti</th>
                          <th className="border-0 text-center">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {beneficiari.map((beneficiario) => (
                          <tr key={beneficiario._id}>
                            <td className="align-middle">
                              <div>
                                <strong>{beneficiario.nomeCompleto}</strong>
                                <br />
                                <small className="text-muted">
                                  {new Date(beneficiario.dataNascita).toLocaleDateString('it-IT')}
                                </small>
                              </div>
                            </td>
                            <td className="align-middle">
                              <code>{beneficiario.codiceFiscale}</code>
                            </td>
                            <td className="align-middle">
                              {calcolaEta(beneficiario.dataNascita)} anni
                            </td>
                            <td className="align-middle">
                              {beneficiario.citta || 'N/A'}
                            </td>
                            <td className="align-middle">
                              <span className={`badge ${beneficiario.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                {beneficiario.isActive ? 'Attivo' : 'Inattivo'}
                              </span>
                            </td>
                            <td className="align-middle">
                              <span className="badge bg-info">
                                {beneficiario.numeroRendiconti || 0}
                              </span>
                            </td>
                            <td className="align-middle text-center">
                              <div className="btn-group btn-group-sm">
                                <Link
                                  to={`/beneficiari/${beneficiario._id}`}
                                  className="btn btn-outline-primary"
                                  title="Visualizza"
                                >
                                  <i className="bi bi-eye"></i>
                                </Link>
                                <Link
                                  to={`/beneficiari/${beneficiario._id}/modifica`}
                                  className="btn btn-outline-secondary"
                                  title="Modifica"
                                >
                                  <i className="bi bi-pencil"></i>
                                </Link>
                                {!beneficiario.isActive ? (
                                  <button
                                    className="btn btn-outline-success"
                                    onClick={() => handleAttiva(beneficiario._id)}
                                    title="Riattiva"
                                  >
                                    <i className="bi bi-check-circle"></i>
                                  </button>
                                ) : (
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDeleteClick(beneficiario)}
                                    title="Disattiva"
                                  >
                                    <i className="bi bi-x-circle"></i>
                                  </button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Vista Mobile - Cards */}
                <div className="d-lg-none">
                  <div className="list-group list-group-flush">
                    {beneficiari.map((beneficiario) => (
                      <div key={beneficiario._id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">{beneficiario.nomeCompleto}</h6>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              <span className={`badge ${beneficiario.isActive ? 'bg-success' : 'bg-secondary'}`}>
                                {beneficiario.isActive ? 'Attivo' : 'Inattivo'}
                              </span>
                              <span className="badge bg-info">
                                {beneficiario.numeroRendiconti || 0} rendiconti
                              </span>
                            </div>
                            <div className="row text-sm">
                              <div className="col-12 mb-1">
                                <small className="text-muted d-block">Codice Fiscale</small>
                                <code className="small">{beneficiario.codiceFiscale}</code>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Età</small>
                                <span>{calcolaEta(beneficiario.dataNascita)} anni</span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Città</small>
                                <span>{beneficiario.citta || 'N/A'}</span>
                              </div>
                            </div>
                            <small className="text-muted">
                              Nato il {new Date(beneficiario.dataNascita).toLocaleDateString('it-IT')}
                            </small>
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
                              title="Disattiva"
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Paginazione */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="card-footer">
                    <div className="d-flex flex-column flex-sm-row justify-content-between align-items-center gap-3">
                      <small className="text-muted">
                        Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.totalItems)} di {pagination.totalItems} risultati
                      </small>
                      <nav>
                        <ul className="pagination pagination-sm mb-0">
                          <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                            <button
                              className="page-link"
                              onClick={() => handlePageChange(pagination.currentPage - 1)}
                              disabled={pagination.currentPage === 1}
                            >
                              <i className="bi bi-chevron-left"></i>
                            </button>
                          </li>
                          
                          {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                            let pageNum;
                            if (pagination.totalPages <= 5) {
                              pageNum = i + 1;
                            } else if (pagination.currentPage <= 3) {
                              pageNum = i + 1;
                            } else if (pagination.currentPage >= pagination.totalPages - 2) {
                              pageNum = pagination.totalPages - 4 + i;
                            } else {
                              pageNum = pagination.currentPage - 2 + i;
                            }
                            
                            return (
                              <li key={pageNum} className={`page-item ${pagination.currentPage === pageNum ? 'active' : ''}`}>
                                <button
                                  className="page-link"
                                  onClick={() => handlePageChange(pageNum)}
                                >
                                  {pageNum}
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
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="card-body text-center py-5">
                <i className="bi bi-people text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 text-muted">Nessun beneficiario trovato</h5>
                <p className="text-muted">
                  {filters.search || filters.attivi !== 'tutti'
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Inizia aggiungendo il tuo primo beneficiario'
                  }
                </p>
                <Link to="/beneficiari/nuovo" className="btn btn-primary">
                  <i className="bi bi-plus-lg me-2"></i>
                  Aggiungi Beneficiario
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modal di conferma eliminazione */}
      {showDeleteModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Conferma Disattivazione</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowDeleteModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <p>
                  Sei sicuro di voler disattivare il beneficiario{' '}
                  <strong>{beneficiarioToDelete?.nomeCompleto}</strong>?
                </p>
                <p className="text-muted small">
                  Il beneficiario verrà disattivato ma i suoi dati rimarranno nel sistema.
                  Potrai riattivarlo in qualsiasi momento.
                </p>
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
                  Disattiva
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