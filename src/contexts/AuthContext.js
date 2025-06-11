import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const AuthContext = createContext();

// Configurazione axios
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5050/api';

// Configurazione axios globale
axios.defaults.baseURL = API_BASE_URL;

// Interceptor per aggiungere il token alle richieste
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Debug solo per le richieste firma
    if (config.url?.includes('firma')) {
      console.log('Axios request config:', {
        url: config.url,
        method: config.method,
        headers: config.headers
      });
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor per gestire errori di autenticazione
axios.interceptors.response.use(
  (response) => {
    // Debug solo per le richieste firma
    if (response.config.url?.includes('firma')) {
      console.log('Axios response:', {
        url: response.config.url,
        status: response.status,
        data: response.data
      });
    }
    return response;
  },
  (error) => {
    // Debug sempre per gli errori
    console.error('Axios error:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message
    });
    
    // Solo reindirizza se siamo già autenticati e riceviamo 401
    // Evita loop se siamo già nella pagina di login
    if (error.response?.status === 401 && !window.location.pathname.includes('/login')) {
      console.log('Token scaduto, reindirizzamento al login...');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve essere usato all\'interno di AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Verifica se l'utente è autenticato al caricamento
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Verifica se il token è ancora valido
          const response = await axios.get('/auth/me');
          setUser(response.data.user);
          setIsAuthenticated(true);
        } catch (error) {
          console.error('Token non valido:', error);
          // Pulisci tutto e non reindirizzare qui (lascia che sia l'interceptor)
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setUser(null);
          setIsAuthenticated(false);
        }
      } else {
        // Nessun token salvato
        setUser(null);
        setIsAuthenticated(false);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/login', { email, password });
      
      const { token, user: userData } = response.data;
      
      // Salva token e dati utente
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setUser(userData);
      setIsAuthenticated(true);
      
      toast.success('Login effettuato con successo!');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il login';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Registrazione
  const register = async (userData) => {
    try {
      setLoading(true);
      const response = await axios.post('/auth/register', userData);
      
      const { token, user: newUser } = response.data;
      
      // Salva token e dati utente
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      setUser(newUser);
      setIsAuthenticated(true);
      
      toast.success('Registrazione completata con successo!');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la registrazione';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Errore durante il logout:', error);
    } finally {
      // Rimuovi dati locali
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      setUser(null);
      setIsAuthenticated(false);
      
      toast.info('Logout effettuato con successo');
    }
  };

  // Aggiorna profilo
  const updateProfile = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put('/auth/profile', profileData);
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profilo aggiornato con successo!');
      return { success: true };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'aggiornamento del profilo';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Aggiorna profilo completo amministratore
  const updateProfileCompleto = async (profileData) => {
    try {
      setLoading(true);
      const response = await axios.put('/auth/profile-completo', profileData);
      
      const updatedUser = response.data.user;
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      
      toast.success('Profilo completo aggiornato con successo!');
      return { success: true, user: updatedUser };
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'aggiornamento del profilo completo';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Upload firma Base64
  const uploadFirma = async (file, password) => {
    try {
      setLoading(true);
      
      // Converti file in Base64
      const firmaBase64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      
      const response = await axios.post('/auth/upload-firma', {
        firmaBase64,
        password
      });
      
      if (response.data.success) {
        // Aggiorna i dati utente con la nuova firma
        const updatedUser = { ...user, firmaImmagine: response.data.firmaUrl };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast.success('Firma caricata con successo!');
        return { success: true, firmaUrl: response.data.firmaUrl };
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante il caricamento della firma';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Elimina firma
  const deleteFirma = async (password) => {
    try {
      setLoading(true);
      
      const response = await axios.delete('/auth/delete-firma', {
        data: { password }
      });
      
      if (response.data.success) {
        // Aggiorna i dati utente rimuovendo la firma
        const updatedUser = { ...user, firmaImmagine: null };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        
        toast.success('Firma eliminata con successo!');
        return { success: true };
      }
      
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante l\'eliminazione della firma';
      toast.error(message);
      return { success: false, error: message };
    } finally {
      setLoading(false);
    }
  };

  // Verifica password
  const verifyPassword = async (password) => {
    try {
      const response = await axios.post('/auth/verify-password', { password });
      return response.data;
    } catch (error) {
      const message = error.response?.data?.message || 'Errore durante la verifica della password';
      return { success: false, valid: false, error: message };
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    register,
    logout,
    updateProfile,
    updateProfileCompleto,
    uploadFirma,
    deleteFirma,
    verifyPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 