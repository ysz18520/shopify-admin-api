import { Router } from 'express';
import { authMiddleware, siteFilterMiddleware } from '../middleware/auth';
import * as designController from '../features/designs/controller';
import { getQiniuUploadToken } from '../features/designs/qiniu';

const router = Router();

// 公开接口（无需认证，按 site 参数过滤）
router.get('/designs', designController.getDesigns);
router.get('/designs/:id', designController.getDesignById);
router.post('/designs/:id/vote', designController.voteDesign);

// 需要认证的接口（自动注入 site 过滤）
router.post('/designs', authMiddleware, siteFilterMiddleware, designController.createDesign);
router.patch('/designs/:id', authMiddleware, siteFilterMiddleware, designController.updateDesign);
router.delete('/designs/:id', authMiddleware, siteFilterMiddleware, designController.deleteDesign);

// 七牛云上传凭证
router.get('/qiniu-upload-token', authMiddleware, getQiniuUploadToken);

export default router;
