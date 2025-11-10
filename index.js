import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import imageRoute from './routes/image.route.js';
import redisClient from './configs/redis.js';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';

dotenv.config({});

const app = express();
const PORT = process.env.PORT || 3000;

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes window
    max: 20, // Limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true, // Return rate limit info in headers
    legacyHeaders: false,  // Disable X-RateLimit-* headers
});

// 🧱 Apply rate limiter to all requests
app.use(limiter);

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/user", userRoute);
app.use("/api/image", imageRoute);


app.listen(PORT, async () => {
    console.log(`Server running at port ${PORT}`);
    connectDB();
    redisClient.on('error', err => console.log('Redis Client Error', err));
    await redisClient.connect();
})