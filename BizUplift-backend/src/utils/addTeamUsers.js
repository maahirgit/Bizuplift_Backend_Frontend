/**
 * src/utils/addTeamUsers.js
 * ─────────────────────────────────────────────────────────
 * Run with: node src/utils/addTeamUsers.js
 *
 * Safely adds/updates only the 4 team member accounts.
 * Does NOT drop any existing data.
 */

const dotenv = require('dotenv');
dotenv.config();

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const TEAM_USERS = [
    { name: 'Heer',   email: 'heer@gmail.com',   password: 'heer',   mobile: '9000000001', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=5',  credits: 500 },
    { name: 'Diya',   email: 'diya@gmail.com',   password: 'diya',   mobile: '9000000002', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=9',  credits: 500 },
    { name: 'Maahir', email: 'maahir@gmail.com', password: 'maahir', mobile: '9000000003', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=15', credits: 500 },
    { name: 'Nigam',  email: 'nigam@gmail.com',  password: 'nigam',  mobile: '9000000004', role: 'customer', avatar: 'https://i.pravatar.cc/150?img=20', credits: 500 },
];

const run = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ Connected to MongoDB Atlas');

        for (const u of TEAM_USERS) {
            const hash = await bcrypt.hash(u.password, 10);
            const existing = await User.findOne({ email: u.email });

            if (existing) {
                // Update password & details in case they changed
                await User.findOneAndUpdate(
                    { email: u.email },
                    { name: u.name, password: hash, mobile: u.mobile, avatar: u.avatar, credits: u.credits },
                    { new: true }
                );
                console.log(`🔄 Updated  : ${u.name} (${u.email})`);
            } else {
                await User.create({ ...u, password: hash });
                console.log(`✅ Created  : ${u.name} (${u.email})`);
            }
        }

        console.log('\n🎉 Done! Team logins:');
        console.log('   heer@gmail.com   / heer');
        console.log('   diya@gmail.com   / diya');
        console.log('   maahir@gmail.com / maahir');
        console.log('   nigam@gmail.com  / nigam');

        process.exit(0);
    } catch (err) {
        console.error('❌ Failed:', err.message);
        process.exit(1);
    }
};

run();
