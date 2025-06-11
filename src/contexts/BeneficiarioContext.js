import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const BeneficiarioContext = createContext();

export const useBeneficiario = () => {
  const context = useContext(BeneficiarioContext);
  if (!context) {
    throw new Error('useBeneficiario deve essere usato all\'interno di BeneficiarioProvider');
  }
  return context;
};

export const BeneficiarioProvider = ({ children }) => {
  const [beneficiari, setBeneficiari] = useState([]);
  const [currentBeneficiario, setCurrentBeneficiario] = useState(null);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Ottieni lista beneficiari
  const fetchBeneficiari = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Parametri supportati dal backend: page, limit, search, attivi
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/beneficiari?${params.toString()}`);
      
      if (response.data.success) {
        setBeneficiari(response.data.data);
        setPagination(response.data.pagination);
      } else {
        toast.error('Errore nel caricamento dei beneficiari');
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento dei beneficiari';
      toast.error(message);
      console.error('Errore fetchBeneficiari:', error);
    } finally {
      setLoading(false);
    }
  };

  // Ottieni singolo beneficiario
  const fetchBeneficiario = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/beneficiari/${id}`);
      
      if (response.data.success) {
        setCurrentBeneficiario(response.data.data);
        return response.data.data;
      } else {
        toast.error('Beneficiario non trovato');
        return null;
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento del beneficiario';
      toast.error(message);
      console.error('Errore fetchBeneficiario:', error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crea nuovo beneficiario
  const createBeneficiario = async (beneficiarioData) => {
    try {
      setLoading(true);
      const response = await axios.post('/beneficiari', beneficiarioData);
      
      if (response.data.success) {
        toast.success('Beneficiario creato con successo!');
        
        // Aggiorna la lista
        await fetchBeneficiari();
        
        return { success: true, beneficiario: response.data.data };
      } else {
        toast.error('Errore nella creazione del beneficiario');
        return { success: false, error: 'Errore nella creazione' };
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la creazione del beneficiario';
      toast.error(message);
      console.error('Errore createBeneficiario:', error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna beneficiario
  const updateBeneficiario = async (id, beneficiarioData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/beneficiari/${id}`, beneficiarioData);
      
      if (response.data.success) {
        toast.success('Beneficiario aggiornato con successo!');
        
        // Aggiorna il beneficiario corrente se è quello modificato
        if (currentBeneficiario?._id === id) {
          setCurrentBeneficiario(response.data.data);
        }
        
        // Aggiorna la lista
        await fetchBeneficiari();
        
        return { success: true, beneficiario: response.data.data };
      } else {
        toast.error('Errore nell\'aggiornamento del beneficiario');
        return { success: false, error: 'Errore nell\'aggiornamento' };
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'aggiornamento del beneficiario';
      toast.error(message);
      console.error('Errore updateBeneficiario:', error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Elimina beneficiario (soft/hard delete gestito dal backend)
  const deleteBeneficiario = async (id) => {
    try {
      setLoading(true);
      const response = await axios.delete(`/beneficiari/${id}`);
      
      if (response.data.success) {
        toast.success(response.data.message);
        
        // Aggiorna la lista
        await fetchBeneficiari();
        
        // Se era il beneficiario corrente, resettalo
        if (currentBeneficiario?._id === id) {
          setCurrentBeneficiario(null);
        }
        
        return { success: true };
      } else {
        toast.error('Errore nell\'eliminazione del beneficiario');
        return { success: false, error: 'Errore nell\'eliminazione' };
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'eliminazione del beneficiario';
      toast.error(message);
      console.error('Errore deleteBeneficiario:', error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Riattiva beneficiario
  const attivaBeneficiario = async (id) => {
    try {
      setLoading(true);
      const response = await axios.put(`/beneficiari/${id}/attiva`);
      
      if (response.data.success) {
        toast.success('Beneficiario riattivato con successo!');
        
        // Aggiorna il beneficiario corrente se è quello modificato
        if (currentBeneficiario?._id === id) {
          setCurrentBeneficiario(response.data.data);
        }
        
        // Aggiorna la lista
        await fetchBeneficiari();
        
        return { success: true, beneficiario: response.data.data };
      } else {
        toast.error('Errore nella riattivazione del beneficiario');
        return { success: false, error: 'Errore nella riattivazione' };
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la riattivazione del beneficiario';
      toast.error(message);
      console.error('Errore attivaBeneficiario:', error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Ottieni rendiconti del beneficiario
  const fetchRendicontiBeneficiario = async (beneficiarioId, filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      // Parametri supportati: page, limit
      Object.keys(filters).forEach(key => {
        if (filters[key] !== undefined && filters[key] !== '') {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/beneficiari/${beneficiarioId}/rendiconti?${params.toString()}`);
      
      if (response.data.success) {
        return {
          success: true,
          rendiconti: response.data.data,
          beneficiario: response.data.beneficiario,
          pagination: response.data.pagination
        };
      } else {
        toast.error('Errore nel caricamento dei rendiconti');
        return { success: false, error: 'Errore nel caricamento' };
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento dei rendiconti del beneficiario';
      toast.error(message);
      console.error('Errore fetchRendicontiBeneficiario:', error);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Reset stato
  const resetState = () => {
    setBeneficiari([]);
    setCurrentBeneficiario(null);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10
    });
  };

  // Cerca beneficiari (funzione di utilità)
  const searchBeneficiari = async (searchTerm) => {
    await fetchBeneficiari({ search: searchTerm, page: 1 });
  };

  // Ottieni beneficiari attivi/inattivi
  const fetchBeneficiariAttivi = async (attivi = true) => {
    await fetchBeneficiari({ attivi: attivi.toString(), page: 1 });
  };

  const value = {
    // Stato
    beneficiari,
    currentBeneficiario,
    loading,
    pagination,
    
    // Azioni CRUD
    fetchBeneficiari,
    fetchBeneficiario,
    createBeneficiario,
    updateBeneficiario,
    deleteBeneficiario,
    attivaBeneficiario,
    
    // Azioni correlate
    fetchRendicontiBeneficiario,
    searchBeneficiari,
    fetchBeneficiariAttivi,
    
    // Utilità
    resetState,
    setCurrentBeneficiario
  };

  return (
    <BeneficiarioContext.Provider value={value}>
      {children}
    </BeneficiarioContext.Provider>
  );
}; 