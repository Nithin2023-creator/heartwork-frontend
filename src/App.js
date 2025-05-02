import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material';
import axios from 'axios';

// Components
import DecoyHome from './components/DecoyHome';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import StickyNotes from './components/StickyNotes';
import Gallery from './components/Gallery';
import TodoList from './components/TodoList';
import Navbar from './components/Navbar';

// Context
import { AuthProvider } from './context/AuthContext';

// Theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#2196F3',
      light: '#E3F2FD',
      dark: '#1976D2',
    },
    secondary: {
      main: '#FFFFFF',
      light: '#F5F5F5',
      dark: '#E0E0E0',
    },
  },
  typography: {
    fontFamily: '"Poppins", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontFamily: '"Dancing Script", cursive',
    },
    h2: {
      fontFamily: '"Dancing Script", cursive',
    },
  },
});

// API configuration - set URL explicitly
axios.defaults.baseURL = 'http://localhost:5000';
console.log('Setting API base URL to:', axios.defaults.baseURL);
// Important: Set withCredentials to false as we're using token-based auth
axios.defaults.withCredentials = false;

// Set up authorization header for all requests if token exists
const token = localStorage.getItem('token');
if (token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
}

// Add an interceptor to log all requests and responses
axios.interceptors.request.use(
  config => {
    // Ensure token is set for each request
    const token = localStorage.getItem('token');
    if (token && !config.headers['Authorization']) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    
    console.log(`API Request: ${config.method.toUpperCase()} ${config.url}`, config.data || 'No data');
    return config;
  },
  error => {
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

axios.interceptors.response.use(
  response => {
    console.log(`API Response: ${response.status} ${response.config.url}`, response.data);
    return response;
  },
  error => {
    console.error('API Response Error:', error.response ? 
      `${error.response.status} ${error.config.url}` : 'Network Error',
      error.response ? error.response.data : error.message
    );
    return Promise.reject(error);
  }
);

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Verify token on component mount
  useEffect(() => {
    const verifyToken = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.log('No token found in localStorage');
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      // Set token in axios headers
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
      try {
        // Try to verify the token
        console.log('Verifying token with backend');
        const response = await axios.get('/api/auth/verify');
        
        if (response.data && response.data.user) {
          console.log('Token verified successfully');
          setIsAuthenticated(true);
        } else {
          console.log('Invalid verification response');
          localStorage.removeItem('token');
          delete axios.defaults.headers.common['Authorization'];
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Token verification failed:', error);
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    verifyToken();
  }, []);
  
  const handleLogin = (token) => {
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setIsAuthenticated(false);
    setShowLogin(false);
  };

  // Wrapper to use useNavigate in a child component
  function DecoyHomeWithNavigate() {
    const navigate = useNavigate();
    return <DecoyHome onTrigger={() => {
      setShowLogin(true);
      navigate('/login');
    }} />;
  }

  // Show loading state while verifying token
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-secondary-light">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-700">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <AuthProvider value={{ isAuthenticated, handleLogin, handleLogout }}>
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light">
            {isAuthenticated && <Navbar />}
            <Routes>
              <Route
                path="/"
                element={
                  isAuthenticated ? (
                    <Navigate to="/dashboard" />
                  ) : showLogin ? (
                    <Navigate to="/login" />
                  ) : (
                    <DecoyHomeWithNavigate />
                  )
                }
              />
              <Route
                path="/login"
                element={
                  showLogin ? (
                    <Login onLogin={handleLogin} />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/dashboard"
                element={
                  isAuthenticated ? (
                    <Dashboard />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/notes"
                element={
                  isAuthenticated ? (
                    <StickyNotes />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/gallery"
                element={
                  isAuthenticated ? (
                    <Gallery />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
              <Route
                path="/todos"
                element={
                  isAuthenticated ? (
                    <TodoList />
                  ) : (
                    <Navigate to="/" />
                  )
                }
              />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
