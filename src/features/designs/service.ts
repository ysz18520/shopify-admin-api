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

export async function createDesign(data: any) {
  const design = await prisma.design.create({
    data: {
      site: data.site,
      designId: data.designId || data.design_id || generateDesignId(),
      designTitle: data.designTitle || data.design_title || '',
      designDescription: data.designDescription || data.design_description || '',
      designAuthor: data.designAuthor || data.design_author || '',
      designImg: data.designImg || data.design_img || '',
      series: data.series || '',
      project: data.project || '',
      votingCount: data.votingCount || data.voting_count || 0,
      addedBy: data.addedBy || data.added_by || '',
    },
  });
  return formatDesign(design);
}

export async function updateDesign(id: number, data: any, siteFilter?: string) {
  const existing = await prisma.design.findUnique({ where: { id } });
  if (!existing) throw new Error('设计作品不存在');
  if (siteFilter && existing.site !== siteFilter) throw new Error('Permission denied');

  const updateData: any = {};
  if (data.designTitle || data.design_title) updateData.designTitle = data.designTitle || data.design_title;
  if (data.designDescription || data.design_description) updateData.designDescription = data.designDescription || data.design_description;
  if (data.designAuthor || data.design_author) updateData.designAuthor = data.designAuthor || data.design_author;
  if (data.designImg || data.design_img) updateData.designImg = data.designImg || data.design_img;
  if (data.series) updateData.series = data.series;
  if (data.project) updateData.project = data.project;
  if (data.votingCount || data.voting_count) updateData.votingCount = data.votingCount || data.voting_count;

  const design = await prisma.design.update({
    where: { id },
    data: updateData,
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
