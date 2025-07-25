import React from 'react';
import { Link } from 'react-router-dom';
import Icon from '../common/Icon';
import moment from 'moment';

const BlogPostCard = ({ blog }) => {
  const formatDate = (date) => {
    return moment(date).format('DD/MM/YYYY');
  };

  const truncateHtml = (html, maxLength = 150) => {
    const div = document.createElement('div');
    div.innerHTML = html;
    let text = '';
    let len = 0;
    function walk(node) {
      if (len >= maxLength) return;
      if (node.nodeType === 3) { // text node
        let remain = maxLength - len;
        text += node.nodeValue.slice(0, remain);
        len += node.nodeValue.slice(0, remain).length;
      } else if (node.nodeType === 1) { // element
        text += `<${node.nodeName.toLowerCase()}`;
        for (let attr of node.attributes) {
          text += ` ${attr.name}="${attr.value}"`;
        }
        text += '>';
        for (let child of node.childNodes) {
          walk(child);
          if (len >= maxLength) break;
        }
        text += `</${node.nodeName.toLowerCase()}>`;
      }
    }
    for (let child of div.childNodes) {
      walk(child);
      if (len >= maxLength) break;
    }
    if (div.textContent.length > maxLength) text += '...';
    return text;
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="p-6">
        {/* Title */}
        <Link to={`/blogs/${blog._id}`} className="block no-underline">
          <h3 className="text-xl font-semibold text-gray-900 mb-3 hover:text-blue-600 transition-colors line-clamp-2">
            {blog.title}
          </h3>
        </Link>

        {/* Content Preview */}
        <div className="text-gray-600 mb-4 line-clamp-3 prose prose-sm max-w-none">
          <div dangerouslySetInnerHTML={{ __html: truncateHtml(blog.content, 150) }} />
        </div>

        {/* Meta Information */}
        <div className="flex items-center justify-between text-sm text-gray-500">
          <div className="flex items-center space-x-4">
            {/* Author */}
            {/* <div className="flex items-center">
              <Icon icon="mdi:account" className="w-4 h-4 mr-1" />
              <span>{blog.author?.info?.fullName || blog.author?.email || 'Unknown'}</span>
            </div> */}

            {/* Date */}
            <div className="flex items-center">
              <Icon icon="mdi:calendar" className="w-4 h-4 mr-1" />
              <span>{formatDate(blog.createdAt)}</span>
            </div>
          </div>

          {/* View Count */}
          <div className="flex items-center">
            <Icon icon="mdi:eye" className="w-4 h-4 mr-1" />
            <span>{blog.viewCount || 0} lượt xem</span>
          </div>
        </div>

        {/* Read More Button */}
        <div className="mt-4">
          <Link
            to={`/blogs/${blog._id}`}
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors no-underline"
          >
            Đọc thêm
            <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogPostCard;