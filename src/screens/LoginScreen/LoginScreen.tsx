import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './LoginScreen.css';
import logo from '../../assets/logo-2.png'
import { useNavigate } from 'react-router-dom';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (username=='a' && password=='a') {
      // Handle login logic here
      // console.log('Login attempt with:', username, password);
      // alert('Login successful!');
      navigate('/UploadScreen');
    } else {
      alert('Please enter both username and password');
    }
  };

  return (
    <div className="login-page">
      <div className="login-container">
        <img src={logo} className='logo' alt="Company Logo" />

        <form onSubmit={handleLogin}>
          <div className="input-group">
            <svg className="icon" viewBox="0 0 24 24">
              <path fill="none" stroke="white" strokeWidth="1.5" d="M12,4A4,4 0 0,1 16,8A4,4 0 0,1 12,12A4,4 0 0,1 8,8A4,4 0 0,1 12,4M12,14C16.42,14 20,15.79 20,18V20H4V18C4,15.79 7.58,14 12,14Z"></path>
            </svg>
            <input 
              type="text" 
              placeholder="USERNAME" 
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="input-group">
            <svg className="icon" viewBox="0 0 24 24">
              <path fill="none" stroke="white" strokeWidth="1.5" d="M12,17A2,2 0 0,0 14,15C14,13.89 13.1,13 12,13A2,2 0 0,0 10,15A2,2 0 0,0 12,17M18,8A2,2 0 0,1 20,10V20A2,2 0 0,1 18,22H6A2,2 0 0,1 4,20V10C4,8.89 4.9,8 6,8H7V6A5,5 0 0,1 12,1A5,5 0 0,1 17,6V8H18M12,3A3,3 0 0,0 9,6V8H15V6A3,3 0 0,0 12,3Z"></path>
            </svg>
            <input 
              type="password" 
              placeholder="PASSWORD" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <button type="submit" className="login-btn">LOGIN</button>
        </form>
        
        <a href="#" className="forgot-password">Forgot password?</a>
      </div>
    </div>
  );
};

export default Login;