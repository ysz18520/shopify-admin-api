export const QINIU_CONFIG = {
  accessKey: process.env.QINIU_ACCESS_KEY || '',
  secretKey: process.env.QINIU_SECRET_KEY || '',
  bucketName: process.env.QINIU_BUCKET_NAME || 'opjoys01',
  domain: process.env.QINIU_DOMAIN || 'https://image.sifanonline.com',
  uploadUrl: process.env.QINIU_UPLOAD_URL || 'https://up.qiniup.com',
};
