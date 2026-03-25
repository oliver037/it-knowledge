import { z } from 'zod';

export const articleSchema = z.object({
  title: z.string().min(2, '标题至少 2 个字符'),
  summary: z.string().max(300, '摘要不能超过 300 个字符').optional().or(z.literal('')),
  content: z.string().min(10, '正文至少 10 个字符'),
  tags: z.array(z.string().min(1)).max(8).optional()
});

export function normalizeTags(tags = []) {
  return [...new Set(tags.map((tag) => tag.trim()).filter(Boolean))];
}
