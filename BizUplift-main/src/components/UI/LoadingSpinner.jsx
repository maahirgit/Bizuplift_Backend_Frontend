import React from 'react';
import { motion } from 'framer-motion';

const LoadingSpinner = ({ fullPage = false }) => {
  return (
    <div className={`flex flex-col items-center justify-center ${fullPage ? 'fixed inset-0 z-[100] bg-white/80 backdrop-blur-sm' : 'py-20 w-full'}`}>
      <div className="relative w-20 h-20">
        {/* Outer Ring */}
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          className="absolute inset-0 rounded-full border-4 border-primary/20 border-t-primary"
        />
        {/* Inner Pulse */}
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-4 rounded-full bg-primary/30"
        />
      </div>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-6 font-heading font-bold text-gray-900 text-lg"
      >
        Lifting your business...
      </motion.p>
      <p className="text-gray-500 text-sm mt-1 animate-pulse">Connecting to live MongoDB Atlas</p>
    </div>
  );
};

export default LoadingSpinner;
