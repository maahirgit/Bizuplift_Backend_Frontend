const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

/**
 * dbUtils.js — Comprehensive utility for BizUplift Product Data Management
 * This script consolidates all previous fixes: path normalization, 
 * extension synchronization, and unique file mapping.
 */

const ProductSchema = new mongoose.Schema({
    name: String,
    images: [String]
}, { strict: false });

const Product = mongoose.model('Product', ProductSchema);
const PRODUCTS_DIR = path.join(__dirname, 'uploads/uploads/products');

async function runMaintenance() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB Atlas');

        const products = await Product.find({});
        const files = fs.readdirSync(PRODUCTS_DIR);
        
        // Map of base filenames (without extension) to full filenames for quick lookup
        const fileMap = {};
        files.forEach(f => {
            const ext = path.extname(f);
            const base = path.basename(f, ext);
            fileMap[base] = f;
        });

        let fixedCount = 0;

        for (const product of products) {
            let changed = false;
            if (!product.images || !Array.isArray(product.images) || product.images.length === 0) continue;

            let mainImage = product.images[0];

            // 1. Path Normalization (e.g., /upload/ -> /uploads/products/)
            if (mainImage.startsWith('/upload/') && !mainImage.startsWith('/uploads/products/')) {
                mainImage = mainImage.replace('/upload/', '/uploads/products/');
                changed = true;
            } else if (mainImage.startsWith('/uploads/') && !mainImage.startsWith('/uploads/products/')) {
                mainImage = mainImage.replace('/uploads/', '/uploads/products/');
                changed = true;
            }

            // 2. Extension Synchronization
            const fileName = path.basename(mainImage);
            const ext = path.extname(fileName);
            const base = path.basename(fileName, ext);

            // Check if current file exists with current extension
            if (!fs.existsSync(path.join(PRODUCTS_DIR, fileName))) {
                // If not, check if it exists with a different extension (sync .jpg/.png)
                if (fileMap[base]) {
                    mainImage = `/uploads/products/${fileMap[base]}`;
                    changed = true;
                } else {
                    // Try snake_case fallback for some manual matches
                    const snakeBase = product.name.toLowerCase().replace(/ /g, '_');
                    if (fileMap[snakeBase]) {
                        mainImage = `/uploads/products/${fileMap[snakeBase]}`;
                        changed = true;
                    }
                }
            }

            if (changed) {
                product.images = [mainImage];
                product.markModified('images');
                await product.save();
                fixedCount++;
                console.log(`✓ Optimized: "${product.name}" -> ${mainImage}`);
            }
        }

        console.log(`\nMaintenance Complete: ${fixedCount} products updated.`);
        
        // Final State Summary
        const finalProducts = await Product.find({});
        const uniquePaths = [...new Set(finalProducts.map(p => p.images[0]))];
        console.log(`Total Products: ${finalProducts.length}`);
        console.log(`Unique Image Assets: ${uniquePaths.length}`);
        
        process.exit(0);
    } catch (err) {
        console.error('Maintenance Error:', err);
        process.exit(1);
    }
}

runMaintenance();
