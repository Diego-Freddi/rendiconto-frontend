import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '../../contexts/AuthContext';

// Schema di validazione
const schema = yup.object({
  nome: yup
    .string()
    .required('Nome richiesto')
    .min(2, 'Nome deve essere di almeno 2 caratteri'),
  cognome: yup
    .string()
    .required('Cognome richiesto')
    .min(2, 'Cognome deve essere di almeno 2 caratteri'),
  email: yup
    .string()
    .email('Email non valida')
    .required('Email richiesta'),
  codiceFiscale: yup
    .string()
    .required('Codice fiscale richiesto')
    .matches(/^[A-Z]{6}[0-9]{2}[A-Z][0-9]{2}[A-Z][0-9]{3}[A-Z]$/, 'Codice fiscale non valido'),
  password: yup
    .string()
    .min(6, 'Password deve essere di almeno 6 caratteri')
    .required('Password richiesta'),
  confirmPassword: yup
    .string()
    .oneOf([yup.ref('password')], 'Le password non coincidono')
    .required('Conferma password richiesta')
});

const Register = () => {
  const { register: registerUser, isAuthenticated, loading } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({
    resolver: yupResolver(schema)
  });

  // Se già autenticato, reindirizza alla dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const onSubmit = async (data) => {
    const { confirmPassword, ...userData } = data;
    const result = await registerUser(userData);
    // Il redirect viene gestito automaticamente dal context
  };

  return (
    <div className="min-vh-100 d-flex align-items-center bg-light py-4">
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <div className="card shadow">
              <div className="card-body p-4">
                {/* Header */}
                <div className="text-center mb-4">
                  <i className="bi bi-person-plus text-primary" style={{ fontSize: '3rem' }}></i>
                  <h3 className="mt-2">Registrati</h3>
                  <p className="text-muted">Crea il tuo account per gestire i rendiconti</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)}>
                  <div className="row">
                    {/* Nome */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="nome" className="form-label">
                        Nome *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.nome ? 'is-invalid' : ''}`}
                        id="nome"
                        placeholder="Inserisci il tuo nome"
                        {...register('nome')}
                      />
                      {errors.nome && (
                        <div className="invalid-feedback">
                          {errors.nome.message}
                        </div>
                      )}
                    </div>

                    {/* Cognome */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="cognome" className="form-label">
                        Cognome *
                      </label>
                      <input
                        type="text"
                        className={`form-control ${errors.cognome ? 'is-invalid' : ''}`}
                        id="cognome"
                        placeholder="Inserisci il tuo cognome"
                        {...register('cognome')}
                      />
                      {errors.cognome && (
                        <div className="invalid-feedback">
                          {errors.cognome.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Email */}
                  <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                      Email *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-envelope"></i>
                      </span>
                      <input
                        type="email"
                        className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                        id="email"
                        placeholder="Inserisci la tua email"
                        {...register('email')}
                      />
                      {errors.email && (
                        <div className="invalid-feedback">
                          {errors.email.message}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Codice Fiscale */}
                  <div className="mb-3">
                    <label htmlFor="codiceFiscale" className="form-label">
                      Codice Fiscale *
                    </label>
                    <div className="input-group">
                      <span className="input-group-text">
                        <i className="bi bi-card-text"></i>
                      </span>
                      <input
                        type="text"
                        className={`form-control ${errors.codiceFiscale ? 'is-invalid' : ''}`}
                        id="codiceFiscale"
                        placeholder="RSSMRA80A01H501Z"
                        style={{ textTransform: 'uppercase' }}
                        {...register('codiceFiscale')}
                      />
                      {errors.codiceFiscale && (
                        <div className="invalid-feedback">
                          {errors.codiceFiscale.message}
                        </div>
                      )}
                    </div>
                    <div className="form-text">
                      Inserisci il codice fiscale in formato standard (16 caratteri)
                    </div>
                  </div>

                  <div className="row">
                    {/* Password */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="password" className="form-label">
                        Password *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock"></i>
                        </span>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          className={`form-control ${errors.password ? 'is-invalid' : ''}`}
                          id="password"
                          placeholder="Crea una password"
                          {...register('password')}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowPassword(!showPassword)}
                        >
                          <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                        {errors.password && (
                          <div className="invalid-feedback">
                            {errors.password.message}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Conferma Password */}
                    <div className="col-md-6 mb-3">
                      <label htmlFor="confirmPassword" className="form-label">
                        Conferma Password *
                      </label>
                      <div className="input-group">
                        <span className="input-group-text">
                          <i className="bi bi-lock-fill"></i>
                        </span>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          className={`form-control ${errors.confirmPassword ? 'is-invalid' : ''}`}
                          id="confirmPassword"
                          placeholder="Ripeti la password"
                          {...register('confirmPassword')}
                        />
                        <button
                          type="button"
                          className="btn btn-outline-secondary"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          <i className={`bi ${showConfirmPassword ? 'bi-eye-slash' : 'bi-eye'}`}></i>
                        </button>
                        {errors.confirmPassword && (
                          <div className="invalid-feedback">
                            {errors.confirmPassword.message}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Submit button */}
                  <button
                    type="submit"
                    className="btn btn-primary w-100 mb-3"
                    disabled={isSubmitting || loading}
                  >
                    {isSubmitting || loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        Registrazione in corso...
                      </>
                    ) : (
                      'Registrati'
                    )}
                  </button>

                  {/* Link login */}
                  <div className="text-center">
                    <p className="mb-0">
                      Hai già un account?{' '}
                      <Link to="/login" className="text-primary text-decoration-none">
                        Accedi qui
                      </Link>
                    </p>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register; 