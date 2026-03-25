import { useEffect } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  useEffect(() => {
    document.body.classList.add('theme-stenders_qi');
    return () => {
      document.body.classList.remove('theme-stenders_qi');
    };
  }, []);

  return (
    <div className="shell">
      <div className="game-bg" aria-hidden="true" />
      <header className="topbar">
        <Link to="/" className="brand">
          <span className="brand-chip">ITKB</span>
          <span>IT 小琦知识库</span>
        </Link>
        <nav className="nav">
          <NavLink to="/">知识大厅</NavLink>
          <NavLink to="/admin">管理控制台</NavLink>
        </nav>
      </header>
      <main className="page">
        <Outlet />
      </main>
    </div>
  );
}
