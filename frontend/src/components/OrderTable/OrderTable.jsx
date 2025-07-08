import React, { useState, useMemo } from 'react';
import { Search, ChevronDown, ChevronUp } from 'lucide-react';
import './OrderTable.scss';

const OrderTable = ({ orders, loading, error, pagination, onPageChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    warehouse: ''
  });

  console.log('🔍 OrderTable recebeu:', { orders, loading, error });

  // Filtrar e ordenar dados
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders || !orders.results || !Array.isArray(orders.results)) {
      console.log('❌ Dados inválidos');
      return [];
    }
    
    console.log('✅ Processando', orders.results.length, 'pedidos');
    
    let filtered = orders.results.filter(order => {
      if (!order) return false;
      
      // Busca segura
      let matchesSearch = true;
      if (searchTerm && searchTerm.trim() !== '') {
        const numero = String(order.numero_pc || '').toLowerCase();
        const fornecedorName = String(
          (order.fornecedor && order.fornecedor.name) || 
          (order.fornecedor && order.fornecedor.razao_social) || ''
        ).toLowerCase();
        const searchLower = searchTerm.toLowerCase();
        
        matchesSearch = numero.includes(searchLower) || fornecedorName.includes(searchLower);
      }
      
      // Filtros
      const matchesStatus = !filters.status || order.status === filters.status;
      const matchesSupplier = !filters.supplier || 
                             (order.fornecedor && order.fornecedor.code === filters.supplier);
      const matchesWarehouse = !filters.warehouse || order.armazenamento === filters.warehouse;
      
      return matchesSearch && matchesStatus && matchesSupplier && matchesWarehouse;
    });

    console.log('✅ Filtrados:', filtered.length, 'pedidos');

    // Ordenação
    if (sortConfig.key && filtered.length > 0) {
      filtered.sort((a, b) => {
        let aValue = '';
        let bValue = '';
        
        if (sortConfig.key === 'fornecedor') {
          aValue = (a.fornecedor && a.fornecedor.name) || 
                   (a.fornecedor && a.fornecedor.razao_social) || '';
          bValue = (b.fornecedor && b.fornecedor.name) || 
                   (b.fornecedor && b.fornecedor.razao_social) || '';
        } else {
          aValue = a[sortConfig.key] || '';
          bValue = b[sortConfig.key] || '';
        }
        
        // Converter para string e comparar
        aValue = String(aValue).toLowerCase();
        bValue = String(bValue).toLowerCase();
        
        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }

    return filtered;
  }, [orders, searchTerm, filters, sortConfig]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  const getStatusClass = (status) => {
    const statusMap = {
      'PENDENTE': 'status--pending',
      'PARCIAL': 'status--partial', 
      'FINALIZADO': 'status--completed',
      'CANCELADO': 'status--cancelled'
    };
    return statusMap[status] || 'status--default';
  };

  const getSortIcon = (columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown size={16} className="sort-icon sort-icon--inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="sort-icon sort-icon--active" />
      : <ChevronDown size={16} className="sort-icon sort-icon--active" />;
  };

  if (loading) {
    return (
      <div className="order-table">
        <div className="order-table__loading">
          <div className="loading-spinner"></div>
          <span>Carregando pedidos...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-table">
        <div className="order-table__error">
          <span>Erro ao carregar pedidos: {error}</span>
        </div>
      </div>
    );
  }

  // Verificação segura dos dados
  if (!orders || !orders.results || !Array.isArray(orders.results)) {
    return (
      <div className="order-table">
        <div className="order-table__empty">
          <span>Nenhum pedido encontrado</span>
        </div>
      </div>
    );
  }

  return (
    <div className="order-table">
      <div className="order-table__header">
        <h2>Pedidos de Compra</h2>
        
        <div className="order-table__controls">
          <div className="search-box">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por número ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <select
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">Todos os status</option>
              <option value="PENDENTE">Pendente</option>
              <option value="PARCIAL">Parcial</option>
              <option value="FINALIZADO">Finalizado</option>
              <option value="CANCELADO">Cancelado</option>
            </select>
            
            <select
              value={filters.warehouse}
              onChange={(e) => handleFilterChange('warehouse', e.target.value)}
            >
              <option value="">Todos os armazéns</option>
              <option value="01">Armazém 01</option>
              <option value="02">Armazém 02</option>
              <option value="03">Armazém 03</option>
            </select>
          </div>
        </div>
      </div>

      <div className="order-table__content">
        <table className="table">
          <thead>
            <tr>
              <th onClick={() => handleSort('numero_pc')} className="sortable">
                Número PC {getSortIcon('numero_pc')}
              </th>
              <th onClick={() => handleSort('data_emissao')} className="sortable">
                Data Emissão {getSortIcon('data_emissao')}
              </th>
              <th onClick={() => handleSort('fornecedor')} className="sortable">
                Fornecedor {getSortIcon('fornecedor')}
              </th>
              <th>Qtd Itens</th>
              <th onClick={() => handleSort('followup_date')} className="sortable">
                Follow-up {getSortIcon('followup_date')}
              </th>
              <th>Armazém</th>
              <th>Atraso</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedOrders.length > 0 ? (
              filteredAndSortedOrders.map(order => {
                const fornecedor = order.fornecedor || {};
                const fornecedorName = fornecedor.name || fornecedor.razao_social || 'N/A';
                const fornecedorCode = fornecedor.code || '';
                
                return (
                  <tr key={order.id} className="order-row">
                    <td className="order-row__number">
                      <span className="number-text">{order.numero_pc || 'N/A'}</span>
                    </td>
                    
                    <td className="order-row__date">
                      {formatDate(order.data_emissao)}
                    </td>
                    
                    <td className="order-row__supplier">
                      <div className="supplier-info">
                        <span className="supplier-code">{fornecedorCode}</span>
                        <span className="supplier-name">{fornecedorName}</span>
                      </div>
                    </td>
                    
                    <td className="order-row__items">
                      <span className="items-count">{order.quantidade_itens || 0}</span>
                    </td>
                    
                    <td className="order-row__followup">
                      {formatDate(order.followup_date)}
                    </td>
                    
                    <td className="order-row__warehouse">
                      <span className="warehouse-code">{order.armazenamento || 'N/A'}</span>
                    </td>
                    
                    <td className="order-row__delay">
                      <span className={`delay-badge ${order.atraso > 0 ? 'delay--high' : 'delay--none'}`}>
                        {(order.atraso || order.delay_days || 0) > 0 ? `${order.atraso || order.delay_days}d` : '-'}
                      </span>
                    </td>
                    
                    <td className="order-row__status">
                      <span className={`status-badge ${getStatusClass(order.status)}`}>
                        {order.status || 'N/A'}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="8" className="no-data">
                  {searchTerm || Object.values(filters).some(f => f) 
                    ? 'Nenhum pedido encontrado com os filtros aplicados' 
                    : 'Nenhum pedido encontrado'
                  }
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {pagination && pagination.total_pages > 1 && (
        <div className="order-table__pagination">
          <span>
            Página {pagination.current_page} de {pagination.total_pages} 
            ({pagination.count} total)
          </span>
          {onPageChange && (
            <div className="pagination-controls">
              <button 
                onClick={() => onPageChange(pagination.current_page - 1)}
                disabled={pagination.current_page <= 1}
              >
                Anterior
              </button>
              <button 
                onClick={() => onPageChange(pagination.current_page + 1)}
                disabled={pagination.current_page >= pagination.total_pages}
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default OrderTable;