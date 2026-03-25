import prisma from '../src/prisma.js';

const seedData = [
  {
    title: 'Linux 常见排障命令速查',
    summary: '从进程、端口、磁盘到网络连通性的一页清单。',
    content: `# Linux 常见排障命令\n\n## 进程与资源\n- top\n- htop\n- ps aux | grep <name>\n\n## 端口与网络\n- ss -lntp\n- netstat -tunlp\n- curl -I <url>\n- traceroute <host>`,
    tags: ['Linux', '运维', '排障']
  },
  {
    title: 'HTTP 状态码排查思路',
    summary: '定位 4xx/5xx 问题时最实用的检查顺序。',
    content: `# HTTP 状态码排查\n\n## 4xx\n- 401: 鉴权失效\n- 403: 权限策略拒绝\n- 404: 路径或路由不存在\n\n## 5xx\n- 500: 应用内部异常\n- 502: 网关转发异常\n- 504: 上游响应超时`,
    tags: ['HTTP', '后端', '排障']
  }
];

function toSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function main() {
  for (const item of seedData) {
    const slug = toSlug(item.title);
    await prisma.article.upsert({
      where: { slug },
      update: {
        title: item.title,
        summary: item.summary,
        content: item.content,
        tags: item.tags
      },
      create: {
        ...item,
        slug
      }
    });
  }
  console.log('Seed completed');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
