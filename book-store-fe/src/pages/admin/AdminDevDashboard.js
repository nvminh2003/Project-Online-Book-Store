import React, { useEffect, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Icon } from '@iconify/react';
import axios from 'axios';
import AdminTable from '../../components/admin/AdminTable';

const API_URL = process.env.REACT_APP_API_URL_BACKEND || 'http://localhost:9999/api';

const AdminDevDashboard = () => {
  const { user } = useAuth();
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingBlog, setLoadingBlog] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [bookRes, catRes] = await Promise.all([
          axios.get(`${API_URL}/books?limit=1000`),
          axios.get(`${API_URL}/categories`),
        ]);
        setBooks(bookRes.data.data.books || []);
        setCategories(catRes.data.data || []);
      } catch (err) {
        setBooks([]);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoadingBlog(true);
      try {
        const res = await axios.get(`${API_URL}/blogs?limit=1000`);
        console.log('API /blogs response:', res.data);
        // Lấy đúng mảng blog từ res.data.data.blogs
        let blogArr = [];
        if (Array.isArray(res.data.data?.blogs)) {
          blogArr = res.data.data.blogs;
        } else if (Array.isArray(res.data.data)) {
          blogArr = res.data.data;
        } else if (Array.isArray(res.data.blogs)) {
          blogArr = res.data.blogs;
        } else if (Array.isArray(res.data)) {
          blogArr = res.data;
        }
        setBlogs(blogArr);
      } catch (err) {
        setBlogs([]);
      } finally {
        setLoadingBlog(false);
      }
    };
    fetchBlogs();
  }, []);

  // Stats
  const totalBooks = books.length;
  const totalCategories = categories.length;
  const totalBlogs = blogs.length;
  const lowStockBooks = books.filter(b => b.stockQuantity <= 10);
  const newBooks = books.filter(b => {
    const created = new Date(b.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  });
  const newBlogs = blogs.filter(b => {
    const created = new Date(b.createdAt);
    const now = new Date();
    return created.getMonth() === now.getMonth() && created.getFullYear() === now.getFullYear();
  });

  // Category distribution
  const categoryStats = categories.map(cat => ({
    ...cat,
    bookCount: books.filter(b => (b.categories || []).some(c => (c._id || c) === cat._id)).length
  }));

  // Top 5 books by stock
  const topStockBooks = [...books].sort((a, b) => b.stockQuantity - a.stockQuantity).slice(0, 5);
  const lowStockBooksTop = [...lowStockBooks].sort((a, b) => a.stockQuantity - b.stockQuantity).slice(0, 5);

  // Top 5 blogs by views
  const topBlogs = [...blogs].sort((a, b) => (b.views || 0) - (a.views || 0)).slice(0, 5);
  console.log("blog", topBlogs)
  // Pie chart data (category distribution)
  const pieData = categoryStats.filter(c => c.bookCount > 0);
  const pieColors = [
    'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-gray-500'
  ];

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Admin Dev Dashboard</h1>
        <p className="text-gray-600 text-lg">Welcome, <span className="font-semibold">{user?.info?.fullName || user?.email}</span> <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs">Admin Dev</span></p>
      </div>
      {(loading || loadingBlog) ? (
        <div className="text-center py-10 text-gray-500">Đang tải dữ liệu...</div>
      ) : (
        <>
          {/* Stats cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <Icon icon="mdi:book-open-page-variant" width="36" className="text-blue-500 mb-2" />
              <div className="text-lg font-semibold">Tổng số sách</div>
              <div className="text-2xl font-bold text-blue-700">{totalBooks}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <Icon icon="mdi:shape" width="36" className="text-green-500 mb-2" />
              <div className="text-lg font-semibold">Tổng danh mục</div>
              <div className="text-2xl font-bold text-green-700">{totalCategories}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <Icon icon="mdi:alert-circle" width="36" className="text-red-500 mb-2" />
              <div className="text-lg font-semibold">Sách sắp hết hàng</div>
              <div className="text-2xl font-bold text-red-700">{lowStockBooks.length}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <Icon icon="mdi:new-box" width="36" className="text-purple-500 mb-2" />
              <div className="text-lg font-semibold">Sách mới trong tháng</div>
              <div className="text-2xl font-bold text-purple-700">{newBooks.length}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <Icon icon="mdi:post-outline" width="36" className="text-orange-500 mb-2" />
              <div className="text-lg font-semibold">Tổng số blog</div>
              <div className="text-2xl font-bold text-orange-600">{totalBlogs}</div>
            </div>
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <Icon icon="mdi:post" width="36" className="text-yellow-500 mb-2" />
              <div className="text-lg font-semibold">Blog mới trong tháng</div>
              <div className="text-2xl font-bold text-yellow-600">{newBlogs.length}</div>
            </div>
          </div>

          {/* Category distribution pie chart (simple custom) + Top blog */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <div className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Icon icon="mdi:chart-pie" width="24" className="text-blue-500" /> Tỷ lệ sách theo danh mục
              </div>
              {pieData.length === 0 ? (
                <div className="text-gray-400">Không có dữ liệu</div>
              ) : (
                <div className="flex flex-col items-center w-full">
                  <div className="relative w-40 h-40 mb-4">
                    {/* Pie chart bằng CSS (tối giản, không dùng thư viện ngoài) */}
                    <svg viewBox="0 0 32 32" className="w-full h-full">
                      {(() => {
                        let total = pieData.reduce((sum, c) => sum + c.bookCount, 0);
                        let acc = 0;
                        return pieData.map((c, i) => {
                          const val = c.bookCount / total * 100;
                          const start = acc;
                          acc += val;
                          const large = val > 50 ? 1 : 0;
                          const r = 16, cx = 16, cy = 16;
                          const a1 = (start / 100) * 2 * Math.PI;
                          const a2 = ((start + val) / 100) * 2 * Math.PI;
                          const x1 = cx + r * Math.sin(a1);
                          const y1 = cy - r * Math.cos(a1);
                          const x2 = cx + r * Math.sin(a2);
                          const y2 = cy - r * Math.cos(a2);
                          return (
                            <path
                              key={c._id}
                              d={`M${cx},${cy} L${x1},${y1} A${r},${r} 0 ${large},1 ${x2},${y2} Z`}
                              fill={[
                                '#3b82f6', '#22c55e', '#eab308', '#ef4444', '#a21caf', '#f472b6', '#6366f1', '#14b8a6', '#f97316', '#6b7280'
                              ][i % 10]}
                            />
                          );
                        });
                      })()}
                    </svg>
                  </div>
                  <div className="flex flex-col gap-1 w-full">
                    {pieData.map((c, i) => (
                      <div key={c._id} className="flex items-center gap-2 text-sm">
                        <span className={`inline-block w-3 h-3 rounded-full ${pieColors[i % pieColors.length]}`}></span>
                        <span className="flex-1 truncate">{c.name}</span>
                        <span className="font-semibold">{c.bookCount}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            {/* Top blog by views */}
            <div className="bg-white p-6 rounded-lg shadow flex flex-col items-center">
              <div className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Icon icon="mdi:eye" width="22" className="text-blue-500" /> Top 5 blog nhiều lượt xem
              </div>
              <div className="w-full overflow-x-auto">
                <table className="min-w-[500px] w-full text-sm">
                  <thead>
                    <tr className="bg-blue-50 text-left">
                      <th className="py-2 px-3">#</th>
                      <th className="py-2 px-3">Tiêu đề</th>
                      <th className="py-2 px-3">Tác giả</th>
                      <th className="py-2 px-3">Ngày tạo</th>
                      <th className="py-2 px-3">Lượt xem</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topBlogs.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-gray-400 py-4">Không có dữ liệu blog</td>
                      </tr>
                    ) : (
                      topBlogs.map((item, idx) => (
                        <tr key={item._id || idx} className="border-t">
                          <td className="py-2">
                            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold bg-blue-100 text-blue-700">
                              {idx + 1}
                            </div>
                          </td>
                          <td className="py-2 px-3 max-w-xs truncate" title={item.title}>
                            {item.title?.length > 15 ? item.title.slice(0, 15) + '...' : item.title}
                          </td>
                          <td className="py-2 px-3">
                            {item.author?.info?.fullName || item.author?.email || 'N/A'}
                          </td>
                          <td className="py-2 px-3">
                            {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                          </td>
                          <td className="py-2 px-3 font-semibold text-blue-600">
                            {item.viewCount?.toLocaleString('vi-VN') || 0}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          </div>

          {/* Top books by stock & Low stock books */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Icon icon="mdi:star" width="22" className="text-yellow-500" /> Top 5 sách tồn kho cao nhất
              </div>
              <ul className="divide-y">
                {topStockBooks.length === 0 ? <li className="text-gray-400">Không có dữ liệu</li> : topStockBooks.map(b => (
                  <li key={b._id} className="py-2 flex items-center gap-2">
                    <img src={b.images?.[0] || '/default-book.jpg'} alt={b.title} className="w-8 h-12 object-cover rounded mr-2" />
                    <span className="flex-1 truncate">{b.title}</span>
                    <span className="text-xs text-gray-500">Kho: {b.stockQuantity}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white p-6 rounded-lg shadow">
              <div className="font-semibold text-lg mb-4 flex items-center gap-2">
                <Icon icon="mdi:alert" width="22" className="text-red-500" /> Top 5 sách sắp hết hàng
              </div>
              <ul className="divide-y">
                {lowStockBooksTop.length === 0 ? <li className="text-gray-400">Không có dữ liệu</li> : lowStockBooksTop.map(b => (
                  <li key={b._id} className="py-2 flex items-center gap-2">
                    <img src={b.images?.[0] || '/default-book.jpg'} alt={b.title} className="w-8 h-12 object-cover rounded mr-2" />
                    <span className="flex-1 truncate">{b.title}</span>
                    <span className="text-xs text-red-500 font-semibold">Kho: {b.stockQuantity}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Category table */}
          <div className="bg-white p-6 rounded-lg shadow mb-8">
            <div className="font-semibold text-lg mb-4 flex items-center gap-2">
              <Icon icon="mdi:shape-outline" width="22" className="text-blue-500" /> Danh mục & số lượng sách
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-[400px] w-full text-sm">
                <thead>
                  <tr className="bg-blue-50">
                    <th className="py-2 px-3 text-left font-semibold">Tên danh mục</th>
                    <th className="py-2 px-3 text-left font-semibold">Số sách</th>
                  </tr>
                </thead>
                <tbody>
                  {categoryStats.length === 0 ? (
                    <tr><td colSpan={2} className="text-center text-gray-400 py-4">Không có dữ liệu</td></tr>
                  ) : categoryStats.map(cat => (
                    <tr key={cat._id}>
                      <td className="py-2 px-3">{cat.name}</td>
                      <td className="py-2 px-3">{cat.bookCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDevDashboard;