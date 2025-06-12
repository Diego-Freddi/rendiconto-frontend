import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRendiconto } from '../../contexts/RendicontoContext';
import { useResponsive } from '../../hooks/useResponsive';
import './RendicontoList.css';

const RendicontoList = () => {
  const navigate = useNavigate();
  const { isMobile } = useResponsive();
  const { 
    rendiconti, 
    loading, 
    pagination, 
    fetchRendiconti, 
    deleteRendiconto,
    updateStatoRendiconto 
  } = useRendiconto();

  const [filters, setFilters] = useState({
    page: 1,
    limit: 10,
    stato: '',
    anno: '',
    search: ''
  });

  const [openDropdown, setOpenDropdown] = useState(null);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });

  // Carica rendiconti al mount e quando cambiano i filtri
  useEffect(() => {
    fetchRendiconti(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]); // fetchRendiconti non incluso nelle dipendenze per evitare loop infiniti

  // Chiudi dropdown quando si clicca fuori
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdown(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
      page: 1 // Reset pagina quando cambiano i filtri
    }));
  };

  const handlePageChange = (newPage) => {
    setFilters(prev => ({
      ...prev,
      page: newPage
    }));
  };

  const handleDelete = async (id) => {
    if (window.confirm('Sei sicuro di voler eliminare questo rendiconto?')) {
      await deleteRendiconto(id);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    await updateStatoRendiconto(id, newStatus);
    setOpenDropdown(null);
  };

  const toggleDropdown = (e, rendicontoId) => {
    e.stopPropagation();
    
    if (openDropdown === rendicontoId) {
      setOpenDropdown(null);
    } else {
      // Calcola la posizione del bottone
      const rect = e.target.getBoundingClientRect();
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
      
      setDropdownPosition({
        top: rect.bottom + scrollTop + 5, // 5px sotto il bottone
        left: rect.right + scrollLeft - 150 // Allineato a destra, larghezza menu ~150px
      });
      
      setOpenDropdown(rendicontoId);
    }
  };

  const getStatusBadge = (stato) => {
    const badges = {
      'bozza': 'bg-warning text-dark',
      'completato': 'bg-success',
      'inviato': 'bg-primary'
    };
    return badges[stato] || 'bg-secondary';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('it-IT', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('it-IT');
  };

  if (loading && rendiconti.length === 0) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '400px' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Caricamento...</span>
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* PATTERN D: Header responsive */}
      <div className={`d-flex ${isMobile ? 'flex-column gap-3' : 'justify-content-between align-items-center'} mb-4`}>
        <div className={isMobile ? 'text-center' : ''}>
          <h2 className="mb-1">Gestione Rendiconti</h2>
          <p className="text-muted mb-0">
            Visualizza e gestisci tutti i tuoi rendiconti
          </p>
        </div>
        <Link 
          to="/rendiconti/nuovo" 
          className={`btn btn-primary ${isMobile ? 'mobile-full-width' : ''}`}
        >
          <i className="bi bi-plus-circle me-2"></i>
          Nuovo Rendiconto
        </Link>
      </div>

      {/* Filtri responsive */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className={`${isMobile ? 'col-12' : 'col-md-3'}`}>
                  <label className="form-label">Cerca</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome, cognome o R.G."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <div className={`${isMobile ? 'col-6' : 'col-md-2'}`}>
                  <label className="form-label">Stato</label>
                  <select
                    className="form-select"
                    value={filters.stato}
                    onChange={(e) => handleFilterChange('stato', e.target.value)}
                  >
                    <option value="">Tutti</option>
                    <option value="bozza">Bozza</option>
                    <option value="completato">Completato</option>
                    <option value="inviato">Inviato</option>
                  </select>
                </div>
                <div className={`${isMobile ? 'col-6' : 'col-md-2'}`}>
                  <label className="form-label">Anno</label>
                  <select
                    className="form-select"
                    value={filters.anno}
                    onChange={(e) => handleFilterChange('anno', e.target.value)}
                  >
                    <option value="">Tutti</option>
                    {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className={`${isMobile ? 'col-6' : 'col-md-2'}`}>
                  <label className="form-label">Per pagina</label>
                  <select
                    className="form-select"
                    value={filters.limit}
                    onChange={(e) => handleFilterChange('limit', parseInt(e.target.value))}
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
                <div className={`${isMobile ? 'col-6' : 'col-md-3'} d-flex align-items-end`}>
                  <button
                    className={`btn btn-outline-secondary ${isMobile ? 'mobile-full-width' : ''}`}
                    onClick={() => setFilters({
                      page: 1,
                      limit: 10,
                      stato: '',
                      anno: '',
                      search: ''
                    })}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset
                  </button>
                </div>
              </div>
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
                Rendiconti ({pagination.totalItems})
              </h5>
              {loading && (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
              )}
            </div>
            <div className="card-body p-0">
              {rendiconti.length > 0 ? (
                <>
                  {/* Desktop: Tabella completa */}
                  {!isMobile && (
                    <div className="table-responsive">
                      <table className="table table-hover mb-0">
                        <thead className="table-light">
                          <tr>
                            <th>Beneficiario</th>
                            <th>R.G.</th>
                            <th>Anno</th>
                            <th>Stato</th>
                            <th>Totale Patrimonio</th>
                            <th>Ultima modifica</th>
                            <th width="120">Azioni</th>
                          </tr>
                        </thead>
                        <tbody>
                          {rendiconti.map((rendiconto) => (
                            <tr key={rendiconto._id}>
                              <td>
                                <div>
                                  <strong>
                                    {rendiconto.beneficiarioId?.nome} {rendiconto.beneficiarioId?.cognome}
                                  </strong>
                                  <br />
                                  <small className="text-muted">
                                    {rendiconto.beneficiarioId?.codiceFiscale}
                                  </small>
                                </div>
                              </td>
                              <td>{rendiconto.datiGenerali?.rg_numero || 'N/A'}</td>
                              <td>{rendiconto.datiGenerali?.anno}</td>
                              <td>
                                <span className={`badge ${getStatusBadge(rendiconto.stato)}`}>
                                  {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                                </span>
                              </td>
                              <td>
                                <strong>{formatCurrency(rendiconto.beneficiarioId?.totalePatrimonio || 0)}</strong>
                              </td>
                              <td>
                                <small>{formatDate(rendiconto.updatedAt)}</small>
                              </td>
                              <td>
                                <div className="btn-group btn-group-sm">
                                  <Link
                                    to={`/rendiconti/${rendiconto._id}`}
                                    className="btn btn-outline-primary"
                                    title="Visualizza"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </Link>
                                  {rendiconto.stato !== 'inviato' && (
                                    <Link
                                      to={`/rendiconti/${rendiconto._id}/modifica`}
                                      className="btn btn-outline-secondary"
                                      title="Modifica"
                                    >
                                      <i className="bi bi-pencil"></i>
                                    </Link>
                                  )}
                                  <button
                                    className="btn btn-outline-danger"
                                    onClick={() => handleDelete(rendiconto._id)}
                                    title="Elimina"
                                  >
                                    <i className="bi bi-trash"></i>
                                  </button>
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
                      {rendiconti.map((rendiconto) => (
                        <div key={rendiconto._id} className="card mb-3 mobile-card-compact">
                          <div className="card-body">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <h6 className="card-title mb-1">
                                  {rendiconto.beneficiarioId?.nome} {rendiconto.beneficiarioId?.cognome}
                                </h6>
                                <small className="text-muted d-block">
                                  {rendiconto.beneficiarioId?.codiceFiscale}
                                </small>
                                <small className="text-muted">
                                  R.G. {rendiconto.datiGenerali?.rg_numero || 'N/A'} - Anno {rendiconto.datiGenerali?.anno}
                                </small>
                              </div>
                              <span className={`badge ${getStatusBadge(rendiconto.stato)}`}>
                                {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                              </span>
                            </div>
                            
                            <div className="row mb-2">
                              <div className="col-6">
                                <small className="text-muted">Patrimonio:</small>
                                <div className="fw-bold">{formatCurrency(rendiconto.beneficiarioId?.totalePatrimonio || 0)}</div>
                              </div>
                              <div className="col-6">
                                <small className="text-muted">Ultima modifica:</small>
                                <div className="small">{formatDate(rendiconto.updatedAt)}</div>
                              </div>
                            </div>

                            <div className="d-flex gap-2">
                              <Link
                                to={`/rendiconti/${rendiconto._id}`}
                                className="btn btn-outline-primary btn-sm flex-fill"
                              >
                                <i className="bi bi-eye me-1"></i>
                                Visualizza
                              </Link>
                              {rendiconto.stato !== 'inviato' && (
                                <Link
                                  to={`/rendiconti/${rendiconto._id}/modifica`}
                                  className="btn btn-outline-secondary btn-sm flex-fill"
                                >
                                  <i className="bi bi-pencil me-1"></i>
                                  Modifica
                                </Link>
                              )}
                              <button
                                className="btn btn-outline-danger btn-sm"
                                onClick={() => handleDelete(rendiconto._id)}
                                title="Elimina"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-5">
                  <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-muted">Nessun rendiconto trovato</h5>
                  <p className="text-muted">
                    {filters.search || filters.stato || filters.anno ? 
                      'Prova a modificare i filtri di ricerca' : 
                      'Inizia creando il tuo primo rendiconto'
                    }
                  </p>
                  <Link to="/rendiconti/nuovo" className="btn btn-primary">
                    <i className="bi bi-plus-circle me-2"></i>
                    Crea Rendiconto
                  </Link>
                </div>
              )}
            </div>

            {/* Paginazione */}
            {pagination.totalPages > 1 && (
              <div className="card-footer">
                <nav aria-label="Paginazione rendiconti">
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

      {/* Dropdown menu per azioni (mantenuto per compatibilità) */}
      {openDropdown && (
        <div
          className="dropdown-menu show"
          style={{
            position: 'absolute',
            top: dropdownPosition.top,
            left: dropdownPosition.left,
            zIndex: 1000
          }}
        >
          <button
            className="dropdown-item"
            onClick={() => handleStatusChange(openDropdown, 'bozza')}
          >
            <i className="bi bi-pencil-square me-2"></i>
            Segna come Bozza
          </button>
          <button
            className="dropdown-item"
            onClick={() => handleStatusChange(openDropdown, 'completato')}
          >
            <i className="bi bi-check-circle me-2"></i>
            Segna come Completato
          </button>
          <button
            className="dropdown-item"
            onClick={() => handleStatusChange(openDropdown, 'inviato')}
          >
            <i className="bi bi-send me-2"></i>
            Segna come Inviato
          </button>
        </div>
      )}
    </div>
  );
};

export default RendicontoList; 