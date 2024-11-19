import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify'; // Correctly import Auth
import jwtDecode from 'jwt-decode';

function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      // Sign in the user
      const user = await Auth.signIn(email, password);

      // Decode the ID token to check for the Admin group
      const idToken = user.signInUserSession.idToken.jwtToken;
      const decodedToken = jwtDecode(idToken);
      const groups = decodedToken['cognito:groups'] || [];

      if (groups.includes('admins')) {
        // Store admin status and redirect to admin page
        localStorage.setItem('isAdmin', 'true');
        navigate('/admin');
      } else {
        throw new Error('Access denied. You are not an admin.');
      }
    } catch (err) {
      setError(err.message);
    }
  };

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={handleLogin}>
        <div>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button type="submit">Login</button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </form>
    </div>
  );
}

export default LoginPage;
