import React, { useState, useEffect, useRef } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import axios from 'axios';

const StickyNote = ({ note, onEdit, onDelete }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedContent, setEditedContent] = useState(note.content);
  const noteRef = useRef(null);
  
  // Motion values for realistic paper movement
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Calculate rotation based on mouse position
  const rotateX = useTransform(mouseY, [-100, 100], [2, -2]);
  const rotateY = useTransform(mouseX, [-100, 100], [-2, 2]);
  
  // Random base rotation (-5 to 5 degrees)
  const randomRotation = note.id.charCodeAt(1) % 10 - 5;
  
  // Spring physics for smoother, more natural motion
  const springRotateX = useSpring(rotateX, { stiffness: 150, damping: 15 });
  const springRotateY = useSpring(rotateY, { stiffness: 150, damping: 15 });
  
  // Random subtle movements to simulate air flow
  const floatX = useMotionValue(0);
  const floatY = useMotionValue(0);
  
  useEffect(() => {
    // Create more pronounced wavy motion to simulate natural air flow
    const intervalId = setInterval(() => {
      // More complex wave pattern using multiple sine waves with different frequencies
      const now = Date.now();
      const primaryWave = Math.sin(now / 2000) * 0.8;
      const secondaryWave = Math.sin(now / 1200) * 0.3;
      const tertiaryWave = Math.sin(now / 700) * 0.1;
      
      // Combine waves for more natural, unpredictable movement
      floatX.set(primaryWave + secondaryWave);
      floatY.set(Math.sin(now / 1700) * 0.6 + tertiaryWave);
    }, 20);
    
    return () => clearInterval(intervalId);
  }, []);
  
  // Handle mouse move for paper tilting effect
  const handleMouseMove = (e) => {
    if (noteRef.current) {
      const rect = noteRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      mouseX.set(e.clientX - centerX);
      mouseY.set(e.clientY - centerY);
    }
  };
  
  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };
  
  // Natural-looking sticky note colors
  const colors = [
    { bg: 'bg-yellow-50', shadow: 'rgba(234, 179, 8, 0.2)' },
    { bg: 'bg-rose-50', shadow: 'rgba(236, 72, 153, 0.2)' },
    { bg: 'bg-blue-50', shadow: 'rgba(59, 130, 246, 0.2)' },
    { bg: 'bg-green-50', shadow: 'rgba(34, 197, 94, 0.2)' },
    { bg: 'bg-amber-50', shadow: 'rgba(249, 115, 22, 0.2)' },
  ];
  
  // Set a consistent color based on note id
  const colorIndex = note.id.charCodeAt(0) % colors.length;
  const { bg, shadow } = colors[colorIndex];

  const handleSave = () => {
    onEdit(note.id, editedContent);
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={noteRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotateZ: randomRotation,
        x: floatX,
        y: floatY
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      style={{ 
        rotateX: springRotateX,
        rotateY: springRotateY,
        perspective: "1000px",
        transformStyle: "preserve-3d"
      }}
      whileHover={{ 
        scale: 1.03, 
        boxShadow: `0 15px 30px -10px ${shadow}`,
        zIndex: 10
      }}
      // Add subtle corner lifting effect for more realistic paper appearance
      animate={{ 
        opacity: 1, 
        scale: 1,
        rotateZ: randomRotation,
        x: floatX,
        y: floatY,
        skewX: floatX.get() * 0.5,
        skewY: floatY.get() * 0.5
      }}
      className={`${bg} relative p-4 rounded shadow-lg w-full h-52 overflow-hidden transform-gpu`}
    >
      {/* Rugged paper texture overlay */}
      <div 
        className="absolute inset-0 opacity-30 pointer-events-none"
        style={{ 
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M11 18c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm48 25c3.866 0 7-3.134 7-7s-3.134-7-7-7-7 3.134-7 7 3.134 7 7 7zm-43-7c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm63 31c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM34 90c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zm56-76c1.657 0 3-1.343 3-3s-1.343-3-3-3-3 1.343-3 3 1.343 3 3 3zM12 86c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm28-65c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm23-11c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-6 60c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm29 22c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zM32 63c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm57-13c2.76 0 5-2.24 5-5s-2.24-5-5-5-5 2.24-5 5 2.24 5 5 5zm-9-21c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM60 91c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM35 41c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2zM12 60c1.105 0 2-.895 2-2s-.895-2-2-2-2 .895-2 2 .895 2 2 2z' fill='%23000000' fill-opacity='0.05' fill-rule='evenodd'/%3E%3C/svg%3E")`,
          mixBlendMode: "multiply"
        }}
      />
      
      {/* Slightly torn/rough edges */}
      <div className="absolute inset-0 overflow-hidden opacity-30 pointer-events-none">
        <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
          <filter id="roughpaper">
            <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="5" result="noise" />
            <feDiffuseLighting in="noise" lighting-color="white" surfaceScale="2" result="diffLight">
              <feDistantLight azimuth="45" elevation="60" />
            </feDiffuseLighting>
          </filter>
          <rect width="100%" height="100%" filter="url(#roughpaper)" opacity="0.2" />
        </svg>
      </div>
      
      {/* Enhanced thumbtack design with realistic appearance */}
      <div className="absolute -top-3 left-4 flex flex-col items-center z-20">
        <div className="relative">
          {/* Thumbtack head with metallic effect */}
          <div className="w-8 h-3 rounded-full bg-gradient-to-br from-gray-300 via-gray-100 to-gray-400 border border-gray-400 shadow-md" />
          
          {/* Thumbtack pin */}
          <div className="absolute left-1/2 top-2 -translate-x-1/2 w-1.5 h-6 bg-gradient-to-r from-gray-400 to-gray-500 rounded-b-full shadow-md" />
          
          {/* Pin point */}
          <div className="absolute left-1/2 top-7 -translate-x-1/2 w-1 h-1 bg-gray-600 rounded-full" />
          
          {/* Colored cap */}
          <div className="w-6 h-6 rounded-full absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-br from-red-400 to-red-600 border border-red-500 shadow-inner" />
          
          {/* Highlight reflection */}
          <div className="w-2 h-1 rounded-full absolute top-0 left-1/2 -translate-x-0 -translate-y-1 bg-white opacity-70" />
        </div>
        
        {/* Shadow cast by thumbtack */}
        <div className="w-4 h-1.5 bg-black opacity-20 blur-sm mt-4 rounded-full" />
      </div>
      
      {/* Horizontal ruled lines */}
      <div className="absolute inset-0 pointer-events-none">
        {Array.from({ length: 8 }).map((_, index) => (
          <div 
            key={index} 
            className="absolute left-0 right-0 h-px bg-blue-800 opacity-5"
            style={{ top: `${(index + 1) * 18 + 20}px` }}
          />
        ))}
      </div>

      {isEditing ? (
        <div className="h-full flex flex-col mt-4">
          <textarea
            value={editedContent}
            onChange={(e) => setEditedContent(e.target.value)}
            autoFocus
            className="flex-grow bg-transparent focus:outline-none resize-none p-2 font-handwriting text-lg leading-7 z-10"
            style={{ 
              backgroundImage: "none",
              fontFamily: "'Caveat', cursive",
              lineHeight: "22px",
              paddingTop: "2px"
            }}
          />
          <div className="flex justify-end space-x-2 mt-2">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsEditing(false)}
              className="px-2 py-1 text-sm text-gray-700 hover:text-gray-900 rounded-md hover:bg-black hover:bg-opacity-5"
            >
              Cancel
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleSave}
              className="px-2 py-1 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600"
            >
              Save
            </motion.button>
          </div>
        </div>
      ) : (
        <>
          <div 
            className="h-full p-2 pt-6 pl-10 overflow-y-auto cursor-pointer font-handwriting text-lg text-gray-800 break-words"
            onClick={() => setIsEditing(true)}
            style={{ 
              fontFamily: "'Caveat', cursive",
              lineHeight: "22px",
              paddingTop: "2px"
            }}
          >
            {note.content}
          </div>
          
          <motion.button
            whileHover={{ scale: 1.2 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => onDelete(note.id)}
            className="absolute bottom-2 right-2 w-6 h-6 flex items-center justify-center text-red-500 hover:bg-red-100 rounded-full"
          >
            <span className="text-lg">×</span>
          </motion.button>
        </>
      )}
      
      {/* Subtle drop shadow for depth */}
      <div className="absolute -bottom-1 left-4 right-4 h-1 bg-black opacity-5 blur-sm rounded-full" />
    </motion.div>
  );
};

const StickyNotesBoard = () => {
  const [notes, setNotes] = useState([]);
  const [newNote, setNewNote] = useState('');
  const [loading, setLoading] = useState(true);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  
  // Function to fetch notes from API
  const fetchNotes = async (isInitialLoad = false) => {
    try {
      // Only set loading state on initial load
      if (isInitialLoad) {
        setLoading(true);
      }
      
      const response = await axios.get('/api/notes');
      if (response.data && response.data.length > 0) {
        // Convert the API data format to match our UI format
        const formattedNotes = response.data.map(note => ({
          id: note._id,
          content: note.text,
          createdAt: note.createdAt
        }));
        setNotes(formattedNotes);
      } else {
        setNotes([]);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      if (isInitialLoad) {
        setLoading(false);
        setInitialLoadComplete(true);
      }
    }
  };
  
  // Initial load of notes
  useEffect(() => {
    fetchNotes(true); // Pass true to indicate initial load
  }, []);
  
  // Set up periodic refresh to get notes from other users
  useEffect(() => {
    // Only start periodic refresh after initial load is complete
    if (!initialLoadComplete) return;
    
    // Refresh every 5 seconds to get new notes from other users
    // but don't show loading indicator
    const intervalId = setInterval(() => {
      fetchNotes(false); // Pass false to indicate it's not initial load
    }, 5000);
    
    // Clean up interval on component unmount
    return () => clearInterval(intervalId);
  }, [initialLoadComplete]);

  const addNote = async () => {
    if (newNote.trim() !== '') {
      try {
        const response = await axios.post('/api/notes', { text: newNote });
        
        // Create a note object in the format our UI expects
        const note = {
          id: response.data._id,
          content: response.data.text,
          createdAt: response.data.createdAt
        };
        
        setNotes([...notes, note]);
        setNewNote('');
      } catch (error) {
        console.error('Error adding note:', error);
      }
    }
  };

  const deleteNote = async (id) => {
    try {
      await axios.delete(`/api/notes/${id}`);
      setNotes(notes.filter(note => note.id !== id));
    } catch (error) {
      console.error('Error deleting note:', error);
    }
  };

  const editNote = async (id, content) => {
    try {
      const response = await axios.put(`/api/notes/${id}`, { text: content });
      
      // Update the note in our state with the API response
      setNotes(notes.map(note => 
        note.id === id ? { 
          ...note, 
          content: response.data.text 
        } : note
      ));
    } catch (error) {
      console.error('Error updating note:', error);
    }
  };

  return (
    <div className="container mx-auto p-6">
      {/* Add Font Import for handwritten style */}
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-faces/0.0.1/caveat/index.min.css" />
      
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <span className="mr-3">📝</span>
          Shared Sticky Notes
        </h1>
        
        <div className="flex">
          <textarea
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Write a new note..."
            className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-handwriting text-lg"
            style={{ fontFamily: "'Caveat', cursive" }}
          />
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={addNote}
            className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 transition-colors"
          >
            Add Note
          </motion.button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center h-40">
          <div className="text-gray-500">Loading notes...</div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {notes.map(note => (
            <StickyNote
              key={note.id}
              note={note}
              onEdit={editNote}
              onDelete={deleteNote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default StickyNotesBoard;