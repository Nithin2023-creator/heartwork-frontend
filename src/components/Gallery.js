import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';

const Gallery = () => {
  const [images, setImages] = useState([]);
  const [selectedImage, setSelectedImage] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  // Removed zoom states as we simplified the image preview

  useEffect(() => {
    fetchImages();
  }, []);

  useEffect(() => {
    // Clean up preview URL when component unmounts
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const fetchImages = async () => {
    try {
      const response = await axios.get('/api/gallery/images');
      setImages(response.data);
    } catch (error) {
      console.error('Error fetching images:', error);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }
      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      setSelectedFile(file);
      
      // Create a preview URL for the selected file
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const formData = new FormData();
    formData.append('image', selectedFile);

    setUploading(true);
    try {
      const response = await axios.post('/api/gallery/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      // Add the new image to the state
      setImages(prevImages => [response.data, ...prevImages]);
      
      // Reset the form
      setSelectedFile(null);
      setPreviewUrl(null);
      setShowUpload(false);
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId, e) => {
    e.stopPropagation();
    try {
      const response = await axios.delete(`/api/gallery/images/${imageId}`);
      if (response.data.message === 'Image deleted successfully') {
        setImages(images.filter(img => img._id !== imageId));
        if (selectedImage && selectedImage._id === imageId) {
          setSelectedImage(null);
        }
      }
    } catch (error) {
      console.error('Error deleting image:', error);
      alert('Failed to delete image. Please try again.');
    }
  };

  // Removed zoom handling functions as we simplified the image preview

  return (
    <div className="min-h-screen bg-neutral-100 p-6 relative overflow-hidden">
      {/* Background pattern similar to Dashboard */}
      <div className="fixed inset-0 -z-10 bg-gradient-to-br from-neutral-50 to-neutral-100">
        <div className="absolute inset-0 opacity-5">
          {[...Array(20)].map((_, i) => (
            <div 
              key={i}
              className="absolute text-8xl"
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
        <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white opacity-30"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Title section removed as requested */}

        {/* Upload section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl shadow-lg p-6 mb-8 relative overflow-hidden"
        >
          {/* Glossy effect */}
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent opacity-80"></div>
          
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-blue-600">Our Memories</h2>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowUpload(!showUpload)}
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md hover:shadow-lg transition-all duration-300 flex items-center"
            >
              {showUpload ? (
                <>
                  <span className="mr-2">✕</span>
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <span className="mr-2">+</span>
                  <span>Add Photo</span>
                </>
              )}
            </motion.button>
          </div>
          
          <AnimatePresence>
            {showUpload && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="bg-blue-50 rounded-xl p-6 mb-6">
                  <div className="flex flex-col md:flex-row gap-6 items-start">
                    <div className="flex-1">
                      <label className="block mb-4 text-blue-800 font-medium">Select an image to upload</label>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileSelect}
                          disabled={uploading}
                          className="block w-full text-sm text-gray-500
                            file:mr-4 file:py-3 file:px-6
                            file:rounded-full file:border-0
                            file:text-sm file:font-medium
                            file:bg-blue-600 file:text-white
                            hover:file:bg-blue-700
                            cursor-pointer focus:outline-none"
                        />
                      </div>
                      <p className="mt-2 text-xs text-gray-500">Maximum file size: 5MB</p>
                      
                      <div className="mt-6">
                        <motion.button
                          whileHover={{ scale: 1.03 }}
                          whileTap={{ scale: 0.97 }}
                          onClick={handleUpload}
                          disabled={!selectedFile || uploading}
                          className={`px-6 py-3 rounded-lg text-white transition-all duration-300 w-full ${
                            !selectedFile || uploading
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-gradient-to-r from-blue-500 to-blue-600 hover:shadow-md'
                          }`}
                        >
                          {uploading ? (
                            <span className="flex items-center justify-center">
                              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Uploading...
                            </span>
                          ) : 'Upload Photo'}
                        </motion.button>
                      </div>
                    </div>
                    
                    {previewUrl && (
                      <div className="w-full md:w-1/3">
                        <p className="mb-2 text-blue-800 font-medium">Preview</p>
                        <div className="relative aspect-square overflow-hidden rounded-lg shadow-md bg-white">
                          <img 
                            src={previewUrl} 
                            alt="Preview" 
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Gallery Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl shadow-lg p-6 relative overflow-hidden"
        >
          {/* Glossy effect */}
          <div className="absolute inset-x-0 top-0 h-8 bg-gradient-to-b from-white to-transparent opacity-80"></div>

          {images.length === 0 ? (
            <div className="py-16 text-center">
              <div className="text-5xl mb-4">📷</div>
              <h3 className="text-xl text-gray-600 mb-2">No photos yet</h3>
              <p className="text-gray-500">Add your first photo to start building your gallery</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              <AnimatePresence>
                {images.map((image) => (
                  <motion.div
                    key={image._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    whileHover={{ y: -5, scale: 1.03 }}
                    className="relative group overflow-hidden rounded-xl shadow-md bg-gray-100"
                    style={{ aspectRatio: "auto" }}
                  >
                    <div 
                      className="overflow-hidden cursor-pointer w-full"
                      onClick={() => setSelectedImage(image)}
                    >
                      <img
                        src={image.imageUrl}
                        alt=""
                        className="w-full object-contain transition-transform duration-500 group-hover:scale-110"
                      />
                    </div>
                    
                    {/* Hover overlay with delete button */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-between p-3">
                      <div className="text-white text-sm font-medium truncate max-w-[70%]">
                        {image.title || 'Memory'}
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={(e) => handleDelete(image._id, e)}
                        className="bg-red-500 hover:bg-red-600 text-white rounded-full p-2 shadow-lg transition-colors duration-300"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </motion.div>
      </div>

      {/* Image Preview Modal with fullscreen and animation */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-50 flex items-center justify-center"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              layoutId={`image-${selectedImage._id}`}
              className="w-full h-full flex items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <motion.img
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ 
                  scale: 1, 
                  opacity: 1,
                  transition: { 
                    duration: 0.5,
                    type: "spring", 
                    damping: 30, 
                    stiffness: 300 
                  }
                }}
                exit={{ scale: 0.8, opacity: 0 }}
                src={selectedImage.imageUrl}
                alt=""
                className="max-w-full max-h-full object-contain"
              />
            </motion.div>
            
            {/* Close button */}
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-3 hover:bg-opacity-80 transition-all duration-300"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="mt-16 text-center"
      >
        <div className="flex justify-center items-center space-x-2">
          <span className="text-xl">🐼</span>
          <span className="text-neutral-400 font-medium">×</span>
          <span className="text-xl">🐻</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Gallery;