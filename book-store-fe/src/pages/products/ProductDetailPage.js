import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ProductDetailPage = () => {
  const [books, setBooks] = useState([]);
  const [categories, setCategories] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchBooks();
    fetchCategories();
  }, [page]);

  const fetchBooks = async () => {
    try {
      const res = await axios.get(`/api/books?page=${page}&limit=12`);
      setBooks(res.data.data.books);
      setTotalPages(res.data.data.pagination.totalPages);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get('/api/categories');
      setCategories(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const formatCurrency = (price) => {
    return price.toLocaleString('vi-VN') + 'đ';
  };

  return (
    <div className="container mx-auto px-4 py-6 flex">
      {/* Sidebar danh mục */}
      <aside className="w-1/4 pr-6">
        <h2 className="font-semibold text-lg mb-4">DANH MỤC SÁCH</h2>
        <ul className="space-y-2">
          {categories.map((cat) => (
            <li key={cat._id} className="text-blue-700 hover:underline cursor-pointer">
              {cat.name}
            </li>
          ))}
        </ul>
      </aside>

      {/* Danh sách sản phẩm */}
      <main className="w-3/4">
        <h1 className="text-2xl font-bold mb-4">Tất cả sản phẩm</h1>
        <div className="grid grid-cols-4 gap-6">
          {books.map((book) => {
            const discount = book.originalPrice && book.sellingPrice
              ? Math.round(((book.originalPrice - book.sellingPrice) / book.originalPrice) * 100)
              : 0;

            return (
              <div key={book._id} className="border rounded p-3 shadow hover:shadow-md transition">
                <div className="relative">
                  {discount > 0 && (
                    <div className="absolute top-0 left-0 bg-red-600 text-white text-xs px-1 py-0.5">
                      -{discount}%
                    </div>
                  )}
                  <img
                    src={book.images[0] || '/no-image.png'}
                    alt={book.title}
                    className="w-full h-48 object-cover mb-2"
                  />
                </div>
                <div className="text-sm font-semibold line-clamp-2 min-h-[3rem]">
                  {book.title}
                </div>
                <div className="mt-1">
                  <span className="text-red-600 font-bold">{formatCurrency(book.sellingPrice)}</span>
                  {discount > 0 && (
                    <span className="line-through text-gray-500 text-sm ml-2">
                      {formatCurrency(book.originalPrice)}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Pagination */}
        <div className="mt-6 flex justify-center space-x-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i}
              onClick={() => setPage(i + 1)}
              className={`px-3 py-1 border rounded ${page === i + 1 ? 'bg-blue-500 text-white' : 'bg-white'}`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      </main>
    </div>
  );
};

export default ProductDetailPage;
