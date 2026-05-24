import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { MarketplacePage } from './pages/MarketplacePage';
import { DatasetDetailPage } from './pages/DatasetDetailPage';

export function App() {
  return (
    <BrowserRouter>
      <main className="mx-auto min-h-screen max-w-5xl px-4 py-8">
        <Routes>
          <Route path="/" element={<MarketplacePage />} />
          <Route path="/datasets/:id" element={<DatasetDetailPage />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
