import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useRendiconto } from '../../contexts/RendicontoContext';
import './RendicontoList.css';

const RendicontoList = () => {
  const navigate = useNavigate();
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
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div>
              <h2 className="mb-1">Gestione Rendiconti</h2>
              <p className="text-muted mb-0">
                Visualizza e gestisci tutti i tuoi rendiconti
              </p>
            </div>
            <Link to="/rendiconti/nuovo" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              <span className="d-none d-sm-inline">Nuovo Rendiconto</span>
              <span className="d-sm-none">Nuovo</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Filtri */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-12 col-md-6 col-lg-3">
                  <label className="form-label">Cerca</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome, cognome o R.G."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="col-6 col-md-3 col-lg-2">
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
                <div className="col-6 col-md-3 col-lg-2">
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
                <div className="col-6 col-md-3 col-lg-2">
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
                <div className="col-6 col-md-3 col-lg-3 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setFilters({
                      page: 1,
                      limit: 10,
                      stato: '',
                      anno: '',
                      search: ''
                    })}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    <span className="d-none d-sm-inline">Reset Filtri</span>
                    <span className="d-sm-none">Reset</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Lista Rendiconti */}
      <div className="row">
        <div className="col-12">
          <div className="card">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                Rendiconti ({pagination?.total || 0})
              </h5>
              {loading && (
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                  <span className="visually-hidden">Caricamento...</span>
                </div>
              )}
            </div>
            
            {rendiconti.length > 0 ? (
              <>
                {/* Vista Desktop - Tabella */}
                <div className="d-none d-lg-block">
                  <div className="table-responsive">
                    <table className="table table-hover mb-0">
                      <thead className="table-light">
                        <tr>
                          <th className="border-0">Beneficiario</th>
                          <th className="border-0">R.G.</th>
                          <th className="border-0">Anno</th>
                          <th className="border-0">Stato</th>
                          <th className="border-0">Totale Entrate</th>
                          <th className="border-0">Totale Uscite</th>
                          <th className="border-0">Ultima modifica</th>
                          <th className="border-0 text-center">Azioni</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rendiconti.map((rendiconto) => (
                          <tr key={rendiconto._id} className="cursor-pointer">
                            <td className="align-middle">
                              <strong>
                                {rendiconto.beneficiarioId?.nome} {rendiconto.beneficiarioId?.cognome}
                              </strong>
                            </td>
                            <td className="align-middle">
                              {rendiconto.datiGenerali?.rg_numero || '-'}
                            </td>
                            <td className="align-middle">
                              {rendiconto.datiGenerali?.anno}
                            </td>
                            <td className="align-middle">
                              <span className={`badge ${getStatusBadge(rendiconto.stato)}`}>
                                {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                              </span>
                            </td>
                            <td className="align-middle text-success">
                              {formatCurrency(rendiconto.totaleEntrate)}
                            </td>
                            <td className="align-middle text-danger">
                              {formatCurrency(rendiconto.totaleUscite)}
                            </td>
                            <td className="align-middle">
                              {formatDate(rendiconto.updatedAt)}
                            </td>
                            <td className="align-middle text-center">
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
                </div>

                {/* Vista Mobile - Cards */}
                <div className="d-lg-none">
                  <div className="list-group list-group-flush">
                    {rendiconti.map((rendiconto) => (
                      <div key={rendiconto._id} className="list-group-item">
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="flex-grow-1">
                            <h6 className="mb-1">
                              {rendiconto.beneficiarioId?.nome} {rendiconto.beneficiarioId?.cognome}
                            </h6>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              <span className={`badge ${getStatusBadge(rendiconto.stato)}`}>
                                {rendiconto.stato.charAt(0).toUpperCase() + rendiconto.stato.slice(1)}
                              </span>
                              <small className="text-muted">
                                Anno {rendiconto.datiGenerali?.anno}
                              </small>
                              {rendiconto.datiGenerali?.rg_numero && (
                                <small className="text-muted">
                                  R.G. {rendiconto.datiGenerali.rg_numero}
                                </small>
                              )}
                            </div>
                            <div className="row text-sm">
                              <div className="col-6">
                                <small className="text-muted d-block">Entrate</small>
                                <span className="text-success fw-bold">
                                  {formatCurrency(rendiconto.totaleEntrate)}
                                </span>
                              </div>
                              <div className="col-6">
                                <small className="text-muted d-block">Uscite</small>
                                <span className="text-danger fw-bold">
                                  {formatCurrency(rendiconto.totaleUscite)}
                                </span>
                              </div>
                            </div>
                            <small className="text-muted">
                              Aggiornato il {formatDate(rendiconto.updatedAt)}
                            </small>
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
                          >
                            <i className="bi bi-trash"></i>
                          </button>
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
                        Mostrando {((pagination.currentPage - 1) * pagination.limit) + 1} - {Math.min(pagination.currentPage * pagination.limit, pagination.total)} di {pagination.total} risultati
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
                <i className="bi bi-file-earmark-text text-muted" style={{ fontSize: '3rem' }}></i>
                <h5 className="mt-3 text-muted">Nessun rendiconto trovato</h5>
                <p className="text-muted">
                  {filters.search || filters.stato || filters.anno 
                    ? 'Prova a modificare i filtri di ricerca'
                    : 'Inizia creando il tuo primo rendiconto'
                  }
                </p>
                <Link to="/rendiconti/nuovo" className="btn btn-primary">
                  <i className="bi bi-plus-circle me-2"></i>
                  Crea Rendiconto
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Dropdown menu personalizzato per azioni */}
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