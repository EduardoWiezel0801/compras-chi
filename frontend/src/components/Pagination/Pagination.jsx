import React from 'react';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { motion } from 'framer-motion';
import './Pagination.scss';

const Pagination = ({ currentPage, totalPages, totalItems, onPageChange }) => {
  // Função para gerar array de páginas visíveis
  const getVisiblePages = () => {
    const delta = 2; // Número de páginas antes e depois da atual
    const range = [];
    const rangeWithDots = [];

    // Calcular o range de páginas
    for (
      let i = Math.max(2, currentPage - delta);
      i <= Math.min(totalPages - 1, currentPage + delta);
      i++
    ) {
      range.push(i);
    }

    // Adicionar primeira página
    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    // Adicionar páginas do range
    rangeWithDots.push(...range);

    // Adicionar última página
    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else if (totalPages > 1) {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  // Função para lidar com mudança de página
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  // Se não há páginas suficientes, não mostrar paginação
  if (totalPages <= 1) {
    return null;
  }

  const visiblePages = getVisiblePages();

  return (
    <div className="pagination">
      <div className="pagination__container">
        {/* Informações */}
        <div className="pagination__info">
          <span className="pagination__text">
            Página {currentPage} de {totalPages}
          </span>
          <span className="pagination__total">
            ({totalItems} itens no total)
          </span>
        </div>

        {/* Controles de navegação */}
        <div className="pagination__controls">
          {/* Primeira página */}
          <motion.button
            className={`pagination__button pagination__button--nav ${
              currentPage === 1 ? 'pagination__button--disabled' : ''
            }`}
            onClick={() => handlePageChange(1)}
            disabled={currentPage === 1}
            whileHover={{ scale: currentPage !== 1 ? 1.05 : 1 }}
            whileTap={{ scale: currentPage !== 1 ? 0.95 : 1 }}
            title="Primeira página"
          >
            <ChevronsLeft size={16} />
          </motion.button>

          {/* Página anterior */}
          <motion.button
            className={`pagination__button pagination__button--nav ${
              currentPage === 1 ? 'pagination__button--disabled' : ''
            }`}
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            whileHover={{ scale: currentPage !== 1 ? 1.05 : 1 }}
            whileTap={{ scale: currentPage !== 1 ? 0.95 : 1 }}
            title="Página anterior"
          >
            <ChevronLeft size={16} />
          </motion.button>

          {/* Números das páginas */}
          <div className="pagination__pages">
            {visiblePages.map((page, index) => (
              <React.Fragment key={index}>
                {page === '...' ? (
                  <span className="pagination__dots">...</span>
                ) : (
                  <motion.button
                    className={`pagination__button pagination__button--page ${
                      page === currentPage ? 'pagination__button--active' : ''
                    }`}
                    onClick={() => handlePageChange(page)}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                  >
                    {page}
                  </motion.button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Próxima página */}
          <motion.button
            className={`pagination__button pagination__button--nav ${
              currentPage === totalPages ? 'pagination__button--disabled' : ''
            }`}
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            whileHover={{ scale: currentPage !== totalPages ? 1.05 : 1 }}
            whileTap={{ scale: currentPage !== totalPages ? 0.95 : 1 }}
            title="Próxima página"
          >
            <ChevronRight size={16} />
          </motion.button>

          {/* Última página */}
          <motion.button
            className={`pagination__button pagination__button--nav ${
              currentPage === totalPages ? 'pagination__button--disabled' : ''
            }`}
            onClick={() => handlePageChange(totalPages)}
            disabled={currentPage === totalPages}
            whileHover={{ scale: currentPage !== totalPages ? 1.05 : 1 }}
            whileTap={{ scale: currentPage !== totalPages ? 0.95 : 1 }}
            title="Última página"
          >
            <ChevronsRight size={16} />
          </motion.button>
        </div>

        {/* Input direto para página (opcional) */}
        <div className="pagination__jump">
          <span className="pagination__jump-label">Ir para:</span>
          <input
            type="number"
            min="1"
            max={totalPages}
            className="pagination__jump-input"
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                const page = parseInt(e.target.value);
                if (page >= 1 && page <= totalPages) {
                  handlePageChange(page);
                  e.target.value = '';
                }
              }
            }}
            placeholder={currentPage.toString()}
          />
        </div>
      </div>
    </div>
  );
};

export default Pagination;

