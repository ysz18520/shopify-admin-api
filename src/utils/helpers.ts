import { v4 as uuidv4 } from 'uuid';

const QINIU_DOMAIN = process.env.QINIU_DOMAIN || 'https://image.sifanonline.com';

export function generateDesignId(): string {
  return uuidv4().replace(/-/g, '').substring(0, 8).toUpperCase();
}

export function formatDesign(row: any) {
  return {
    id: row.id,
    design_id: row.designId,
    design_title: row.designTitle,
    design_description: row.designDescription,
    design_author: row.designAuthor,
    design_img: row.designImg,
    design_img_url: row.designImg ? `${QINIU_DOMAIN}/${row.designImg}` : null,
    voting_count: row.votingCount,
    series: row.series,
    project: row.project,
    added_by: row.addedBy,
    created_at: row.createdAt,
  };
}
