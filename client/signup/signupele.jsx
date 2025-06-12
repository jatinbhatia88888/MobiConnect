import React from 'react';
import './src/signupform.css'; 

export const SignUp = (
    {url}
) => {
  return (
    <div className="signup-wrapper">
      <div className="main-content">
        
        <div className="signup-left">
          <div className="page-title">Sign Up</div>
          <div className="signup-box">
            <h2>Create Account</h2>
            <form type="post" action ={url}>
              <input type="text" placeholder="Username" />
              <input type="email" placeholder="Email" />
              <input type="password" placeholder="Password" />
              <input type="password" placeholder="Confirm Password" />
              <button type="submit">Sign Up</button>
              <button type="button" className="google-signin">
                <i className="fab fa-google"></i> Sign up with Google
              </button>
            </form>
          </div>
        </div>

        
        <div className="signup-right">
          <div className="branding">
            <img src="/logo.png" alt="Logo" className="logo-img" />
            <h1>MobiConnect</h1>
            <p>Connect. Chat. Collaborate.</p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          © 2025 MobiConnect. All rights reserved.
        </div>
        <div className="footer-social">
          <a href="#"><i className="fab fa-facebook-f"></i></a>
          <a href="#"><i className="fab fa-twitter"></i></a>
          <a href="#"><i className="fab fa-instagram"></i></a>
        </div>
      </footer>
    </div>
  );
};


