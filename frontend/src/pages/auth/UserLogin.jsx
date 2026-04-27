import React, { useState } from 'react';
import '../../styles/auth-shared.css';
import { Link, useNavigate } from 'react-router-dom';
import api, { getApiErrorMessage } from '../../lib/api';

const UserLogin = () => {
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

      await api.post('/api/auth/user/login', {
        email,
        password
      });

      navigate("/");
    } catch (error) {
      setErrorMessage(getApiErrorMessage(error, 'Unable to sign in right now.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="auth-card" role="region" aria-labelledby="user-login-title">
        <header>
          <h1 id="user-login-title" className="auth-title">Welcome back</h1>
          <p className="auth-subtitle">Sign in to continue your food journey.</p>
        </header>
        <form className="auth-form" onSubmit={handleSubmit} noValidate>
          {errorMessage && <p className="form-message form-message--error" role="alert">{errorMessage}</p>}
          <div className="field-group">
            <label htmlFor="email">Email</label>
            <input id="email" name="email" type="email" placeholder="you@example.com" autoComplete="email" />
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
          New here? <Link to="/user/register">Create account</Link>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
