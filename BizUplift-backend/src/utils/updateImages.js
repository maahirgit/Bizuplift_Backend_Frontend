const mongoose = require('mongoose');

const Product = require('../models/Product');

const updateDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected. Migrating exactly', await Product.countDocuments(), 'products...');
        
        const products = await Product.find({});
        for (const prod of products) {
            // Create a clean image filename from the product's exact name
            const cleanName = prod.name.trim().replace(/[^a-zA-Z0-9-]/g, '_').replace(/_+/g, '_').toLowerCase();
            const imagePath = `/images/products/${cleanName}.webp`;
            
            prod.images = [imagePath];
            await prod.save();
            console.log(`Updated: ${prod.name} -> ${imagePath}`);
        }
        
        console.log('✅ All products updated successfully with their exact product names.');
        process.exit(0);
    } catch (e) {
        console.error('❌ Failed to update:', e);
        process.exit(1);
    }
}
updateDB();
