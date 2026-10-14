import multer from 'multer';

// Store images in memory buffer for instant AI processing without filling disk
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Please upload a screenshot image (JPG, PNG, or WEBP).'), false);
  }
};

export const uploadScreenshot = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter
}).single('screenshot');
