import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure storage for different file types
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    let uploadPath = '';
    
    // Determine upload directory based on file type
    switch (file.fieldname) {
      case 'document':
        uploadPath = path.join(__dirname, '../uploads/documents');
        break;
      case 'photo':
        uploadPath = path.join(__dirname, '../uploads/photos');
        break;
      case 'signature':
        uploadPath = path.join(__dirname, '../uploads/signatures');
        break;
      default:
        uploadPath = path.join(__dirname, '../uploads');
    }
    
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter
const fileFilter = (req, file, cb) => {
  // Allowed file types
  const allowedDocTypes = ['.pdf', '.doc', '.docx'];
  const allowedImageTypes = ['.jpg', '.jpeg', '.png'];
  
  const ext = path.extname(file.originalname).toLowerCase();
  let isValid = false;

  switch (file.fieldname) {
    case 'document':
      isValid = allowedDocTypes.includes(ext);
      break;
    case 'photo':
    case 'signature':
      isValid = allowedImageTypes.includes(ext);
      break;
  }

  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type'), false);
  }
};

// Create multer instance
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * File upload error handler
 * @type {import('express').ErrorRequestHandler}
 */
export const uploadErrorHandler = (err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({
        success: false,
        message: 'File is too large. Maximum size is 5MB'
      });
    }
    return res.status(400).json({
      success: false,
      message: 'File upload error',
      error: err.message
    });
  }
  
  if (err) {
    return res.status(400).json({
      success: false,
      message: err.message
    });
  }
  
  next();
};

export default upload;