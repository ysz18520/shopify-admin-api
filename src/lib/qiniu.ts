import * as qiniu from 'qiniu';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';

const ACCESS_KEY = process.env.QINIU_ACCESS_KEY || '';
const SECRET_KEY = process.env.QINIU_SECRET_KEY || '';
const BUCKET_NAME = process.env.QINIU_BUCKET_NAME || '';
const BUCKET_DOMAIN = process.env.QINIU_BUCKET_DOMAIN || '';

const mac = new qiniu.auth.digest.Mac(ACCESS_KEY, SECRET_KEY);

interface UploadResult {
  key: string;
  url: string;
}

/**
 * 上传文件到七牛云
 * @param buffer 文件 Buffer
 * @param originalName 原始文件名
 * @param pathPrefix 存储路径前缀，如 'shopify/apopresent/'
 * @param timeout token 有效期（秒），默认 600
 */
export function uploadToQiniu(
  buffer: Buffer,
  originalName: string,
  pathPrefix: string = 'shopify/',
  timeout: number = 600
): Promise<UploadResult> {
  return new Promise((resolve, reject) => {
    const ext = path.extname(originalName) || '';
    const fileKey = `${pathPrefix}${uuidv4().replace(/-/g, '')}${ext}`;

    const options = {
      scope: `${BUCKET_NAME}:${fileKey}`,
      expires: timeout,
    };
    const putPolicy = new qiniu.rs.PutPolicy(options);
    const uploadToken = putPolicy.uploadToken(mac);

    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2; // 华南区域
    const formUploader = new qiniu.form_up.FormUploader(config);
    const putExtra = new qiniu.form_up.PutExtra();

    formUploader.put(uploadToken, fileKey, buffer, putExtra, (err, body, info) => {
      if (err) {
        reject(err);
        return;
      }
      if (info.statusCode !== 200) {
        reject(new Error(`七牛云上传失败: ${info.statusCode} ${JSON.stringify(body)}`));
        return;
      }
      resolve({
        key: fileKey,
        url: `${BUCKET_DOMAIN}/${fileKey}`,
      });
    });
  });
}

/**
 * 从七牛云删除文件
 */
export function deleteFromQiniu(fileKey: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const config = new qiniu.conf.Config();
    config.zone = qiniu.zone.Zone_z2; // 华南区域
    const bucketManager = new qiniu.rs.BucketManager(mac, config);

    bucketManager.delete(BUCKET_NAME, fileKey, (err, _body, info) => {
      if (err) {
        reject(err);
        return;
      }
      if (info.statusCode !== 200 && info.statusCode !== 612) {
        // 612 = file not found, still consider success
        reject(new Error(`七牛云删除失败: ${info.statusCode}`));
        return;
      }
      resolve();
    });
  });
}

/**
 * 拼接完整 CDN URL
 */
export function buildQiniuUrl(key: string): string | null {
  if (!key) return null;
  return `${BUCKET_DOMAIN}/${key}`;
}
