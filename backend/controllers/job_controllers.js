import catchAsyncErrors from '../middlewares/catchAsyncErrors.js';
import jobModel from '../models/JobSchema.js'
import userModel from '../models/userModel.js';

// controller function: 1.postJob 2.alljobs 3.getMyAllpostedJobs 4.deleteJob 5.getASingleJob

export const postJob = catchAsyncErrors(async (req, res, next)=>{
       const role = req.user.role;
       if(role === "Job Seeker" || role!=="Employer"){
            return res.status(401).json({success:false, message:"Only Employer can post a new job"})
       }
       else {
        try {
            const {
                title,
                jobType,
                location,
                companyName,
                introduction,
                responsibilities,
                qualifications,
                offers,
                salary,
                hiringMultipleCandidates,
                personalWebsiteTitle,
                personalWebsiteUrl,
                jobNiche,
              } = req.body;
              if (
                !title ||
                !jobType ||
                !location ||
                !companyName ||
                !introduction ||
                !responsibilities ||
                !qualifications ||
                !salary ||
                !jobNiche
              ) {
                return res.status(400).json({success:false, message:"Please provide all given fields"})
              }
        
              if((personalWebsiteTitle && !personalWebsiteUrl) || (!personalWebsiteTitle && personalWebsiteUrl)){
                return res.status(400).json({success:false, message:"Provide both the website urlProvide both the website url and title, or leave both blank."})
              }
        
              const postedBy = req.user._id;
              const newJob = await jobModel.create({
                title, jobType, location, companyName, introduction, responsibilities, qualifications, offers,
                salary, hiringMultipleCandidates,
                personalWebsite:{
                    title: personalWebsiteTitle,
                    url: personalWebsiteUrl
                },
                jobNiche,
                postedBy
              })
        
              res.status(201).json({
                success: true,
                message: "job posted successfully",
                newJob, 
        });
      } catch (error) {
        console.error(error);  // Log the error for debugging purposes
    
        res.status(500).json({
          success: false,
          message: "Internal server error. Please try again later.",
          error: error.message,
        });
      }
    
       }
});

// ------------------------------------------------------------------------------------------------------------------------
export const alljobs = catchAsyncErrors(async (req, res, next) => {
  try {
    const { city, niche, searchKeyword } = req.query;
    const query = {};

    // Add filters based on the query parameters
    if (city) {
      query.location = { $regex: city, $options: 'i' };  // Case-insensitive match for location
    }

    if (niche) {
      query.jobNiche = { $regex: niche, $options: 'i' };  // Case-insensitive match for job niche
    }

    if (searchKeyword) {
      // Search across multiple fields (title, company name, responsibilities, etc.)
      query.$or = [
        { title: { $regex: searchKeyword, $options: 'i' } },  // Match title
        { companyName: { $regex: searchKeyword, $options: 'i' } },  // Match company name
        { responsibilities: { $regex: searchKeyword, $options: 'i' } },  // Match responsibilities
        { qualifications: { $regex: searchKeyword, $options: 'i' } },  // Match qualifications
      ];
    }

    // Fetch jobs from the database based on the query
    const jobs = await jobModel.find(query);

    res.status(200).json({
      success: true,
      jobs,
      count: jobs.length,  // Return the count of jobs
    });
  } catch (error) {
    console.error(error);  // Log error for debugging
    res.status(500).json({
      success: false,
      message: "Internal server error. Please try again later.",
      error: error.message,
    });
  }
});

// ------------------------------------------------------------------------------------------------------------------------
export const getMyAllpostedJobs = catchAsyncErrors(async(req, res, next)=>{
    const role = req.user.role;
       if(role === "Job Seeker" || role!=="Employer"){
            res.status(401).json({success:false, message:"Job Seeker user are not allowed to use this resources"});
       } else{
        try {
            const myJobs = await jobModel.find({postedBy:req.user._id})
            res.status(200).json({
                success:true,
                myJobs,
                count: myJobs.length,
            })
        } catch (error) {
            console.error(error)
            res.status(500).json({
                success:false,
                message:"Internal server error. Please try again later.",
                error: error.message,
            })
        }
       }
})
// ------------------------------------------------------------------------------------------------------------------------
export const deleteJob = catchAsyncErrors(async (req, res, next) => {
  const role = req.user.role;
  if (role !== "Employer") {
      return res.status(401).json({
          success: false, 
          message: "You are not authorized to use this resource."
      });
  }
  try {
      const { id } = req.params;
      const job = await jobModel.findById(id);
      if (!job) {
          return res.status(404).json({
              success: false,
              message: "Oops! Job not found."
          });
      }

      // Delete the job
      await job.remove(); // Optional: You can keep deleteOne() if preferred

      res.status(200).json({
          success: true,
          message: `Job with title ${job.title} deleted successfully.`
      });
  } catch (error) {
      return res.status(500).json({
          success: false,
          message: error.message || "Internal Server Error"
      });
  }
});

// ------------------------------------------------------------------------------------------------------------------------
export const getASingleJob = catchAsyncErrors(async(req, res, next)=>{
  const { id } = req.params;
  const job = await jobModel.findById(id);
  if (!job) {
    return res.status(404).json({success:false, message:"Job not found."});
  }
  res.status(200).json({
    success: true,
    job,
  });
})