import React from 'react';
import './OrderRow.scss';

const OrderRow = ({ order }) => {
  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para determinar classe do status
  const getStatusClass = (status) => {
    const statusMap = {
      'PENDENTE': 'status--pending',
      'PARCIAL': 'status--partial', 
      'FINALIZADO': 'status--completed',
      'CANCELADO': 'status--cancelled'
    };
    return statusMap[status] || 'status--default';
  };

  // Função para determinar classe do atraso
  const getDelayClass = (atraso) => {
    if (!atraso || atraso === 0) return 'delay--none';
    if (atraso <= 2) return 'delay--low';
    if (atraso <= 5) return 'delay--medium';
    return 'delay--high';
  };

  // Extrair dados do pedido com fallbacks
  const {
    id,
    numero_pc = '',
    data_emissao = '',
    fornecedor = {},
    quantidade_itens = 0,
    followup_date = '',
    armazenamento = '',
    atraso = 0,
    status = 'PENDENTE'
  } = order || {};

  const fornecedorCode = fornecedor.code || '';
  const fornecedorName = fornecedor.name || fornecedor.razao_social || '';

  return (
    <tr className="order-row">
      <td className="order-row__number">
        <span className="number-text">{numero_pc}</span>
      </td>
      
      <td className="order-row__date">
        {formatDate(data_emissao)}
      </td>
      
      <td className="order-row__supplier">
        <div className="supplier-info">
          <span className="supplier-code">{fornecedorCode}</span>
          <span className="supplier-name">{fornecedorName}</span>
        </div>
      </td>
      
      <td className="order-row__items">
        <span className="items-count">{quantidade_itens}</span>
      </td>
      
      <td className="order-row__followup">
        {formatDate(followup_date)}
      </td>
      
      <td className="order-row__warehouse">
        <span className="warehouse-code">{armazenamento}</span>
      </td>
      
      <td className="order-row__delay">
        <span className={`delay-badge ${getDelayClass(atraso)}`}>
          {atraso > 0 ? `${atraso}d` : '-'}
        </span>
      </td>
      
      <td className="order-row__status">
        <span className={`status-badge ${getStatusClass(status)}`}>
          {status}
        </span>
      </td>
    </tr>
  );
};

export default OrderRow;