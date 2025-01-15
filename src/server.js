// بارگیری متغیرهای محیطی از فایل .env
require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

// تنظیمات Mongoose برای جلوگیری از اخطارها
mongoose.set('strictQuery', false); // غیرفعال کردن `strictQuery` برای Mongoose 7

// اتصال به MongoDB با استفاده از متغیر محیطی
// const MONGODB_URI = process.env.MONGODB_URI||'mongodb://localhost:27017/userdb';
const MONGODB_URI = 'mongodb://localhost:27017/user_management';
mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB: ', err));

// ثبت مسیرها
fastify.register(userRoutes);

// شروع سرور
const start = async () => {
    try {
        const PORT = process.env.PORT; // فقط از متغیر محیطی استفاده می‌کنیم
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server is running at http://localhost:${PORT}`);
    } catch (err) {
        console.error('Error starting server: ', err);
        process.exit(1); // خروج با کد خطا در صورت عدم موفقیت
    }
};

// مدیریت graceful shutdown
process.on('SIGINT', async () => {
    await fastify.close();
    mongoose.connection.close();
    console.log('Server and MongoDB connection closed');
    process.exit(0);
});

// شروع برنامه
start();
