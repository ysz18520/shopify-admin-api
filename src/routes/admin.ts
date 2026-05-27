import { Router } from 'express';
import { authMiddleware, siteFilterMiddleware } from '../middleware/auth';
import * as adminController from '../features/admin/controller';

const router = Router();

// 公开接口
router.post('/login', adminController.login);

// 需要鉴权的接口
router.use(authMiddleware);
router.use(siteFilterMiddleware);

router.get('/bookings', adminController.getBookings);
router.put('/bookings/:id/cancel', adminController.cancelBooking);
router.get('/stats', adminController.getStats);
router.get('/availability', adminController.getAvailability);
router.put('/availability', adminController.saveAvailability);
router.get('/holidays', adminController.getHolidays);
router.post('/holidays', adminController.addHoliday);
router.delete('/holidays/:id', adminController.removeHoliday);

export default router;
