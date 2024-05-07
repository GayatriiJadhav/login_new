// const express = require("express")
// const app = express()
// const cors = require('cors')
// const mongoose = require('mongoose')
// const User = require('./models/user.model'); // Adjust the path as per your project structure
// const jwt = require('jsonwebtoken')


// app.use(cors())
// app.use(express.json())

// async function connectToMongoDB() {
//     try {
//         await mongoose.connect('mongodb://localhost:27017/logindb', { useNewUrlParser: true, useUnifiedTopology: true });
//         console.log('MongoDB connected');
//     } catch (err) {
//         console.error('MongoDB connection error:', err);
//     }
// }

// connectToMongoDB();


// app.post('/api/register', async (req, res) => {
//     console.log(req.body)
//     try {
//         const user = await User.create({
//             name: req.body.name,
//             email: req.body.email,
//             password: req.body.password,
//         })
//         res.json({ status: 'ok' })
//     } catch (err) {
//         res.json({ status: 'error', error: 'Duplicate email' })
//     }
// })
// app.post('/api/login', async (req, res) => {
//     const user = await User.findOne({
//         email: req.body.email,
//         password: req.body.password,
//     })

//     if (user) {
//         const token = jwt.sign({
//             name: user.name,
//             email: user.email,
//         },
//         'secret123'
//     )
//         return res.json({ status: 'ok', user: token })
//     }else{
//         return res.json({ status: 'ok', user: false })
//     }
// })


// app.listen(1337, () => {
//     console.log('server started on 1337')
// })
// ////////////////////////////////////////////



const express = require("express");
const app = express();
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/user.model'); // Adjust the path as per  project structure
const jwt = require('jsonwebtoken');
const redis = require('redis');

app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        await mongoose.connect('mongodb://localhost:27017/logindb', { useNewUrlParser: true, useUnifiedTopology: true });
        console.log('MongoDB connected');
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
}

connectToMongoDB();

// Connect to Redis
const redisClient = redis.createClient();

// Middleware to check login information from cache or database
const checkLoginInfo = async (req, res, next) => {
    const { email, password } = req.body;
    const userCacheKey = `${email}:${password}`;

    // Check if user information is cached
    redisClient.get(userCacheKey, async (err, cachedUser) => {
        if (err) {
            console.error('Error retrieving user from cache:', err);
            return next();
        }

        if (cachedUser) {
            // User information found in cache
            console.log('Login information retrieved from Redis cache');
            return res.json({ status: 'ok', user: JSON.parse(cachedUser) });
        } else {
            // User information not found in cache, fetch from database
            const user = await User.findOne({ email, password });
            if (user) {
                // Cache user information
                redisClient.set(userCacheKey, JSON.stringify(user));
                
                console.log('Login information retrieved from database and cached');
                console.log('User CacheKey');
                console.log('User info came from DB');
                return res.json({ status: 'ok', user });
            } else {
                // User not found in database
                console.log('User not found in database');
                return next();
            }
        }
    });
};

// Register user
app.post('/api/register', async (req, res) => {
    console.log(req.body);
    try {
        const user = await User.create({
            name: req.body.name,
            email: req.body.email,
            password: req.body.password,
        });
        res.json({ status: 'ok' });
    } catch (err) {
        res.json({ status: 'error', error: 'Duplicate email' });
    }
});

// Login user
app.post('/api/login',async (req, res) => {
    // const checkLoginInfo = async (req, res, next) => {
        const { email, password } = req.body;
        const userCacheKey = `${email}:${password}`;
    
        // Check if user information is cached
        redisClient.get(userCacheKey, async (err, cachedUser) => {
            if (err) {
                console.error('Error retrieving user from cache:', err);
                return next();
            }
    
            if (cachedUser) {
                // User information found in cache
                console.log('Login information retrieved from Redis cache');
                return res.json({ status: 'ok', user: JSON.parse(cachedUser) });
            } else {
                // User information not found in cache, fetch from database
                const user = await User.findOne({ email, password });
                if (user) {
                    // Cache user information
                    // redisClient.set(userCacheKey, JSON.stringify(user));
                    await redisClient.set(userCacheKey, JSON.stringify(user), {
                        EX: 10,
                        NX: true,
                      });
                    console.log('Login information retrieved from database and cached');
                    console.log('User CacheKey');
                    console.log('User info came from DB');
                    return res.json({ status: 'ok', user });
                } else {
                    // User not found in database
                    console.log('User not found in database');
                    return next();
                }
            }
        });
    
    // const { email, password } = req.body;
    // const user = await User.findOne({ email, password });

    // if (user) {
    //     // User information found in database but not cached
    //     const token = jwt.sign({
    //         name: user.name,
    //         email: user.email,
    //     }, 'secret123');

    //     return res.json({ status: 'ok', user: token });
    // } else {
    //     // User not found in database
    //     return res.json({ status: 'error', error: 'Invalid email or password' });
    // }
});

app.listen(1337, () => {
    console.log('Server started on port 1337');
});
///////////////////////////////////

