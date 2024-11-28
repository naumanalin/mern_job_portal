
http://localhost:8000/

## User
1. Registeration: POST: http://localhost:8000/api/v1/user/register
2. Login:         POST: http://localhost:8000/api/v1/user/login
3. Logout:        GET : http://localhost:8000/api/v1/user/logout
4. GetUserInfo    GET : http://localhost:8000/api/v1/user/getuserinfo
5. Update Profile PUT : http://localhost:8000/api/v1/user/update/profile
6. Update PW      PUT : http://localhost:8000/api/v1/user/update/password


## Jobs
1. Post New Job:         POST:   http://localhost:8000/api/v1/job/postnewjob
2. Get all Jobs:         GET :   http://localhost:8000/api/v1/job/getalljobs
3. Get My Posted Jobs:   GET :   http://localhost:8000/api/v1/job/getmypostedjobs
4. Delete a Job:         DELETE: http://localhost:8000/api/v1/job/delete/:id
5. Single Job:           GET :   http://localhost:8000/api/v1/job/get-single-job/:id


## Applications
1. Apply for new job(new application):   POST  : http://localhost:8000/api/v1/application/apply/:id
2. Employer get all applications:        GET   : http://localhost:8000/api/v1/application/employer/getall_applications
3. Jobseekers get all sends applicatios: GET   : http://localhost:8000/api/v1/application/jobseeker/getall_applications
4. Delete Application:                   Delete: http://localhost:8000/api/v1/application/delete/:id