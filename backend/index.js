import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";

import { connectDB } from './models/connect.js';
import { errorMiddleware } from "./middlewares/error.js";
import { emailAutomation } from "./utils/emailAutomation.js";

import userRouter from './routes/user_Routes.js';
import jobRouter from './routes/job_Routes.js';
import applicationRouter from './routes/application_Routes.js';

const app = express();

// dotenv
dotenv.config();
const PORT = process.env.PORT || 3000;  // Vercel automatically handles the port

const FRONTEND_URL = process.env.FRONTEND_URL;

// Database connection and other middleware
connectDB();
app.use(errorMiddleware);

app.use(express.static('public'));
app.use(
  cors({
    origin: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  })
);

app.use(cookieParser());  // to access user jwt
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test Route
app.get('/', (req, res) => {
  res.json({ success: true, message: "ki hal chal lahh...?" });
});

// All Routes
app.use('/api/v1/user', userRouter);
app.use('/api/v1/job', jobRouter);
app.use('/api/v1/application', applicationRouter);

// Run email automation if needed
emailAutomation();


// app.listen(PORT, ()=>{console.log('server is listening at port', PORT)})

// Export the handler for Vercel to use
export default app;


