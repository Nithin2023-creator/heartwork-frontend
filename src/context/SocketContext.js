import React, { createContext, useContext, useState, useEffect } from 'react';
import { io } from 'socket.io-client';
import axios from 'axios';

// Create context
const SocketContext = createContext(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);

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
    });
    
    // Listen for new gallery images
    newSocket.on('newGalleryImage', (image) => {
      console.log('New gallery image received:', image);
    });
    
    setSocket(newSocket);
    
    // Clean up socket connection
    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, []);
  
  return (
    <SocketContext.Provider value={{ 
      socket
    }}>
      {children}
    </SocketContext.Provider>
  );
};

export default SocketContext; 