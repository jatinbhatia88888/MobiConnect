import React from 'react';
import './src/loginform.css';
 

export  function Form({url}) {
  return (
    <div className="login-wrapper">
  <div className="main-content">
    <div className="login-left">
      <div className="branding">
        <img className="logo-img" src="your-logo.png" alt="MobiConnect" />
        <h1>MobiConnect</h1>
        <p>Connect. Chat. Collaborate.</p>
      </div>
    </div>

    <div className="login-right">
      <div className="login-box">
        <h2 className="page-title">Login Page</h2>
        <h2>Welcome Back</h2>
        <form>
          <input type="text" placeholder="Username or Email" />
          <input type="password" placeholder="Password" />
          <button type="submit">Login</button>
        </form>
        <div className="forgot-password">Forgot Password?</div>
      </div>
    </div>
  </div>

  <footer className="footer">
    <div className="footer-social">
      <a href="#"><i className="fab fa-facebook-f"></i></a>
      <a href="#"><i className="fab fa-twitter"></i></a>
      <a href="#"><i className="fab fa-instagram"></i></a>
    </div>
    <div className="footer-content">
      © 2025 MobiConnect. All rights reserved.
    </div>
  </footer>
</div>

  );
}
