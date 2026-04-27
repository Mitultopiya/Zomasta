import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../lib/api';

const FoodPartnerLogin = () => {
  const navigate = useNavigate();
  const [ errorMessage, setErrorMessage ] = useState('');
  const [ isSubmitting, setIsSubmitting ] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      setIsSubmitting(true);
      setErrorMessage('');

      await api.post('/api/auth/food-partner/login', {
        email,
        password
      });

      navigate("/create-food");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to sign in right now.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="partner-login-title">
        <header>
          <h1 id="partner-login-title" className="auth-title">Partner login</h1>
          <p className="auth-subtitle">Access your dashboard and manage orders.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {errorMessage && <p className="form-message form-message--error" role="alert">{errorMessage}</p>}
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="business@example.com" autoComplete="email" />
          </div>
          <div className="field-group">
            <label htmlFor="password">Password</label>
            <input id="password" name="password" type="password" placeholder="Password" autoComplete="current-password" />
          </div>
          <button className="auth-submit" type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
        <div className="auth-alt-action">
          New partner? <Link to="/food-partner/register">Create an account</Link>
        </div>
      </div>
    </div>
  );
};

export default FoodPartnerLogin;
