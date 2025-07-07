import React from 'react';
import { motion } from 'framer-motion';
import { AlertTriangle, Clock, CheckCircle } from 'lucide-react';
import './OrderRow.scss';

const OrderRow = ({ order, index }) => {
  // Função para formatar data
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  // Função para truncar texto longo
  const truncateText = (text, maxLength = 35) => {
    if (!text) return '-';
    return text.length > maxLength ? text.substring(0, maxLength - 3) + '...' : text;
  };

  // Função para determinar classe do status
  const getStatusClass = (order) => {
    if (order.is_delayed) return 'delayed';
    if (order.is_today) return 'today';
    if (order.is_tomorrow) return 'tomorrow';
    return 'normal';
  };

  // Função para obter ícone do status
  const getStatusIcon = (order) => {
    if (order.is_delayed) return <AlertTriangle size={16} />;
    if (order.is_today) return <Clock size={16} />;
    if (order.status === 'FINALIZADO') return <CheckCircle size={16} />;
    return null;
  };

  // Função para obter texto do status de entrega
  const getDeliveryStatus = (order) => {
    if (order.status === 'FINALIZADO') return 'FINALIZADO';
    if (order.status === 'PARCIAL') return 'PARCIAL';
    return 'PENDENTE';
  };

  return (
    <motion.tr
      className={`order-row order-row--${getStatusClass(order)}`}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
    >
      {/* Número do Pedido */}
      <td className="order-row__cell order-row__cell--number">
        <span className="order-row__number">{order.number}</span>
      </td>

      {/* Data de Emissão */}
      <td className="order-row__cell order-row__cell--date">
        <span className="order-row__date">{formatDate(order.issue_date)}</span>
      </td>

      {/* Código do Fornecedor */}
      <td className="order-row__cell order-row__cell--supplier-code">
        <span className="order-row__supplier-code">{order.supplier_code}</span>
      </td>

      {/* Nome do Fornecedor */}
      <td className="order-row__cell order-row__cell--supplier-name">
        <span 
          className="order-row__supplier-name"
          title={order.supplier_name}
        >
          {truncateText(order.supplier_name)}
        </span>
      </td>

      {/* Quantidade de Itens */}
      <td className="order-row__cell order-row__cell--items">
        <span className="order-row__items">{order.items_count}</span>
      </td>

      {/* Data de Followup */}
      <td className="order-row__cell order-row__cell--followup">
        <div className="order-row__followup">
          {getStatusIcon(order)}
          <span>{formatDate(order.followup_date)}</span>
        </div>
      </td>

      {/* Armazém */}
      <td className="order-row__cell order-row__cell--warehouse">
        <span className="order-row__warehouse">{order.warehouse}</span>
      </td>

      {/* Dias de Atraso */}
      <td className="order-row__cell order-row__cell--delay">
        <span className={`order-row__delay ${order.delay_days > 0 ? 'order-row__delay--has-delay' : ''}`}>
          {order.delay_days > 0 ? `${order.delay_days} dias` : '-'}
        </span>
      </td>

      {/* Status de Entrega */}
      <td className="order-row__cell order-row__cell--status">
        <span className={`order-row__status order-row__status--${order.status.toLowerCase()}`}>
          {getDeliveryStatus(order)}
        </span>
      </td>
    </motion.tr>
  );
};

export default OrderRow;

