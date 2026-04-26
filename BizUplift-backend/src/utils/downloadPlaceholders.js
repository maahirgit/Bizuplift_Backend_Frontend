const fs = require('fs');
const path = require('path');
const https = require('https');
const mongoose = require('mongoose');
const Product = require('../models/Product');

// Target directory in the frontend
const PUBLIC_DIR = path.join(__dirname, '../../../../BizUplift-main/public');

const downloadImage = (url, filepath) => {
    return new Promise((resolve, reject) => {
        const file = fs.createWriteStream(filepath);
        https.get(url, response => {
            if (response.statusCode >= 300 && response.headers.location) {
                // follow redirect
                return downloadImage(response.headers.location, filepath).then(resolve).catch(reject);
            }
            response.pipe(file);
            file.on('finish', () => resolve(filepath));
        }).on('error', err => {
            fs.unlink(filepath, () => {});
            reject(err);
        });
    });
};

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const products = await Product.find({});
        console.log(`Found ${products.length} products. Generating placeholder images...`);

        // Ensure directory exists
        const dir = path.join(PUBLIC_DIR, 'images', 'products');
        if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

        for (const prod of products) {
            // e.g. /images/products/hand-painted_mitti_diya_set_12_pcs_.webp
            const imagePath = prod.images[0];
            const fullPath = path.join(PUBLIC_DIR, imagePath);
            
            // Just use a JPG placeholder instead from placehold.co
            // webp from placeholder APIs can be tricky if not supported
            // placehold.co returns PNG or JPEG normally. We'll download PNG and name it .webp (browser usually handles this fine, or we can just fetch png)
            const textUrl = encodeURIComponent(prod.name.substring(0, 30));
            const url = `https://placehold.co/800x800/2a2a2a/ffffff.png?text=${textUrl}&font=montserrat`;
            
            console.log(`Downloading placeholder for: ${prod.name}`);
            await downloadImage(url, fullPath);
        }

        console.log('✅ Successfully created visual placeholder images for all products!');
        process.exit(0);
    } catch (e) {
        console.error('❌ Error generating placeholders:', e);
        process.exit(1);
    }
};

run();
