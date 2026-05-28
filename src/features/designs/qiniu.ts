import { Response } from 'express';
import qiniu from 'qiniu';
import { v4 as uuidv4 } from 'uuid';
import { AuthRequest } from '../../middleware/auth';
import { success, fail } from '../../utils/response';
import { QINIU_CONFIG } from '../../config/qiniu';

export function getQiniuUploadToken(_req: AuthRequest, res: Response) {
  try {
    const mac = new qiniu.auth.digest.Mac(QINIU_CONFIG.accessKey, QINIU_CONFIG.secretKey);
    const key = `shopify/${uuidv4().replace(/-/g, '')}`;
    const putPolicy = new qiniu.rs.PutPolicy({ scope: `${QINIU_CONFIG.bucketName}:${key}` });
    const uploadToken = putPolicy.uploadToken(mac);

    success(res, {
      token: uploadToken,
      key,
      upload_url: QINIU_CONFIG.uploadUrl,
      domain: QINIU_CONFIG.domain,
    });
  } catch (error: any) {
    fail(res, error.message || '获取上传凭证失败', 500);
  }
}
