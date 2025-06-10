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
  }, [filters]);

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
    <div className="container-fluid">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">Gestione Rendiconti</h2>
              <p className="text-muted mb-0">
                Visualizza e gestisci tutti i tuoi rendiconti
              </p>
            </div>
            <Link to="/rendiconti/nuovo" className="btn btn-primary">
              <i className="bi bi-plus-circle me-2"></i>
              Nuovo Rendiconto
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
                <div className="col-md-3">
                  <label className="form-label">Cerca</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Nome, cognome o R.G."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                  />
                </div>
                <div className="col-md-2">
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
                <div className="col-md-2">
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
                <div className="col-md-2">
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
                <div className="col-md-3 d-flex align-items-end">
                  <button
                    className="btn btn-outline-secondary"
                    onClick={() => setFilters({
                      page: 1,
                      limit: 10,
                      stato: '',
                      anno: '',
                      search: ''
                    })}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset Filtri
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
            <div className="card-header">
              <h6 className="mb-0">
                <i className="bi bi-list-ul me-2"></i>
                Rendiconti ({pagination.totalItems})
              </h6>
            </div>
            <div className="card-body p-0">
              {rendiconti.length === 0 ? (
                <div className="text-center py-5">
                  <i className="bi bi-inbox text-muted" style={{ fontSize: '3rem' }}></i>
                  <h5 className="mt-3 text-muted">Nessun rendiconto trovato</h5>
                  <p className="text-muted">
                    {filters.search || filters.stato || filters.anno 
                      ? 'Prova a modificare i filtri di ricerca'
                      : 'Inizia creando il tuo primo rendiconto'
                    }
                  </p>
                  {!filters.search && !filters.stato && !filters.anno && (
                    <Link to="/rendiconti/nuovo" className="btn btn-primary">
                      <i className="bi bi-plus-circle me-2"></i>
                      Crea Primo Rendiconto
                    </Link>
                  )}
                </div>
              ) : (
                <div className="table-container">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Beneficiario</th>
                        <th>Periodo</th>
                        <th>R.G.</th>
                        <th>Stato</th>
                        <th>Patrimonio</th>
                        <th>Entrate</th>
                        <th>Uscite</th>
                        <th>Creato</th>
                        <th>Azioni</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rendiconti.map((rendiconto) => (
                        <tr key={rendiconto._id}>
                          <td>
                            <div>
                              <div className="fw-bold">
                                {rendiconto.datiGenerali?.beneficiario?.nome} {rendiconto.datiGenerali?.beneficiario?.cognome}
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {rendiconto.datiGenerali?.mese} {rendiconto.datiGenerali?.anno}
                            </span>
                          </td>
                          <td>
                            <code>{rendiconto.datiGenerali?.rg_numero}</code>
                          </td>
                          <td>
                            <span className={`badge ${getStatusBadge(rendiconto.stato)}`}>
                              {rendiconto.stato}
                            </span>
                          </td>
                          <td>{formatCurrency(rendiconto.totalePatrimonio)}</td>
                          <td className="text-success">{formatCurrency(rendiconto.totaleEntrate)}</td>
                          <td className="text-danger">{formatCurrency(rendiconto.totaleUscite)}</td>
                          <td>{formatDate(rendiconto.createdAt)}</td>
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
                              <div className="btn-group btn-group-sm dropdown-container">
                                <button
                                  className="btn btn-outline-secondary"
                                  onClick={(e) => toggleDropdown(e, rendiconto._id)}
                                  title="Altro"
                                >
                                  <i className="bi bi-three-dots"></i>
                                </button>
                                {openDropdown === rendiconto._id && (
                                  <div 
                                    className="dropdown-menu dropdown-menu-end show dropdown-menu-table"
                                    style={{
                                      position: 'fixed',
                                      top: `${dropdownPosition.top}px`,
                                      left: `${dropdownPosition.left}px`,
                                      zIndex: 9999
                                    }}
                                  >
                                    {rendiconto.stato === 'bozza' && (
                                      <button
                                        className="dropdown-item"
                                        onClick={() => handleStatusChange(rendiconto._id, 'completato')}
                                      >
                                        <i className="bi bi-check-circle me-2"></i>
                                        Marca come Completato
                                      </button>
                                    )}
                                    {rendiconto.stato === 'completato' && (
                                      <>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => handleStatusChange(rendiconto._id, 'inviato')}
                                        >
                                          <i className="bi bi-send me-2"></i>
                                          Marca come Inviato
                                        </button>
                                        <button
                                          className="dropdown-item"
                                          onClick={() => handleStatusChange(rendiconto._id, 'bozza')}
                                        >
                                          <i className="bi bi-arrow-left me-2"></i>
                                          Torna a Bozza
                                        </button>
                                      </>
                                    )}
                                    <hr className="dropdown-divider" />
                                    {rendiconto.stato !== 'inviato' && (
                                      <button
                                        className="dropdown-item text-danger"
                                        onClick={() => handleDelete(rendiconto._id)}
                                      >
                                        <i className="bi bi-trash me-2"></i>
                                        Elimina
                                      </button>
                                    )}
                                  </div>
                                )}
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Paginazione */}
      {pagination.totalPages > 1 && (
        <div className="row mt-4">
          <div className="col-12">
            <nav>
              <ul className="pagination justify-content-center">
                <li className={`page-item ${pagination.currentPage === 1 ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.currentPage - 1)}
                    disabled={pagination.currentPage === 1}
                  >
                    Precedente
                  </button>
                </li>
                
                {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
                  <li key={page} className={`page-item ${pagination.currentPage === page ? 'active' : ''}`}>
                    <button
                      className="page-link"
                      onClick={() => handlePageChange(page)}
                    >
                      {page}
                    </button>
                  </li>
                ))}
                
                <li className={`page-item ${pagination.currentPage === pagination.totalPages ? 'disabled' : ''}`}>
                  <button
                    className="page-link"
                    onClick={() => handlePageChange(pagination.currentPage + 1)}
                    disabled={pagination.currentPage === pagination.totalPages}
                  >
                    Successiva
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
};

export default RendicontoList; 