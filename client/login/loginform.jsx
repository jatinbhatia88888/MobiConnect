import React from 'react';
import './src/loginform.css';
 

export  function Form({url}) {
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
            <form>
              <input type="email" placeholder="Email" required />
              <input type="password" placeholder="Password" required />
              <button type="submit">Login</button>
              <button type="button" className="google-signin">
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
