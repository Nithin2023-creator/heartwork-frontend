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
import { SocketProvider } from './context/SocketContext';

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

  // Install PWA logic
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [showInstallModal, setShowInstallModal] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
      // Show banner and modal on mobile
      if (/Mobi|Android/i.test(navigator.userAgent)) {
        setShowInstallBanner(true);
        // Show a modal notification after a short delay
        setTimeout(() => {
          setShowInstallModal(true);
        }, 3000); // 3 seconds delay
      }
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleModalInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
        setShowInstallBanner(false);
        setShowInstallModal(false);
      }
      setDeferredPrompt(null);
    }
  };

  const handleCloseModal = () => setShowInstallModal(false);

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
        <SocketProvider>
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-primary-light to-secondary-light flex flex-col">
              {showInstallBanner && (
                <div className="fixed top-0 left-0 w-full z-50 flex justify-center">
                  <div className="flex items-center bg-green-600 text-white px-4 py-3 rounded-b-lg shadow-lg mt-0 w-full max-w-md mx-auto">
                    <span className="flex-1 font-semibold">Install Heartwork App for a better experience!</span>
                    <button
                      onClick={handleModalInstall}
                      className="ml-4 px-3 py-1 rounded bg-white text-green-700 font-bold hover:bg-green-100 transition-colors"
                    >
                      Install
                    </button>
                    <button
                      onClick={handleCloseModal}
                      className="ml-2 text-white hover:text-gray-200 text-xl font-bold"
                      aria-label="Close install banner"
                    >
                      ×
                    </button>
                  </div>
                </div>
              )}
              {isAuthenticated && <Navbar />}
              <div className="flex-grow">
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
                      isAuthenticated ? <Navigate to="/dashboard" /> : <Login />
                    }
                  />
                  <Route
                    path="/dashboard"
                    element={
                      isAuthenticated ? <Dashboard /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/notes"
                    element={
                      isAuthenticated ? <StickyNotes /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/gallery"
                    element={
                      isAuthenticated ? <Gallery /> : <Navigate to="/login" />
                    }
                  />
                  <Route
                    path="/todos"
                    element={
                      isAuthenticated ? <TodoList /> : <Navigate to="/login" />
                    }
                  />
                </Routes>
              </div>
              
              {/* Modal for mobile install prompt */}
              {showInstallModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                  <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                    <div className="text-center mb-4">
                      <h3 className="text-xl font-bold text-gray-900">Install Heartwork App</h3>
                      <p className="text-gray-500 mt-2">
                        Install our app for the best experience! You'll get automatic updates, offline access, and mobile notifications.
                      </p>
                    </div>
                    
                    <div className="mt-6 flex flex-col space-y-3">
                      <button
                        onClick={handleModalInstall}
                        className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded transition-colors"
                      >
                        Install Now
                      </button>
                      <button
                        onClick={handleCloseModal}
                        className="w-full py-2 px-4 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold rounded transition-colors"
                      >
                        Maybe Later
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Router>
        </SocketProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
