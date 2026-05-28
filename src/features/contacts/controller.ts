import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { success, successList, fail } from '../../utils/response';
import * as contactService from './service';

export async function createContact(req: AuthRequest, res: Response) {
  try {
    const site = req.user?.role === 'site'
      ? req.user.site
      : (req.body.site || 'default');
    const contact = await contactService.createContact({ ...req.body, site });
    success(res, contact, '提交成功');
  } catch (error: any) {
    fail(res, error.message || '提交失败');
  }
}

export async function getContacts(req: AuthRequest, res: Response) {
  try {
    const site = typeof req.query.site === 'string' ? req.query.site : undefined;
    const page = typeof req.query.page === 'string' ? parseInt(req.query.page) : 1;
    const pageSize = typeof req.query.page_size === 'string' ? parseInt(req.query.page_size) : 10;
    const keyword = typeof req.query.keyword === 'string' ? req.query.keyword : undefined;

    const result = await contactService.getContacts({ site, page, pageSize, keyword });
    successList(res, result.data, result.count);
  } catch (error: any) {
    fail(res, error.message || '获取联系信息失败', 500);
  }
}

export async function getContactById(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    const siteFilter = req.user?.role === 'site' ? req.user.site : undefined;
    const contact = await contactService.getContactById(id, siteFilter);
    success(res, contact);
  } catch (error: any) {
    fail(res, error.message || '获取联系信息失败', 404);
  }
}

export async function updateContact(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    const siteFilter = req.user?.role === 'site' ? req.user.site : undefined;
    const contact = await contactService.updateContact(id, req.body, siteFilter);
    success(res, contact, '更新成功');
  } catch (error: any) {
    fail(res, error.message || '更新失败');
  }
}

export async function deleteContact(req: AuthRequest, res: Response) {
  try {
    const id = parseInt(String(req.params.id));
    const siteFilter = req.user?.role === 'site' ? req.user.site : undefined;
    await contactService.deleteContact(id, siteFilter);
    success(res, null, '删除成功');
  } catch (error: any) {
    fail(res, error.message || '删除失败');
  }
}
