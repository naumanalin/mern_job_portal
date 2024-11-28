import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import ErrorHandler from '../middlewares/error.js';
import userModel from '../models/userModel.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken'
import fs from 'fs'
import path from 'path'

// controller functions are: register, Login, Logout, getLogedUser, updateProfile, updatePassword

// --------------------------------------------------------------------------------------------------------------------------
export const register = catchAsyncErrors(async (req, res, next) => {
    try {
        const {
            name,
            email,
            phone,
            address,
            password,
            role,
            firstNiche,
            secondNiche,
            thirdNiche,
            coverLetter,
        } = req.body;

        // Handle resume file
        const resume = req.file.filename;
        if (!resume) {
          console.log(req.file)
          return res.status(400).json({
            success: false,
            message: "Resume field are required for registration.",
        });
        }

        // Validate required fields
        if (!name || !email || !phone || !address || !password || !role) {
            return res.status(400).json({
                success: false,
                message: "Please provide all required fields for registration.",
            });
        }

        // Validate role-specific fields
        if (role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
            return res.status(400).json({
                success: false,
                message: "Please provide your niches to register yourself as a Job Seeker.",
            });
        }

        // Check if user already exists
        const isUserExist = await userModel.findOne({ email });
        if (isUserExist) {
            return res.status(409).json({
                success: false,
                message: `User with this email: ${email} already exists. Please log in.`,
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Prepare user data
        const userData = {
            name,
            email,
            phone,
            address,
            password: hashedPassword,
            resume,
            role,
            niches: role === "Job Seeker" ? { firstNiche, secondNiche, thirdNiche } : null,
            coverLetter,
        };

        // Save new user to database
        const newUser = await userModel.create(userData);

        res.status(201).json({
            success: true,
            message: "User registered successfully.",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                role: newUser.role,
            },
        });
    } catch (error) {
        
    }
});


// --------------------------------------------------------------------------------------------------------------------------
export const Login = async (req, res) => {
  try {
      const { email, password, role } = req.body;

      // Validate input fields
      if (!email || !password || !role) {
          return res.status(400).json({ success: false, message: "All fields are required." });
      }

      // Find the user
      const findUser = await userModel.findOne({ email });
      if (!findUser) {
          return res.status(404).json({ success: false, message: "User not found." });
      }

      // Authenticate role
      if (findUser.role !== role) {
          return res.status(400).json({ success: false, message: "Invalid user role." });
      }

      // Compare password
      const comPassword = await bcrypt.compare(password, findUser.password);
      if (!comPassword) {
          return res.status(400).json({ success: false, message: "Password did not match." });
      }


      // Generate JWT token
      const userInfo = await  userModel.findOne({ email }).select('-password');

      const token = jwt.sign(
        { userId: findUser._id, userName: findUser.name, userRole: findUser.role },
        process.env.JWT_SECRET_KEY,
        { expiresIn: "3d" }
    );
    
    

      // Set token in HTTP-only cookie
      res.status(200)
          .cookie('at', token, {
              httpOnly: true,
              maxAge: 3 * 24 * 60 * 60 * 1000, // 3 days
              path: '/',
              sameSite: "strict",
              secure: process.env.NODE_ENV === "production", // Use secure cookies in production
          })
          .json({ success: true, message: "Login successful.", userInfo, token });
  } catch (error) {
      console.error("Login error:", error.message);
      res.status(500).json({ success: false, message: "Internal Server Error." });
  }
};

// --------------------------------------------------------------------------------------------------------------------------
export const Logout = async (req, res) => {
  try {
      res.clearCookie('at', {
          path: '/', // Ensure the path matches the one used during login
      });
      res.status(200).json({ message: "Logout successful.", success: true });
  } catch (error) {
      console.error(`Logout Error: ${error.message}`);
      res.status(500).json({ message: "Internal Server Error while logging out.", success: false });
  }
};

// --------------------------------------------------------------------------------------------------------------------------
export const getLogedUser = catchAsyncErrors(async (req, res, next) => {
    const user = req.user;
    res.status(200).json({
      success: true,
      user: user || 'middleware not work',
    });
  });

// --------------------------------------------------------------------------------------------------------------------------
export const updateProfile = async (req, res) => {
    try {
        const newUserInfo = {
            name: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            address: req.body.address,
            coverLetter: req.body.coverLetter,
            niches: {
                firstNiche: req.body.firstNiche,
                secondNiche: req.body.secondNiche,
                thirdNiche: req.body.thirdNiche
            }
        };

        // Destructure niches 
        const { firstNiche, secondNiche, thirdNiche } = newUserInfo.niches;

        // Ensure niches are provided for Job Seekers
        if (req.user.role === "Job Seeker" && (!firstNiche || !secondNiche || !thirdNiche)) {
            return res.status(400).json({
                message: "All niches are required for Job Seekers.",
                success: false
            });
        }

        // Delete old resume file if a new file is uploaded
        if (req.file) {
            const oldFileName = req.user.resume;
            const oldFilePath = path.join('public/resume', oldFileName);

            try {
                await fs.promises.unlink(oldFilePath);
            } catch (error) {
                console.error("Error deleting old resume file:", error.message);
            }

            // Update the resume filename in newUserInfo
            newUserInfo.resume = req.file.filename;
        }

        // Update user information in the database
        const updatedUser = await userModel.findByIdAndUpdate(
            req.user._id, // Find user by ID
            { $set: newUserInfo }, // Update fields
            { new: true, runValidators: true } // Return the updated document and apply validations
        );

        if (!updatedUser) {
            return res.status(404).json({
                message: "User not found.",
                success: false
            });
        }

        // Send success response
        res.status(200).json({
            message: "Profile updated successfully.",
            success: true,
            data: updatedUser
        });
    } catch (error) {
        console.error("Error updating profile:", error.message);
        res.status(500).json({
            message: "An error occurred while updating the profile.",
            success: false,
            error: error.message
        });
    }
};

// ------------------------------------------------------------------------------------
export const updatePassword = async (req, res) => {
    try {
        const user = await userModel.findById(req.user.id).select("+password");

        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        const isPasswordMatched = await bcrypt.compare(req.body.oldPassword, user.password);

        if (!isPasswordMatched) {
            return res.status(400).json({ success: false, message: "Old password did not match" });
        }

        if (req.body.newPassword !== req.body.confirmPassword) {
            return res.status(400).json({ success: false, message: "Confirm password did not match" });
        }

        // Hash the new password before saving
        const hashedPassword = await bcrypt.hash(req.body.newPassword, 12);

        // Update user's password in the database
        user.password = hashedPassword;
        await user.save();

        // Send success response
        return res.status(200).json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        // Handle any errors that occur during the process
        console.error(error);
        return res.status(500).json({ success: false, message: "Server error. Please try again later." });
    }
};