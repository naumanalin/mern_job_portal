import express from "express"
import dotenv from "dotenv"
import cors from "cors"
import cookieParser from 'cookie-parser'

import { connectDB } from './models/connect.js'
import { errorMiddleware } from "./middlewares/error.js"
import { emailAutomation } from "./utils/emailAutomation.js"

import userRouter from './routes/user_Routes.js'
import jobRouter from './routes/job_Routes.js'
import applicationRouter from './routes/application_Routes.js'

const app = express()

// dotenv
dotenv.config()
const PORT = process.env.PORT;
const FRONTEND_URL = process.env.FRONTEND_URL

// Database connection and others
connectDB();
app.use(errorMiddleware)

app.use(express.static('public'))
app.use(
    cors({
        // origin:[FRONTEND_URL, "file:///home/ali/Downloads/MERN_Job_portal/mern-job-portal/index.html"],
        origin: true,
        methods:['GET', 'POST', 'PUT', 'DELETE'],
        credentials: true
    })
)

app.use(cookieParser());  // to access user jwt 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));




// Test Route
app.get('/', (req, res)=>{
    res.json({success:true, message:"ki hal chal lahh...?"})
})

// All Routes
app.use('/api/v1/user', userRouter)
app.use('/api/v1/job', jobRouter)
app.use('/api/v1/application', applicationRouter)

emailAutomation();


app.listen(PORT, ()=>{console.log('server is listening at port', PORT)})
