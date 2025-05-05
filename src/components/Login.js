import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { handleLogin } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Using API URL:', axios.defaults.baseURL);

    try {
      // Explicit headers and config for the request
      const config = {
        headers: {
          'Content-Type': 'application/json',
        },
        withCredentials: false // Important: Set to false to match global config
      };
      
      console.log('Sending login request with password:', password ? '******' : 'empty');
      
      const response = await axios.post('/api/auth/login', { password }, config);
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        console.log('Login successful, setting token and redirecting');
        // Call the handleLogin function from context
        handleLogin(response.data.token);
        // Navigate to dashboard
        navigate('/dashboard');
      } else {
        console.error('Login response missing token:', response.data);
        setError('Invalid login response. Please try again.');
      }
    } catch (err) {
      console.error('Login error:', err);
      
      // More detailed error reporting
      if (err.response) {
        console.error('Error response:', err.response.data);
        console.error('Status code:', err.response.status);
        setError(`Login failed: ${err.response.data.message || 'Unknown error'}`);
      } else if (err.request) {
        console.error('No response received:', err.request);
        setError('No response from server. Please check your connection.');
      } else {
        console.error('Error details:', err.message);
        setError(`Error: ${err.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Simple function to test the API connection
  const testConnection = async () => {
    try {
      setLoading(true);
      setError('');
      const testUrl = `${axios.defaults.baseURL}/api/test`;
      console.log('Testing API connection to:', testUrl);
      
      const response = await axios.get('/api/test', { withCredentials: false });
      console.log('Test response:', response.data);
      alert(`API connection successful! Server says: ${response.data.message}`);
    } catch (err) {
      console.error('API test error:', err);
      setError('Could not connect to the API. Please check if the server is running.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-6 sm:p-8 relative overflow-hidden">
      {/* Glossy background effect similar to Dashboard */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="absolute inset-0 opacity-5">
          {[...Array(15)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-8xl transform rotate-12"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                opacity: 0.07,
                transform: `rotate(${Math.random() * 40 - 20}deg)`,
              }}
            >
              {i % 2 === 0 ? '🐼' : '🐻'}
            </div>
          ))}
        </div>
        {/* Glossy overlay */}
        <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white to-transparent opacity-30 pointer-events-none"></div>
      </div>

      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-screen">
        {/* Logo Header */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-8 text-center"
        >
          <div className="flex justify-center items-center space-x-4 mb-6">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-4xl sm:text-5xl"
            >
              🐼
            </motion.div>
            
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="h-10 w-1 bg-black rounded-full"
            />
            
            <motion.div
              initial={{ scale: 0.8, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-4xl sm:text-5xl"
            >
              🐻
            </motion.div>
          </div>
          
          <h1 className="font-sans text-4xl sm:text-5xl font-black tracking-tight text-black mb-3 uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-neutral-600">
              OUR WORLD
            </span>
          </h1>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="bg-white rounded-2xl shadow-xl overflow-hidden w-full max-w-md relative"
        >
          {/* Glossy card effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-40 pointer-events-none"></div>
          
          {/* Header with gradient */}
          <div className="h-20 bg-gradient-to-r w-full relative overflow-hidden flex items-center justify-center">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-300 to-purple-500 opacity-90"></div>
            <motion.div 
              whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
              transition={{ duration: 0.5 }}
              className="text-4xl z-10 drop-shadow-md"
            >
              🔒
            </motion.div>
          </div>
          
          <div className="p-8">
            <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">Welcome Back</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter your password"
                    required
                  />
                </div>
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-red-50 border-l-4 border-red-500 p-4 rounded"
                >
                  <p className="text-red-700 text-sm">{error}</p>
                </motion.div>
              )}

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={loading}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    <span>Verifying...</span>
                  </div>
                ) : 'Enter Our World'}
              </motion.button>
            </form>

            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={testConnection}
                disabled={loading}
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none transition-colors"
              >
                Test Connection
              </button>
            </div>
          </div>
          
          {/* Glossy highlight */}
          <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white to-transparent opacity-30 pointer-events-none"></div>
        </motion.div>
        
        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8, duration: 0.8 }}
          className="mt-8 text-center"
        >
          <p className="text-gray-500 text-sm">
            This is a private space. Unauthorized access is prohibited.
          </p>
        </motion.div>
      </div>
    </div>
  );
};

export default Login; 