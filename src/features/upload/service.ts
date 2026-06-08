import prisma from '../../lib/prisma';
import { uploadToQiniu, deleteFromQiniu } from '../../lib/qiniu';
import path from 'path';

export interface UploadConfig {
  maxFileSize: number;     // 字节
  allowedFileTypes: string; // "*" 或 ".jpg,.png,.pdf"
}

/**
 * 获取店铺的上传配置
 */
export async function getUploadConfig(site: string): Promise<UploadConfig> {
  const store = await prisma.store.findUnique({
    where: { name: site },
  });

  if (!store) {
    throw new Error('Store not found');
  }

  return {
    maxFileSize: store.maxFileSize,
    allowedFileTypes: store.allowedFileTypes,
  };
}

/**
 * 校验文件是否允许上传
 */
export function validateFile(
  fileName: string,
  fileSize: number,
  mimeType: string,
  config: UploadConfig
): string | null {
  // 检查文件大小
  if (fileSize > config.maxFileSize) {
    const maxMB = Math.round(config.maxFileSize / 1024 / 1024);
    return `文件大小超过限制（最大 ${maxMB}MB）`;
  }

  // 检查文件类型
  if (config.allowedFileTypes !== '*') {
    const ext = path.extname(fileName).toLowerCase();
    const allowed = config.allowedFileTypes.split(',').map(t => t.trim().toLowerCase());
    if (!allowed.includes(ext)) {
      return `不支持的文件类型 ${ext}，允许的类型：${config.allowedFileTypes}`;
    }
  }

  return null;
}

/**
 * 上传文件并保存记录
 */
export async function uploadFile(
  buffer: Buffer,
  originalName: string,
  mimeType: string,
  fileSize: number,
  site: string,
  uploadedBy?: string
) {
  const pathPrefix = `shopify/${site}/`;

  const result = await uploadToQiniu(buffer, originalName, pathPrefix);

  const file = await prisma.uploadedFile.create({
    data: {
      site,
      fileName: originalName,
      fileKey: result.key,
      fileUrl: result.url,
      fileSize,
      mimeType,
      uploadedBy: uploadedBy || null,
    },
  });

  return file;
}

/**
 * 获取文件列表
 */
export async function getFileList(site: string | undefined, page: number = 1, pageSize: number = 20) {
  const where = site ? { site } : {};

  const [files, total] = await Promise.all([
    prisma.uploadedFile.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    prisma.uploadedFile.count({ where }),
  ]);

  return { files, total, page, pageSize };
}

/**
 * 删除文件（数据库 + 七牛云）
 */
export async function deleteFile(id: string, site?: string) {
  const file = await prisma.uploadedFile.findUnique({ where: { id } });

  if (!file) {
    throw new Error('File not found');
  }

  // 权限检查：如果指定了 site，确保文件属于该店铺
  if (site && file.site !== site) {
    throw new Error('Permission denied');
  }

  // 从七牛云删除
  try {
    await deleteFromQiniu(file.fileKey);
  } catch (error) {
    console.error('Delete from Qiniu failed:', error);
    // 即使七牛云删除失败，也删除数据库记录
  }

  // 从数据库删除
  await prisma.uploadedFile.delete({ where: { id } });

  return { success: true };
}
