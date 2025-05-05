# Heartwork Frontend

A React-based frontend for the Heartwork application, designed to allow users to share sticky notes, gallery images and more with loved ones.

## Features

- **Sticky Notes**: Share text notes with real-time notifications
- **Gallery**: Upload and share images
- **To-Do Lists**: Create and manage shared to-do lists
- **Real-time Notifications**: Get notified when new content is added
- **Mobile Push Notifications**: Receive notifications on mobile devices even when the browser is closed

## Mobile Push Notifications

The application now supports mobile push notifications, allowing users to receive alerts on their mobile devices even when the browser is closed or the app is in the background.

### Setup Instructions

1. **Environment Setup**:
   Copy the `.env.example` file to `.env` and add your VAPID public key:
   ```
   REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
   ```

2. **Installation as PWA**:
   For the best experience on mobile devices, install the app as a Progressive Web App:
   - On Android: Use the "Add to Home Screen" option in Chrome
   - On iOS: Use Safari's share button and select "Add to Home Screen"

3. **Notification Controls**:
   - Toggle browser notifications using the "Browser" button in the navbar
   - Toggle mobile push notifications using the "Mobile" button in the navbar
   - Note: Push notifications require a secure context (HTTPS) when deployed

### Troubleshooting

If you're experiencing issues with notifications:

1. Check if your browser supports the Web Push API and Service Workers
2. Ensure you've granted notification permissions
3. Verify that you're using HTTPS or localhost (required for notifications)
4. Check your browser's notification settings
5. On Windows, check Focus Assist settings and Windows notification settings

For detailed testing and diagnostics, use the Notification Testing panel in the Dashboard.

## Development

### Installation

```bash
npm install
```

### Running the development server

```bash
npm start
```

### Building for production

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the project root with the following variables:

```
REACT_APP_API_URL=http://localhost:5000
REACT_APP_VAPID_PUBLIC_KEY=your_vapid_public_key
```

## Technologies Used

- React
- React Router
- Framer Motion
- Socket.io
- Web Push API
- Service Workers
- Tailwind CSS
