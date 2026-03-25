import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { getArticle } from '../api';

export default function ArticlePage() {
  const { slug } = useParams();
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getArticle(slug)
      .then(setItem)
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return <div className="panel"><p className="hint">加载中...</p></div>;
  }

  if (!item) {
    return (
      <div className="panel">
        <p className="hint">文章不存在</p>
        <Link to="/" className="text-link">返回首页</Link>
      </div>
    );
  }

  return (
    <article className="panel article">
      <Link to="/" className="text-link">返回首页</Link>
      <h1>{item.title}</h1>
      <div className="meta-row">
        <span>更新于 {new Date(item.updatedAt).toLocaleString('zh-CN')}</span>
        <span>{item.tags.join(' / ')}</span>
      </div>
      {item.summary && <blockquote>{item.summary}</blockquote>}
      <pre>{item.content}</pre>
    </article>
  );
}
