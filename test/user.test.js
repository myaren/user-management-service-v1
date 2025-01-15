const request = require('supertest');
const fastify = require('fastify')();
const mongoose = require('mongoose');
const userRoutes = require('../src/routes/userRoutes');
const User = require('../src/models/User');

// تنظیمات Mongoose
mongoose.set('strictQuery', false); // غیرفعال کردن `strictQuery`

// بارگیری متغیرهای محیطی
require('dotenv').config();

// Register routes
fastify.register(userRoutes);

// Start server before tests
beforeAll(async () => {
    console.log('MONGODB_URI:', process.env.MONGODB_URI); // بررسی مقدار MONGODB_URI
    console.log('PORT:', process.env.PORT); // بررسی مقدار PORT
    // const MONGODB_URI = process.env.MONGODB_URI||'mongodb://localhost:27017/userdb';
    const MONGODB_URI = 'mongodb://localhost:27017/userdb';
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const PORT = process.env.PORT;
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
}, 30000); // افزایش timeout به ۳۰ ثانیه

// Close server after tests
afterAll(async () => {
    await fastify.close();
    await mongoose.connection.close();
}, 30000); // افزایش timeout به ۳۰ ثانیه

// Clean up database after each test
afterEach(async () => {
    await User.deleteMany({}); // حذف تمام کاربران بعد از هر تست
}, 30000); // افزایش timeout به ۳۰ ثانیه

describe('User API', () => {
    it('should connect to MongoDB', async () => {
        const isConnected = mongoose.connection.readyState === 1; // 1 به معنای اتصال برقرار است
        expect(isConnected).toBe(true);
    });

    it('should create a new user', async () => {
        const res = await request(fastify.server)
            .post('/users')
            .send({ name: 'John Doe', age: 30, email: 'john@example.com' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User created');
    }, 30000); // افزایش timeout به ۳۰ ثانیه

    it('should get users', async () => {
        const res = await request(fastify.server).get('/users');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    }, 30000); // افزایش timeout به ۳۰ ثانیه

    it('should not allow duplicate email', async () => {
        // ایجاد اولین کاربر
        await request(fastify.server)
            .post('/users')
            .send({ name: 'John Doe', age: 30, email: 'john@example.com' });

        // تلاش برای ایجاد کاربر دوم با ایمیل تکراری
        const res = await request(fastify.server)
            .post('/users')
            .send({ name: 'Jane Doe', age: 25, email: 'john@example.com' });

        expect(res.statusCode).toEqual(400); // انتظار خطای 400
        expect(res.body).toHaveProperty('message', 'Email already exists'); // انتظار پیام خطا
    }, 30000); // افزایش timeout به ۳۰ ثانیه

    it('should add multiple users', async () => {
        const users = [
            { name: 'Alice', age: 28, email: 'alice@example.com' },
            { name: 'Bob', age: 32, email: 'bob@example.com' },
            { name: 'Charlie', age: 24, email: 'charlie@example.com' }
        ];

        // اضافه کردن چند کاربر
        for (const user of users) {
            const res = await request(fastify.server)
                .post('/users')
                .send(user);
            expect(res.statusCode).toEqual(200); // انتظار موفقیت‌آمیز بودن ایجاد هر کاربر
            expect(res.body).toHaveProperty('message', 'User created');
        }

        // بررسی وجود تمام کاربران در پایگاه داده
        const allUsers = await User.find({});
        expect(allUsers.length).toBe(users.length); // انتظار تعداد کاربران برابر با تعداد کاربران اضافه‌شده
    }, 30000); // افزایش timeout به ۳۰ ثانیه

    it('should have no users after cleanup', async () => {
        const users = await User.find({}); // بررسی تعداد کاربران بعد از پاک‌سازی
        expect(users.length).toBe(0); // انتظار عدم وجود کاربر
    }, 30000); // افزایش timeout به ۳۰ ثانیه
});
