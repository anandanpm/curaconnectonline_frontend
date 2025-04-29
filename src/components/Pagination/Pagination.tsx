import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import './Pagination.scss';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1
}) => {
  const range = (start: number, end: number) => {
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  };

  const generatePagination = () => {
    // Direct return if there are few pages
    if (totalPages <= 5) {
      return range(1, totalPages);
    }

    // Calculate left and right boundaries
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // Whether to show dots
    const shouldShowLeftDots = leftSiblingIndex > 2;
    const shouldShowRightDots = rightSiblingIndex < totalPages - 1;

    // Generate the appropriate page numbers
    if (!shouldShowLeftDots && shouldShowRightDots) {
      // Show initial pages
      const leftItemCount = 3 + 2 * siblingCount;
      return [...range(1, leftItemCount), '...', totalPages];
    } else if (shouldShowLeftDots && !shouldShowRightDots) {
      // Show final pages
      const rightItemCount = 3 + 2 * siblingCount;
      return [1, '...', ...range(totalPages - rightItemCount + 1, totalPages)];
    } else if (shouldShowLeftDots && shouldShowRightDots) {
      // Show middle pages
      return [
        1,
        '...',
        ...range(leftSiblingIndex, rightSiblingIndex),
        '...',
        totalPages
      ];
    }

    return range(1, totalPages);
  };

  const pages = generatePagination();

  return (
    <div className="pagination">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="pagination-button"
      >
        <ChevronLeft />
      </button>

      {pages.map((page, index) => (
        page === '...' ? (
          <span key={`ellipsis-${index}`} className="pagination-ellipsis">...</span>
        ) : (
          <button
            key={`page-${page}`}
            onClick={() => onPageChange(Number(page))}
            className={`pagination-button ${currentPage === page ? "active" : ""}`}
          >
            {page}
          </button>
        )
      ))}

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="pagination-button"
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default Pagination;