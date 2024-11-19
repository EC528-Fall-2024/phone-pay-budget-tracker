import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Amplify } from 'aws-amplify';
import awsConfig from './aws-exports';
import LoginPage from './LoginPage';
import MainPage from './MainPage';

Amplify.configure(awsConfig); // Call Amplify configuration here

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin" element={<ProtectedRoute element={MainPage} />} />
      </Routes>
    </Router>
  );
}

function ProtectedRoute({ element: Component, ...rest }) {
  const isAdmin = localStorage.getItem('isAdmin');
  return isAdmin === 'true' ? <Component {...rest} /> : <Navigate to="/login" />;
}

export default App;
