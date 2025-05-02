import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

const Dashboard = () => {
  const [hoverEmoji, setHoverEmoji] = useState(null);
  
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
    </div>
  );
};

export default Dashboard;