import cron from 'node-cron'; // Corrected import
import jobModel from '../models/JobSchema.js';
import userModel from '../models/userModel.js';
import { sendEmail } from './sendEmail.js';

export const emailAutomation = () => {
    cron.schedule("*/1 * * * *", async () => {
        console.log("Running Cron Automation");
        const jobs = await jobModel.find({ newsLettersSent: false });
        for (const job of jobs) {
          try {
            const filteredUsers = await userModel.find({
              $or: [
                { "niches.firstNiche": job.jobNiche },
                { "niches.secondNiche": job.jobNiche },
                { "niches.thirdNiche": job.jobNiche },
              ],
            });
            for (const user of filteredUsers) {
              const subject = `Hot Job Alert: ${job.title} in ${job.jobNiche} Available Now`;
              const message = `
              <div style="font-family: Arial, sans-serif; line-height: 1.6;">
                  <h2>Hi ${user.name},</h2>
                  <p>Great news! A new job that fits your niche has just been posted:</p>
                  <ul>
                      <li><strong>Position:</strong> ${job.title}</li>
                      <li><strong>Company:</strong> ${job.companyName}</li>
                      <li><strong>Location:</strong> ${job.location}</li>
                      <li><strong>Salary:</strong> ${job.salary}</li>
                  </ul>
                  <p>
                      <strong>Don’t wait too long!</strong> Job openings like these are filled quickly.
                  </p>
                  <p>
                      We’re here to support you in your job search. Best of luck!
                  </p>
                  <p>
                      <img src="https://example.com/logo.png" alt="NicheNest Logo" style="width: 150px;">
                  </p>
                  <p>Best Regards,<br>NicheNest Team</p>
              </div>`;
                            sendEmail({
                email: user.email,
                subject,
                message,
              });
            } // end of inner for-loop

            job.newsLettersSent = true;
            await job.save();
            } catch (error) {
                console.error('Error in email automation:', error.message);
            }
        }
    });
};
