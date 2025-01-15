const request = require('supertest');
const fastify = require('fastify')();
const mongoose = require('mongoose');
const userRoutes = require('../src/routes/userRoutes');
const User = require('../src/models/User');

// Mongoose settings
mongoose.set('strictQuery', false); // Disable `strictQuery`

// Load environment variables
require('dotenv').config();

// Register routes
fastify.register(userRoutes);

// Start server before tests
beforeAll(async () => {
    console.log('MONGODB_URI:', process.env.MONGODB_URI); // Check MONGODB_URI value
    console.log('PORT:', process.env.PORT); // Check PORT value
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/user_management';
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
    const PORT = process.env.PORT;
    await fastify.listen({ port: PORT, host: '0.0.0.0' });
}, 30000); // Increase timeout to 30 seconds

// Close server after tests
afterAll(async () => {
    await fastify.close();
    await mongoose.connection.close();
}, 30000); // Increase timeout to 30 seconds

// Clean up database after each test
afterEach(async () => {
    await User.deleteMany({}); // Remove all users after each test
}, 30000); // Increase timeout to 30 seconds

describe('User API', () => {
    it('should connect to MongoDB', async () => {
        const isConnected = mongoose.connection.readyState === 1; // 1 means connection is established
        expect(isConnected).toBe(true);
    });

    it('should create a new user', async () => {
        const res = await request(fastify.server)
            .post('/users')
            .send({ name: 'John Doe', age: 30, email: 'john@example.com' });
        expect(res.statusCode).toEqual(200);
        expect(res.body).toHaveProperty('message', 'User created');
    }, 30000); // Increase timeout to 30 seconds

    it('should get users', async () => {
        const res = await request(fastify.server).get('/users');
        expect(res.statusCode).toEqual(200);
        expect(Array.isArray(res.body)).toBeTruthy();
    }, 30000); // Increase timeout to 30 seconds

    it('should not allow duplicate email', async () => {
        // Create the first user
        await request(fastify.server)
            .post('/users')
            .send({ name: 'John Doe', age: 30, email: 'john@example.com' });

        // Attempt to create a second user with a duplicate email
        const res = await request(fastify.server)
            .post('/users')
            .send({ name: 'Jane Doe', age: 25, email: 'john@example.com' });

        expect(res.statusCode).toEqual(400); // Expect a 400 error
        expect(res.body).toHaveProperty('message', 'Email already exists'); // Expect error message
    }, 30000); // Increase timeout to 30 seconds

    it('should add multiple users', async () => {
        const users = [
            { name: 'Alice', age: 28, email: 'alice@example.com' },
            { name: 'Bob', age: 32, email: 'bob@example.com' },
            { name: 'Charlie', age: 24, email: 'charlie@example.com' }
        ];

        // Add multiple users
        for (const user of users) {
            const res = await request(fastify.server)
                .post('/users')
                .send(user);
            expect(res.statusCode).toEqual(200); // Expect successful creation of each user
            expect(res.body).toHaveProperty('message', 'User created');
        }

        // Verify all users are in the database
        const allUsers = await User.find({});
        expect(allUsers.length).toBe(users.length); // Expect user count to match added users
    }, 30000); // Increase timeout to 30 seconds

    it('should have no users after cleanup', async () => {
        const users = await User.find({}); // Check user count after cleanup
        expect(users.length).toBe(0); // Expect no users
    }, 30000); // Increase timeout to 30 seconds
});
