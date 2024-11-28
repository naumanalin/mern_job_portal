import express from 'express'
import { postJob, alljobs, getMyAllpostedJobs, deleteJob, getASingleJob } from '../controllers/job_controllers.js';
import { isLogedin } from '../middlewares/isLogedin.js';
const router = express.Router();

// first three for employer only
router.post('/postnewjob', isLogedin, postJob);
router.get('/getmypostedjobs', isLogedin, getMyAllpostedJobs);
router.delete("/delete/:id", isLogedin, deleteJob);

router.get('/getalljobs', alljobs);
router.get("/get-single-job/:id", getASingleJob)


export default router;