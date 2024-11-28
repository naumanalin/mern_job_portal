import express from 'express'
import { deleteApplication, employerGetAllApplications, jobSeekerGetAllApplications, postApplication } from '../controllers/application_controllers.js';
import { isLogedin } from '../middlewares/isLogedin.js';
import upload from '../middlewares/Multer.js'
const router = express.Router();

router.post('/apply/:id', isLogedin, postApplication) // only for Job Seeker
router.get('/employer/getall_applications', isLogedin, employerGetAllApplications)
router.get('/jobseeker/getall_applications', isLogedin, jobSeekerGetAllApplications )
router.delete('/delete/:id', isLogedin, deleteApplication)

export default router;