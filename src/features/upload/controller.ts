import type { Request, Response } from 'express';
import * as uploadService from './service';

/**
 * C端文件上传（Shopify 前端调用）
 * POST /api/upload?site=apopresent
 */
export async function uploadFile(req: Request, res: Response) {
  try {
    const site = req.query.site as string;
    if (!site) {
      res.status(400).json({ error: 'site is required' });
      return;
    }

    const file = req.file;
    if (!file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    // 获取店铺上传配置
    const config = await uploadService.getUploadConfig(site);

    // 校验文件
    const error = uploadService.validateFile(file.originalname, file.size, file.mimetype, config);
    if (error) {
      res.status(400).json({ error });
      return;
    }

    // 上传并保存记录
    const result = await uploadService.uploadFile(
      file.buffer,
      file.originalname,
      file.mimetype,
      file.size,
      site
    );

    res.status(201).json(result);
  } catch (error: any) {
    console.error('Upload file error:', error);
    if (error.message === 'Store not found') {
      res.status(404).json({ error: 'Store not found' });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * B端文件列表（管理后台）
 * GET /api/admin/files?site=xxx&page=1&pageSize=20
 */
export async function getFileList(req: Request, res: Response) {
  try {
    const site = req.query.site as string | undefined;
    const page = parseInt(req.query.page as string) || 1;
    const pageSize = parseInt(req.query.pageSize as string) || 20;

    const result = await uploadService.getFileList(site, page, pageSize);
    res.json(result);
  } catch (error) {
    console.error('Get file list error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

/**
 * B端删除文件（管理后台）
 * DELETE /api/admin/files/:id
 */
export async function deleteFile(req: Request, res: Response) {
  try {
    const id = req.params.id as string;
    const rawSite = req.query.site;
    const site = typeof rawSite === 'string' ? rawSite : undefined;

    await uploadService.deleteFile(id, site);
    res.json({ success: true });
  } catch (error: any) {
    console.error('Delete file error:', error);
    if (error.message === 'File not found') {
      res.status(404).json({ error: error.message });
      return;
    }
    if (error.message === 'Permission denied') {
      res.status(403).json({ error: error.message });
      return;
    }
    res.status(500).json({ error: 'Internal server error' });
  }
}
