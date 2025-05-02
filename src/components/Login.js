import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Login = ({ onLogin }) => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

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
        withCredentials: false // Important: Set to false to match our global config
      };
      
      console.log('Sending login request with password:', password ? '******' : 'empty');
      
      const response = await axios.post('/api/auth/login', { password }, config);
      console.log('Login response:', response.data);
      
      if (response.data && response.data.token) {
        console.log('Login successful, setting token and redirecting');
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token);
        // Set token in axios headers for future requests
        axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.token}`;
        // Call the onLogin callback
        onLogin(response.data.token);
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
        setError('No response from the server. Please check your connection.');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-light to-secondary-light p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md"
      >
        <div className="text-center mb-8">
          <motion.h1
            initial={{ y: -20 }}
            animate={{ y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl font-dancing text-primary mb-2"
          >
            Welcome Back
          </motion.h1>
          <p className="text-gray-600">Enter your password to continue</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-500 text-sm text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Verifying...' : 'Enter'}
          </motion.button>
          
          <div className="flex justify-center mt-4">
            <button
              type="button"
              onClick={testConnection}
              disabled={loading}
              className="text-sm text-primary hover:underline focus:outline-none"
            >
              Test Connection
            </button>
          </div>
        </form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 text-center"
        >
          <p className="text-sm text-gray-500">
            This is a private space. Unauthorized access is prohibited.
          </p>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default Login; 