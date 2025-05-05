/**
 * Utility functions for handling browser notifications
 */

// Request notification permission from the user
export const requestNotificationPermission = async () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }

  console.log('Current notification permission:', Notification.permission);

  if (Notification.permission === 'granted') {
    console.log('Notification permission already granted');
    return true;
  }

  if (Notification.permission !== 'denied') {
    console.log('Requesting notification permission from user...');
    try {
      const permission = await Notification.requestPermission();
      console.log('Permission request result:', permission);
      return permission === 'granted';
    } catch (error) {
      console.error('Error requesting permission:', error);
      return false;
    }
  }

  console.log('Notification permission was previously denied');
  return false;
};

// Show a notification
export const showNotification = (title, options = {}) => {
  console.log('Attempting to show notification:', title);
  console.log('Current notification permission:', Notification.permission);
  
  if (!('Notification' in window)) {
    console.log('Notifications not supported in this browser');
    return;
  }
  
  if (Notification.permission !== 'granted') {
    console.log('Notification permission not granted');
    return;
  }

  // Set default icon if not provided
  const defaultOptions = {
    icon: '/logo192.png',
    badge: '/logo192.png',
    ...options
  };

  console.log('Notification options:', defaultOptions);

  try {
    const notification = new Notification(title, defaultOptions);
    console.log('Notification created successfully');
    
    // Add click handler if provided
    if (options.onClick) {
      notification.onclick = options.onClick;
      console.log('Custom click handler attached');
    } else {
      // Default click handler to focus the app
      notification.onclick = () => {
        window.focus();
        notification.close();
      };
      console.log('Default click handler attached');
    }

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};

// Check if notifications are supported and permission is granted
export const canShowNotifications = () => {
  const isSupported = 'Notification' in window;
  const isGranted = Notification.permission === 'granted';
  
  console.log('Notifications supported:', isSupported);
  console.log('Notification permission granted:', isGranted);
  
  return isSupported && isGranted;
};

// Add this function to check if we're in a secure context for notifications
export const checkSecureContext = () => {
  // Check if we're in a secure context (HTTPS or localhost)
  const isSecureContext = window.isSecureContext;
  const isLocalhost = window.location.hostname === 'localhost' || 
                      window.location.hostname === '127.0.0.1';
  const protocol = window.location.protocol;
  
  console.log('Notification environment check:', {
    isSecureContext,
    isLocalhost,
    protocol,
    location: window.location.href
  });
  
  return {
    isSecureContext,
    isLocalhost,
    protocol,
    isValid: isSecureContext || isLocalhost
  };
}; 