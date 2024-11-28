import catchAsyncErrors from "../middlewares/catchAsyncErrors.js";
import appModel from '../models/applictionSchema.js';
import jobModel from '../models/JobSchema.js'

// controller functions: 1.postApplication 2.employerGetAllApplications 3.jobSeekerGetAllApplications 4.deleteApplication

export const postApplication = catchAsyncErrors(async (req, res, next) => {
    const role = req.user.role;
    if(role !== "Job Seeker"){
        return res.status(401).json({success:false, message:"Only Job Seeker can apply for this job."})
    }
    try {
        const { id } = req.params; // to get job details
        const { name, email, phone, address, coverLetter, resume } = req.user;
        if (!name || !email || !phone || !address || !coverLetter || !resume) {
          return res.status(401).json({success:false, message:"First complete your profile with proper resume, cover letter and bio information then you can apply."})
        }
        const jobSeekerInfo = {
          id: req.user._id,
          name,
          email,
          phone,
          address,
          coverLetter,
          resume,
          role: "Job Seeker",
        };

        const jobDetails = await jobModel.findById(id);
        if (!jobDetails) {
          return res.status(404).json({success:false, message:"Job not found."})
        }
        const isAlreadyApplied = await appModel.findOne({
          "jobInfo.jobId": id,
          "jobSeekerInfo.id": req.user._id,
        });
        if (isAlreadyApplied) {
          return res.status(409).json({success:false, message:"You have already applied for this job."})
        }

        // Create a new application object
        const newApplication = new appModel({
          jobSeekerInfo,
          employerInfo: {
            id: jobDetails.postedBy, // Assuming employer ID is stored in jobDetails.postedBy
            role: "Employer",
          },
          jobInfo: {
            jobId: id,
            jobTitle: jobDetails.title, // Assuming job title is stored in jobDetails.title
          },
        });

        // Save the application data
        const savedApplication = await newApplication.save();

        // Send success response
        res.status(201).json({
            success: true,
            message: "Application submitted successfully!",
            application: savedApplication,
        });

    } catch (error) {
        console.error(error)
        res.status(500).json({ 
            success:false,
            message: `internal server error, please try again later`,
            error: error.message
        })
    }
})

// ----------------------------------------------------------------
export const employerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
    try {
      const role = req.user.role;
      if (role !== "Employer") {
        return res.status(403).json({
          success: false,
          message: "Only Employers can view applications.",
        });
      }
      // Fetch all applications related to jobs posted by the employer
      const applications = await appModel.find({
        "employerInfo.id": req.user._id,
      }).populate({
        path: "jobInfo.jobId",
        select: "title location companyName",
      });
  
      if (!applications || applications.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No applications found for jobs you posted.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Applications retrieved successfully.",
        applications,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: `Internal server error, please try again later.`,
        error: error.message,
      });
    }
  });
  
// ----------------------------------------------------------------
export const jobSeekerGetAllApplications = catchAsyncErrors(async (req, res, next) => {
    try {
      const role = req.user.role;
      if (role !== "Job Seeker") {
        return res.status(403).json({
          success: false,
          message: "Only Job Seekers can view their applications.",
        });
      }
  
      // Fetch all applications submitted by the logged-in Job Seeker
      const applications = await appModel.find({
        "jobSeekerInfo.id": req.user._id,
      }).populate({
        path: "jobInfo.jobId",
        select: "title location companyName",
      });
  
      if (!applications || applications.length === 0) {
        return res.status(404).json({
          success: false,
          message: "No applications found.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Applications retrieved successfully.",
        applications,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error, please try again later.",
        error: error.message,
      });
    }
  });
  
// ----------------------------------------------------------------
export const deleteApplication = catchAsyncErrors(async (req, res, next) => {
    try {
      const applicationId = req.params.id;
      const role = req.user.role;
  
      // Fetch the application to ensure it exists and the user is authorized
      const application = await appModel.findById(applicationId);
  
      if (!application) {
        return res.status(404).json({
          success: false,
          message: "Application not found.",
        });
      }
  
      // Authorization check
      if (
        (role === "Job Seeker" && application.jobSeekerInfo.id.toString() !== req.user._id.toString()) ||
        (role === "Employer" && application.employerInfo.id.toString() !== req.user._id.toString())
      ) {
        return res.status(403).json({
          success: false,
          message: "You are not authorized to delete this application.",
        });
      }
  
      // Update the `deletedBy` field instead of removing the document
      if (role === "Job Seeker") {
        application.deletedBy.jobSeeker = true;
      } else if (role === "Employer") {
        application.deletedBy.employer = true;
      }
  
      // Save the updated application
      await application.save();
  
      // Check if both Job Seeker and Employer have marked it as deleted
      if (application.deletedBy.jobSeeker && application.deletedBy.employer) {
        await appModel.findByIdAndDelete(applicationId);
        return res.status(200).json({
          success: true,
          message: "Application deleted successfully.",
        });
      }
  
      return res.status(200).json({
        success: true,
        message: "Application marked as deleted by user.",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        success: false,
        message: "Internal server error, please try again later.",
        error: error.message,
      });
    }
  });
  
