import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  ChevronDown, 
  ChevronUp, 
  Filter, 
  X, 
  AlertTriangle,
  Calendar,
  Package,
  Truck,
  CheckCircle
} from 'lucide-react';
import OrderRow from './OrderRow/OrderRow';
import './OrderTable.scss';

const OrderTable = ({ orders, loading, error, pagination, onPageChange, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    warehouse: '',
    priority: ''
  });
  const [showFilters, setShowFilters] = useState(false);

  console.log('🔍 OrderTable recebeu:', { orders, loading, error });

  // Extrair listas únicas para filtros dinâmicos
  const filterOptions = useMemo(() => {
    if (!orders?.results?.length) return { suppliers: [], warehouses: [] };
    
    const suppliers = [...new Set(orders.results
      .filter(order => order.fornecedor)
      .map(order => ({
        code: order.fornecedor.code,
        name: order.fornecedor.name || order.fornecedor.razao_social
      }))
    )];

    const warehouses = [...new Set(orders.results
      .filter(order => order.armazenamento)
      .map(order => order.armazenamento)
    )];

    return { suppliers, warehouses };
  }, [orders]);

  // Determinar prioridade baseada na data de followup
  const getPriority = useCallback((order) => {
    if (!order.followup_date) return 'normal';
    
    const today = new Date();
    const followupDate = new Date(order.followup_date);
    const diffTime = followupDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return 'overdue';
    if (diffDays === 0) return 'today';
    if (diffDays === 1) return 'tomorrow';
    return 'normal';
  }, []);

  // Filtrar e ordenar dados com melhor performance
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders?.results?.length) return [];
    
    let filtered = orders.results.filter(order => {
      if (!order) return false;
      
      // Busca em múltiplos campos
      if (searchTerm?.trim()) {
        const searchLower = searchTerm.toLowerCase();
        const searchFields = [
          String(order.numero_pc || ''),
          String(order.fornecedor?.name || ''),
          String(order.fornecedor?.razao_social || ''),
          String(order.fornecedor?.code || ''),
          String(order.armazenamento || '')
        ];
        
        const matchesSearch = searchFields.some(field => 
          field.toLowerCase().includes(searchLower)
        );
        
        if (!matchesSearch) return false;
      }
      
      // Filtros específicos
      if (filters.status && order.status !== filters.status) return false;
      if (filters.supplier && order.fornecedor?.code !== filters.supplier) return false;
      if (filters.warehouse && order.armazenamento !== filters.warehouse) return false;
      if (filters.priority) {
        const orderPriority = getPriority(order);
        if (orderPriority !== filters.priority) return false;
      }
      
      return true;
    });

    // Ordenação melhorada
    if (sortConfig.key && filtered.length > 0) {
      filtered.sort((a, b) => {
        let aValue, bValue;
        
        switch (sortConfig.key) {
          case 'fornecedor':
            aValue = a.fornecedor?.name || a.fornecedor?.razao_social || '';
            bValue = b.fornecedor?.name || b.fornecedor?.razao_social || '';
            break;
          case 'numero_pc':
            aValue = parseInt(a.numero_pc) || 0;
            bValue = parseInt(b.numero_pc) || 0;
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          case 'data_emissao':
          case 'followup_date':
            aValue = new Date(a[sortConfig.key] || '1970-01-01');
            bValue = new Date(b[sortConfig.key] || '1970-01-01');
            return sortConfig.direction === 'asc' ? aValue - bValue : bValue - aValue;
          default:
            aValue = String(a[sortConfig.key] || '').toLowerCase();
            bValue = String(b[sortConfig.key] || '').toLowerCase();
        }
        
        if (typeof aValue === 'string') {
          return sortConfig.direction === 'asc' 
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }
        
        return 0;
      });
    }

    return filtered;
  }, [orders, searchTerm, filters, sortConfig, getPriority]);

  // Estatísticas dos dados filtrados
  const stats = useMemo(() => {
    const total = filteredAndSortedOrders.length;
    const overdue = filteredAndSortedOrders.filter(order => getPriority(order) === 'overdue').length;
    const today = filteredAndSortedOrders.filter(order => getPriority(order) === 'today').length;
    const pending = filteredAndSortedOrders.filter(order => order.status === 'PENDENTE').length;
    
    return { total, overdue, today, pending };
  }, [filteredAndSortedOrders, getPriority]);

  const handleSort = useCallback((key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  }, []);

  const handleFilterChange = useCallback((filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  }, []);

  const clearFilters = useCallback(() => {
    setFilters({
      status: '',
      supplier: '',
      warehouse: '',
      priority: ''
    });
    setSearchTerm('');
  }, []);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  }, []);

  const getSortIcon = useCallback((columnKey) => {
    if (sortConfig.key !== columnKey) {
      return <ChevronDown size={16} className="order-table__sort-icon order-table__sort-icon--inactive" />;
    }
    return sortConfig.direction === 'asc' 
      ? <ChevronUp size={16} className="order-table__sort-icon order-table__sort-icon--active" />
      : <ChevronDown size={16} className="order-table__sort-icon order-table__sort-icon--active" />;
  }, [sortConfig]);

  const hasActiveFilters = useMemo(() => {
    return searchTerm.trim() !== '' || 
           Object.values(filters).some(value => value !== '');
  }, [searchTerm, filters]);

  // Estados de loading e erro melhorados
  if (loading) {
    return (
      <div className="order-table order-table--loading">
        <div className="order-table__container">
          <div className="order-table__skeleton">
            {[...Array(8)].map((_, index) => (
              <div key={index} className="order-table__skeleton-row">
                <div className="skeleton"></div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
                <div className="skeleton"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="order-table order-table--error">
        <div className="order-table__container">
          <div className="order-table__error">
            <AlertTriangle size={48} />
            <h3>Erro ao carregar pedidos</h3>
            <p>{error}</p>
            {onRefresh && (
              <button 
                onClick={onRefresh}
                className="order-table__retry-button"
              >
                Tentar novamente
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  if (!orders?.results?.length) {
    return (
      <div className="order-table">
        <div className="order-table__container">
          <div className="order-table__empty">
            <Package size={48} />
            <p>Nenhum pedido encontrado</p>
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="order-table__clear-filters"
              >
                Limpar filtros
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-table">
      <div className="order-table__container">
        
        {/* Header com estatísticas */}
        <div className="order-table__header">
          <div className="order-table__title">
            <h2>Pedidos de Compra</h2>
            <div className="order-table__stats">
              <span className="order-table__stat">
                <Package size={16} />
                {stats.total} total
              </span>
              {stats.overdue > 0 && (
                <span className="order-table__stat order-table__stat--danger">
                  <AlertTriangle size={16} />
                  {stats.overdue} atrasados
                </span>
              )}
              {stats.today > 0 && (
                <span className="order-table__stat order-table__stat--warning">
                  <Calendar size={16} />
                  {stats.today} hoje
                </span>
              )}
            </div>
          </div>
          
          {onRefresh && (
            <button 
              onClick={onRefresh}
              className="order-table__refresh"
              title="Atualizar dados"
            >
              <CheckCircle size={20} />
            </button>
          )}
        </div>

        {/* Controles de busca e filtro */}
        <div className="order-table__controls">
          <div className="order-table__search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por número, fornecedor ou armazém..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="order-table__clear-search"
              >
                <X size={16} />
              </button>
            )}
          </div>
          
          <div className="order-table__filter-toggle">
            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`order-table__filter-button ${showFilters ? 'order-table__filter-button--active' : ''}`}
            >
              <Filter size={20} />
              Filtros
              {hasActiveFilters && <span className="order-table__filter-indicator" />}
            </button>
          </div>
        </div>

        {/* Filtros expandidos */}
        {showFilters && (
          <div className="order-table__filters">
            <div className="order-table__filter">
              <label>Status:</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
              >
                <option value="">Todos</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PARCIAL">Parcial</option>
                <option value="FINALIZADO">Finalizado</option>
                <option value="CANCELADO">Cancelado</option>
              </select>
            </div>
            
            <div className="order-table__filter">
              <label>Fornecedor:</label>
              <select
                value={filters.supplier}
                onChange={(e) => handleFilterChange('supplier', e.target.value)}
              >
                <option value="">Todos</option>
                {filterOptions.suppliers.map(supplier => (
                  <option key={supplier.code} value={supplier.code}>
                    {supplier.name}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="order-table__filter">
              <label>Armazém:</label>
              <select
                value={filters.warehouse}
                onChange={(e) => handleFilterChange('warehouse', e.target.value)}
              >
                <option value="">Todos</option>
                {filterOptions.warehouses.map(warehouse => (
                  <option key={warehouse} value={warehouse}>
                    Armazém {warehouse}
                  </option>
                ))}
              </select>
            </div>
            
            <div className="order-table__filter">
              <label>Prioridade:</label>
              <select
                value={filters.priority}
                onChange={(e) => handleFilterChange('priority', e.target.value)}
              >
                <option value="">Todas</option>
                <option value="overdue">Atrasados</option>
                <option value="today">Hoje</option>
                <option value="tomorrow">Amanhã</option>
                <option value="normal">Normal</option>
              </select>
            </div>
            
            {hasActiveFilters && (
              <button 
                onClick={clearFilters}
                className="order-table__clear-all"
              >
                <X size={16} />
                Limpar tudo
              </button>
            )}
          </div>
        )}

        {/* Tabela */}
        <div className="order-table__wrapper">
          <table className="order-table__table">
            <thead className="order-table__header-section">
              <tr>
                <th colSpan="2" className="order-table__header-group">PEDIDO</th>
                <th colSpan="2" className="order-table__header-group">FORNECEDOR</th>
                <th colSpan="2" className="order-table__header-group">ACOMPANHAMENTO</th>
                <th colSpan="2" className="order-table__header-group">STATUS</th>
              </tr>
              <tr>
                <th 
                  onClick={() => handleSort('numero_pc')} 
                  className="order-table__header-cell order-table__header-cell--sortable"
                >
                  <span>
                    Número
                    {getSortIcon('numero_pc')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('data_emissao')} 
                  className="order-table__header-cell order-table__header-cell--sortable"
                >
                  <span>
                    Emissão
                    {getSortIcon('data_emissao')}
                  </span>
                </th>
                <th 
                  onClick={() => handleSort('fornecedor')} 
                  className="order-table__header-cell order-table__header-cell--sortable"
                >
                  <span>
                    Código/Nome
                    {getSortIcon('fornecedor')}
                  </span>
                </th>
                <th className="order-table__header-cell">Itens</th>
                <th 
                  onClick={() => handleSort('followup_date')} 
                  className="order-table__header-cell order-table__header-cell--sortable"
                >
                  <span>
                    Follow-up
                    {getSortIcon('followup_date')}
                  </span>
                </th>
                <th className="order-table__header-cell">Armazém</th>
                <th className="order-table__header-cell">Atraso</th>
                <th className="order-table__header-cell">Status</th>
              </tr>
            </thead>
            <tbody className="order-table__body">
              {filteredAndSortedOrders.map(order => (
                <OrderRow
                  key={order.id}
                  order={order}
                  priority={getPriority(order)}
                  formatDate={formatDate}
                />
              ))}
            </tbody>
          </table>
        </div>

        {/* Informações de paginação */}
        {pagination && (
          <div className="order-table__pagination-info">
            <span>
              Mostrando {filteredAndSortedOrders.length} de {pagination.count} pedidos
            </span>
            {filteredAndSortedOrders.length < pagination.count && (
              <span className="order-table__filter-note">
                (filtrado de {orders.results.length} carregados)
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderTable;