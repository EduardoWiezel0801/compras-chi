import React from 'react';
import { motion } from 'framer-motion';
import './StatusCard.scss';

const StatusCard = ({ title, value, icon: Icon, color, description }) => {
  return (
    <motion.div
      className={`status-card status-card--${color}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.2 }
      }}
    >
      <div className="status-card__header">
        <div className={`status-card__icon status-card__icon--${color}`}>
          <Icon size={24} />
        </div>
        <div className="status-card__info">
          <h3 className="status-card__title">{title}</h3>
          <p className="status-card__description">{description}</p>
        </div>
      </div>

      <div className="status-card__content">
        <motion.div
          className="status-card__value"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
        >
          {value}
        </motion.div>
      </div>

      <div className={`status-card__accent status-card__accent--${color}`}></div>
    </motion.div>
  );
};

export default StatusCard;

