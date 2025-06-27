import React from 'react';

const WishListItem = ({ book, onRemove }) => {
  return (
    <div className="flex items-center border p-4 rounded shadow-sm bg-white">
      <img
        src={book.images?.[0] || '/default-book.png'}
        alt={book.title}
        className="w-20 h-28 object-cover rounded mr-4"
      />
      <div className="flex-1">
        <h3 className="text-lg font-semibold">{book.title}</h3>
        <div className="text-sm text-gray-600 mb-1">
          {book.authors?.join(', ')}
        </div>
        <div className="text-sm text-gray-500 mb-1">
          Publisher: {book.publisher}
        </div>
        <div className="text-primary font-bold mb-2">
          {book.sellingPrice?.toLocaleString()} VND
        </div>
        <button
          className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
          onClick={() => onRemove(book._id)}
        >
          Remove
        </button>
      </div>
    </div>
  );
};

export default WishListItem;
