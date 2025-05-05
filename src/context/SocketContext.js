import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';
import { requestNotificationPermission, showNotification } from '../utils/notificationUtil';

// Create context
const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);

  // Request notification permission when context is loaded
  useEffect(() => {
    const requestPermission = async () => {
      const isGranted = await requestNotificationPermission();
      setNotificationsEnabled(isGranted);
    };
    
    requestPermission();
  }, []);

  // Initialize socket connection
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    console.log('Initializing socket connection');
    
    const newSocket = io(axios.defaults.baseURL, {
      auth: {
        token: localStorage.getItem('token')
      },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      timeout: 10000,
      transports: ['websocket', 'polling']
    });
    
    // Socket connection events
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    // Listen for new sticky notes
    newSocket.on('newNote', (note) => {
      console.log('New note received:', note);
      
      if (notificationsEnabled) {
        showNotification('New Sticky Note Added', {
          body: note.text.substring(0, 50) + (note.text.length > 50 ? '...' : ''),
          icon: '/logo192.png',
          tag: 'new-note',
          onClick: () => {
            window.location.href = '/notes';
          }
        });
      }
    });
    
    // Listen for new gallery images
    newSocket.on('newGalleryImage', (image) => {
      console.log('New gallery image received:', image);
      
      if (notificationsEnabled) {
        showNotification('New Photo Added', {
          body: image.description || 'A new photo was added to the gallery',
          icon: image.imageUrl || '/logo192.png',
          tag: 'new-gallery-image',
          onClick: () => {
            window.location.href = '/gallery';
          }
        });
      }
    });
    
    setSocket(newSocket);
    
    // Clean up socket connection
    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, [notificationsEnabled]);
  
  return (
    <SocketContext.Provider value={{ socket, notificationsEnabled, setNotificationsEnabled }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 