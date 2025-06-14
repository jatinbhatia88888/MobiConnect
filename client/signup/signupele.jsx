import React from 'react';
import './src/signupform.css'; 
import { auth, provider, signInWithPopup } from '../auth.js'
import {useState} from 'react'


export const SignUp = (
    
    {url}
) => {
    
const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
const [passwordError, setPasswordError] = useState('');
const [emailError,setemailError]=useState('');
  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setemailError("");
    setPasswordError("");
  };
const handleSubmit = async (e) => {
  e.preventDefault();

  if (formData.password !== formData.confirmPassword) {
    setPasswordError('Passwords do not match');
    return;
  }
  const res= await fetch ("http://localhost:8000/search/email",{
    method:"POST",
    headers:{'Content-Type':'application/json'},
    body:JSON.stringify({
      email:formData.email,
    })
  })
  const er= await res.json();
  console.log("email already exist",er.ext)
  if(er.exist){
    setemailError("Email already exist");
    return ;
    
  }

  setPasswordError('');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({
        name: formData.username,
        email: formData.email,
        password: formData.password,
        confirmPassword:formData.confirmPassword,
      }),
    });

    const data = await res.json();
    if (res.ok) {
      window.location.href = '/profile';
    } else {
      alert(data.error || 'Signup failed');
    }
  } catch (err) {
    console.error('Signup error:', err);
    alert('Error submitting form');
  }
};

 
  const handleGoogleSignup = async () => {
    try {
     
      const result = await signInWithPopup(auth, provider);

      const user = result.user;
      const token = await user.getIdToken(); 

     
      const res = await fetch('http://localhost:8000/signup/google', {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (data.needsProfileSetup) {
        
        localStorage.setItem('googleId', data.googleId);
        window.location.href = '/profile';
      } 
    } catch (err) {
      console.error('Google signup failed', err);
      alert('Failed to sign up with Google');
    }
  };


  return (
    <div className="signup-wrapper">
      <div className="main-content">
        
        <div className="signup-left">
          <div className="page-title">Sign Up</div>
          <div className="signup-box">
            <h2>Create Account</h2>
            <form onSubmit={handleSubmit}>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              {emailError && <div className="error-text">{emailError}</div>}
              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />
              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />
              {passwordError && <div className="error-text">{passwordError}</div>}
              <button type="submit">Sign Up</button>
              <button type="button" className="google-signin" onClick={handleGoogleSignup}>
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


