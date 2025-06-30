const cartMockData = {
  items: [
    {
      id: "1a2b3c4d5e6f7g8h9i0j",
      quantity: 2,
      name: "The Great Gatsby",
      author: "F. Scott Fitzgerald",
      imageUrl: "https://example.com/images/gatsby.jpg",
      price: 15.99,
    },
    {
      id: "2b3c4d5e6f7g8h9i0j1a",
      quantity: 1,
      name: "To Kill a Mockingbird",
      author: "Harper Lee",
      imageUrl: "https://example.com/images/mockingbird.jpg",
      price: 12.49,
    },
    {
      id: "3c4d5e6f7g8h9i0j1a2b",
      quantity: 3,
      name: "1984",
      author: "George Orwell",
      imageUrl: "https://example.com/images/1984.jpg",
      price: 14.99,
    },
  ],
  discountAmount: 5.0,
  shippingFee: 3.99,
};

export default cartMockData;
