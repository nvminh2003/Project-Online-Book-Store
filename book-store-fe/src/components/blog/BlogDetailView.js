import React from 'react';
import Icon from '../common/Icon';
import moment from 'moment';

const BlogDetailView = ({ blog }) => {
  const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
  };

  if (!blog) {
    return (
      <div className="text-center py-8">
        <Icon icon="mdi:loading" className="w-8 h-8 mx-auto text-gray-400 animate-spin" />
        <p className="text-gray-500 mt-2">Đang tải bài viết...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-4 leading-tight">
          {blog.title}
        </h1>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500 border-b border-gray-200 pb-4">
          <div className="flex items-center space-x-6">
            {/* Author */}
            {/* <div className="flex items-center">
              <Icon icon="mdi:account" className="w-4 h-4 mr-2" />
              <span className="font-medium">
                {blog.author?.info?.fullName || blog.author?.email || 'Unknown'}
              </span>
            </div> */}

            {/* Date */}
            <div className="flex items-center">
              <Icon icon="mdi:calendar" className="w-4 h-4 mr-2" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>

            {/* View Count */}
            <div className="flex items-center">
              <Icon icon="mdi:eye" className="w-4 h-4 mr-2" />
              <span>{blog.viewCount || 0} lượt xem</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-lg max-w-none">
        <div className="text-gray-700 leading-relaxed">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </div>
      </div>

      {/* Footer */}
      {/* <div className="mt-8 pt-6 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            <span>Được đăng bởi: {blog.author?.info?.fullName || blog.author?.email}</span>
            <span>•</span>
            <span>Cập nhật lần cuối: {formatDate(blog.updatedAt)}</span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-gray-400">Chia sẻ:</span>
            <button className="text-blue-600 hover:text-blue-800 transition-colors">
              <Icon icon="mdi:facebook" className="w-5 h-5" />
            </button>
            <button className="text-blue-400 hover:text-blue-600 transition-colors">
              <Icon icon="mdi:twitter" className="w-5 h-5" />
            </button>
            <button className="text-green-600 hover:text-green-800 transition-colors">
              <Icon icon="mdi:whatsapp" className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div> */}
    </div>
  );
};

export default BlogDetailView;