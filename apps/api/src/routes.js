import express from 'express';
import prisma from './prisma.js';
import { articleSchema, normalizeTags } from './validators.js';
import { makeSlug } from './slug.js';

const router = express.Router();
const adminKey = process.env.ADMIN_KEY || '';

function requireAdmin(req, res, next) {
  if (!adminKey) {
    return res.status(500).json({ message: '服务端未配置管理密钥' });
  }
  const provided = req.header('x-admin-key');
  if (!provided || provided !== adminKey) {
    return res.status(403).json({ message: '无权限执行该操作' });
  }
  return next();
}

router.get('/health', (_req, res) => {
  res.json({ ok: true, service: 'itkb-api' });
});

router.get('/tags', async (_req, res, next) => {
  try {
    const rows = await prisma.article.findMany({ select: { tags: true } });
    const tags = [...new Set(rows.flatMap((row) => row.tags))].sort((a, b) => a.localeCompare(b));
    res.json(tags);
  } catch (error) {
    next(error);
  }
});

router.get('/articles', async (req, res, next) => {
  try {
    const q = (req.query.q || '').toString().trim();
    const tag = (req.query.tag || '').toString().trim();
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(50, Math.max(1, Number(req.query.limit || 10)));

    const where = {
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { summary: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } }
            ]
          }
        : {}),
      ...(tag ? { tags: { has: tag } } : {})
    };

    const [total, data] = await Promise.all([
      prisma.article.count({ where }),
      prisma.article.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      })
    ]);

    res.json({
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
      data
    });
  } catch (error) {
    next(error);
  }
});

router.get('/articles/:slug', async (req, res, next) => {
  try {
    const item = await prisma.article.findUnique({ where: { slug: req.params.slug } });
    if (!item) {
      return res.status(404).json({ message: '文章不存在' });
    }
    return res.json(item);
  } catch (error) {
    return next(error);
  }
});

router.post('/articles', requireAdmin, async (req, res, next) => {
  try {
    const parsed = articleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const payload = parsed.data;
    const slug = makeSlug(payload.title);
    const created = await prisma.article.create({
      data: {
        ...payload,
        summary: payload.summary || null,
        tags: normalizeTags(payload.tags),
        slug
      }
    });

    return res.status(201).json(created);
  } catch (error) {
    if (error.code === 'P2002') {
      return res.status(409).json({ message: '标题重复，请修改后重试' });
    }
    return next(error);
  }
});

router.put('/articles/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const parsed = articleSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: parsed.error.issues[0].message });
    }

    const payload = parsed.data;
    const updated = await prisma.article.update({
      where: { id },
      data: {
        title: payload.title,
        slug: makeSlug(payload.title),
        summary: payload.summary || null,
        content: payload.content,
        tags: normalizeTags(payload.tags)
      }
    });

    return res.json(updated);
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: '文章不存在' });
    }
    if (error.code === 'P2002') {
      return res.status(409).json({ message: '标题重复，请修改后重试' });
    }
    return next(error);
  }
});

router.delete('/articles/:id', requireAdmin, async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    await prisma.article.delete({ where: { id } });
    return res.status(204).send();
  } catch (error) {
    if (error.code === 'P2025') {
      return res.status(404).json({ message: '文章不存在' });
    }
    return next(error);
  }
});

export default router;
