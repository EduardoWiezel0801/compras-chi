import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import OrderTable from './components/OrderTable/OrderTable';
import { useStats, useOrders } from './hooks/useApi';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);

  // Hooks para dados
  const { 
    data: stats, 
    loading: statsLoading, 
    error: statsError, 
    refresh: refreshStats,
    isOnline 
  } = useStats({ refreshInterval: 15000 });

  const { 
    data: orders, 
    loading: ordersLoading, 
    error: ordersError, 
    refresh: refreshOrders 
  } = useOrders({ page: currentPage }, { refreshInterval: 30000 });

  // Função para refresh geral
  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
    await Promise.all([refreshStats(), refreshOrders()]);
  };

  // Função para mudança de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Auto-refresh da página (simular comportamento original)
  useEffect(() => {
    const interval = setInterval(() => {
      if (orders?.total_pages && currentPage < orders.total_pages) {
        setCurrentPage(prev => prev + 1);
      } else {
        setCurrentPage(1);
      }
    }, 15000); // 15 segundos como no original

    return () => clearInterval(interval);
  }, [currentPage, orders?.total_pages]);

  // Preparar dados de paginação
  const paginationData = orders ? {
    current_page: currentPage,
    total_pages: Math.ceil(orders.count / 11), // 11 itens por página como no original
    count: orders.count
  } : null;

  return (
    <Router>
      <div className="app">
        <Header 
          isOnline={isOnline}
          onRefresh={handleRefresh}
          isRefreshing={statsLoading || ordersLoading}
          currentPage={currentPage}
          totalPages={paginationData?.total_pages}
        />

        <main className="app__main">
          <Routes>
            <Route 
              path="/" 
              element={
                <>
                  <Dashboard 
                    stats={stats}
                    loading={statsLoading}
                    error={statsError}
                  />
                  <OrderTable 
                    orders={orders}
                    loading={ordersLoading}
                    error={ordersError}
                    pagination={paginationData}
                    onPageChange={handlePageChange}
                  />
                </>
              } 
            />
          </Routes>
        </main>

        {/* Indicador de conexão offline */}
        {!isOnline && (
          <div className="app__offline-banner">
            <span>Modo Offline - Exibindo dados em cache</span>
          </div>
        )}
      </div>
    </Router>
  );
}

export default App;

