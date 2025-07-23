import React from 'react';
import { Icon } from '@iconify/react';

const AdminPagination = ({
    currentPage,
    totalPages,
    totalItems,
    itemsPerPage,
    onPageChange
}) => {
    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    const generatePages = () => {
        const pages = new Set();

        if (totalPages <= 7) {
            for (let i = 1; i <= totalPages; i++) pages.add(i);
        } else {
            pages.add(1);

            if (currentPage > 4) pages.add('start-ellipsis');

            const start = Math.max(2, currentPage - 1);
            const end = Math.min(totalPages - 1, currentPage + 1);
            for (let i = start; i <= end; i++) {
                pages.add(i);
            }

            if (currentPage < totalPages - 3) pages.add('end-ellipsis');

            pages.add(totalPages);
        }

        return Array.from(pages);
    };

    const pages = generatePages();

    return (
        <div className="mt-4 flex justify-between items-center flex-wrap">
            <div className="text-sm text-gray-700 mb-2">
                Hiển thị <span className="font-medium">{startItem}</span> đến{' '}
                <span className="font-medium">{endItem}</span> của{' '}
                <span className="font-medium">{totalItems}</span> kết quả
            </div>
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => onPageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon icon="mdi:chevron-left" width="20" />
                </button>

                {pages.map((page, index) => {
                    if (page === 'start-ellipsis' || page === 'end-ellipsis') {
                        return (
                            <span key={`ellipsis-${index}`} className="px-3 py-1 text-gray-500">
                                ...
                            </span>
                        );
                    }

                    return (
                        <button
                            key={`page-${page}-${index}`}
                            onClick={() => onPageChange(page)}
                            className={`px-3 py-1 border rounded ${currentPage === page
                                ? 'bg-black text-white border-black'
                                : 'border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {page}
                        </button>
                    );
                })}

                <button
                    onClick={() => onPageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="px-3 py-1 border border-gray-300 rounded hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <Icon icon="mdi:chevron-right" width="20" />
                </button>
            </div>
        </div>
    );
};

export default AdminPagination;
