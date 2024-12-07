import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Auth } from 'aws-amplify'; // Correctly import Auth
import jwtDecode from 'jwt-decode';
import { Container, Typography, TextField, Button, Box, Alert, Link } from '@mui/material';

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

      console.log('Decoded Token:', decodedToken);
      
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
    <Container
      maxWidth="sm"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#f7f7f7',
        padding: 4,
      }}
    >
      {/* App Title */}
      <Typography
        variant="h3"
        component="h1"
        sx={{ color: '#4CAF50', fontWeight: 'bold', marginBottom: 4, textAlign: 'center' }}
      >
        Admin Portal
      </Typography>

      {/* Login Form */}
      <Box
        sx={{
          width: '100%',
          backgroundColor: '#ffffff',
          padding: 4,
          borderRadius: 2,
          boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        }}
      >
        <Typography variant="h5" component="h2" sx={{ marginBottom: 2, textAlign: 'center' }}>
          Login
        </Typography>

        {/* Error Message */}
        {error && (
          <Alert severity="error" sx={{ marginBottom: 2 }}>
            {error}
          </Alert>
        )}

        {/* Email Input */}
        <TextField
          label="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2 }}
          autoComplete="email"
        />

        {/* Password Input */}
        <TextField
          label="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          fullWidth
          sx={{ marginBottom: 2 }}
          autoComplete="current-password"
        />

        {/* Login Button */}
        <Button
          variant="contained"
          color="success"
          fullWidth
          sx={{ paddingY: 1.5, fontSize: 16, marginBottom: 2 }}
          onClick={handleLogin}
        >
          Login
        </Button>

        {/* Signup Link */}
        <Link
          href="/signup"
          variant="body2"
          sx={{
            color: '#4CAF50',
            textAlign: 'center',
            display: 'block',
            marginTop: 2,
            textDecoration: 'underline',
          }}
        >
          Don't have an account? Sign Up
        </Link>
      </Box>
    </Container>
  );
}

export default LoginPage;
