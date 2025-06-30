import React, { useEffect, useState } from 'react';
import WishListItem from '../../components/user/WishListItem';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL_BACKEND;


const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedBook, setSelectedBook] = useState(null);
  const [addingToCart, setAddingToCart] = useState(false);


  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_URL}/wishlist`, { headers:{ Authorization: `Bearer ${localStorage.getItem('accessToken')}` } });

      setWishlist(res.data.data.books || []);
      setError(null);
    } catch (err) {
      setError('Failed to load wishlist');
    }
    setLoading(false);
  };

  const handleRemove = async (bookId) => {
    try {
      await axios.delete(`${API_URL}/wishlist/remove/${bookId}`, { headers:{ Authorization: `Bearer ${localStorage.getItem('accessToken')}`}});

      setWishlist((prev) => prev.filter((book) => book._id !== bookId));
    } catch (err) {
      alert('Failed to remove book from wishlist');
    }
  };

  const handleRemoveClick = (book) => {
    setSelectedBook(book);
    setShowConfirm(true);
  };

  const handleConfirmRemove = async () => {
    if (!selectedBook) return;
    await handleRemove(selectedBook._id);
    setShowConfirm(false);
    setSelectedBook(null);
  };

  const handleCancelRemove = () => {
    setShowConfirm(false);
    setSelectedBook(null);
  };

  const handleAddToCart = async (bookId) => {
  setAddingToCart(true);
  try {
    await axios.post(
      `${API_URL}/cart/add`,
      { items: [{ bookId, quantity: 1 }] },
      { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
    );
    alert('Đã thêm vào giỏ hàng!');
  } catch (err) {
    alert('Thêm vào giỏ hàng thất bại!');
  }
  setAddingToCart(false);
};

  useEffect(() => {
    fetchWishlist();
  }, []);

  if (loading) return <div>Loading wishlist...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">My Wishlist</h2>
      {wishlist.length === 0 ? (
        <div>Your wishlist is empty.</div>
      ) : (
        <div className="grid gap-4">
          {wishlist.map((book) => (
            <div key={book._id} className="flex items-center gap-4 border p-4 rounded shadow-sm bg-white">
              <img src={book.images[0]} alt={book.title} className="w-20 h-28 object-cover rounded" />
              <div className="flex-1">
                <div className="font-semibold text-lg">{book.title}</div>
                <div className="text-gray-600">{book.author}</div>
                <div className="text-blue-600 font-bold mt-1">{book.sellingPrice?.toLocaleString('vi-VN')}₫</div>
              </div>
              <button
                className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 mr-2"
                onClick={() => handleAddToCart(book._id)}
                disabled={addingToCart}
              >
                Thêm vào giỏ hàng
              </button>
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                onClick={() => handleRemoveClick(book)}
              >
                Xóa
              </button>
            </div>
          ))}
        </div>
      )}
      {/* Modal Confirm Delete */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Xác nhận xóa</h3>
            <p>Bạn có chắc chắn muốn xóa <span className="font-bold">{selectedBook?.title}</span> khỏi danh sách yêu thích?</p>
            <div className="flex justify-end gap-2 mt-6">
              <button className="px-4 py-2 bg-gray-300 rounded" onClick={handleCancelRemove}>Hủy</button>
              <button className="px-4 py-2 bg-red-500 text-white rounded" onClick={handleConfirmRemove}>Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
