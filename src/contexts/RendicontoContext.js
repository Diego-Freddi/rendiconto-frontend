import React, { createContext, useContext, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const RendicontoContext = createContext();

export const useRendiconto = () => {
  const context = useContext(RendicontoContext);
  if (!context) {
    throw new Error('useRendiconto deve essere usato all\'interno di RendicontoProvider');
  }
  return context;
};

export const RendicontoProvider = ({ children }) => {
  const [rendiconti, setRendiconti] = useState([]);
  const [currentRendiconto, setCurrentRendiconto] = useState(null);
  const [categorie, setCategorie] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  });

  // Ottieni lista rendiconti
  const fetchRendiconti = async (filters = {}) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      
      Object.keys(filters).forEach(key => {
        if (filters[key]) {
          params.append(key, filters[key]);
        }
      });

      const response = await axios.get(`/rendiconti?${params.toString()}`);
      setRendiconti(response.data.rendiconti);
      setPagination(response.data.pagination);
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento dei rendiconti';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  // Ottieni singolo rendiconto
  const fetchRendiconto = async (id) => {
    try {
      setLoading(true);
      const response = await axios.get(`/rendiconti/${id}`);
      setCurrentRendiconto(response.data.rendiconto);
      return response.data.rendiconto;
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento del rendiconto';
      toast.error(message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Crea nuovo rendiconto
  const createRendiconto = async (rendicontoData) => {
    try {
      setLoading(true);
      const response = await axios.post('/rendiconti', rendicontoData);
      
      toast.success('Rendiconto creato con successo!');
      
      // Aggiorna la lista
      await fetchRendiconti();
      
      return { success: true, rendiconto: response.data.rendiconto };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la creazione del rendiconto';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna rendiconto
  const updateRendiconto = async (id, rendicontoData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/rendiconti/${id}`, rendicontoData);
      
      toast.success('Rendiconto aggiornato con successo!');
      
      // Aggiorna il rendiconto corrente se è quello modificato
      if (currentRendiconto?._id === id) {
        setCurrentRendiconto(response.data.rendiconto);
      }
      
      // Aggiorna la lista
      await fetchRendiconti();
      
      return { success: true, rendiconto: response.data.rendiconto };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'aggiornamento del rendiconto';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna stato rendiconto
  const updateStatoRendiconto = async (id, stato) => {
    try {
      setLoading(true);
      const response = await axios.patch(`/rendiconti/${id}/stato`, { stato });
      
      toast.success('Stato aggiornato con successo!');
      
      // Aggiorna il rendiconto corrente se è quello modificato
      if (currentRendiconto?._id === id) {
        setCurrentRendiconto(prev => ({ ...prev, stato }));
      }
      
      // Aggiorna la lista
      await fetchRendiconti();
      
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'aggiornamento dello stato';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Elimina rendiconto
  const deleteRendiconto = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/rendiconti/${id}`);
      
      toast.success('Rendiconto eliminato con successo!');
      
      // Rimuovi dalla lista
      setRendiconti(prev => prev.filter(r => r._id !== id));
      
      // Se era il rendiconto corrente, resettalo
      if (currentRendiconto?._id === id) {
        setCurrentRendiconto(null);
      }
      
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'eliminazione del rendiconto';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Verifica completezza rendiconto
  const checkCompletezza = async (id) => {
    try {
      const response = await axios.get(`/rendiconti/${id}/completezza`);
      return response.data;
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la verifica della completezza';
      toast.error(message);
      return null;
    }
  };

  // Ottieni categorie
  const fetchCategorie = async () => {
    try {
      const response = await axios.get('/categorie');
      setCategorie(response.data.categorie);
      return response.data.categorie;
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento delle categorie';
      toast.error(message);
      return [];
    }
  };

  // Crea categoria personalizzata
  const createCategoria = async (categoriaData) => {
    try {
      const response = await axios.post('/categorie', categoriaData);
      
      toast.success('Categoria creata con successo!');
      
      // Aggiorna la lista delle categorie
      await fetchCategorie();
      
      return { success: true, categoria: response.data.categoria };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la creazione della categoria';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Reset stato
  const resetState = () => {
    setRendiconti([]);
    setCurrentRendiconto(null);
    setCategorie([]);
    setPagination({
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 10
    });
  };

  const value = {
    // State
    rendiconti,
    currentRendiconto,
    categorie,
    loading,
    pagination,
    
    // Actions
    fetchRendiconti,
    fetchRendiconto,
    createRendiconto,
    updateRendiconto,
    updateStatoRendiconto,
    deleteRendiconto,
    checkCompletezza,
    fetchCategorie,
    createCategoria,
    resetState,
    
    // Setters
    setCurrentRendiconto
  };

  return (
    <RendicontoContext.Provider value={value}>
      {children}
    </RendicontoContext.Provider>
  );
}; 