import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { StoresPage } from './pages/StoresPage';
import { StoreDetailPage } from './pages/StoreDetailPage';
import { ProductsPage } from './pages/ProductsPage';
import { ProductEditPage } from './pages/ProductEditPage';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Navigate to="/stores" replace />} />
        <Route path="/stores" element={<StoresPage />} />
        <Route path="/stores/:id" element={<StoreDetailPage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/new" element={<ProductEditPage />} />
        <Route path="/products/:id/edit" element={<ProductEditPage />} />
      </Routes>
    </Layout>
  );
}

export default App;
