import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { requestNotificationPermission, showNotification } from '../utils/notificationUtil';

const Navbar = () => {
  const location = useLocation();
  const { handleLogout } = useAuth();
  const { notificationsEnabled, setNotificationsEnabled } = useSocket();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showInstall, setShowInstall] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstall(true);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setShowInstall(false);
      }
      setDeferredPrompt(null);
    }
  };

  const toggleNotifications = async () => {
    console.log('Toggle notifications button clicked');
    console.log('Current notification state:', notificationsEnabled);
    
    if (!('Notification' in window)) {
      alert('Your browser does not support notifications');
      return;
    }
    
    if (!notificationsEnabled) {
      console.log('Attempting to enable notifications...');
      console.log('Current permission:', Notification.permission);
      
      if (Notification.permission === 'denied') {
        alert('Notifications are blocked by your browser. Please enable them in your browser settings.');
        // Show help based on browser
        const isChrome = navigator.userAgent.indexOf("Chrome") > -1;
        const isFirefox = navigator.userAgent.indexOf("Firefox") > -1;
        
        if (isChrome) {
          alert('In Chrome: Click the lock icon in the address bar → Site settings → Notifications → Allow');
        } else if (isFirefox) {
          alert('In Firefox: Click the shield icon in the address bar → Manage permissions → Notifications → Allow');
        } else {
          alert('Please check your browser settings to enable notifications');
        }
        return;
      }
      
      const permission = await requestNotificationPermission();
      console.log('Permission request result:', permission);
      
      if (permission) {
        setNotificationsEnabled(true);
        // Show a test notification to confirm it works
        showNotification('Notifications Enabled', {
          body: 'You will now receive notifications when new notes or photos are added.',
          icon: '/logo192.png'
        });
      } else {
        alert('Could not enable notifications. Please check your browser settings.');
      }
    } else {
      console.log('Disabling notifications (locally only)');
      setNotificationsEnabled(false);
      alert('Notifications disabled. You won\'t receive alerts for new notes or photos.');
    }
  };

  const navItems = [
    { path: '/dashboard', label: 'Dashboard', emoji: '🏠' },
    { path: '/notes', label: 'Sticky Notes', emoji: '📝' },
    { path: '/gallery', label: 'Gallery', emoji: '🖼️' },
    { path: '/todos', label: 'To-Do Lists', emoji: '📋' },
  ];

  // Animation variants
  const hoverAnimation = {
    scale: 1.05,
    transition: { duration: 0.2 }
  };

  // Determine active path and get corresponding emoji
  const getActiveEmoji = () => {
    const activeItem = navItems.find(item => location.pathname === item.path);
    return activeItem?.emoji || '🏠';
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="bg-white shadow-md sticky top-0 z-50"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Left side with brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/dashboard" className="flex items-center">
              <div className="flex items-center gap-2">
                <span className="text-xl">🐼</span>
                <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-red-400 to-blue-500">
                  Our World
                </span>
                <span className="text-xl">🐻</span>
              </div>
            </Link>
          </div>
          
          {/* Center with nav items */}
          <div className="hidden sm:flex sm:items-center sm:justify-center sm:flex-1">
            <div className="flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  aria-current={location.pathname === item.path ? 'page' : undefined}
                >
                  <motion.div
                    whileHover={hoverAnimation}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                      location.pathname === item.path
                        ? item.path === '/notes'
                          ? 'bg-red-50 text-red-700 border-b-2 border-red-400'
                          : item.path === '/gallery'
                          ? 'bg-blue-50 text-blue-700 border-b-2 border-blue-400'
                          : item.path === '/todos'
                          ? 'bg-purple-50 text-purple-700 border-b-2 border-purple-400'
                          : 'bg-neutral-50 text-neutral-700 border-b-2 border-neutral-400'
                        : 'text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    <span className="mr-1">{item.emoji}</span>
                    {item.label}
                  </motion.div>
                </Link>
              ))}
            </div>
          </div>
          
          {/* Right side with logout and install */}
          <div className="flex items-center gap-2">
            {/* Notification toggle button */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleNotifications}
              className={`hidden sm:flex items-center gap-1 px-3 py-2 text-sm rounded-full ${
                notificationsEnabled 
                  ? 'bg-blue-600 text-white hover:bg-blue-700' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              } transition-colors`}
              aria-label={notificationsEnabled ? 'Disable notifications' : 'Enable notifications'}
            >
              <span>{notificationsEnabled ? '🔔' : '🔕'}</span>
              <span className="ml-1">{notificationsEnabled ? 'Notifications On' : 'Notifications Off'}</span>
            </motion.button>
            
            {showInstall && (
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleInstallClick}
                className="flex items-center gap-1 px-4 py-2 text-sm rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
              >
                <span>Install App</span>
                <span className="text-xs">⬇️</span>
              </motion.button>
            )}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleLogout}
              className="hidden sm:flex items-center gap-1 px-4 py-2 text-sm rounded-full bg-black text-white hover:bg-neutral-800 transition-colors"
            >
              <span>Logout</span>
              <span className="text-xs">👋</span>
            </motion.button>
            
            {/* Mobile menu button */}
            <div className="flex items-center sm:hidden">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-neutral-500 hover:text-neutral-700 focus:outline-none"
                aria-expanded={isMobileMenuOpen}
              >
                <span className="sr-only">Open main menu</span>
                {/* Icon when menu is closed */}
                {!isMobileMenuOpen ? (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                ) : (
                  <svg className="block h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <motion.div 
        className={`sm:hidden ${isMobileMenuOpen ? 'block' : 'hidden'}`}
        initial={{ opacity: 0, height: 0 }}
        animate={{ 
          opacity: isMobileMenuOpen ? 1 : 0,
          height: isMobileMenuOpen ? 'auto' : 0
        }}
        transition={{ duration: 0.3 }}
      >
        <div className="pt-2 pb-3 space-y-1 px-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <motion.div
                whileHover={hoverAnimation}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center px-3 py-3 rounded-md text-base font-medium ${
                  location.pathname === item.path
                    ? item.path === '/notes'
                      ? 'bg-red-50 text-red-700 border-l-4 border-red-400'
                      : item.path === '/gallery'
                      ? 'bg-blue-50 text-blue-700 border-l-4 border-blue-400'
                      : item.path === '/todos'
                      ? 'bg-purple-50 text-purple-700 border-l-4 border-purple-400'
                      : 'bg-neutral-50 text-neutral-700 border-l-4 border-neutral-400'
                    : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                }`}
              >
                <span className="mr-2 text-lg">{item.emoji}</span>
                {item.label}
              </motion.div>
            </Link>
          ))}
          
          {/* Mobile notification toggle */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={toggleNotifications}
            className={`flex w-full items-center px-3 py-3 rounded-md text-base font-medium ${
              notificationsEnabled 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            <span className="mr-2">{notificationsEnabled ? '🔔' : '🔕'}</span>
            {notificationsEnabled ? 'Disable Notifications' : 'Enable Notifications'}
          </motion.button>
          
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={handleLogout}
            className="flex w-full items-center mt-4 px-3 py-3 rounded-md text-base font-medium text-white bg-black"
          >
            <span className="mr-2">👋</span>
            Logout
          </motion.button>
        </div>
      </motion.div>
      
      {/* Animated indicator of current page - small touch */}
      <motion.div
        className="hidden sm:block absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-red-300 to-blue-300"
        layoutId="navbar-indicator"
      >
        <motion.div
          className="absolute top-0 h-full w-6"
          initial={false}
          animate={{ 
            left: location.pathname === '/notes' ? '40%' : 
                  location.pathname === '/gallery' ? '60%' :
                  location.pathname === '/todos' ? '80%' : '50%',
            backgroundColor: location.pathname === '/notes' ? '#ef4444' : 
                            location.pathname === '/gallery' ? '#3b82f6' :
                            location.pathname === '/todos' ? '#8b5cf6' : '#525252'
          }}
          transition={{ duration: 0.3 }}
        />
      </motion.div>
    </motion.nav>
  );
};

export default Navbar;
