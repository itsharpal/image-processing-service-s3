import express from 'express';
import cookieParser from 'cookie-parser';
import connectDB from './utils/db.js';
import userRoute from './routes/user.route.js';
import imageRoute from './routes/image.route.js';
import dotenv from 'dotenv';
dotenv.config({});

const app = express();
const PORT = process.env.PORT || 3000;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

//routes
app.use("/api/user", userRoute);
app.use("/api/image", imageRoute);


app.listen(PORT, () => {
    console.log(`Server running at port ${PORT}`);
    connectDB();
})