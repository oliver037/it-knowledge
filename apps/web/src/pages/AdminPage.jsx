import { useEffect, useMemo, useState } from 'react';
import { createArticle, deleteArticle, getArticles, setAdminKey, updateArticle } from '../api';

const emptyForm = {
  title: '',
  summary: '',
  content: '',
  tagsText: ''
};

function parseTags(tagsText) {
  return tagsText
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);
}

export default function AdminPage() {
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(null);
  const [list, setList] = useState([]);
  const [message, setMessage] = useState('');
  const [adminKeyInput, setAdminKeyInput] = useState('');

  const submitLabel = useMemo(() => (editing ? '更新文章' : '发布文章'), [editing]);

  async function reload() {
    const res = await getArticles({ page: 1, limit: 50 });
    setList(res.data);
  }

  useEffect(() => {
    const cached = localStorage.getItem('itkb_admin_key') || '';
    setAdminKeyInput(cached);
    setAdminKey(cached);
    reload();
  }, []);

  async function onSubmit(event) {
    event.preventDefault();
    const payload = {
      title: form.title,
      summary: form.summary,
      content: form.content,
      tags: parseTags(form.tagsText)
    };

    try {
      if (editing) {
        await updateArticle(editing.id, payload);
        setMessage('文章已更新');
      } else {
        await createArticle(payload);
        setMessage('文章已发布');
      }
      setForm(emptyForm);
      setEditing(null);
      await reload();
    } catch (error) {
      setMessage(error.response?.data?.message || '提交失败');
    }
  }

  function startEdit(item) {
    setEditing(item);
    setForm({
      title: item.title,
      summary: item.summary || '',
      content: item.content,
      tagsText: item.tags.join(', ')
    });
  }

  async function remove(id) {
    if (!window.confirm('确认删除这篇文章？')) return;
    try {
      await deleteArticle(id);
      setMessage('文章已删除');
      if (editing?.id === id) {
        setEditing(null);
        setForm(emptyForm);
      }
      await reload();
    } catch (error) {
      setMessage(error.response?.data?.message || '删除失败');
    }
  }

  function saveAdminKey() {
    const safe = adminKeyInput.trim();
    setAdminKey(safe);
    localStorage.setItem('itkb_admin_key', safe);
    setMessage('管理密钥已保存');
  }

  return (
    <div className="admin-layout">
      <section className="panel">
        <h2>管理权限</h2>
        <div className="form-grid">
          <label>
            ADMIN_KEY
            <input
              type="password"
              value={adminKeyInput}
              onChange={(e) => setAdminKeyInput(e.target.value)}
              placeholder="输入服务端配置的 ADMIN_KEY"
            />
          </label>
          <div className="actions">
            <button className="btn-primary" type="button" onClick={saveAdminKey}>保存密钥</button>
          </div>
        </div>
      </section>

      <section className="panel">
        <h2>{editing ? '编辑文章' : '新建文章'}</h2>
        <form onSubmit={onSubmit} className="form-grid">
          <label>
            标题
            <input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          </label>
          <label>
            摘要
            <input value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} />
          </label>
          <label>
            标签（逗号分隔）
            <input
              value={form.tagsText}
              onChange={(e) => setForm({ ...form, tagsText: e.target.value })}
              placeholder="Linux, 运维, 排障"
            />
          </label>
          <label>
            正文
            <textarea
              rows={10}
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              required
            />
          </label>
          <div className="actions">
            <button className="btn-primary" type="submit">{submitLabel}</button>
            {editing && (
              <button
                className="btn-ghost"
                type="button"
                onClick={() => {
                  setEditing(null);
                  setForm(emptyForm);
                }}
              >
                取消编辑
              </button>
            )}
          </div>
          {message && <p className="hint">{message}</p>}
        </form>
      </section>

      <section className="panel">
        <h2>文章列表</h2>
        <div className="admin-list">
          {list.map((item) => (
            <div className="admin-item" key={item.id}>
              <div>
                <h4>{item.title}</h4>
                <p>{item.tags.join(' / ')}</p>
              </div>
              <div className="actions">
                <button className="btn-ghost" onClick={() => startEdit(item)}>编辑</button>
                <button className="btn-danger" onClick={() => remove(item.id)}>删除</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
