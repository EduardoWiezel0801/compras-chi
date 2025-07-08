import React, { useState } from 'react';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import OrderTable from './components/OrderTable/OrderTable';
import { useStats, useOrders, useOnlineStatus } from './hooks/useApi';
import './App.css';

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({});
  
  // Hooks para dados da API
  const { data: stats, loading: statsLoading, error: statsError, refetch: refetchStats } = useStats({
    refreshInterval: 30000 // 30 segundos
  });
  
  const { data: orders, loading: ordersLoading, error: ordersError, refetch: refetchOrders } = useOrders({
    page: currentPage,
    ...filters
  }, {
    refreshInterval: 60000 // 1 minuto
  });
  
  const isOnline = useOnlineStatus();

  // Função para refresh geral
  const handleRefresh = () => {
    console.log('🔄 Atualizando dados...');
    refetchStats();
    refetchOrders();
  };

  // Função para mudança de página
  const handlePageChange = (page) => {
    console.log('📄 Mudando para página:', page);
    setCurrentPage(page);
  };

  // Preparar dados de paginação
  const paginationData = orders ? {
    current_page: currentPage,
    total_pages: Math.ceil(orders.count / 11),
    count: orders.count
  } : null;

  console.log('🚀 App renderizando:', {
    stats,
    orders,
    statsLoading,
    ordersLoading,
    isOnline
  });

  return (
    <div className="app">
      <Header 
        isOnline={isOnline}
        onRefresh={handleRefresh}
        isRefreshing={statsLoading || ordersLoading}
        currentPage={currentPage}
        totalPages={paginationData?.total_pages}
      />

      <main className="app__main">
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
      </main>

      {!isOnline && (
        <div className="app__offline-banner">
          <span>Modo Offline - Dados podem estar desatualizados</span>
        </div>
      )}
    </div>
  );
}

export default App;