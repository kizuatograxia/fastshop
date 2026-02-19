import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads/books');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        console.log('📁 Upload destination:', uploadDir);
        console.log('📄 File field:', file.fieldname);
        console.log('📝 Original name:', file.originalname);
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Sanitize filename and append timestamp to avoid collisions
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        const filename = file.fieldname + '-' + uniqueSuffix + ext;
        console.log('💾 Saving as:', filename);
        cb(null, filename);
    }
});

const fileFilter = (req: any, file: any, cb: any) => {
    console.log('🔍 Checking file:', file.originalname, 'MIME:', file.mimetype);

    const allowedMimes = [
        'application/epub+zip',
        'application/pdf',
        'application/octet-stream', // Some browsers send this for unknown types
        'image/jpeg',
        'image/jpg',
        'image/png',
        'image/webp',
        'image/gif'
    ];

    // Also check file extension as fallback
    const ext = file.originalname.toLowerCase().split('.').pop();
    const allowedExtensions = ['epub', 'pdf', 'jpg', 'jpeg', 'png', 'webp', 'gif'];

    if (allowedMimes.includes(file.mimetype) || allowedExtensions.includes(ext || '')) {
        console.log('✅ File accepted');
        cb(null, true);
    } else {
        console.log('❌ File rejected - invalid type');
        cb(new Error(`Invalid file type: ${file.mimetype}. Only EPUB, PDF, and Images are allowed.`), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB limit
    }
});
