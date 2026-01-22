import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import { Layout } from '@/features/layout/components';
import { ProductsPage } from '@/pages/ProductsPage';
import { StoreDetailPage } from '@/pages/StoreDetailPage';
import { StoresPage } from '@/pages/StoresPage';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Navigate to="/stores" replace />} />
          <Route path="/stores" element={<StoresPage />} />
          <Route path="/stores/:storeId" element={<StoreDetailPage />} />
          <Route path="/products" element={<ProductsPage />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
