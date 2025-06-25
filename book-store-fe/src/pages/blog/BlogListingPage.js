import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import BlogPostCard from '../../components/blog/BlogPostCard';
import blogService from '../../services/blogService';
import Icon from '../../components/common/Icon';
import Spinner from '../../components/common/Spinner';

const BlogListingPage = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const currentPage = parseInt(searchParams.get('page')) || 1;
  const currentQuery = searchParams.get('search') || '';

  useEffect(() => {
    setSearchQuery(currentQuery);
    fetchBlogs(currentPage, currentQuery);
  }, [currentPage, currentQuery]);

  const fetchBlogs = async (page, query) => {
    try {
      setLoading(true);
      setError(null);

      let response;
      if (query.trim()) {
        response = await blogService.searchBlogs(query, page, pagination.limit);
      } else {
        response = await blogService.getAllBlogs({ page, limit: pagination.limit });
      }

      if (response.status === 'Success') {
        setBlogs(response.data.blogs);
        setPagination(response.data.pagination);
      } else {
        setError(response.message || 'Có lỗi xảy ra khi tải danh sách bài viết');
      }
    } catch (err) {
      setError(err.message || 'Có lỗi xảy ra khi tải danh sách bài viết');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery.trim()) {
      params.set('search', searchQuery.trim());
    }
    params.set('page', '1');
    setSearchParams(params);
  };

  const handlePageChange = (page) => {
    const params = new URLSearchParams(searchParams);
    params.set('page', page.toString());
    setSearchParams(params);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setSearchParams({ page: '1' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <Spinner />
            <p className="text-gray-500 mt-4">Đang tải danh sách bài viết...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Blog & Tin tức
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Khám phá những bài viết mới nhất về sách, văn học và những câu chuyện thú vị từ MKMN
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex items-center bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Tìm kiếm bài viết..."
                  className="w-full px-4 text-gray-700 focus:outline-none"
                />
              </div>
              <button
                type="submit"
                className="bg-blue-600 text-white px-6 py-3 hover:bg-blue-700 transition-colors"
              >
                <Icon icon="mdi:magnify" className="w-5 h-5" />
              </button>
            </div>
          </form>

          {/* Search Results Info */}
          {currentQuery && (
            <div className="text-center mt-4">
              <p className="text-gray-600">
                Kết quả tìm kiếm cho: <span className="font-semibold">"{currentQuery}"</span>
                <button
                  onClick={clearSearch}
                  className="ml-2 text-blue-600 hover:text-blue-800 no-underline"
                >
                  Xóa tìm kiếm
                </button>
              </p>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-2 mb-8">
            <div className="flex items-center">
              <Icon icon="mdi:alert-circle" className="w-5 h-5 text-red-600 mr-2" />
              <p className="text-red-800 mb-0">{error}</p>
            </div>
          </div>
        )}

        {/* Blog Posts Grid */}
        {blogs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {blogs.map((blog) => (
              <BlogPostCard key={blog._id} blog={blog} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Icon icon="mdi:file-document-outline" className="w-16 h-16 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {currentQuery ? 'Không tìm thấy bài viết nào' : 'Chưa có bài viết nào'}
            </h3>
            <p className="text-gray-500">
              {currentQuery
                ? 'Thử tìm kiếm với từ khóa khác hoặc xem tất cả bài viết.'
                : 'Hãy quay lại sau để xem những bài viết mới nhất.'
              }
            </p>
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center">
            <nav className="flex items-center space-x-2">
              {/* Previous Button */}
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:chevron-left" className="w-4 h-4" />
              </button>

              {/* Page Numbers */}
              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-2 text-sm font-medium rounded-md ${page === currentPage
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-500 bg-white border border-gray-300 hover:bg-gray-50'
                    }`}
                >
                  {page}
                </button>
              ))}

              {/* Next Button */}
              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === pagination.totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon icon="mdi:chevron-right" className="w-4 h-4" />
              </button>
            </nav>
          </div>
        )}

        {/* Results Info */}
        {/* {blogs.length > 0 && (
          <div className="text-center mt-6 text-sm text-gray-500">
            Hiển thị {((currentPage - 1) * pagination.limit) + 1} - {Math.min(currentPage * pagination.limit, pagination.total)}
            trong tổng số {pagination.total} bài viết
          </div>
        )} */}
      </div>
    </div>
  );
};

export default BlogListingPage;
