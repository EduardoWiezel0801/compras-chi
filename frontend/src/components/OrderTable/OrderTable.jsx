import React, { useState, useMemo } from 'react';
import { Search, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import OrderRow from './OrderRow/OrderRow';
import Pagination from '../Pagination/Pagination';
import './OrderTable.scss';

const OrderTable = ({ orders, loading, error, pagination, onPageChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: null, direction: 'asc' });
  const [filters, setFilters] = useState({
    status: '',
    supplier: '',
    warehouse: ''
  });

  // Filtrar e ordenar dados
  const filteredAndSortedOrders = useMemo(() => {
    if (!orders?.results) return [];

    let filtered = orders.results.filter(order => {
      const matchesSearch = 
        order.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.supplier_name.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = !filters.status || order.status === filters.status;
      const matchesSupplier = !filters.supplier || order.supplier_code === filters.supplier;
      const matchesWarehouse = !filters.warehouse || order.warehouse === filters.warehouse;

      return matchesSearch && matchesStatus && matchesSupplier && matchesWarehouse;
    });

    if (sortConfig.key) {
      filtered.sort((a, b) => {
        let aValue = a[sortConfig.key];
        let bValue = b[sortConfig.key];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

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
  }, [orders, searchTerm, sortConfig, filters]);

  // Função para ordenação
  const handleSort = (key) => {
    setSortConfig(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Obter valores únicos para filtros
  const uniqueSuppliers = useMemo(() => {
    if (!orders?.results) return [];
    return [...new Set(orders.results.map(order => order.supplier_code))].sort();
  }, [orders]);

  const uniqueWarehouses = useMemo(() => {
    if (!orders?.results) return [];
    return [...new Set(orders.results.map(order => order.warehouse))].sort();
  }, [orders]);

  if (loading) {
    return (
      <div className="order-table order-table--loading">
        <div className="order-table__container">
          <div className="order-table__skeleton">
            {[...Array(10)].map((_, index) => (
              <div key={index} className="order-table__skeleton-row">
                <div className="skeleton skeleton--text"></div>
                <div className="skeleton skeleton--text"></div>
                <div className="skeleton skeleton--text"></div>
                <div className="skeleton skeleton--text"></div>
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
            <h3>Erro ao carregar pedidos</h3>
            <p>Verifique sua conexão e tente novamente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="order-table">
      <div className="order-table__container">
        {/* Filtros e busca */}
        <div className="order-table__controls">
          <div className="order-table__search">
            <Search size={20} />
            <input
              type="text"
              placeholder="Buscar por pedido ou fornecedor..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="order-table__filters">
            <div className="order-table__filter">
              <Filter size={16} />
              <select
                value={filters.status}
                onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
              >
                <option value="">Todos os Status</option>
                <option value="PENDENTE">Pendente</option>
                <option value="PARCIAL">Parcial</option>
                <option value="FINALIZADO">Finalizado</option>
              </select>
            </div>

            <div className="order-table__filter">
              <select
                value={filters.supplier}
                onChange={(e) => setFilters(prev => ({ ...prev, supplier: e.target.value }))}
              >
                <option value="">Todos os Fornecedores</option>
                {uniqueSuppliers.map(supplier => (
                  <option key={supplier} value={supplier}>{supplier}</option>
                ))}
              </select>
            </div>

            <div className="order-table__filter">
              <select
                value={filters.warehouse}
                onChange={(e) => setFilters(prev => ({ ...prev, warehouse: e.target.value }))}
              >
                <option value="">Todos os Armazéns</option>
                {uniqueWarehouses.map(warehouse => (
                  <option key={warehouse} value={warehouse}>{warehouse}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Tabela */}
        <div className="order-table__wrapper">
          <table className="order-table__table">
            <thead className="order-table__header">
              <tr>
                <th className="order-table__header-group" colSpan="2">
                  <span>PEDIDO DE COMPRA</span>
                </th>
                <th className="order-table__header-group" colSpan="3">
                  <span>FORNECEDOR</span>
                </th>
                <th className="order-table__header-group" colSpan="4">
                  <span>PREVISÃO DE ENTREGA</span>
                </th>
              </tr>
              <tr>
                <th 
                  className="order-table__header-cell order-table__header-cell--sortable"
                  onClick={() => handleSort('number')}
                >
                  <span>Nº PC</span>
                  {sortConfig.key === 'number' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </th>
                <th 
                  className="order-table__header-cell order-table__header-cell--sortable"
                  onClick={() => handleSort('issue_date')}
                >
                  <span>Data Emissão</span>
                  {sortConfig.key === 'issue_date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </th>
                <th className="order-table__header-cell">Código</th>
                <th 
                  className="order-table__header-cell order-table__header-cell--sortable"
                  onClick={() => handleSort('supplier_name')}
                >
                  <span>Razão Social</span>
                  {sortConfig.key === 'supplier_name' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </th>
                <th className="order-table__header-cell">Qtd Itens</th>
                <th 
                  className="order-table__header-cell order-table__header-cell--sortable"
                  onClick={() => handleSort('followup_date')}
                >
                  <span>Followup</span>
                  {sortConfig.key === 'followup_date' && (
                    sortConfig.direction === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                  )}
                </th>
                <th className="order-table__header-cell">Armazenamento</th>
                <th className="order-table__header-cell">Atraso</th>
                <th className="order-table__header-cell">Status</th>
              </tr>
            </thead>
            <tbody className="order-table__body">
              {filteredAndSortedOrders.map((order, index) => (
                <OrderRow 
                  key={order.id} 
                  order={order} 
                  index={index}
                />
              ))}
            </tbody>
          </table>

          {filteredAndSortedOrders.length === 0 && (
            <div className="order-table__empty">
              <p>Nenhum pedido encontrado</p>
            </div>
          )}
        </div>

        {/* Paginação */}
        {pagination && (
          <Pagination
            currentPage={pagination.current_page}
            totalPages={pagination.total_pages}
            totalItems={pagination.count}
            onPageChange={onPageChange}
          />
        )}
      </div>
    </div>
  );
};

export default OrderTable;

