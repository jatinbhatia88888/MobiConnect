import React, { useState } from 'react';
import './src/loginform.css';
import { auth, provider, signInWithPopup } from '../auth.js';

export function Form({ url }) {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errorText, setErrorText] = useState('');

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorText('');

    try {
      const res = await fetch(url, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

     if (res.ok) {
      console.log("dataneedProfileSetup",data.needsProfileSetup);
        if (data.needsProfileSetup) {

        window.location.href = '/profile';
     } else {
       window.location.href = '/home';
    }
   } else {
     setError(data.error || 'Login failed'); 
         } 
    } catch (err) {
      console.error('Login error:', err);
      setErrorText('Something went wrong. Please try again.');
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const token = await user.getIdToken();

      const res = await fetch('http://localhost:8000/auth/google-login', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

     if (data.success) {
  if (data.needsProfileSetup) {
    window.location.href = '/profile';
  } else {
    window.location.href = '/home';
  }}
    } catch (err) {
      console.error('Google login error:', err);
      setErrorText('Google login failed');
    }
  };

  return (
    <div className="login-wrapper">
      <div className="main-content">
        <div className="login-left">
          <div className="branding">
            <img className="logo-img" src="/logo.png" alt="Logo" />
            <h1>MobiConnect</h1>
            <p>Connect seamlessly, chat freely.</p>
          </div>
        </div>

        <div className="login-right">
          <h2 className="page-title">Login Page</h2>
          <div className="login-box">
            <h2>Welcome Back</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              {errorText && <div className="error-text">{errorText}</div>}

              <button type="submit">Login</button>
              <button type="button" className="google-signin" onClick={handleGoogleLogin}>
                <i className="fab fa-google"></i> Login with Google
              </button>
            </form>
            <div className="forgot-password">Forgot password?</div>
          </div>
        </div>
      </div>

      <footer className="footer">
        <div className="footer-content">© 2025 MobiConnect. All rights reserved.</div>
        <div className="footer-social">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
          <a href="#"><i className="fab fa-linkedin-in"></i></a>
        </div>
      </footer>
    </div>
  );
}
