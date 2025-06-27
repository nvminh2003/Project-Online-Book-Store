import React, { useState } from 'react';
import axios from 'axios';

const ProductCard = ({ product }) => {
  const [adding, setAdding] = useState(false);
  const [added, setAdded] = useState(false);

  const handleAddWishlist = async () => {
    setAdding(true);
    try {
      await axios.post('/api/wishlist/add', { bookId: product._id }, { withCredentials: true });
      setAdded(true);
    } catch (err) {
      alert('Failed to add to wishlist');
    }
    setAdding(false);
  };

  return (
    <div className="border rounded p-4 flex flex-col items-center bg-white shadow-sm">
      <img
        src={product.images?.[0] || '/default-book.png'}
        alt={product.title}
        className="w-24 h-36 object-cover mb-2"
      />
      <h3 className="font-semibold text-center mb-1">{product.title}</h3>
      <div className="text-sm text-gray-600 mb-1">{product.authors?.join(', ')}</div>
      <div className="text-primary font-bold mb-2">{product.sellingPrice?.toLocaleString()} VND</div>
      <button
        className={`px-3 py-1 rounded ${added ? 'bg-green-500' : 'bg-pink-500 hover:bg-pink-600'} text-white`}
        onClick={handleAddWishlist}
        disabled={adding || added}
      >
        {added ? 'Added to Wishlist' : adding ? 'Adding...' : 'Add to Wishlist'}
      </button>
    </div>
  );
};

export default ProductCard;
