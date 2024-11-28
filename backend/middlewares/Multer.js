import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure the directory exists
const uploadPath = 'public/resume';
if (!fs.existsSync(uploadPath)) {
    fs.mkdirSync(uploadPath, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadPath);  // Ensure this path exists
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const fileExtension = path.extname(file.originalname);  // Get the file extension
        const baseName = path.basename(file.originalname, fileExtension);  // Get the base name (without extension)
        cb(null, baseName + '-' + uniqueSuffix + fileExtension);  // Create a unique file name
    }
});

// Add file type validation
const fileFilter = (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/;
    const mimeType = allowedTypes.test(file.mimetype);
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());

    if (mimeType && extname) {
        return cb(null, true);
    }
    cb(new Error('Invalid file type. Only .pdf, .doc, and .docx are allowed.'));
};

// Configure the upload
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 1024 * 1024 * 2.5 }  // Limit file size to 2.5MB
});

// Export the upload middleware
export default upload;
