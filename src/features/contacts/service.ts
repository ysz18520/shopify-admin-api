import prisma from '../../lib/prisma';

export async function createContact(data: {
  site: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  remark?: string;
  source?: string;
  project?: string;
}) {
  if (!data.name || !data.email) {
    throw new Error('姓名和邮箱不能为空');
  }

  const contact = await prisma.contact.create({
    data: {
      site: data.site,
      name: data.name,
      email: data.email,
      phone: data.phone || '',
      company: data.company || '',
      remark: data.remark || '',
      source: data.source || '',
      project: data.project || '',
    },
  });
  return contact;
}

export async function getContacts(params: {
  site?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (params.site) where.site = params.site;
  if (params.keyword) {
    where.OR = [
      { name: { contains: params.keyword } },
      { email: { contains: params.keyword } },
      { company: { contains: params.keyword } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.contact.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.contact.count({ where }),
  ]);

  return { data: items, count: total };
}

export async function getContactById(id: number, siteFilter?: string) {
  const contact = await prisma.contact.findUnique({ where: { id } });
  if (!contact) throw new Error('联系信息不存在');
  if (siteFilter && contact.site !== siteFilter) throw new Error('Permission denied');
  return contact;
}

export async function updateContact(id: number, data: {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  remark?: string;
  source?: string;
  project?: string;
}, siteFilter?: string) {
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new Error('联系信息不存在');
  if (siteFilter && existing.site !== siteFilter) throw new Error('Permission denied');

  return prisma.contact.update({ where: { id }, data });
}

export async function deleteContact(id: number, siteFilter?: string) {
  const existing = await prisma.contact.findUnique({ where: { id } });
  if (!existing) throw new Error('联系信息不存在');
  if (siteFilter && existing.site !== siteFilter) throw new Error('Permission denied');
  await prisma.contact.delete({ where: { id } });
}
