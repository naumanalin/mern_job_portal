import express from 'express'
import { getLogedUser, Login, Logout, register, updatePassword, updateProfile } from '../controllers/user_Controllers.js'
import upload from '../middlewares/Multer.js'
import { isLogedin } from '../middlewares/isLogedin.js';

const router = express.Router();

router.post("/register", upload.single('resume'), register);
router.post("/login", Login);
router.get("/logout", isLogedin, Logout);
router.get("/getuserinfo", isLogedin,  getLogedUser);
router.put("/update/profile", isLogedin, upload.single('resume'), updateProfile)
router.put("/update/password", isLogedin, updatePassword)


export default router;