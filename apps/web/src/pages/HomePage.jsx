import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { createArticle, getArticles, getTags, setAdminKey } from '../api';
import { quickGuides, TEMPLATE_STENDERS_QI } from '../quickGuides';
import KnowledgeInteractive3D from '../components/KnowledgeInteractive3D';

const emptySubmitForm = {
  title: '',
  summary: '',
  tagsText: '',
  content: ''
};

function parseTags(tagsText) {
  return (tagsText || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function HomePage() {
  const [q, setQ] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);

  const [submitForm, setSubmitForm] = useState(emptySubmitForm);
  const [submitKey, setSubmitKey] = useState('');
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const subtitle = useMemo(() => {
    if (selectedTag) return `当前按标签「${selectedTag}」筛选`;
    if (q.trim()) return `当前关键词「${q.trim()}」`;
    return 'Stitch 精选模板风格知识空间，卡片化检索与单页直达';
  }, [q, selectedTag]);

  const filteredGuides = useMemo(() => {
    const keyword = q.trim().toLowerCase();
    if (!keyword) return quickGuides;
    return quickGuides.filter((item) => {
      return item.title.toLowerCase().includes(keyword) || item.summary.toLowerCase().includes(keyword);
    });
  }, [q]);

  async function loadArticles() {
    setLoading(true);
    try {
      const res = await getArticles({ q, tag: selectedTag, page: 1, limit: 20 });
      setArticles(res.data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    localStorage.setItem('kb_template_name', TEMPLATE_STENDERS_QI);
    const cachedKey = localStorage.getItem('itkb_admin_key') || '';
    setSubmitKey(cachedKey);
    setAdminKey(cachedKey);
    getTags().then(setTags).catch(() => setTags([]));
  }, []);

  useEffect(() => {
    loadArticles();
  }, [q, selectedTag]);

  async function onSubmitArticle(event) {
    event.preventDefault();
    const safeKey = submitKey.trim();
    if (!safeKey) {
      setSubmitMessage('请先填写管理密钥后再提交。');
      return;
    }

    const payload = {
      title: submitForm.title,
      summary: submitForm.summary,
      tags: parseTags(submitForm.tagsText),
      content: submitForm.content
    };

    try {
      setSubmitLoading(true);
      setAdminKey(safeKey);
      localStorage.setItem('itkb_admin_key', safeKey);
      await createArticle(payload);
      setSubmitForm(emptySubmitForm);
      setSubmitMessage('提交成功，已发布到知识库。');
      await Promise.all([loadArticles(), getTags().then(setTags).catch(() => setTags([]))]);
    } catch (error) {
      setSubmitMessage(error.response?.data?.message || '提交失败，请检查管理密钥或内容格式。');
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <div>
      <section className="hero">
        <p className="hero-kicker">Nordic Ritual</p>
        <h1>IT 小琦知识库</h1>
        <p>{subtitle}</p>
      </section>

      <KnowledgeInteractive3D />

      <section className="panel">
        <div className="toolbar">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="search"
            placeholder="检索目录 / 知识文章..."
          />
        </div>

        <h2 className="section-title">内容提交发布</h2>
        <form className="form-grid" onSubmit={onSubmitArticle}>
          <label>
            管理密钥（ADMIN_KEY）
            <input
              type="password"
              value={submitKey}
              onChange={(e) => setSubmitKey(e.target.value)}
              placeholder="输入管理密钥后可提交发布"
            />
          </label>
          <label>
            标题
            <input
              value={submitForm.title}
              onChange={(e) => setSubmitForm({ ...submitForm, title: e.target.value })}
              placeholder="例如：Windows 蓝屏快速排障"
              required
            />
          </label>
          <label>
            摘要
            <input
              value={submitForm.summary}
              onChange={(e) => setSubmitForm({ ...submitForm, summary: e.target.value })}
              placeholder="一句话描述本条知识"
            />
          </label>
          <label>
            标签（逗号分隔）
            <input
              value={submitForm.tagsText}
              onChange={(e) => setSubmitForm({ ...submitForm, tagsText: e.target.value })}
              placeholder="Windows, 排障, 运维"
            />
          </label>
          <label>
            正文
            <textarea
              rows={8}
              value={submitForm.content}
              onChange={(e) => setSubmitForm({ ...submitForm, content: e.target.value })}
              placeholder="写入可执行步骤、命令和注意事项"
              required
            />
          </label>
          <div className="actions">
            <button className="btn-primary" type="submit" disabled={submitLoading}>
              {submitLoading ? '提交中...' : '提交并发布'}
            </button>
            <Link className="btn-ghost" to="/admin">进入管理控制台（更新/删除）</Link>
          </div>
          {submitMessage && <p className="hint">{submitMessage}</p>}
        </form>

        <h2 className="section-title">Stitch 精选模板目录</h2>
        <div className="grid quick-grid">
          <Link to="/lab/receipt" className="card quick-card">
            <h3>Stitch 目录检索台</h3>
            <p>目录内容已替换到小票模板，点击即可完成检索并跳转详情。</p>
            <div className="meta-row">
              <span>Template: stitch_curated</span>
              <span>已记忆</span>
            </div>
          </Link>
        </div>

        <h2 className="section-title">检索目录</h2>
        <div className="grid quick-grid">
          {filteredGuides.map((item) => (
            <Link to={`/quick/${item.id}`} className="card quick-card" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <div className="meta-row">
                <span>单击跳转界面</span>
                <span>{item.level}</span>
              </div>
            </Link>
          ))}
        </div>

        <h2 className="section-title">知识文章</h2>
        <div className="chips">
          <button className={!selectedTag ? 'chip active' : 'chip'} onClick={() => setSelectedTag('')}>
            全部
          </button>
          {tags.map((tag) => (
            <button
              key={tag}
              className={selectedTag === tag ? 'chip active' : 'chip'}
              onClick={() => setSelectedTag(tag)}
            >
              {tag}
            </button>
          ))}
        </div>

        {loading && <p className="hint">加载中...</p>}
        {!loading && articles.length === 0 && <p className="hint">暂无匹配内容</p>}

        <div className="grid">
          {articles.map((item) => (
            <Link to={`/article/${item.slug}`} className="card" key={item.id}>
              <h3>{item.title}</h3>
              <p>{item.summary || item.content.slice(0, 120)}</p>
              <div className="meta-row">
                <span>{new Date(item.updatedAt).toLocaleString('zh-CN')}</span>
                <span>{item.tags.join(' / ')}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
