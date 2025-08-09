import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import productService from '../services/bookService';
import blogService from '../services/blogService';
import reviewService from '../services/reviewService';
import axios from 'axios';
import logo from '../../src/assets/sction.webp';
import sachmoi from '../../src/assets/sachmoi.jpg';
import logo1 from '../../src/assets/section.jpg';
import logo2 from '../../src/assets/logo3.webp';
import { useCart } from "../contexts/CartContext";
import { useAuth } from "../contexts/AuthContext";
import { notifySuccess, notifyError } from "../components/common/ToastManager";
import WishlistButton from "../components/wishlist/WishlistButton";
import wishlistService from '../services/wishlistService';
const images = [logo, logo1, logo2];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999/api';

const HomePage = () => {
    const [book, setBook] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [index, setIndex] = useState(0);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [latestBlogs, setLatestBlogs] = useState([]);
    const [featuredReviews, setFeaturedReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [blogLoading, setBlogLoading] = useState(true);
    const [reviewLoading, setReviewLoading] = useState(true);
    const [error, setError] = useState(null);
    const [blogError, setBlogError] = useState(null);
    const [reviewError, setReviewError] = useState(null);
    const { addToCart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();

    // Hide cart and wishlist buttons for admin users
    const isAdmin = user?.role === 'superadmin' || user?.role === 'admindev' || user?.role === 'adminbusiness';

    // Tự động chuyển ảnh mỗi 5 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Fetch featured books from API
    useEffect(() => {
        const fetchFeaturedBooks = async () => {
            try {
                setLoading(true);
                const response = await productService.getFeaturedBooks(8);
                setFeaturedBooks(response.data);
                setError(null);
            } catch (err) {
                console.error('Error fetching featured books:', err);
                setError('Không thể tải sách nổi bật. Vui lòng thử lại sau.');
            } finally {
                setLoading(false);
            }
        };

        fetchFeaturedBooks();
    }, []);

    // Fetch latest blogs from API
    useEffect(() => {
        const fetchLatestBlogs = async () => {
            try {
                setBlogLoading(true);
                const response = await blogService.getAllBlogs({
                    limit: 4,
                    status: 'published'
                });
                setLatestBlogs(response.data.blogs || []);
                setBlogError(null);
            } catch (err) {
                console.error('Error fetching latest blogs:', err);
                setBlogError('Không thể tải bài viết mới nhất. Vui lòng thử lại sau.');
            } finally {
                setBlogLoading(false);
            }
        };

        fetchLatestBlogs();
    }, []);

    // Fetch featured reviews from API
    useEffect(() => {
        const fetchFeaturedReviews = async () => {
            try {
                setReviewLoading(true);
                const response = await reviewService.getFeaturedReviews(3);
                setFeaturedReviews(response.data.reviews || []);
                setReviewError(null);
            } catch (err) {
                console.error('Error fetching featured reviews:', err);
                setReviewError('Không thể tải đánh giá nổi bật. Vui lòng thử lại sau.');
            } finally {
                setReviewLoading(false);
            }
        };

        fetchFeaturedReviews();
    }, []);

    // Event handlers for action buttons
    const handleAddToCart = async (bookId) => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            notifyError("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
            setTimeout(() => navigate("/auth/login"), 1500);
            return;
        }

        const currentQuantity = Number(quantity);
        if (isNaN(currentQuantity) || currentQuantity < 1) {
            notifyError("Số lượng không hợp lệ. Vui lòng chọn ít nhất 1 sản phẩm.");
            return;
        }

        try {
            const result = await addToCart(bookId, currentQuantity);

            if (result.success) {
                notifySuccess("Đã thêm vào giỏ hàng thành công!");
            } else {
                notifyError(result.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
            }
        } catch (err) {
            console.error("Lỗi khi thêm vào giỏ hàng:", err.response?.data || err.message);
            notifyError(
                err.response?.data?.message || "Không thể thêm sản phẩm vào giỏ hàng."
            );
        }
    };

    const handleAddToWishlist = async (bookId) => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            notifyError("Bạn cần đăng nhập để thêm vào yêu thích.");
            setTimeout(() => navigate("/auth/login"), 1500);
            return;
        }
        try {
            await wishlistService.addToWishlist(bookId);
            notifySuccess("Đã thêm vào mục yêu thích!");
        } catch (err) {
            console.error("Wishlist error:", err.response?.data || err.message);
            const message = err.response?.data?.message || "Không thể thêm vào yêu thích.";
            notifyError(message);
        }
    };

    const handleViewDetail = (bookId) => {
        navigate(`/detailbook/${bookId}`);
    };

    const benefits = [
        { icon: 'mdi:truck-fast-outline', title: 'Giao hàng nhanh', description: 'Giao hàng toàn quốc, nhanh chóng và tin cậy.' },
        { icon: 'mdi:book-open-page-variant-outline', title: 'Đa dạng thể loại', description: 'Hàng ngàn đầu sách từ kinh tế, văn học đến khoa học.' },
        { icon: 'mdi:shield-check-outline', title: 'Chất lượng đảm bảo', description: 'Tất cả sách đều được chọn lọc kỹ lưỡng, chất lượng cao.' },
        { icon: 'mdi:tag-heart-outline', title: 'Ưu đãi hấp dẫn', description: 'Nhiều chương trình khuyến mãi, giảm giá đặc biệt.' },
    ];

    // Format price function
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    // Format date function
    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('vi-VN', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit'
        });
    };

    // Truncate HTML function (giống như trong BlogPostCard)
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
        <div className="bg-white">

            {/* Hero Section */}
            <section className="relative h-[500px] overflow-hidden text-white">
                {/* Các ảnh xếp chồng lên nhau */}
                {images.map((url, i) => (
                    <div
                        key={i}
                        className={`absolute inset-0 bg-center bg-cover transition-opacity duration-1000 ${i === index ? "opacity-100 z-10" : "opacity-0 z-0"}`}
                        style={{ backgroundImage: `url(${url})` }}
                    />
                ))}

                {/* Lớp phủ đen */}
                <div className="absolute inset-0 bg-black bg-opacity-50 z-20" />

                {/* Nội dung */}
                <div className="relative z-30 flex flex-col justify-center items-center h-full text-center px-4">
                    <h1 className="text-4xl md:text-6xl font-bold mb-4">Khám Phá Thế Giới Tri Thức</h1>
                    <p className="text-lg md:text-xl mb-8">Nơi mỗi trang sách mở ra một chân trời mới.</p>
                    <a
                        href="/getbook"
                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-full transition no-underline"
                    >
                        Xem Sách Ngay
                    </a>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12">Tại sao chọn chúng tôi?</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {benefits.map((item, index) => (
                            <div key={index} className="flex flex-col items-center">
                                <div className="bg-blue-100 text-blue-600 rounded-full p-4 mb-4">
                                    <Icon icon={item.icon} className="w-8 h-8" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{item.title}</h3>
                                <p className="text-gray-600">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Featured Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex flex-col md:flex-row items-center gap-12">
                        <div className="md:w-1/2">
                            <img src={sachmoi} alt="Đọc sách" className="rounded-lg shadow-lg w-full" />
                        </div>
                        <div className="md:w-1/2">
                            {/* <h3 className="text-xl font-semibold text-blue-600 uppercase">Sách Mới Về</h3> */}
                            <h2 className="text-3xl font-bold text-gray-800 mt-2 mb-4">Món quà từ những trang sách</h2>
                            <p className="text-gray-600 mb-6">
                                Khám phá những đầu sách mới nhất vừa được cập nhật. Từ những tác phẩm kinh điển đến các bestseller hiện đại, chúng tôi luôn mang đến những lựa chọn tuyệt vời nhất cho bạn.
                            </p>
                            {/* <Link
                                to="/products?filter=new-arrivals"
                                className="bg-black text-white font-bold text-lg py-2 px-6 inline-block text-center no-underline hover:bg-blue-600 transition-colors duration-300"
                            >
                                Xem Thêm
                            </Link> */}
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Sách nổi bật</h2>

                    {loading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : error ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{error}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {featuredBooks.map(book => {
                                    const isOutOfStock = typeof book.stockQuantity === 'number' && book.stockQuantity <= 0;
                                    return (
                                        <div key={book._id} className={`flex flex-col h-full border rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300 ${isOutOfStock ? 'opacity-60 pointer-events-none' : ''}`}>
                                            <div>
                                                <div className="aspect-[3/4] w-full overflow-hidden mb-3 relative">
                                                    <img
                                                        src={book.images && book.images.length > 0 ? book.images[0] : 'https://via.placeholder.com/300x400?text=No+Image'}
                                                        alt={book.title}
                                                        className="w-full h-full object-cover rounded-md cursor-pointer transition-transform duration-200 hover:scale-105"
                                                        onClick={() => handleViewDetail(book._id)}
                                                    />
                                                    {isOutOfStock && (
                                                        <span className="absolute top-2 right-2 bg-gray-700 text-white text-xs px-2 py-0.5 rounded animate-pulse">Hết hàng</span>
                                                    )}
                                                </div>
                                                <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 min-h-[40px]">{book.title}</h3>
                                                <p className="text-sm text-gray-500 italic min-h-[20px]">{book.authors ? book.authors.join(', ') : "Tác giả không rõ"}</p>
                                                <div className="mb-3 min-h-[32px]">
                                                    {book.originalPrice && book.originalPrice > book.sellingPrice && (
                                                        <span className="text-sm text-gray-400 line-through mr-1">
                                                            {formatPrice(book.originalPrice)}
                                                        </span>
                                                    )}
                                                    <span className="text-lg font-bold text-red-600">{formatPrice(book.sellingPrice)}</span>
                                                </div>
                                            </div>
                                            <div className="flex flex-row gap-3 mt-auto w-full justify-center items-end pb-2">
                                                {/* Thêm vào giỏ - ẩn cho admin */}
                                                {!isAdmin && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleAddToCart(book._id);
                                                        }}
                                                        className={`bg-white border border-blue-500 p-3 rounded-full flex items-center justify-center transition-all duration-200 ${isOutOfStock ? 'opacity-60 cursor-not-allowed pointer-events-none' : 'hover:bg-blue-100 hover:scale-110 hover:shadow-lg'}`}
                                                        title="Thêm vào giỏ hàng"
                                                        disabled={isOutOfStock}
                                                    >
                                                        <Icon icon="mdi:cart" width="20" height="20" color="#2563eb" />
                                                    </button>
                                                )}
                                                {/* Yêu thích - ẩn cho admin */}
                                                {!isAdmin && (
                                                    <WishlistButton
                                                        bookId={book._id}
                                                        variant="icon-only"
                                                        onRequireLogin={() => {
                                                            notifyError("Bạn cần đăng nhập để thêm vào yêu thích.");
                                                            setTimeout(() => navigate("/auth/login"), 1500);
                                                        }}
                                                        onSuccessAdd={() => {
                                                            notifySuccess("Thêm sản phẩm yêu thích thành công");
                                                        }}
                                                        onSuccessRemove={() => {
                                                            notifyError("Đã xóa khỏi danh sách yêu thích");
                                                        }}
                                                        disabled={isOutOfStock}
                                                    />
                                                )}
                                                {/* Xem chi tiết */}
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleViewDetail(book._id);
                                                    }}
                                                    className="bg-white border border-purple-500 p-3 rounded-full hover:bg-purple-100 hover:scale-110 hover:shadow-lg flex items-center justify-center transition-all duration-200"
                                                    title="Xem chi tiết"
                                                >
                                                    <Icon icon="mdi:eye" width="20" height="20" color="#7c3aed" />
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>

                            {/* Link "Xem thêm" */}
                            <div className="text-center mt-10">
                                <Link
                                    to="/getbook"
                                    className="bg-black text-white font-bold text-lg py-2 px-6 inline-block text-center no-underline hover:bg-blue-600 transition-colors duration-300"
                                >
                                    Xem thêm
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            {/* Latest Blogs Section */}
            <section className="py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Bài viết mới nhất</h2>

                    {blogLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                        </div>
                    ) : blogError ? (
                        <div className="text-center py-12">
                            <p className="text-red-600 mb-4">{blogError}</p>
                            <button
                                onClick={() => window.location.reload()}
                                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                            >
                                Thử lại
                            </button>
                        </div>
                    ) : latestBlogs.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-gray-500">Chưa có bài viết nào.</p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {latestBlogs.map(blog => (
                                    <div key={blog._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
                                        <div className="p-4">
                                            <h3 className="font-semibold text-lg text-gray-900 mb-3 line-clamp-2 min-h-[48px]">
                                                {blog.title}
                                            </h3>
                                            <div className="text-gray-600 text-sm line-clamp-3 mb-4 min-h-[60px] prose prose-sm max-w-none">
                                                <div dangerouslySetInnerHTML={{ __html: truncateHtml(blog.content || blog.summary, 120) }} />
                                            </div>

                                            {/* Meta Information */}
                                            <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
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

                                            <Link
                                                to={`/blogs/${blog._id}`}
                                                className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors no-underline"
                                            >
                                                Đọc thêm
                                                <Icon icon="mdi:arrow-right" className="w-4 h-4 ml-1" />
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Link "Xem thêm" */}
                            <div className="text-center mt-10">
                                <Link
                                    to="/blogs"
                                    className="bg-blue-600 text-white font-bold text-lg py-3 px-8 rounded-lg inline-block text-center no-underline hover:bg-blue-700 transition-colors duration-300"
                                >
                                    Xem tất cả bài viết
                                </Link>
                            </div>
                        </>
                    )}
                </div>
            </section>

            <section className="py-16 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-gray-800 mb-2">Khách hàng nói gì về chúng tôi</h2>
                        <p className="text-gray-600 text-base">Những chia sẻ chân thực từ độc giả</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {featuredReviews.map((review, index) => (
                            <div key={index} className="bg-white border border-gray-100 rounded-xl shadow-sm p-6 hover:shadow-md transition duration-200">
                                {/* Company or book title as brand */}
                                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                                    {review.book?.title || "Sách yêu thích"}
                                </h4>

                                {/* Quote icon + comment */}
                                <div className="mb-4">
                                    <span className="block text-blue-500 text-5xl font-bold font-serif leading-none mb-2 select-none">“</span>
                                    <p className="text-gray-700 text-base italic">
                                        {review.comment}
                                    </p>
                                </div>

                                {/* User info */}
                                <div className="flex items-center mt-auto pt-4 border-t border-gray-100">
                                    <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex items-center justify-center text-sm font-semibold text-gray-600 mr-3">
                                        {review.user?.info?.avatar ? (
                                            <img src={review.user.info.avatar} alt="avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <span>
                                                {(review.user?.info?.fullName || review.user?.email || 'U').charAt(0).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-800">
                                            {review.user?.info?.fullName || review.user?.email?.split('@')[0] || 'Khách hàng'}
                                        </p>
                                        <p className="text-xs text-gray-500">Khách hàng thân thiết</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}

export default HomePage;
