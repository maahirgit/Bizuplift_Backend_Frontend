import React from 'react';
import { Link } from 'react-router-dom';
import { Star, Shield, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

const SellerCard = ({ seller }) => {
    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.01 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group block"
        >
            <Link 
                to={`/seller/${seller.id}`} 
                className="block relative bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-md hover:shadow-2xl hover:shadow-primary/10 transition-shadow duration-300 border border-gray-100 dark:border-gray-800 overflow-hidden"
            >
                {/* Subtle Background pattern on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />

                <div className="flex items-start gap-4 mb-4 relative z-10">
                    <div className="relative">
                        <motion.img 
                            whileHover={{ rotate: 10, scale: 1.1 }}
                            src={seller.avatar} 
                            alt={seller.name} 
                            className="w-14 h-14 rounded-full object-cover border-2 shadow-sm" 
                            style={{ borderColor: 'rgb(var(--color-primary))' }} 
                        />
                        {seller.verified && (
                            <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-900 rounded-full p-0.5 shadow-sm">
                                <Shield className="w-4 h-4 text-blue-500 fill-blue-500" />
                            </div>
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="font-bold text-base text-gray-900 dark:text-white leading-tight mb-1 group-hover:text-primary transition-colors">
                            {seller.business}
                        </h3>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-widest">
                            {seller.city}, {seller.state}
                        </p>
                    </div>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-4 leading-relaxed relative z-10 font-body">
                    "{seller.story}"
                </p>

                <div className="flex items-center justify-between border-t border-gray-100 dark:border-gray-800 pt-4 relative z-10">
                    <div className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800/50 px-2.5 py-1 rounded-lg">
                        <Star className="w-4 h-4 fill-yellow-400 text-yellow-500" />
                        <span className="text-sm font-bold text-gray-700 dark:text-gray-300">{seller.rating}</span>
                        <div className="w-1 h-1 rounded-full bg-gray-300 mx-1" />
                        <span className="text-xs font-semibold text-gray-500">{seller.totalOrders} <span className="font-normal opacity-80">orders</span></span>
                    </div>
                    
                    <motion.div 
                        initial={{ x: 0 }}
                        whileHover={{ x: 3 }}
                        className="flex items-center gap-1 text-xs font-bold transition-colors" 
                        style={{ color: 'rgb(var(--color-primary))' }}
                    >
                        <span>Visit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                    </motion.div>
                </div>
            </Link>
        </motion.div>
    );
};

export default SellerCard;
