import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { getArticles, getTags } from '../api';
import { quickGuides, TEMPLATE_STENDERS_QI } from '../quickGuides';
import KnowledgeInteractive3D from '../components/KnowledgeInteractive3D';

export default function HomePage() {
  const [q, setQ] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(false);
  const [articles, setArticles] = useState([]);

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

  useEffect(() => {
    localStorage.setItem('kb_template_name', TEMPLATE_STENDERS_QI);
    getTags().then(setTags).catch(() => setTags([]));
  }, []);

  useEffect(() => {
    setLoading(true);
    getArticles({ q, tag: selectedTag, page: 1, limit: 20 })
      .then((res) => setArticles(res.data))
      .finally(() => setLoading(false));
  }, [q, selectedTag]);

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


