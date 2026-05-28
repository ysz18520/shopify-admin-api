import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { success, successList, fail } from '../../utils/response';
import * as designService from './service';

export async function getDesigns(req: AuthRequest, res: Response) {
  try {
    const site = typeof req.query.site === 'string' ? req.query.site : undefined;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
    const pageSize = typeof req.query.page_size === 'string' ? parseInt(req.query.page_size) : 10;
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : undefined;
    const series = typeof req.query.series === 'string' ? req.query.series : undefined;
    const project = typeof req.query.project === 'string' ? req.query.project : undefined;

    const result = await designService.getDesigns({ site, page, pageSize, keyword, series, project });
    successList(res, result.data, result.count);
  } catch (error: any) {
    fail(res, error.message || '获取设计列表失败', 500);
  }
}

export async function getDesignById(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    const siteFilter = req.user?.role === 'site' ? req.user.site : undefined;
    const design = await designService.getDesignById(id, siteFilter);
    success(res, design);
  } catch (error: any) {
    fail(res, error.message || '获取设计详情失败', 404);
  }
}

export async function createDesign(req: AuthRequest, res: Response) {
  try {
    const site = req.user?.role === 'site'
      ? req.user.site
      : (req.body.site || 'default');
    const design = await designService.createDesign({
      ...req.body,
      site,
      addedBy: req.user?.username || '',
    });
    success(res, design, '创建成功');
  } catch (error: any) {
    fail(res, error.message || '创建失败');
  }
}

export async function updateDesign(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    const siteFilter = req.user?.role === 'site' ? req.user.site : undefined;
    const design = await designService.updateDesign(id, req.body, siteFilter);
    success(res, design, '更新成功');
  } catch (error: any) {
    fail(res, error.message || '更新失败');
  }
}

export async function deleteDesign(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    const siteFilter = req.user?.role === 'site' ? req.user.site : undefined;
    await designService.deleteDesign(id, siteFilter);
    success(res, null, '删除成功');
  } catch (error: any) {
    fail(res, error.message || '删除失败');
  }
}

export async function voteDesign(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    const result = await designService.voteDesign(id);
    success(res, result, '投票成功');
  } catch (error: any) {
    fail(res, error.message || '投票失败');
  }
}
