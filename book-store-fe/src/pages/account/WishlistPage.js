import React, { useEffect, useState } from 'react';
import WishListItem from '../../components/user/WishListItem';
import axios from 'axios';

const WishlistPage = () => {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchWishlist = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/wishlist', { withCredentials: true });
      setWishlist(res.data.data.books || []);
      setError(null);
    } catch (err) {
      setError('Failed to load wishlist');
    }
    setLoading(false);
  };

  const handleRemove = async (bookId) => {
    try {
      await axios.delete(`/api/wishlist/remove/${bookId}`, { withCredentials: true });
      setWishlist((prev) => prev.filter((book) => book._id !== bookId));
    } catch (err) {
      alert('Failed to remove book from wishlist');
    }
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
            <WishListItem key={book._id} book={book} onRemove={handleRemove} />
          ))}
        </div>
      )}
    </div>
  );
};

export default WishlistPage;
