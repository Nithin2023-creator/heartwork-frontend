import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useSocket } from '../context/SocketContext';
import { showNotification, checkSecureContext } from '../utils/notificationUtil';
import axios from 'axios';

const Dashboard = () => {
  const [hoverEmoji, setHoverEmoji] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationResult, setSimulationResult] = useState(null);
  
  const features = [
    {
      title: 'Sticky Notes',
      description: 'Share thoughts and sweet reminders in our private space.',
      emoji: '🐼',
      path: '/notes',
      color: 'from-red-300 to-red-500'
    },
    {
      title: 'Our Gallery',
      description: 'Collect memories that tell our unique story.',
      emoji: '🐻',
      path: '/gallery',
      color: 'from-blue-300 to-blue-500'
    },
    {
      title: 'To-Do Lists',
      description: 'Keep track of daily activities and goals together.',
      emoji: '📝',
      path: '/todos',
      color: 'from-purple-300 to-purple-500'
    }
  ];

  const { notificationsEnabled } = useSocket();

  const simulateAddNote = async () => {
    try {
      setSimulationLoading(true);
      setSimulationResult(null);
      
      const response = await axios.post('/api/notes', {
        text: `This is a test note created at ${new Date().toLocaleTimeString()}`
      });
      
      setSimulationResult({
        success: true,
        message: 'Sticky note created successfully! All connected users should receive a notification.'
      });
      
    } catch (error) {
      console.error('Error creating note:', error);
      setSimulationResult({
        success: false,
        message: `Error creating note: ${error.response?.data?.message || error.message}`
      });
    } finally {
      setSimulationLoading(false);
    }
  };

  const simulateAddImage = async () => {
    try {
      setSimulationLoading(true);
      setSimulationResult(null);
      
      setSimulationResult({
        success: true,
        message: 'This is a simulation only - to actually broadcast a gallery image notification, please upload an image in the Gallery page.'
      });
      
    } catch (error) {
      console.error('Error:', error);
      setSimulationResult({
        success: false,
        message: error.message
      });
    } finally {
      setSimulationLoading(false);
    }
  };

  // Add a function to test browser notifications directly
  const testNativeBrowserNotification = () => {
    console.log('Testing native browser notification');
    
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    
    console.log('Current notification permission:', Notification.permission);
    
    if (Notification.permission !== 'granted') {
      alert(`Notification permission is "${Notification.permission}". Please enable notifications from the navbar first.`);
      return;
    }
    
    try {
      // Create a notification using the browser's native API directly
      const notification = new Notification('Test Direct Browser Notification', {
        body: 'This notification bypasses our utility function',
        icon: '/logo192.png'
      });
      
      console.log('Native notification created:', notification);
      
      notification.onclick = () => {
        console.log('Native notification clicked');
        window.focus();
        notification.close();
      };
      
      alert('Check if you see a notification outside this browser window');
    } catch (error) {
      console.error('Error creating native notification:', error);
      alert(`Error creating notification: ${error.message}`);
    }
  };

  // Add function to check browser notification permission status
  const checkNotificationPermission = () => {
    if (!('Notification' in window)) {
      alert('This browser does not support notifications');
      return;
    }
    
    const permission = Notification.permission;
    let status = '';
    
    switch(permission) {
      case 'granted':
        status = '✅ GRANTED - You should be able to receive notifications';
        break;
      case 'denied':
        status = '❌ DENIED - You need to update your browser settings to allow notifications';
        break;
      case 'default':
        status = '⚠️ NOT DECIDED - You need to grant permission when prompted';
        break;
      default:
        status = `Unknown status: ${permission}`;
    }
    
    alert(`Notification Permission Status: ${status}`);
    console.log('Notification permission check:', {
      permission,
      notificationsEnabled,
      isSupported: 'Notification' in window,
      userAgent: navigator.userAgent
    });
  };

  // Add a function to check environment security
  const checkEnvironment = () => {
    const securityInfo = checkSecureContext();
    let message = '';
    
    if (securityInfo.isValid) {
      if (securityInfo.isSecureContext) {
        message = '✅ You are in a secure context (HTTPS). Notifications should work properly.';
      } else if (securityInfo.isLocalhost) {
        message = '✅ You are on localhost which is considered secure for notifications.';
      }
    } else {
      message = '❌ You are not in a secure context. Notifications may not work on some browsers.';
    }
    
    if (securityInfo.protocol !== 'https:' && !securityInfo.isLocalhost) {
      message += '\n\n⚠️ Warning: Your protocol is ' + securityInfo.protocol + 
                '. Most browsers require HTTPS for notifications.';
    }
    
    alert(message);
    console.log('Environment check result:', securityInfo);
  };

  // Add function for Chrome service worker notification workaround
  const testServiceWorkerNotification = async () => {
    if (!('serviceWorker' in navigator)) {
      alert('Service Worker is not supported in this browser');
      return;
    }
    
    if (Notification.permission !== 'granted') {
      alert('Please enable notifications from the navbar first!');
      return;
    }
    
    try {
      alert('Attempting to send a notification via Service Worker...');
      
      // Check if any service worker is active
      const registration = await navigator.serviceWorker.ready;
      console.log('Service Worker registration found:', registration);
      
      // Try to show a notification through the service worker
      await registration.showNotification('Service Worker Notification', {
        body: 'This notification is sent via Service Worker (works better in Chrome)',
        icon: '/logo192.png',
        data: {
          url: window.location.href
        }
      });
      
      alert('Service Worker notification sent! Check outside the browser window.');
      console.log('Service Worker notification sent successfully');
    } catch (error) {
      console.error('Error sending Service Worker notification:', error);
      alert(`Error sending notification: ${error.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-100 p-6 sm:p-8 relative overflow-hidden">
      {/* Glossy background effect */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
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
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-30"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Bold Title with Panda & Bear Emoji */}
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="mb-20 text-center"
        >
          <div className="flex justify-center items-center space-x-4 mb-6">
            <motion.div
              initial={{ scale: 0.8, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-5xl sm:text-6xl"
            >
              🐼
            </motion.div>
            
            <motion.div
              initial={{ scaleY: 0 }}
              animate={{ scaleY: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="h-16 w-1 bg-black rounded-full"
            />
            
            <motion.div
              initial={{ scale: 0.8, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="text-5xl sm:text-6xl"
            >
              🐻
            </motion.div>
          </div>
          
          <h1 className="font-sans text-6xl sm:text-7xl font-black tracking-tight text-black mb-3 uppercase">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-black to-neutral-600">
              OUR WORLD
            </span>
          </h1>
          
          <div className="flex justify-center">
            <div className="h-1 w-24 bg-black rounded-full"></div>
          </div>
          
          <p className="mt-6 text-neutral-600 text-lg max-w-md mx-auto font-medium">
            A space created just for us
          </p>
        </motion.div>

        {/* Glossy Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -6, scale: 1.03, boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)' }}
              onHoverStart={() => setHoverEmoji(index)}
              onHoverEnd={() => setHoverEmoji(null)}
              className="bg-white rounded-2xl shadow-lg overflow-hidden group relative transition-all duration-300"
            >
              <Link to={feature.path} className="block">
                {/* Glossy card effect */}
                <div className="absolute inset-0 bg-gradient-to-br from-white to-transparent opacity-40 pointer-events-none"></div>
                
                <div className="h-24 bg-gradient-to-r w-full relative overflow-hidden flex items-center justify-center">
                  <div className={`absolute inset-0 bg-gradient-to-r ${feature.color} opacity-90`}></div>
                  
                  <motion.div 
                    animate={{
                      scale: hoverEmoji === index ? 1.2 : 1,
                      rotate: hoverEmoji === index ? [0, -5, 5, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                    className="text-5xl z-10 drop-shadow-md"
                  >
                    {feature.emoji}
                  </motion.div>
                </div>
                
                <div className="p-8">
                  <h2 className="text-2xl font-bold text-neutral-800 mb-3 group-hover:text-neutral-600 transition-colors">
                    {feature.title}
                  </h2>
                  <p className="text-neutral-600 text-lg">{feature.description}</p>
                  
                  <div className="mt-6 flex items-center text-sm font-semibold text-neutral-500 group-hover:text-neutral-700">
                    <span>Explore</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1 group-hover:ml-2 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                    </svg>
                  </div>
                </div>
              </Link>
              
              {/* Glossy highlight */}
              <div className="absolute inset-x-0 top-0 h-1/4 bg-gradient-to-b from-white to-transparent opacity-30 pointer-events-none"></div>
            </motion.div>
          ))}
        </div>

        {/* Bold Quote Section (kept as black) */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="bg-black text-white p-10 sm:p-12 rounded-2xl relative overflow-hidden shadow-xl"
        >
          {/* Glossy effect for black section */}
          <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-white to-transparent opacity-10"></div>
          
          <div className="flex flex-col sm:flex-row items-center justify-between relative z-10">
            <div className="text-5xl mb-6 sm:mb-0 sm:mr-8">
              {Math.random() > 0.5 ? '🐼' : '🐻'}
            </div>
            
            <div className="flex-1">
              <h3 className="text-2xl sm:text-3xl font-bold mb-4">Every day with you is an adventure</h3>
              <p className="text-neutral-300 font-light text-lg">
                From the smallest moments to our biggest dreams, we're building something beautiful together, one day at a time.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.8 }}
        className="mt-16 text-center"
      >
        <div className="flex justify-center items-center space-x-2">
          <span className="text-xl">🐼</span>
          <span className="text-neutral-400 font-medium">×</span>
          <span className="text-xl">🐻</span>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.6 }}
        className="mt-10 bg-white p-6 rounded-2xl shadow-lg max-w-3xl mx-auto"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center">
          <span className="mr-2">🔔</span>
          Notification Testing Center
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          Use these buttons to test different types of notifications. Make sure to enable notifications in the navbar first!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={() => {
              if (notificationsEnabled) {
                showNotification('New Sticky Note Added', {
                  body: 'Someone just added a new note: "Remember to check the calendar for our date night!"',
                  icon: '/logo192.png',
                  tag: 'test-note',
                  onClick: () => {
                    window.location.href = '/notes';
                  }
                });
              } else {
                alert('Please enable notifications from the navbar first!');
              }
            }}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white rounded-xl shadow-md transform transition-transform hover:scale-105"
          >
            <span>📝</span>
            Test Sticky Note Notification
          </button>
          
          <button
            onClick={() => {
              if (notificationsEnabled) {
                showNotification('New Photo Added', {
                  body: 'Someone just uploaded a new photo to the gallery!',
                  icon: '/logo192.png',
                  tag: 'test-gallery',
                  onClick: () => {
                    window.location.href = '/gallery';
                  }
                });
              } else {
                alert('Please enable notifications from the navbar first!');
              }
            }}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-blue-400 to-blue-500 hover:from-blue-500 hover:to-blue-600 text-white rounded-xl shadow-md transform transition-transform hover:scale-105"
          >
            <span>🖼️</span>
            Test Gallery Notification
          </button>
          
          <button
            onClick={testNativeBrowserNotification}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white rounded-xl shadow-md transform transition-transform hover:scale-105 mt-4 w-full"
          >
            <span>🧪</span>
            Test Native Browser Notification API
          </button>
          
          <button
            onClick={checkNotificationPermission}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white rounded-xl shadow-md transform transition-transform hover:scale-105 mt-4 w-full"
          >
            <span>🔍</span>
            Check Notification Permission Status
          </button>
          
          <button
            onClick={checkEnvironment}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white rounded-xl shadow-md transform transition-transform hover:scale-105 mt-4 w-full"
          >
            <span>🔒</span>
            Check Environment Security
          </button>
          
          <button
            onClick={testServiceWorkerNotification}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-400 to-purple-500 hover:from-purple-500 hover:to-purple-600 text-white rounded-xl shadow-md transform transition-transform hover:scale-105 mt-4 w-full"
          >
            <span>🤖</span>
            Test Service Worker Notification (Chrome Fix)
          </button>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Note: If you click the notification, it will take you to the corresponding page</p>
        </div>

        {/* Add a troubleshooting section below the notification testing center */}
        <div className="bg-gray-50 p-4 rounded-lg mt-4 text-sm">
          <h3 className="font-bold text-gray-700 mb-2">🛠️ Troubleshooting Notifications</h3>
          <ul className="list-disc pl-5 space-y-2 text-gray-600">
            <li>Make sure you've clicked the bell icon in the navbar to enable notifications</li>
            <li>Some browsers only allow notifications on secure contexts (HTTPS)</li>
            <li><strong>Windows 10 Focus Assist:</strong> Check if Focus Assist is disabled in Windows settings</li>
            <li><strong>Windows 10 Notifications:</strong> Go to Settings → System → Notifications & actions → ensure notifications are enabled</li>
            <li><strong>Windows 10 Browser:</strong> In Settings → System → Notifications & actions → make sure your browser is allowed</li>
            <li>For Chrome: Click the lock icon in address bar → Site Settings → Notifications → Allow</li>
            <li>For Firefox: Click the shield icon in address bar → Site Permissions → Notifications → Allow</li>
            <li>Try using the "Service Worker Notification" button which works better in Chrome</li>
            <li>Try using a different browser to test if the issue is browser-specific</li>
          </ul>
          
          <div className="mt-4 p-3 bg-blue-50 text-blue-700 rounded">
            <p className="font-semibold">Windows 10 Quick Fix:</p>
            <p>Many users find that notifications don't appear even when permissions are granted. Try these steps:</p>
            <ol className="list-decimal pl-5 space-y-1 mt-2">
              <li>Click the Notification icon in the taskbar (bottom right)</li>
              <li>Click "Manage notifications" at the bottom</li>
              <li>Make sure "Get notifications from apps and other senders" is ON</li>
              <li>Scroll down and ensure your browser (Chrome/Firefox/Edge) is ON</li>
              <li>Restart your browser and try again</li>
            </ol>
          </div>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="mt-8 bg-white p-6 rounded-2xl shadow-lg max-w-3xl mx-auto"
      >
        <h2 className="text-xl font-bold mb-4 text-center text-gray-800 flex items-center justify-center">
          <span className="mr-2">📡</span>
          Broadcast Simulation
        </h2>
        
        <p className="text-gray-600 text-center mb-6">
          These buttons will create real broadcast events that will send notifications to all connected users.
          Try opening the app in another browser or device to see the notifications in real-time!
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            onClick={simulateAddNote}
            disabled={simulationLoading}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white rounded-xl shadow-md transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>🚀</span>
            Create Real Sticky Note
          </button>
          
          <button
            onClick={simulateAddImage}
            disabled={simulationLoading}
            className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white rounded-xl shadow-md transform transition-transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>🔄</span>
            Simulate Gallery Upload
          </button>
        </div>
        
        {simulationResult && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-6 p-4 rounded-lg ${simulationResult.success ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}
          >
            <p className="text-center">{simulationResult.message}</p>
          </motion.div>
        )}
        
        <div className="mt-6 text-center text-xs text-gray-500">
          <p>Note: The sticky note simulation will create an actual note in the database</p>
        </div>
      </motion.div>
    </div>
  );
};

export default Dashboard;