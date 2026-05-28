import { Router } from 'express';
import { authMiddleware, siteFilterMiddleware } from '../middleware/auth';
import * as contactController from '../features/contacts/controller';

const router = Router();

// 公开接口（外部提交联系信息）
router.post('/contact', contactController.createContact);

// 需要认证的接口
router.get('/contacts', authMiddleware, siteFilterMiddleware, contactController.getContacts);
router.get('/contacts/:id', authMiddleware, siteFilterMiddleware, contactController.getContactById);
router.patch('/contacts/:id', authMiddleware, siteFilterMiddleware, contactController.updateContact);
router.delete('/contacts/:id', authMiddleware, siteFilterMiddleware, contactController.deleteContact);

export default router;
