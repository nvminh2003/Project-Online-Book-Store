import React from 'react';
import { Icon } from '@iconify/react';

const AdminPageLayout = ({ title, children, actions }) => {
    return (
        <div className="p-6">
            {/* Header */}
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
                <div className="flex gap-2">
                    {actions}
                </div>
            </div>

            {/* Content */}
            <div className="bg-white rounded-lg shadow">
                {children}
            </div>
        </div>
    );
};

export default AdminPageLayout; 