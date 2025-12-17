import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { SessionProvider } from './context/SessionContext';
import { POSPage } from './pages/POSPage';
import { DashboardPage } from './pages/DashboardPage';
import InventoryPage from './pages/InventoryPage';
import ClientsPage from './pages/ClientsPage';
import CatalogsPage from './pages/CatalogsPage';

import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        {/* Configuración global de notificaciones */}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1f2937',
              color: '#fff',
              borderRadius: '0.75rem',
            },
            success: {
              duration: 3000,
              iconTheme: {
                primary: '#10b981',
                secondary: '#fff',
              },
            },
            error: {
              duration: 4000,
              iconTheme: {
                primary: '#ef4444',
                secondary: '#fff',
              },
            },
          }}
        />

        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/pos" element={<POSPage />} />
            <Route path="/inventario" element={<InventoryPage />} />
            <Route path="/clientes" element={<ClientsPage />} />
            <Route path="/catalogos" element={<CatalogsPage />} />
          </Route>

          {/* Rutas futuras - Placeholder */}
          {/* <Route path="/login" element={<LoginPage />} /> */}
          {/* <Route path="/ventas" element={<HistorialVentasPage />} /> */}

          {/* Redirección por defecto */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </SessionProvider>
    </BrowserRouter>
  );
}

export default App;
