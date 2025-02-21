// Load environment variables from .env file
require('dotenv').config();

const fastify = require('fastify')({ logger: true });
const mongoose = require('mongoose');
const userRoutes = require('./routes/userRoutes');

// Mongoose settings to prevent warnings
mongoose.set('strictQuery', false); // Disable `strictQuery` for Mongoose 7

// Connect to MongoDB using environment variable
const MONGODB_URI = process.env.MONGODB_URI||'mongodb://localhost:27017/user_management';

mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('Error connecting to MongoDB: ', err));

// Register routes
fastify.register(userRoutes);

// Start server
const start = async () => {
    try {
        const PORT = process.env.PORT; // Only use environment variable
        await fastify.listen({ port: PORT, host: '0.0.0.0' });
        console.log(`Server is running at http://localhost:${PORT}`);
    } catch (err) {
        console.error('Error starting server: ', err);
        process.exit(1); // Exit with error code if failed
    }
};

// Handle graceful shutdown
process.on('SIGINT', async () => {
    await fastify.close();
    mongoose.connection.close();
    console.log('Server and MongoDB connection closed');
    process.exit(0);
});

// Start program
start();
