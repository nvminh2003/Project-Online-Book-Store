import React from "react";

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  const handlePageChange = (page) => {
    if (page !== currentPage && page >= 1 && page <= totalPages) {
      onPageChange(page);
    }
  };

  const getVisiblePages = () => {
    const delta = 2;
    const range = [];
    const rangeWithDots = [];

    for (let i = Math.max(2, currentPage - delta); i <= Math.min(totalPages - 1, currentPage + delta); i++) {
      range.push(i);
    }

    if (currentPage - delta > 2) {
      rangeWithDots.push(1, '...');
    } else {
      rangeWithDots.push(1);
    }

    rangeWithDots.push(...range);

    if (currentPage + delta < totalPages - 1) {
      rangeWithDots.push('...', totalPages);
    } else {
      rangeWithDots.push(totalPages);
    }

    return rangeWithDots;
  };

  return (
    <nav className="flex items-center justify-center space-x-1" aria-label="Pagination Navigation">
      <button
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === 1
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
          }`}
        onClick={() => handlePageChange(currentPage - 1)}
        disabled={currentPage === 1}
        aria-label="Previous Page"
      >
        ←
      </button>

      {getVisiblePages().map((page, index) => (
        <React.Fragment key={index}>
          {page === '...' ? (
            <span className="px-3 py-2 text-sm text-gray-500">...</span>
          ) : (
            <button
              className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${page === currentPage
                ? 'bg-blue-600 text-white'
                : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              onClick={() => handlePageChange(page)}
              aria-current={page === currentPage ? "page" : undefined}
            >
              {page}
            </button>
          )}
        </React.Fragment>
      ))}

      <button
        className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${currentPage === totalPages
          ? 'text-gray-400 cursor-not-allowed'
          : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
          }`}
        onClick={() => handlePageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        aria-label="Next Page"
      >
        →
      </button>
    </nav>
  );
};

export default Pagination;
