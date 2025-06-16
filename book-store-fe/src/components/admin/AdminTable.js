import React from 'react';
import { Icon } from '@iconify/react';

const AdminTable = ({
    columns,
    data,
    loading,
    emptyMessage = "Không có dữ liệu"
}) => {
    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                    <tr>
                        {columns.map((column, index) => (
                            <th
                                key={index}
                                className={`py-4 whitespace-nowrap text-sm text-gray-500 ${column.className || ''}`}
                                style={column.width ? { width: column.width, minWidth: column.width, maxWidth: column.width } : {}}
                            >
                                {column.label}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {data.length === 0 ? (
                        <tr>
                            <td
                                colSpan={columns.length}
                                className="px-6 py-4 text-center text-gray-500"
                            >
                                {emptyMessage}
                            </td>
                        </tr>
                    ) : (
                        data.map((item, index) => (
                            <tr key={item.id || index}>
                                {columns.map((column, colIndex) => (
                                    <td
                                        key={colIndex}
                                        className={`py-4 ${column.className || 'whitespace-nowrap text-sm text-gray-500'}`}
                                        style={column.width ? { width: column.width, minWidth: column.width, maxWidth: column.width } : {}}
                                    >
                                        {column.render ? column.render(item) : item[column.key]}
                                    </td>
                                ))}
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    );
};

export default AdminTable;
