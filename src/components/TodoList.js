import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import io from 'socket.io-client';

// Task component with animations
const Task = ({ task, onComplete, onDelete, animal }) => {
  // Add special styling for default todos
  const isDefault = task.isDefault || false;
  
  // Handler function for checkbox change
  const handleCheckboxChange = (e) => {
    // Prevent the default checkbox behavior to have more control
    e.preventDefault();
    // Call the onComplete function with the task ID
    onComplete(task._id);
  };
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, height: 0, y: -10 }}
      className={`p-4 mb-3 rounded-lg shadow-md flex items-center justify-between
        ${task.completed ? 'bg-gray-100' : 'bg-white'} 
        ${animal === 'panda' ? 'border-l-4 border-red-400' : 'border-l-4 border-blue-400'}
        ${isDefault ? 'border-r-4 border-r-yellow-400' : ''}`}
    >
      <div className="flex items-center flex-1">
        <motion.div
          whileHover={{ scale: 1.2 }}
          whileTap={{ scale: 0.9 }}
        >
          <input
            type="checkbox"
            checked={task.completed}
            onChange={handleCheckboxChange}
            className={`h-5 w-5 rounded-md mr-3 cursor-pointer 
              ${animal === 'panda' ? 'accent-red-400' : 'accent-blue-400'}`}
            id={`task-${task._id}`} // Add unique ID
          />
        </motion.div>
        <label
          htmlFor={`task-${task._id}`} // Connect label to checkbox
          className={`flex-1 text-lg cursor-pointer ${
            task.completed ? 'line-through text-gray-500' : 'text-gray-800'
          } ${isDefault ? 'font-medium' : ''}`}
          onClick={() => onComplete(task._id)} // Also toggle when clicking the text
        >
          {task.text}
          {isDefault && (
            <span className="ml-2 px-2 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded-full">Daily</span>
          )}
        </label>
      </div>
      
      {/* Only show delete button for non-default tasks */}
      {!isDefault && (
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => onDelete(task._id)}
          className="text-gray-400 hover:text-red-500 focus:outline-none ml-2"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
              clipRule="evenodd"
            />
          </svg>
        </motion.button>
      )}
    </motion.div>
  );
};

// Todo list component for an animal
const AnimalTodoList = ({ animal, socket }) => {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastRefreshTime, setLastRefreshTime] = useState(null);

  const emoji = animal === 'panda' ? '🐼' : '🐻';
  const gradientColor = animal === 'panda' ? 'from-red-300 to-red-500' : 'from-blue-300 to-blue-500';
  const buttonColor = animal === 'panda' ? 'bg-red-500 hover:bg-red-600' : 'bg-blue-500 hover:bg-blue-600';

  // Function to check if we need to reset todos (if it's a new day)
  const isNewDay = useCallback(() => {
    const lastReset = localStorage.getItem(`${animal}LastReset`);
    if (!lastReset) return true;
    
    const now = new Date();
    const lastResetDate = new Date(lastReset);
    
    // Check if it's a different day
    return now.getDate() !== lastResetDate.getDate() ||
           now.getMonth() !== lastResetDate.getMonth() ||
           now.getFullYear() !== lastResetDate.getFullYear();
  }, [animal]);

  // Function to check if it's morning (between 5am and 11am)
  const isMorningTime = useCallback(() => {
    const now = new Date();
    const hours = now.getHours();
    return hours >= 5 && hours < 11;
  }, []);

  // Auto refresh function that checks if tasks need to be reset
  const autoRefreshTasks = useCallback(async () => {
    const now = new Date();
    
    // Check if we need to reset (if it's a new day and morning time)
    if (isNewDay() && isMorningTime()) {
      console.log(`Auto-refreshing default todos for ${animal} (new day morning)`);
      await fetchTasks(true);
      setLastRefreshTime(now);
    } else {
      // Just fetch the current todos without resetting
      await fetchTasks(false);
    }
  }, [isNewDay, isMorningTime, animal]);

  // Fetch tasks from API
  const fetchTasks = useCallback(async (shouldReset = false) => {
    try {
      setLoading(true);
      
      // If it's a new day or forced reset, try to reset the todos first
      if (shouldReset || isNewDay()) {
        console.log(`Attempting to reset default todos for ${animal} (new day or forced reset)`);
        try {
          await resetDefaultTodos();
        } catch (resetErr) {
          console.error('Reset failed, falling back to direct creation:', resetErr);
          await createDefaultTasks();
        }
        
        // Update last reset time
        localStorage.setItem(`${animal}LastReset`, new Date().toISOString());
      } 
      
      // Just fetch the current todos for this animal
      const response = await axios.get(`/api/todos?animal=${animal}`);
      
      if (response.data.length === 0) {
        // If no todos exist, create default ones
        console.log(`No todos found for ${animal}, creating defaults`);
        await createDefaultTasks();
        
        // Fetch again to get the newly created tasks
        const newResponse = await axios.get(`/api/todos?animal=${animal}`);
        setTasks(newResponse.data);
      } else {
        setTasks(response.data);
      }
      
      setError(null);
    } catch (err) {
      console.error('Error fetching tasks:', err);
      setError(`Failed to load tasks: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, [isNewDay, animal]);

  // Create default tasks directly
  const createDefaultTasks = async () => {
    try {
      const defaultTasks = [
        { text: 'Breakfast', isDefault: true },
        { text: 'Lunch', isDefault: true },
        { text: 'Dinner', isDefault: true },
        { text: 'Daily Walk', isDefault: true }
      ];
      
      // Create each default task
      for (const task of defaultTasks) {
        try {
          await axios.post('/api/todos', {
            ...task,
            animal
          });
        } catch (err) {
          console.error(`Failed to create task "${task.text}":`, err);
        }
      }
      
      console.log(`Created default tasks for ${animal}`);
    } catch (err) {
      console.error('Error creating default tasks:', err);
      setError(`Failed to create default tasks: ${err.message}`);
    }
  };

  // Reset default todos
  const resetDefaultTodos = async () => {
    try {
      console.log(`Attempting to reset default todos for ${animal}`);
      
      // Delete any existing default todos and create new ones
      const response = await axios.post('/api/todos/reset-defaults', { animal });
      console.log(`Reset response for ${animal}:`, response.data);
      
      return response.data;
    } catch (err) {
      console.error(`Error resetting default todos for ${animal}:`, err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      throw err; // Re-throw to handle in the calling function
    }
  };

  // Add a new task
  const addTask = async (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;

    try {
      console.log(`Attempting to add task for ${animal}: "${newTask}"`);
      
      // Ensure the auth token is included
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Make the add request with explicit headers
      const response = await axios.post('/api/todos', {
        text: newTask,
        animal
      }, config);
      console.log('Add response:', response.data);
      
      // Clear the input field
      setNewTask('');
      
      // Update local state as a fallback in case socket update is delayed
      setTasks(prevTasks => [response.data, ...prevTasks]);
    } catch (err) {
      console.error('Error adding task:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Status code:', err.response ? err.response.status : 'No status code');
      
      if (err.response && err.response.status === 401) {
        // Authentication error
        setError('Authentication error. Please log in again.');
      } else {
        setError(`Failed to add task: ${err.message}`);
      }
    }
  };

  // Toggle completion status
  const toggleComplete = async (taskId) => {
    try {
      // Find the specific task to update by ID
      const taskToUpdate = tasks.find(task => task._id === taskId);
      if (!taskToUpdate) {
        console.error(`Task with ID ${taskId} not found in state`);
        return;
      }

      console.log(`Toggling completion for task: "${taskToUpdate.text}" (${taskId}), current status: ${taskToUpdate.completed}`);
      
      // Ensure the auth token is included
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Create a copy of the new completion state to ensure consistency
      const newCompletedState = !taskToUpdate.completed;
      
      // First update the local state immediately for a responsive feel
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task._id === taskId ? { ...task, completed: newCompletedState } : task
        )
      );
      
      // Then make the API call to update the server with exact ID and state
      const response = await axios.put(`/api/todos/${taskId}`, {
        completed: newCompletedState
      }, config);
      
      console.log('Toggle response from server:', response.data);
      
      // If the server response doesn't match our local update, sync with server state
      if (response.data.completed !== newCompletedState) {
        console.log('Server state different from local, syncing with server');
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task._id === taskId ? { ...task, ...response.data } : task
          )
        );
      }
    } catch (err) {
      console.error('Error updating task:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Status code:', err.response ? err.response.status : 'No status code');
      
      if (err.response && err.response.status === 404) {
        // If task not found, refresh the list
        fetchTasks();
        setError('Task not found. List has been refreshed.');
      } else if (err.response && err.response.status === 401) {
        // Authentication error
        setError('Authentication error. Please log in again.');
      } else {
        setError(`Failed to update task: ${err.message}`);
        // Revert local state since the API call failed
        fetchTasks();
      }
    }
  };

  // Delete a task
  const deleteTask = async (taskId) => {
    try {
      console.log(`Attempting to delete task with ID: ${taskId}`);
      
      // Ensure the auth token is included
      const token = localStorage.getItem('token');
      const config = {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      };
      
      // Update local state first for immediate feedback
      setTasks(prevTasks => prevTasks.filter(task => task._id !== taskId));
      
      // Make the delete request with explicit headers
      const response = await axios.delete(`/api/todos/${taskId}`, config);
      console.log('Delete response:', response.data);
    } catch (err) {
      console.error('Error deleting task:', err);
      console.error('Error details:', err.response ? err.response.data : 'No response data');
      console.error('Status code:', err.response ? err.response.status : 'No status code');
      
      if (err.response && err.response.status === 404) {
        // If task not found, it's already gone, so no need to update local state
        setError('Task may have already been deleted');
      } else if (err.response && err.response.status === 401) {
        // Authentication error
        setError('Authentication error. Please log in again.');
        // Refresh the list to show accurate state
        fetchTasks();
      } else {
        setError(`Failed to delete task: ${err.message}`);
        // Refresh the list since the delete failed
        fetchTasks();
      }
    }
  };

  // Listen for task updates
  useEffect(() => {
    if (!socket) return;
    
    socket.on('taskUpdate', (updatedTasks) => {
      // Filter tasks for this animal only
      const animalTasks = updatedTasks.filter(task => task.animal === animal);
      setTasks(animalTasks);
    });
    
    return () => {
      socket.off('taskUpdate');
    };
  }, [socket, animal]);

  // Initial load and auto refresh
  useEffect(() => {
    // Initial fetch
    autoRefreshTasks();
    
    // Set up auto refresh every hour to check for morning time
    const refreshInterval = setInterval(() => {
      autoRefreshTasks();
    }, 60 * 60 * 1000); // Check every hour
    
    return () => clearInterval(refreshInterval);
  }, [autoRefreshTasks]);

  // Sort tasks by completion status and default status
  const sortedTasks = [...tasks].sort((a, b) => {
    // First sort by completion status
    if (a.completed !== b.completed) {
      return a.completed ? 1 : -1;
    }
    
    // Then sort by default status
    if (a.isDefault !== b.isDefault) {
      return a.isDefault ? -1 : 1;
    }
    
    // Then sort by creation date (newest first)
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-lg overflow-hidden flex flex-col"
    >
      {/* Header with gradient */}
      <div className="relative h-20 flex items-center justify-center">
        <div className={`absolute inset-0 bg-gradient-to-r ${gradientColor} opacity-90`}></div>
        <motion.div 
          whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
          transition={{ duration: 0.5 }}
          className="text-4xl z-10 drop-shadow-md"
        >
          {emoji}
        </motion.div>
      </div>

      {/* Content */}
      <div className="p-6 flex-grow">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            {animal === 'panda' ? 'Panda\'s Todos' : 'Bear\'s Todos'}
          </h2>
          
          {/* Auto-refresh message instead of buttons */}
          <div className="text-xs text-gray-500">
            Daily tasks auto-reset every morning
          </div>
        </div>

        {/* Add task form */}
        <form onSubmit={addTask} className="mb-6">
          <div className="flex">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Add a new task..."
              className="flex-grow p-3 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className={`${buttonColor} text-white px-4 py-2 rounded-r-lg transition-colors`}
            >
              Add
            </motion.button>
          </div>
        </form>

        {/* Error message */}
        {error && (
          <div className="bg-red-100 text-red-700 p-2 rounded mb-4">
            {error}
          </div>
        )}

        {/* Task list */}
        <div className="space-y-1">
          {loading ? (
            <div className="text-center py-4 text-gray-500">Loading tasks...</div>
          ) : sortedTasks.length === 0 ? (
            <div className="text-center py-4 text-gray-500">No tasks yet. Add one above!</div>
          ) : (
            <div>
              <AnimatePresence>
                {sortedTasks.map(task => (
                  <Task
                    key={task._id}
                    task={task}
                    onComplete={toggleComplete}
                    onDelete={deleteTask}
                    animal={animal}
                  />
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// Main TodoList component
const TodoList = () => {
  const [socket, setSocket] = useState(null);

  // Initialize socket connection
  useEffect(() => {
    console.log('Connecting to socket at:', axios.defaults.baseURL);
    
    // Create socket with the correct backend URL and reconnection options
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
    
    // Log socket connection events
    newSocket.on('connect', () => {
      console.log('Socket connected successfully');
    });
    
    newSocket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
    
    setSocket(newSocket);
    
    // Clean up socket connection
    return () => {
      console.log('Disconnecting socket');
      newSocket.disconnect();
    };
  }, []);

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6 text-gray-800 flex items-center">
          <span className="mr-3">📝</span>
          Our To-Do Lists
        </h1>
        <p className="text-gray-600 max-w-2xl">
          Keep track of your daily activities, goals, and tasks together! Daily tasks automatically reset each morning.
          <span className="text-blue-500 ml-1">All changes appear in real-time for both users.</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <AnimalTodoList animal="panda" socket={socket} />
        <AnimalTodoList animal="bear" socket={socket} />
      </div>
    </div>
  );
};

export default TodoList;
