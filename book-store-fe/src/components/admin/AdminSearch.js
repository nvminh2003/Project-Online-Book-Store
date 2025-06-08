import React from 'react';
import { Icon } from '@iconify/react';

const AdminSearch = ({
    placeholder = "Tìm kiếm...",
    value,
    onChange,
    onSearch,
    filters = [],
    className = ""
}) => {
    const handleSubmit = (e) => {
        e.preventDefault();
        onSearch?.();
    };

    return (
        <div className={`mb-6 flex gap-4 ${className}`}>
            <form onSubmit={handleSubmit} className="flex-1">
                <div className="relative">
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full pl-4 pr-10 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                    />
                    <button
                        type="submit"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-blue-600"
                    >
                        <Icon icon="mdi:magnify" width="20" />
                    </button>
                </div>
            </form>

            {filters.map((filter, index) => (
                <select
                    key={index}
                    value={filter.value}
                    onChange={(e) => filter.onChange(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-300"
                >
                    <option value="">{filter.placeholder}</option>
                    {filter.options.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            ))}
        </div>
    );
};

export default AdminSearch; 