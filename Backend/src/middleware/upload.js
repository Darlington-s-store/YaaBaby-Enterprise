import multer from 'multer';
import { bucket } from '../config/firebase.js';
import { v4 as uuidv4 } from 'uuid';

// Use memory storage for buffer-based upload
const storage = multer.memoryStorage();

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

/**
 * Upload Buffer to Firebase Storage
 * @param {Buffer} buffer 
 * @param {string} originalName
 * @param {string} folder 
 */
export const uploadToFirebase = (buffer, originalName, folder = 'products') => {
  return new Promise((resolve, reject) => {
    const fileName = `${folder}/${uuidv4()}-${originalName}`;
    const file = bucket.file(fileName);

    const stream = file.createWriteStream({
      metadata: {
        contentType: 'image/jpeg', // Default or detect from originalName
      }
    });

    stream.on('error', (error) => reject(error));

    stream.on('finish', async () => {
      try {
        // Make the file public and get the URL
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
        resolve({ secure_url: publicUrl });
      } catch (error) {
        reject(error);
      }
    });

    stream.end(buffer);
  });
};

/**
 * Middleware to handle single or multiple uploads and sync with Firebase
 */
export const firebaseUploadMiddleware = async (req, res, next) => {
  if (!req.files && !req.file) return next();

  try {
    if (req.file) {
      const result = await uploadToFirebase(req.file.buffer, req.file.originalname);
      req.body.imageUrl = result.secure_url;
    }

    if (req.files) {
      const uploadPromises = req.files.map(file => 
        uploadToFirebase(file.buffer, file.originalname)
      );
      const results = await Promise.all(uploadPromises);
      req.body.images = results.map(r => r.secure_url);
    }

    next();
  } catch (error) {
    console.error('Firebase Upload Error:', error);
    res.status(500).json({ message: 'Error uploading images to Firebase' });
  }
};
