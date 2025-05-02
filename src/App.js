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
            {showInstall && (
              <div className="fixed bottom-4 left-0 w-full flex justify-center z-50">
                <button
                  onClick={handleModalInstall}
                  className="flex items-center gap-2 px-6 py-3 rounded-full bg-green-600 text-white shadow-lg hover:bg-green-700 transition-colors text-lg font-semibold"
                >
                  <span>Install App</span>
                  <span className="text-xl">⬇️</span>
                </button>
              </div>
            )}
            
            {showInstallModal && (
              <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
                <div className="bg-white rounded-xl p-6 m-4 max-w-sm w-full shadow-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-xl font-bold text-gray-900">Install Heartwork App</h3>
                    <button 
                      onClick={handleCloseModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="text-2xl">×</span>
                    </button>
                  </div>
                  
                  <div className="mb-6">
                    <p className="text-gray-700 mb-4">Install our app on your home screen for a better experience!</p>
                    <div className="flex items-center mb-4 text-gray-700">
                      <span className="mr-2 text-xl">⚡</span>
                      <span>Faster loading</span>
                    </div>
                    <div className="flex items-center mb-4 text-gray-700">
                      <span className="mr-2 text-xl">📲</span>
                      <span>Home screen access</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <span className="mr-2 text-xl">🔌</span>
                      <span>Works offline</span>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <button
                      onClick={handleCloseModal}
                      className="mr-2 px-4 py-2 text-gray-500 hover:text-gray-700 font-medium"
                    >
                      Not now
                    </button>
                    <button
                      onClick={handleModalInstall}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors"
                    >
                      Install Now
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
