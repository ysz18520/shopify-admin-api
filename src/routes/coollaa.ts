import { Router } from 'express';
import * as bookingController from '../features/booking/controller';

const router = Router();

// Booking
router.get('/booking/config', bookingController.getConfig);
router.get('/booking/slots', bookingController.getSlots);
router.post('/booking', bookingController.createBooking);
router.put('/booking/:id/cancel', bookingController.cancelBooking);

export default router;
