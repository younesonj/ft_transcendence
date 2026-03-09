import { diskStorage } from 'multer';
import { extname } from 'path';
import { BadRequestException } from '@nestjs/common';
import * as fs from 'fs';

// Configure storage
export const multerConfig = {
    storage: diskStorage({
        destination: (req, file, callback) => {
            const destinationPath = './uploads/avatars';
            fs.mkdirSync(destinationPath, { recursive: true });
            callback(null, destinationPath);
        },
        filename: (req, file, callback) => {
            // Generate unique filename: userId_timestamp.ext
            const userId = req.user?.userId || 'unknown';
            const uniqueSuffix = Date.now();
            const ext = extname(file.originalname);
            const filename = `${userId}_${uniqueSuffix}${ext}`;
            callback(null, filename);
        },
    }),
    fileFilter: (req, file, callback) => {
        // Only allow images
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|webp)$/)) {
            return callback(
                new BadRequestException('Only image files are allowed!'),
                false,
            );
        }
        callback(null, true);
    },
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB max
    },
};