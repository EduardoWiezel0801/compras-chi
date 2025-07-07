import React from 'react';
import { Clock, AlertTriangle, Calendar, CheckCircle } from 'lucide-react';
import StatusCard from './StatusCard/StatusCard';
import './Dashboard.scss';

const Dashboard = ({ stats, loading, error }) => {
  if (loading) {
    return (
      <div className="dashboard dashboard--loading">
        <div className="dashboard__container">
          {[...Array(4)].map((_, index) => (
            <div key={index} className="dashboard__card-skeleton">
              <div className="skeleton skeleton--circle"></div>
              <div className="skeleton skeleton--text"></div>
              <div className="skeleton skeleton--number"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard dashboard--error">
        <div className="dashboard__container">
          <div className="dashboard__error">
            <AlertTriangle size={48} />
            <h3>Erro ao carregar estatísticas</h3>
            <p>Verifique sua conexão e tente novamente</p>
          </div>
        </div>
      </div>
    );
  }

  const cardsData = [
    {
      id: 'hoje',
      title: 'PENDENTE HOJE',
      value: stats?.previsto_hoje || 0,
      icon: Clock,
      color: 'warning',
      description: 'Pedidos previstos para hoje'
    },
    {
      id: 'atrasado',
      title: 'ATRASADO',
      value: stats?.atrasada || 0,
      icon: AlertTriangle,
      color: 'danger',
      description: 'Pedidos em atraso'
    },
    {
      id: 'amanha',
      title: 'PREVISTO AMANHÃ',
      value: stats?.previsto_amanha || 0,
      icon: Calendar,
      color: 'info',
      description: 'Pedidos previstos para amanhã'
    },
    {
      id: 'finalizado',
      title: 'RECEB. CONCLUÍDO',
      value: stats?.finalizado || 0,
      icon: CheckCircle,
      color: 'success',
      description: 'Recebimentos finalizados hoje'
    }
  ];

  return (
    <div className="dashboard">
      <div className="dashboard__container">
        {cardsData.map((card) => (
          <StatusCard
            key={card.id}
            title={card.title}
            value={card.value}
            icon={card.icon}
            color={card.color}
            description={card.description}
          />
        ))}
      </div>
    </div>
  );
};

export default Dashboard;

