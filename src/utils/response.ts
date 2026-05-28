import { Response } from 'express';

export function success(res: Response, data: any, message = '操作成功') {
  res.json({ code: 200, message, data });
}

export function successList(res: Response, data: any[], count: number) {
  res.json({ code: 200, data, count });
}

export function fail(res: Response, message: string, code = 400, errors?: any) {
  const body: any = { code, message };
  if (errors) body.errors = errors;
  res.status(code).json(body);
}
