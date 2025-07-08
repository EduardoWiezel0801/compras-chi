import React, { useState, useEffect } from 'react';
import Header from './components/Header/Header';
import Dashboard from './components/Dashboard/Dashboard';
import OrderTable from './components/OrderTable/OrderTable';
import './App.css';

// Simulação de dados para evitar problemas de API
const mockStats = {
  previsto_hoje: 5,
  atrasada: 1,
  previsto_amanha: 2,
  finalizado: 0
};

const mockOrders = {
  results: [
    {
      id: 1,
      numero_pc: 'PC2024007',
      data_emissao: '2025-01-07',
      fornecedor: { codigo: 'FOR001', razao_social: 'ALPHA MATERIAIS LTDA' },
      quantidade_itens: 5,
      followup: '2025-01-08',
      armazenamento: '01',
      atraso: 0,
      status: 'PENDENTE'
    },
    {
      id: 2,
      numero_pc: 'PC2024008',
      data_emissao: '2025-01-06',
      fornecedor: { codigo: 'FOR002', razao_social: 'BETA COMERCIAL S.A.' },
      quantidade_itens: 3,
      followup: '2025-01-07',
      armazenamento: '02',
      atraso: 1,
      status: 'ATRASADO'
    }
  ],
  count: 2
};

function App() {
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState(mockStats);
  const [orders, setOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [isOnline, setIsOnline] = useState(true);

  // Função para refresh
  const handleRefresh = () => {
    setLoading(true);
    // Simular carregamento
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  // Função para mudança de página
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // Preparar dados de paginação
  const paginationData = {
    current_page: currentPage,
    total_pages: Math.ceil(orders.count / 11),
    count: orders.count
  };

  return (
    <div className="app">
      <Header 
        isOnline={isOnline}
        onRefresh={handleRefresh}
        isRefreshing={loading}
        currentPage={currentPage}
        totalPages={paginationData.total_pages}
      />

      <main className="app__main">
        <Dashboard 
          stats={stats}
          loading={loading}
          error={null}
        />
        <OrderTable 
          orders={orders}
          loading={loading}
          error={null}
          pagination={paginationData}
          onPageChange={handlePageChange}
        />
      </main>

      {!isOnline && (
        <div className="app__offline-banner">
          <span>Modo Offline - Exibindo dados em cache</span>
        </div>
      )}
    </div>
  );
}

export default App;
