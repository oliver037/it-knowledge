import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import HomePage from './pages/HomePage';
import ArticlePage from './pages/ArticlePage';
import AdminPage from './pages/AdminPage';
import QuickGuidePage from './pages/QuickGuidePage';

const ReceiptLabPage = lazy(() => import('./pages/ReceiptLabPage'));

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="article/:slug" element={<ArticlePage />} />
          <Route path="quick/:id" element={<QuickGuidePage />} />
          <Route
            path="lab/receipt"
            element={(
              <Suspense fallback={<section className="panel"><p className="hint">3D 实验室加载中...</p></section>}>
                <ReceiptLabPage />
              </Suspense>
            )}
          />
          <Route path="admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
