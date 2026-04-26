/**
 * src/utils/seedData.js
 * ─────────────────────────────────────────────────────────
 * Run with: node src/utils/seedData.js
 *
 * Seeds the exact same data from the frontend DataContext.jsx
 * into MongoDB Atlas. Safe to re-run — drops existing data first.
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('../models/User');
const Seller = require('../models/Seller');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Review = require('../models/Review');
const Post = require('../models/Post');
const CreditLedger = require('../models/CreditLedger');

// ─── Seed Data (mirrors DataContext.jsx) ─────────────────

const SELLERS_DATA = [
    {
        name: 'Priya Sharma', business: 'KalaKraft', category: 'Handicrafts',
        city: 'Jaipur', state: 'Rajasthan',
        story: 'Started making diyas in my kitchen during lockdown in 2020. What began as a hobby to keep myself busy turned into a passion project. Each diya I make carries a piece of my heart — hand-painted with natural colors, inspired by Rajasthani folk art. Today, KalaKraft ships to 200+ cities across India.',
        rating: 4.8, totalOrders: 1240, verified: true,
        festivals: ['Diwali', 'Navratri'],
        avatar: 'https://i.pravatar.cc/150?img=47',
        tagline: 'Handcrafted with love from Jaipur',
        joinedAt: '2021-01-15', products: 24,
        milestones: [
            { year: '2020', event: 'Started making diyas at home' },
            { year: '2021', event: 'First 100 orders on BizUplift' },
            { year: '2022', event: 'Featured in Jaipur Times' },
            { year: '2023', event: 'Crossed 1000 orders milestone' },
        ],
    },
    {
        name: 'Ramesh Patel', business: 'MithaiBhandar', category: 'Food & Sweets',
        city: 'Surat', state: 'Gujarat',
        story: '4th generation halwai family bringing traditional recipes online. My great-grandfather started this shop in 1952. We use the same copper vessels, the same wood-fire technique, and the same family recipes. No preservatives, no shortcuts — just pure, authentic Indian mithai made with love.',
        rating: 4.9, totalOrders: 3200, verified: true,
        festivals: ['Diwali', 'Eid', 'Holi'],
        avatar: 'https://i.pravatar.cc/150?img=12',
        tagline: '70 years of sweet tradition',
        joinedAt: '2020-10-01', products: 18,
        milestones: [
            { year: '1952', event: 'Great-grandfather opens the shop' },
            { year: '2020', event: 'Joined BizUplift' },
            { year: '2021', event: 'Pan-India shipping launched' },
            { year: '2023', event: '3000+ happy customers' },
        ],
    },
    {
        name: 'Anjali Nair', business: 'KeralaKrafts', category: 'Clothing',
        city: 'Kochi', state: 'Kerala',
        story: 'Preserving traditional Kerala weaving techniques that are centuries old. I work with a collective of 12 weavers from Balaramapuram, ensuring fair wages and sustainable practices. Every kasavu saree we sell supports a weaver family.',
        rating: 4.7, totalOrders: 890, verified: true,
        festivals: ['Onam', 'Christmas'],
        avatar: 'https://i.pravatar.cc/150?img=32',
        tagline: "Weaving Kerala's heritage, thread by thread",
        joinedAt: '2021-06-20', products: 15,
        milestones: [
            { year: '2021', event: 'Started with 3 weavers' },
            { year: '2022', event: 'Collective grows to 12 artisans' },
            { year: '2023', event: 'Featured in Vogue India' },
        ],
    },
    {
        name: 'Gurpreet Singh', business: 'PunjabDiHaat', category: 'Clothing',
        city: 'Amritsar', state: 'Punjab',
        story: 'Promoting Phulkari embroidery to the world. My mother taught me this art when I was 8 years old. Today I run a workshop with 20 women artisans from rural Punjab, creating contemporary Phulkari pieces that blend tradition with modern fashion.',
        rating: 4.6, totalOrders: 670, verified: true,
        festivals: ['Lohri', 'Baisakhi'],
        avatar: 'https://i.pravatar.cc/150?img=67',
        tagline: "Punjab's colors, world's canvas",
        joinedAt: '2021-09-10', products: 12,
        milestones: [
            { year: '2021', event: 'Launched with 5 products' },
            { year: '2022', event: 'Workshop employs 20 women' },
            { year: '2023', event: 'Export to 3 countries' },
        ],
    },
];

const USERS_DATA = [
    { name: 'Admin User',    email: 'admin@bizuplift.com',       password: 'admin123',   mobile: '9999999999', role: 'admin',    avatar: 'https://i.pravatar.cc/150?img=1',  credits: 0    },
    { name: 'Arjun Mehta',  email: 'arjun@example.com',         password: 'password123',mobile: '9876543210', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=11', credits: 1250 },
    { name: 'Sneha Reddy',  email: 'sneha@example.com',         password: 'password123',mobile: '9876543211', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=25', credits: 450  },
    { name: 'Vikram Joshi', email: 'vikram@example.com',        password: 'password123',mobile: '9876543212', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=33', credits: 800  },
    { name: 'Meera Pillai', email: 'meera@example.com',         password: 'password123',mobile: '9876543213', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=44', credits: 200  },
    { name: 'Rohan Das',    email: 'rohan@example.com',         password: 'password123',mobile: '9876543214', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=55', credits: 600  },
    // Sellers (role updated after seller profile created)
    { name: 'Priya Sharma', email: 'priya@kalakraft.com',       password: 'seller123',  mobile: '9876543220', role: 'seller',   avatar: 'https://i.pravatar.cc/150?img=47', credits: 3200 },
    { name: 'Ramesh Patel', email: 'ramesh@mithaibandar.com',   password: 'seller123',  mobile: '9876543221', role: 'seller',   avatar: 'https://i.pravatar.cc/150?img=12', credits: 8900 },
    { name: 'Anjali Nair',  email: 'anjali@keralakrafts.com',   password: 'seller123',  mobile: '9876543222', role: 'seller',   avatar: 'https://i.pravatar.cc/150?img=32', credits: 2100 },
    { name: 'Gurpreet Singh',email: 'gurpreet@punjabdihaat.com',password: 'seller123',  mobile: '9876543223', role: 'seller',   avatar: 'https://i.pravatar.cc/150?img=67', credits: 1800 },
    // Project team members
    { name: 'Heer',          email: 'heer@gmail.com',            password: 'heer',       mobile: '9000000001', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=5',  credits: 500  },
    { name: 'Diya',          email: 'diya@gmail.com',            password: 'diya',       mobile: '9000000002', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=9',  credits: 500  },
    { name: 'Maahir',        email: 'maahir@gmail.com',          password: 'maahir',     mobile: '9000000003', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=15', credits: 500  },
    { name: 'Nigam',         email: 'nigam@gmail.com',           password: 'nigam',      mobile: '9000000004', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=20', credits: 500  },
];

// ─── Seed Runner ─────────────────────────────────────────

const seed = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        // Drop existing collections
        console.log('🗑️  Clearing existing data...');
        await Promise.all([
            User.deleteMany({}),
            Seller.deleteMany({}),
            Product.deleteMany({}),
            Order.deleteMany({}),
            Review.deleteMany({}),
            Post.deleteMany({}),
            CreditLedger.deleteMany({}),
        ]);

        // ── 1. Seed Sellers ────────────────────────────────
        console.log('🏪 Seeding sellers...');
        const sellers = await Seller.insertMany(SELLERS_DATA);
        const [sellerKala, sellerMithai, sellerKerala, sellerPunjab] = sellers;

        // ── 2. Seed Users ─────────────────────────────────
        console.log('👥 Seeding users...');
        const hashedUsers = await Promise.all(
            USERS_DATA.map(async (u, i) => {
                const hash = await bcrypt.hash(u.password, 10);
                const sellerMap = { 6: sellerKala._id, 7: sellerMithai._id, 8: sellerKerala._id, 9: sellerPunjab._id };
                return { ...u, password: hash, sellerId: sellerMap[i] || null };
            })
        );
        const users = await User.insertMany(hashedUsers);
        const [, userArjun, , , , , userPriya, userRamesh, userAnjali, userGurpreet] = users;

        // Link users back to seller profiles
        await Seller.findByIdAndUpdate(sellerKala._id,   { userId: userPriya._id });
        await Seller.findByIdAndUpdate(sellerMithai._id, { userId: userRamesh._id });
        await Seller.findByIdAndUpdate(sellerKerala._id, { userId: userAnjali._id });
        await Seller.findByIdAndUpdate(sellerPunjab._id, { userId: userGurpreet._id });

        // ── 3. Seed Products ──────────────────────────────
        console.log('📦 Seeding products...');
        const PRODUCTS_DATA = [
            // Diwali
            { name: 'Hand-Painted Mitti Diya Set (12 pcs)',  sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'Diwali',   category: 'Candles & Diyas',    images: ['/uploads/products/mitti-diya-set-12.jpg'], mrp: 599,  price: 349,  minPrice: 299,  maxDiscount: 25, stock: 150, rating: 4.8, reviews: 342, negotiable: true,  tags: ['diwali','diya','oil lamp','decoration'], featured: true  },
            { name: 'Premium Kaju Katli Box (500g)',         sellerId: sellerMithai._id, sellerName: 'MithaiBhandar',festival: 'Diwali',   category: 'Food & Sweets',      images: ['/uploads/products/kaju-katli.jpg'], mrp: 750,  price: 650,  minPrice: 580,  maxDiscount: 10, stock: 80,  rating: 4.9, reviews: 512, negotiable: true,  tags: ['diwali','sweets','kaju katli','mithai'],  featured: true  },
            { name: 'Brass Puja Thali Set',                  sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'Diwali',   category: 'Decoration',         images: ['/uploads/products/puja-thali.jpg'], mrp: 1499, price: 999,  minPrice: 850,  maxDiscount: 20, stock: 45,  rating: 4.7, reviews: 89,  negotiable: true,  tags: ['diwali','puja','thali','brass'],          featured: true  },
            { name: 'Marigold Flower Garland (5ft)',         sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'Diwali',   category: 'Decoration',         images: ['/uploads/products/marigold-garland.jpg'], mrp: 399,  price: 199,  minPrice: 150,  maxDiscount: 30, stock: 200, rating: 4.5, reviews: 120, negotiable: true,  tags: ['decoration','flowers','toran'],           featured: false },
            // Holi
            { name: 'Organic Herbal Gulal (Pack of 5)',      sellerId: sellerMithai._id, sellerName: 'MithaiBhandar',festival: 'Holi',     category: 'Decoration',         images: ['/uploads/products/organic-gulal.jpg'], mrp: 499,  price: 399,  minPrice: 350,  maxDiscount: 15, stock: 300, rating: 4.8, reviews: 445, negotiable: true,  tags: ['holi','colors','gulal','organic'],        featured: true  },
            { name: 'Traditional Thandai Mix (200g)',        sellerId: sellerMithai._id, sellerName: 'MithaiBhandar',festival: 'Holi',     category: 'Food & Sweets',      images: ['/uploads/products/thandai-mix.jpg'], mrp: 350,  price: 299,  minPrice: 250,  maxDiscount: 10, stock: 100, rating: 4.7, reviews: 234, negotiable: false, tags: ['holi','drink','thandai'],                featured: true  },
            { name: 'White Cotton Kurta for Holi',           sellerId: sellerPunjab._id, sellerName: 'PunjabDiHaat', festival: 'Holi',     category: 'Clothing',           images: ['/uploads/products/white-kurta.jpg'], mrp: 999,  price: 699,  minPrice: 599,  maxDiscount: 20, stock: 150, rating: 4.4, reviews: 189, negotiable: true,  tags: ['holi','clothing','kurta','white'],        featured: false },
            // Navratri
            { name: 'Embroidered Chaniya Choli Set',         sellerId: sellerKerala._id, sellerName: 'KeralaKrafts', festival: 'Navratri', category: 'Clothing',           images: ['/uploads/products/chaniya-choli.jpg'], mrp: 4500, price: 3200, minPrice: 2800, maxDiscount: 20, stock: 25,  rating: 4.9, reviews: 95,  negotiable: true,  tags: ['navratri','garba','lehenga','clothing'],  featured: true  },
            { name: 'Decorative Dandiya Sticks (Pair)',      sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'Navratri', category: 'Decoration',         images: ['/uploads/products/dandiya-sticks.jpg'], mrp: 299,  price: 199,  minPrice: 150,  maxDiscount: 15, stock: 200, rating: 4.6, reviews: 178, negotiable: true,  tags: ['navratri','dandiya','dance','prop'],      featured: false },
            // Eid
            { name: 'Authentic Sheer Khurma Mix (1kg)',      sellerId: sellerMithai._id, sellerName: 'MithaiBhandar',festival: 'Eid',      category: 'Food & Sweets',      images: ['/uploads/products/sheer-khurma.jpg'], mrp: 599,  price: 499,  minPrice: 450,  maxDiscount: 10, stock: 60,  rating: 4.8, reviews: 167, negotiable: false, tags: ['eid','sweets','dessert','seviyan'],       featured: true  },
            { name: 'Crystal Attar Perfume Bottle',          sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'Eid',      category: 'Decoration',         images: ['/uploads/products/attar-bottle.jpg'], mrp: 999,  price: 799,  minPrice: 700,  maxDiscount: 15, stock: 40,  rating: 4.7, reviews: 88,  negotiable: true,  tags: ['eid','attar','perfume','gift'],           featured: false },
            // Rakhi
            { name: 'Handcrafted Zardosi Rakhi',             sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'Rakhi',    category: 'Gifts',              images: ['/uploads/products/zardosi-rakhi.jpg'], mrp: 299,  price: 199,  minPrice: 150,  maxDiscount: 20, stock: 500, rating: 4.8, reviews: 654, negotiable: true,  tags: ['rakhi','raksha bandhan','brother','gift'],featured: true  },
            { name: 'Assorted Mithai Gift Box',              sellerId: sellerMithai._id, sellerName: 'MithaiBhandar',festival: 'Rakhi',    category: 'Food & Sweets',      images: ['/uploads/products/mithai-gift-box.jpg'], mrp: 699,  price: 599,  minPrice: 500,  maxDiscount: 10, stock: 100, rating: 4.6, reviews: 210, negotiable: true,  tags: ['rakhi','sweets','gift'],                 featured: false },
            // Onam
            { name: 'Traditional Kasavu Saree',              sellerId: sellerKerala._id, sellerName: 'KeralaKrafts', festival: 'Onam',     category: 'Clothing',           images: ['/uploads/products/kasavu-saree.jpg'], mrp: 2499, price: 1899, minPrice: 1600, maxDiscount: 25, stock: 50,  rating: 4.9, reviews: 134, negotiable: true,  tags: ['onam','saree','kerala','clothing'],       featured: true  },
            { name: 'Kerala Banana Chips (Freshly Fried)',   sellerId: sellerKerala._id, sellerName: 'KeralaKrafts', festival: 'Onam',     category: 'Food & Sweets',      images: ['/uploads/products/banana-chips.jpg'], mrp: 399,  price: 299,  minPrice: 250,  maxDiscount: 15, stock: 200, rating: 4.7, reviews: 320, negotiable: false, tags: ['onam','chips','snacks'],                 featured: false },
            // Christmas
            { name: 'Handmade Pine Cone Wreath',             sellerId: sellerKerala._id, sellerName: 'KeralaKrafts', festival: 'Christmas',category: 'Decoration',         images: ['/uploads/products/pine-cone-wreath.jpg'], mrp: 1299, price: 999,  minPrice: 800,  maxDiscount: 20, stock: 30,  rating: 4.8, reviews: 112, negotiable: true,  tags: ['christmas','wreath','decoration'],        featured: true  },
            { name: 'Rich Plum Cake (Traditional)',          sellerId: sellerKerala._id, sellerName: 'KeralaKrafts', festival: 'Christmas',category: 'Food & Sweets',      images: ['/uploads/products/plum-cake.jpg'], mrp: 899,  price: 699,  minPrice: 600,  maxDiscount: 15, stock: 100, rating: 4.9, reviews: 287, negotiable: false, tags: ['christmas','cake','sweets'],              featured: true  },
            // Lohri / Pongal
            { name: 'Til-Gud Ladoo (Sesame Jaggery Balls)', sellerId: sellerMithai._id, sellerName: 'MithaiBhandar',festival: 'Lohri',    category: 'Food & Sweets',      images: ['/uploads/products/til-gud-ladoo.jpg'], mrp: 349,  price: 279,  minPrice: 240,  maxDiscount: 10, stock: 120, rating: 4.6, reviews: 198, negotiable: false, tags: ['lohri','pongal','sweets','til'],          featured: false },
            { name: 'Phulkari Dupatta (Hand-Embroidered)',   sellerId: sellerPunjab._id, sellerName: 'PunjabDiHaat', festival: 'Lohri',    category: 'Clothing',           images: ['/uploads/products/phulkari-dupatta.jpg'], mrp: 1599, price: 1199, minPrice: 1000, maxDiscount: 20, stock: 40,  rating: 4.8, reviews: 145, negotiable: true,  tags: ['lohri','clothing','dupatta','phulkari'],  featured: true  },
            { name: 'Earthen Pongal Pot Set',                sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'Pongal',   category: 'Decoration',         images: ['/uploads/products/pongal-pot-set.jpg'], mrp: 699,  price: 499,  minPrice: 400,  maxDiscount: 25, stock: 60,  rating: 4.5, reviews: 89,  negotiable: true,  tags: ['pongal','pot','decoration'],              featured: false },
            // Dussehra
            { name: 'Hand-Painted Ravana Mask',              sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'Dussehra', category: 'Decoration',         images: ['/uploads/products/ravana-mask.jpg'], mrp: 499,  price: 349,  minPrice: 300,  maxDiscount: 20, stock: 50,  rating: 4.4, reviews: 45,  negotiable: true,  tags: ['dussehra','mask','craft'],               featured: false },
            // All year
            { name: 'Blue Pottery Vase (Jaipur)',            sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'All',      category: 'Handicrafts',        images: ['/uploads/products/blue-pottery-vase.jpg'], mrp: 1299, price: 899,  minPrice: 800,  maxDiscount: 25, stock: 30,  rating: 4.7, reviews: 156, negotiable: true,  tags: ['decor','handicraft','pottery'],           featured: false },
            { name: 'Assorted Scented Candles (Set of 3)',   sellerId: sellerKala._id,   sellerName: 'KalaKraft',    festival: 'All',      category: 'Candles & Diyas',    images: ['/uploads/products/scented-candles.jpg'], mrp: 799,  price: 599,  minPrice: 500,  maxDiscount: 20, stock: 100, rating: 4.8, reviews: 267, negotiable: true,  tags: ['candles','gift','decor'],                featured: false },
            { name: 'Hand-Woven Area Rug',                   sellerId: sellerPunjab._id, sellerName: 'PunjabDiHaat', festival: 'All',      category: 'Handicrafts',        images: ['/uploads/products/hand-woven-area-rug.jpg'], mrp: 2500, price: 1799, minPrice: 1500, maxDiscount: 25, stock: 20,  rating: 4.5, reviews: 89,  negotiable: true,  tags: ['rug','decor','home'],                     featured: false },
        ];
        const products = await Product.insertMany(PRODUCTS_DATA);
        const [prodDiya, prodKaju, prodThali] = products;

        // ── 4. Seed Orders ────────────────────────────────
        console.log('🛒 Seeding orders...');
        await Order.insertMany([
            {
                customerId: userArjun._id,
                items: [{ productId: prodDiya._id, name: prodDiya.name, quantity: 2, price: 349, image: prodDiya.images[0] }],
                total: 698, status: 'Delivered', paymentMethod: 'UPI',
                address: { name: 'Arjun Mehta', line1: '42, Shanti Nagar', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: '9876543210' },
                creditsEarned: 70, deliveredAt: new Date('2024-10-25T15:00:00Z'),
            },
            {
                customerId: userArjun._id,
                items: [
                    { productId: prodKaju._id,  name: prodKaju.name,  quantity: 1, price: 650, image: prodKaju.images[0]  },
                    { productId: prodThali._id, name: prodThali.name, quantity: 1, price: 999, image: prodThali.images[0] },
                ],
                total: 1649, status: 'Shipped', paymentMethod: 'Card',
                address: { name: 'Arjun Mehta', line1: '42, Shanti Nagar', city: 'Mumbai', state: 'Maharashtra', pincode: '400001', phone: '9876543210' },
                creditsEarned: 164,
            },
        ]);

        // ── 5. Seed Reviews ───────────────────────────────
        console.log('⭐ Seeding reviews...');
        await Review.insertMany([
            { productId: prodDiya._id, userId: userArjun._id, userName: 'Arjun Mehta', rating: 5, title: 'Absolutely beautiful!', body: 'The diyas are hand-painted with such intricate detail. They look even better in person.', helpful: 12 },
            { productId: prodKaju._id, userId: userArjun._id, userName: 'Arjun Mehta', rating: 5, title: 'Best Kaju Katli ever!', body: "I've tried many brands but MithaiBhandar's Kaju Katli is on another level.", helpful: 23 },
        ]);

        // ── 6. Seed Posts ─────────────────────────────────
        console.log('📝 Seeding community posts...');
        await Post.insertMany([
            { authorId: userArjun._id, authorName: 'Arjun Mehta', authorAvatar: 'https://i.pravatar.cc/150?img=11', type: 'review', festival: 'Diwali', content: 'Just got this amazing Diwali hamper from @KalaKraft 🪔 The diyas are hand-painted and so beautiful! The packaging was premium and delivery was super fast. Highly recommend!', image: 'https://images.unsplash.com/photo-1620807664364-77acecd33d96?auto=format&fit=crop&q=80&w=800', likes: 47, comments: 8 },
            { authorId: userArjun._id, authorName: 'Arjun Mehta', authorAvatar: 'https://i.pravatar.cc/150?img=11', type: 'tip', festival: 'Diwali', content: 'Pro tip for Diwali shopping: Use the AI negotiation feature on BizUplift! I saved ₹200 on a brass thali set 🤝', image: null, likes: 123, comments: 31 },
            { authorId: userPriya._id, authorName: 'Priya Sharma (KalaKraft)', authorAvatar: 'https://i.pravatar.cc/150?img=47', type: 'seller_story', festival: 'Diwali', content: 'Excited to share that KalaKraft just crossed 1000 orders! 🎉 Thank you to every customer who supported a small seller.', image: 'https://images.unsplash.com/photo-1603902342981-6782db867202?auto=format&fit=crop&q=80&w=800', likes: 156, comments: 23 },
            { authorId: userRamesh._id, authorName: 'Ramesh Patel (MithaiBhandar)', authorAvatar: 'https://i.pravatar.cc/150?img=12', type: 'seller_story', festival: 'Eid', content: 'Our Sheer Khurma mix is now available for Eid! 🌙 Made with the same recipe my great-grandmother used.', image: 'https://plus.unsplash.com/premium_photo-1695123927643-989278bd44aa?auto=format&fit=crop&q=80&w=800', likes: 78, comments: 14 },
            { authorId: userGurpreet._id, authorName: 'Gurpreet Singh (PunjabDiHaat)', authorAvatar: 'https://i.pravatar.cc/150?img=67', type: 'seller_story', festival: 'Lohri', content: "Lohri is coming! 🔥 Our Phulkari dupattas are ready. Each one is handwoven by women artisans from my village.", image: 'https://images.unsplash.com/photo-1601633534571-066345dc3ce2?auto=format&fit=crop&q=80&w=800', likes: 201, comments: 38 },
        ]);

        // ── 7. Seed Credit Ledgers ────────────────────────
        console.log('💰 Seeding credit ledgers...');
        await CreditLedger.create({
            userId: userArjun._id, balance: 1250,
            transactions: [
                { action: 'Purchase Reward',   points: 94,   type: 'earn',   balance: 1250 },
                { action: 'First Purchase Bonus', points: 100, type: 'earn', balance: 1156 },
                { action: 'Review Written',    points: 50,   type: 'earn',   balance: 1056 },
                { action: 'Referral Bonus',    points: 200,  type: 'earn',   balance: 1006 },
                { action: 'Redeemed for discount', points: -200, type: 'redeem', balance: 806 },
            ],
        });

        console.log('\n✅ Seed complete!');
        console.log(`   👥 ${USERS_DATA.length} users`);
        console.log(`   🏪 ${SELLERS_DATA.length} sellers`);
        console.log(`   📦 ${PRODUCTS_DATA.length} products`);
        console.log('   🛒 2 orders');
        console.log('   ⭐ 2 reviews');
        console.log('   📝 5 posts');
        console.log('\n🔑 Test credentials:');
        console.log('   Customer: arjun@example.com   / password123');
        console.log('   Seller:   priya@kalakraft.com / seller123');
        console.log('   Admin:    admin@bizuplift.com / admin123');
        console.log('\n👥 Team credentials:');
        console.log('   Heer:   heer@gmail.com   / heer');
        console.log('   Diya:   diya@gmail.com   / diya');
        console.log('   Maahir: maahir@gmail.com / maahir');
        console.log('   Nigam:  nigam@gmail.com  / nigam');

        process.exit(0);
    } catch (err) {
        console.error('❌ Seed failed:', err);
        process.exit(1);
    }
};

seed();
