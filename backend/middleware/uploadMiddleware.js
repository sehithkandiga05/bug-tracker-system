const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer Storage setup
const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, uploadDir);
  },
  filename(req, file, cb) {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// File filter validation
const fileFilter = (req, file, cb) => {
  const allowedExtensions = /jpeg|jpg|png|gif|mp4|webm|log|txt|pdf|zip/;
  const extname = allowedExtensions.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedExtensions.test(file.mimetype) || file.mimetype === 'text/plain' || file.mimetype === 'application/octet-stream';

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb(new Error('Only images, videos, logs, TXT, PDF, and ZIP files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 25 * 1024 * 1024 }, // 25MB Max limit
  fileFilter,
});

module.exports = upload;
