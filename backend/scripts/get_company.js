const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('../models/user');

dotenv.config();

const connectDB = async () => {
    console.log("Connecting to DB...");
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("DB Connected");
    } catch (err) {
        console.error("DB Connection Error", err);
        process.exit(1);
    }
};

const findCompany = async () => {
    await connectDB();
    try {
        const user = await User.findOne({ role: 'admin' });
        if (user) {
            console.log(`COMPANY:${user.company}`);
        } else {
            console.log("NO_ADMIN_FOUND");
        }
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.connection.close();
        process.exit(0);
    }
};

findCompany();
