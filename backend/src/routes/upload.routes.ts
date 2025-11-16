import { Router, Request, Response } from 'express';
import multer from 'multer';
import { authenticateJWT } from '../middleware/auth';
import { supabaseStorageService } from '../services/supabaseStorage';
import { AuthRequest } from '../types/request';
import { logger } from '../utils/logger';

const router = Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Accept common file types
    const allowedTypes = [
      'image/jpeg',
      'image/jpg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'text/plain',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only images, PDFs, and documents are allowed.'));
    }
  },
});

// All routes require authentication
router.use(authenticateJWT);

/**
 * Upload profile image
 * POST /api/upload/profile-image
 */
router.post('/profile-image', upload.single('image'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
      return;
    }

    const result = await supabaseStorageService.uploadFile(
      'user-uploads',
      file.originalname,
      file.buffer,
      userId,
      file.mimetype
    );

    logger.info('Profile image uploaded', { userId, url: result.url });

    res.json({ 
      success: true, 
      url: result.url,
      path: result.path 
    });
  } catch (error: any) {
    logger.error('Profile image upload failed', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload image' 
    });
  }
});

/**
 * Upload document (SOP, letters, etc.)
 * POST /api/upload/document
 */
router.post('/document', upload.single('document'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const file = req.file;
    const { documentType } = req.body; // Optional: 'sop', 'cover_letter', etc.

    if (!file) {
      res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
      return;
    }

    const result = await supabaseStorageService.uploadFile(
      'documents',
      file.originalname,
      file.buffer,
      userId,
      file.mimetype
    );

    logger.info('Document uploaded', { userId, documentType, url: result.url });

    res.json({ 
      success: true, 
      url: result.url,
      path: result.path,
      documentType: documentType || 'document'
    });
  } catch (error: any) {
    logger.error('Document upload failed', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload document' 
    });
  }
});

/**
 * Upload payment proof
 * POST /api/upload/payment-proof
 */
router.post('/payment-proof', upload.single('proof'), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ 
        success: false, 
        error: 'No file uploaded' 
      });
      return;
    }

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
      return;
    }

    const result = await supabaseStorageService.uploadFile(
      'payment-proofs',
      file.originalname,
      file.buffer,
      userId,
      file.mimetype
    );

    logger.info('Payment proof uploaded', { userId, url: result.url });

    res.json({ 
      success: true, 
      url: result.url,
      path: result.path 
    });
  } catch (error: any) {
    logger.error('Payment proof upload failed', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to upload payment proof' 
    });
  }
});

/**
 * Get user's uploaded files
 * GET /api/upload/files?bucket=user-uploads
 */
router.get('/files', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bucket } = req.query;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
      return;
    }

    if (!bucket || typeof bucket !== 'string') {
      res.status(400).json({ 
        success: false, 
        error: 'Bucket parameter is required' 
      });
      return;
    }

    const files = await supabaseStorageService.listUserFiles(bucket, userId);

    res.json({ 
      success: true, 
      files 
    });
  } catch (error: any) {
    logger.error('List files failed', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to list files' 
    });
  }
});

/**
 * Delete a file
 * DELETE /api/upload/file
 */
router.delete('/file', async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.userId;
    const { bucket, path } = req.body;

    if (!userId) {
      res.status(401).json({ 
        success: false, 
        error: 'Unauthorized' 
      });
      return;
    }

    if (!bucket || !path) {
      res.status(400).json({ 
        success: false, 
        error: 'Bucket and path are required' 
      });
      return;
    }

    // Verify the file belongs to the user
    if (!path.startsWith(userId + '/')) {
      res.status(403).json({ 
        success: false, 
        error: 'Access denied' 
      });
      return;
    }

    await supabaseStorageService.deleteFile(bucket, path);

    logger.info('File deleted', { userId, bucket, path });

    res.json({ 
      success: true, 
      message: 'File deleted successfully' 
    });
  } catch (error: any) {
    logger.error('File deletion failed', { error: error.message });
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Failed to delete file' 
    });
  }
});

export default router;


