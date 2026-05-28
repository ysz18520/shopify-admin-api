import prisma from '../../lib/prisma';
import { generateDesignId, formatDesign } from '../../utils/helpers';

export async function getDesigns(params: {
  site?: string;
  page?: number;
  pageSize?: number;
  keyword?: string;
  series?: string;
  project?: string;
}) {
  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const skip = (page - 1) * pageSize;

  const where: any = {};
  if (params.site) where.site = params.site;
  if (params.keyword) {
    where.OR = [
      { designTitle: { contains: params.keyword } },
      { designAuthor: { contains: params.keyword } },
    ];
  }
  if (params.series) where.series = params.series;
  if (params.project) where.project = params.project;

  const [items, total] = await Promise.all([
    prisma.design.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
    }),
    prisma.design.count({ where }),
  ]);

  return { data: items.map(formatDesign), count: total };
}

export async function getDesignById(id: number, siteFilter?: string) {
  const design = await prisma.design.findUnique({ where: { id } });
  if (!design) throw new Error('设计作品不存在');
  if (siteFilter && design.site !== siteFilter) throw new Error('Permission denied');
  return formatDesign(design);
}

export async function createDesign(data: {
  site: string;
  designId?: string;
  designTitle: string;
  designDescription?: string;
  designAuthor?: string;
  designImg?: string;
  series?: string;
  project?: string;
  votingCount?: number;
  addedBy?: string;
}) {
  const design = await prisma.design.create({
    data: {
      site: data.site,
      designId: data.designId || generateDesignId(),
      designTitle: data.designTitle,
      designDescription: data.designDescription || '',
      designAuthor: data.designAuthor || '',
      designImg: data.designImg || '',
      series: data.series || '',
      project: data.project || '',
      votingCount: data.votingCount || 0,
      addedBy: data.addedBy || '',
    },
  });
  return formatDesign(design);
}

export async function updateDesign(id: number, data: {
  designTitle?: string;
  designDescription?: string;
  designAuthor?: string;
  designImg?: string;
  series?: string;
  project?: string;
  votingCount?: number;
}, siteFilter?: string) {
  const existing = await prisma.design.findUnique({ where: { id } });
  if (!existing) throw new Error('设计作品不存在');
  if (siteFilter && existing.site !== siteFilter) throw new Error('Permission denied');

  const design = await prisma.design.update({
    where: { id },
    data,
  });
  return formatDesign(design);
}

export async function deleteDesign(id: number, siteFilter?: string) {
  const existing = await prisma.design.findUnique({ where: { id } });
  if (!existing) throw new Error('设计作品不存在');
  if (siteFilter && existing.site !== siteFilter) throw new Error('Permission denied');
  await prisma.design.delete({ where: { id } });
}

export async function voteDesign(id: number) {
  const existing = await prisma.design.findUnique({ where: { id } });
  if (!existing) throw new Error('设计作品不存在');

  const design = await prisma.design.update({
    where: { id },
    data: { votingCount: { increment: 1 } },
  });
  return { voting_count: design.votingCount };
}
