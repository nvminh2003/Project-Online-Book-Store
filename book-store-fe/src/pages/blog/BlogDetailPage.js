import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import BlogDetailView from '../../components/blog/BlogDetailView';
import blogService from '../../services/blogService';
import Icon from '../../components/common/Icon';
import Spinner from '../../components/common/Spinner';

const BlogDetailPage = () => {
  const { id } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchBlog();
  }, [id]);

  const fetchBlog = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await blogService.getBlogById(id);

      if (response.status === 'Success') {
        setBlog(response.data);
      } else {
        setError(response.message || 'Không thể tải bài viết');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải bài viết');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Spinner />
            <p className="text-gray-500 mt-4">Đang tải bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Icon icon="mdi:alert-circle" className="w-16 h-16 mx-auto text-red-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không thể tải bài viết</h2>
            <p className="text-gray-600 mb-6">{error}</p>
            <div className="space-x-4">
              <button
                onClick={fetchBlog}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors no-underline"
              >
                Thử lại
              </button>
              <Link
                to="/blogs"
                className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700 transition-colors inline-block no-underline"
              >
                Quay lại danh sách
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Icon icon="mdi:file-document-outline" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy bài viết</h2>
            <p className="text-gray-600 mb-6">Bài viết bạn đang tìm kiếm không tồn tại hoặc đã bị xóa.</p>
            <Link
              to="/blogs"
              className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block no-underline"
            >
              Quay lại danh sách bài viết
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back to Blog List */}
        <div className="mb-3">
          <Link
            to="/blogs"
            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors no-underline"
          >
            <Icon icon="mdi:arrow-left" className="w-4 h-4 mr-2" />
            Quay lại danh sách bài viết
          </Link>
        </div>

        {/* Blog Content */}
        <div className="bg-white rounded-lg shadow-md p-8">
          <BlogDetailView blog={blog} />
        </div>

        {/* Breadcrumb */}
        {/* <nav className="mb-8">
          <ol className="flex items-center space-x-2 text-sm text-gray-500">
            <li>
              <Link to="/" className="hover:text-blue-600 transition-colors">
                Trang chủ
              </Link>
            </li>
            <li>
              <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            </li>
            <li>
              <Link to="/blogs" className="hover:text-blue-600 transition-colors">
                Blog
              </Link>
            </li>
            <li>
              <Icon icon="mdi:chevron-right" className="w-4 h-4" />
            </li>
            <li className="text-gray-900 font-medium truncate">
              {blog.title}
            </li>
          </ol>
        </nav> */}

      </div>
    </div>
  );
};

export default BlogDetailPage;