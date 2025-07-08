import React from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import './Header.scss';

const Header = ({ isOnline, onRefresh, isRefreshing, currentPage, totalPages }) => {
  return (
    <header className="header">
      <div className="header__container">
        <div className="header__brand">
          <div className="header__logo">
            <span className="header__logo-text">C</span>
          </div>
          <h1 className="header__title">
            CHIAPERINI - PEDIDOS DE COMPRA PREVISTOS
          </h1>
        </div>

        <div className="header__info">
          <div className="header__connection">
            {isOnline ? (
              <div className="header__status header__status--online">
                <Wifi size={20} />
                <span>Online</span>
              </div>
            ) : (
              <div className="header__status header__status--offline">
                <WifiOff size={20} />
                <span>Offline</span>
              </div>
            )}
          </div>

          {currentPage && totalPages && (
            <div className="header__pagination">
              <span>Página {currentPage} de {totalPages}</span>
            </div>
          )}

          <button
            className={`header__refresh ${isRefreshing ? 'header__refresh--spinning' : ''}`}
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Atualizar dados"
          >
            <RefreshCw size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;

