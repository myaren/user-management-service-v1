const fastify = require('fastify');
const User = require('../models/User');

/**
 * @function registerUserRoutes - registers user routes
 * @param {Fastify} fastify - fastify instance
 * @returns {Promise<void>}
 */
module.exports = async (fastify) => {
    // create a new user
    fastify.post('/users', async (request, reply) => {
        try {
            const { name, age, email } = request.body;
            const user = new User({ name, age, email });
            await user.save();
            return { message: 'User created', user };
        } catch (err) {
            if (err.code === 11000) {
                // if email already exists
                return reply.status(400).send({ message: 'Email already exists' });
            }
            throw err;
        }
    });

    // get all users or filtered users
    fastify.get('/users', async (request, reply) => {
        const { name, age } = request.query;
        const filter = {};
        if (name) filter.name = new RegExp(name, 'i'); // case-insensitive
        if (age) filter.age = age;
        const users = await User.find(filter);
        return users;
    });
};
