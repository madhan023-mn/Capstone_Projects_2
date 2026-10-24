const multer = require('multer');
const path = require('path');
const fs = require('fs');
const AppError = require('../utils/appError');

const os = require('os');

// Ensure uploads directory exists (use os.tmpdir() in serverless environments)
const isServerless = Boolean(process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME);
const uploadDir = isServerless ? path.join(os.tmpdir(), 'uploads') : path.join(__dirname, '../uploads');

try {
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }
} catch (err) {
  console.warn('⚠️ Notice: Upload directory initialization in serverless:', err.message);
}

// Multer Disk Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `prod-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new AppError('Only image files (JPEG, PNG, WEBP) are allowed!', 400), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB max
  fileFilter,
});

exports.uploadSingleImage = upload.single('image');

exports.handleUploadResponse = (req, res, next) => {
  if (!req.file) {
    return next(new AppError('Please provide an image file to upload', 400));
  }

  const fileUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;

  res.status(200).json({
    success: true,
    message: 'Image uploaded successfully',
    data: {
      url: fileUrl,
      filename: req.file.filename,
      size: req.file.size,
    },
  });
};
