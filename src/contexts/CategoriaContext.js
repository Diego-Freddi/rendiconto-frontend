import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const CategoriaContext = createContext();

export const useCategorie = () => {
  const context = useContext(CategoriaContext);
  if (!context) {
    throw new Error('useCategorie deve essere usato all\'interno di CategoriaProvider');
  }
  return context;
};

export const CategoriaProvider = ({ children }) => {
  const [categorie, setCategorie] = useState([]);
  const [categorieDefault, setCategorieDefault] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch tutte le categorie dell'utente (default + personalizzate)
  const fetchCategorie = async (tipo = null) => {
    try {
      setLoading(true);
      const params = tipo ? { tipo } : {};
      const response = await axios.get('/categorie', { params });
      setCategorie(response.data.categorie || []);
      return { success: true, categorie: response.data.categorie };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento delle categorie';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Fetch solo categorie default
  const fetchCategorieDefault = async (tipo = null) => {
    try {
      const params = tipo ? { tipo } : {};
      const response = await axios.get('/categorie/default', { params });
      setCategorieDefault(response.data.categorie || []);
      return { success: true, categorie: response.data.categorie };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento delle categorie default';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  // Crea nuova categoria personalizzata
  const createCategoria = async (categoriaData) => {
    try {
      setLoading(true);
      const response = await axios.post('/categorie', categoriaData);
      
      toast.success('Categoria creata con successo!');
      
      // Ricarica le categorie
      await fetchCategorie();
      
      return { success: true, categoria: response.data.categoria };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la creazione della categoria';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna categoria personalizzata
  const updateCategoria = async (id, categoriaData) => {
    try {
      setLoading(true);
      const response = await axios.put(`/categorie/${id}`, categoriaData);
      
      toast.success('Categoria aggiornata con successo!');
      
      // Ricarica le categorie
      await fetchCategorie();
      
      return { success: true, categoria: response.data.categoria };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'aggiornamento della categoria';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Elimina categoria personalizzata
  const deleteCategoria = async (id) => {
    try {
      setLoading(true);
      await axios.delete(`/categorie/${id}`);
      
      toast.success('Categoria eliminata con successo!');
      
      // Ricarica le categorie
      await fetchCategorie();
      
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'eliminazione della categoria';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Carica categorie al mount
  useEffect(() => {
    fetchCategorie(); // Carica tutte le categorie (default + personalizzate)
    fetchCategorieDefault(); // Carica solo le categorie default (senza filtro tipo)
  }, []);

  // Utility per ottenere categorie per tipo
  const getCategoriePerTipo = (tipo) => {
    if (tipo === 'entrate') {
      // Filtra solo le categorie di tipo ENTRATE
      return categorie
        .filter(cat => cat.tipo === 'ENTRATE')
        .map(cat => cat.nome)
        .sort();
    } else if (tipo === 'uscite') {
      // Filtra solo le categorie di tipo USCITE
      return categorie
        .filter(cat => cat.tipo === 'USCITE')
        .map(cat => cat.nome)
        .sort();
    }
    
    // Se non specificato, restituisci tutte
    return categorie.map(cat => cat.nome).sort();
  };

  const value = {
    categorie,
    categorieDefault,
    loading,
    fetchCategorie,
    fetchCategorieDefault,
    createCategoria,
    updateCategoria,
    deleteCategoria,
    getCategoriePerTipo
  };

  return (
    <CategoriaContext.Provider value={value}>
      {children}
    </CategoriaContext.Provider>
  );
};

export default CategoriaContext; 