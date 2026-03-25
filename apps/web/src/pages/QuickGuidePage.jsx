import { Link, useParams } from 'react-router-dom';
import { getQuickGuide } from '../quickGuides';

export default function QuickGuidePage() {
  const { id } = useParams();
  const guide = getQuickGuide(id || '');

  if (!guide) {
    return (
      <article className="panel article">
        <p className="hint">目录内容不存在</p>
        <Link to="/" className="text-link">返回首页</Link>
      </article>
    );
  }

  return (
    <article className="panel article">
      <Link to="/" className="text-link">返回首页</Link>
      <h1>{guide.title}</h1>
      <div className="meta-row">
        <span>目录知识</span>
        <span>{guide.level}</span>
      </div>
      <blockquote>{guide.summary}</blockquote>
      <pre>{guide.content}</pre>
    </article>
  );
}
