import { Router } from 'express';
import { authMiddleware, siteFilterMiddleware } from '../middleware/auth';
import * as adminController from '../features/admin/controller';
import * as storeController from '../features/store/controller';

const router = Router();

// 公开接口
router.post('/login', adminController.login);

// 需要鉴权的接口
router.use(authMiddleware);
router.use(siteFilterMiddleware);

// 店铺管理（超管可操作所有店铺）
router.get('/stores', storeController.getAllStores);
router.get('/stores/:name', storeController.getStoreByName);
router.post('/stores', storeController.createStore);
router.put('/stores/:name', storeController.updateStore);
router.put('/stores/:name/rename', storeController.renameStore);
router.delete('/stores/:name', storeController.deleteStore);

// 预约管理
router.get('/bookings', adminController.getBookings);
router.put('/bookings/:id/cancel', adminController.cancelBooking);
router.get('/stats', adminController.getStats);
router.get('/availability', adminController.getAvailability);
router.put('/availability', adminController.saveAvailability);
router.get('/holidays', adminController.getHolidays);
router.post('/holidays', adminController.addHoliday);
router.delete('/holidays/:id', adminController.removeHoliday);

export default router;
