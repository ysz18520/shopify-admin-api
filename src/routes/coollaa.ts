import { Router } from 'express';
import multer from 'multer';
import * as bookingController from '../features/booking/controller';
import * as uploadController from '../features/upload/controller';

const router = Router();

// Multer 配置：内存存储，60MB 限制
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 60 * 1024 * 1024 }, // 60MB 硬上限（实际限制由店铺配置控制）
});

// Booking
router.get('/booking/config', bookingController.getConfig);
router.get('/booking/slots', bookingController.getSlots);
router.post('/booking', bookingController.createBooking);
router.put('/booking/:id/cancel', bookingController.cancelBooking);

// File Upload
router.post('/upload', upload.single('file'), uploadController.uploadFile);

export default router;
