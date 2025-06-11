import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';

// Context
import { AuthProvider } from './contexts/AuthContext';
import { RendicontoProvider } from './contexts/RendicontoContext';
import { CategoriaProvider } from './contexts/CategoriaContext';
import { BeneficiarioProvider } from './contexts/BeneficiarioContext';

// Components
import Layout from './components/Layout/Layout';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Pages
import Login from './pages/Auth/Login';
import Register from './pages/Auth/Register';
import Dashboard from './pages/Dashboard/Dashboard';
import RendicontoList from './pages/Rendiconti/RendicontoList';
import RendicontoForm from './pages/Rendiconti/RendicontoForm';
import RendicontoDetail from './pages/Rendiconti/RendicontoDetail';
import Categorie from './pages/Categorie/Categorie';
import Profile from './pages/Profile/Profile';
import BeneficiariList from './pages/Beneficiari/BeneficiariList';
import BeneficiarioForm from './pages/Beneficiari/BeneficiarioForm';
import BeneficiarioDetail from './pages/Beneficiari/BeneficiarioDetail';

function App() {
  return (
    <AuthProvider>
      <RendicontoProvider>
        <CategoriaProvider>
          <BeneficiarioProvider>
            <Router>
    <div className="App">
            <Routes>
              {/* Routes pubbliche */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Routes protette */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<Dashboard />} />
                <Route path="rendiconti" element={<RendicontoList />} />
                <Route path="rendiconti/nuovo" element={<RendicontoForm />} />
                <Route path="rendiconti/:id" element={<RendicontoDetail />} />
                <Route path="rendiconti/:id/modifica" element={<RendicontoForm />} />
                <Route path="categorie" element={<Categorie />} />
                <Route path="beneficiari" element={<BeneficiariList />} />
                <Route path="beneficiari/nuovo" element={<BeneficiarioForm />} />
                <Route path="beneficiari/:id/modifica" element={<BeneficiarioForm />} />
                <Route path="beneficiari/:id" element={<BeneficiarioDetail />} />
                <Route path="profilo" element={<Profile />} />
              </Route>
              
              {/* Redirect per routes non trovate */}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
            
            {/* Toast notifications */}
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="light"
            />
    </div>
            </Router>
          </BeneficiarioProvider>
        </CategoriaProvider>
      </RendicontoProvider>
    </AuthProvider>
  );
}

export default App;
