import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Icon from '../components/common/Icon';
import productService from '../services/bookService';
import axios from 'axios';
import logo from '../../src/assets/sction.webp';
import sachmoi from '../../src/assets/sachmoi.jpg';
import logo1 from '../../src/assets/section.jpg';
import logo2 from '../../src/assets/logo3.webp';
const images = [logo, logo1, logo2];

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:9999/api';

const HomePage = () => {

    const [index, setIndex] = useState(0);
    const [featuredBooks, setFeaturedBooks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [toastMsg, setToastMsg] = useState("");
    const [toastType, setToastType] = useState("success");

    const navigate = useNavigate();

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

    // Event handlers for action buttons
    const handleAddToCart = async (bookId) => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setToastMsg("Bạn cần đăng nhập để thêm sản phẩm vào giỏ hàng.");
            setToastType("error");
            setTimeout(() => navigate("/auth/login"), 1500);
            return;
        }
        const payload = {
            bookId,
            quantity: 1,
        };
        try {
            const response = await axios.post(
                `${API_URL}/cart/add`,
                payload,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            if (response.data?.status === "Success") {
                setToastMsg("Đã thêm vào giỏ hàng thành công!");
                setToastType("success");
                setTimeout(() => setToastMsg(""), 1500);
            } else {
                setToastMsg(response.data.message || "Có lỗi xảy ra khi thêm vào giỏ hàng.");
                setToastType("error");
                setTimeout(() => setToastMsg(""), 1500);
            }
        } catch (err) {
            console.error("Add to cart error:", err.response?.data || err.message);
            setToastMsg(err.response?.data?.message || "Không thể thêm vào giỏ hàng.");
            setToastType("error");
            setTimeout(() => setToastMsg(""), 1500);
        }
    };

    const handleAddToWishlist = async (bookId) => {
        const token = localStorage.getItem("accessToken");
        if (!token) {
            setToastMsg("Bạn cần đăng nhập để thêm vào yêu thích.");
            setToastType("error");
            setTimeout(() => navigate("/auth/login"), 1500);
            return;
        }
        try {
            await axios.post(`${API_URL}/wishlist/add`, { bookId }, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setToastMsg("Đã thêm vào mục yêu thích!");
            setToastType("success");
            setTimeout(() => setToastMsg(""), 1500);
        } catch (err) {
            console.error("Wishlist error:", err.response?.data || err.message);
            setToastMsg(err.response?.data?.message || "Không thể thêm vào yêu thích.");
            setToastType("error");
            setTimeout(() => setToastMsg(""), 1500);
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

    const testimonials = [
        { quote: 'Trang web có rất nhiều sách hay và hiếm. Giao hàng cũng rất nhanh. Tôi rất hài lòng!', author: 'Nguyễn Văn A' },
        { quote: 'Nhờ có những cuốn sách ở đây, tôi đã học hỏi được nhiều điều và phát triển bản thân. Cảm ơn!', author: 'Trần Thị B' },
    ];

    // Format price function
    const formatPrice = (price) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND'
        }).format(price);
    };

    return (
        <div className="bg-white">
            {/* Toast Notification */}
            {toastMsg && (
                <div className={`fixed top-4 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-lg shadow-lg animate-fade-in text-center text-base font-medium ${toastType === "success" ? "bg-green-100 border border-green-400 text-green-700" : "bg-red-100 border border-red-400 text-red-700"}`}>
                    {toastMsg}
                </div>
            )}

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
                            <h3 className="text-xl font-semibold text-blue-600 uppercase">Sách Mới Về</h3>
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
                                {featuredBooks.map(book => (
                                    <div key={book._id} className="border rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                                        <div className="aspect-[3/4] w-full overflow-hidden mb-3">
                                            <img
                                                src={book.images && book.images.length > 0 ? book.images[0] : 'https://via.placeholder.com/300x400?text=No+Image'}
                                                alt={book.title}
                                                className="w-full h-full object-cover rounded-md cursor-pointer transition-transform duration-200 hover:scale-105"
                                                onClick={() => handleViewDetail(book._id)}
                                            />
                                        </div>
                                        <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 min-h-[40px]">{book.title}</h3>
                                        <p className="text-sm text-gray-500 italic">{book.authors ? book.authors.join(', ') : "Tác giả không rõ"}</p>
                                        {/* <p className="text-gray-800 font-medium mt-2">{formatPrice(book.sellingPrice)}</p> */}
                                        <div className="mb-3">
                                            {book.originalPrice && book.originalPrice > book.sellingPrice && (
                                                <span className="text-sm text-gray-400 line-through mr-1">
                                                    {formatPrice(book.originalPrice)}
                                                </span>
                                            )}
                                            <span className="text-lg font-bold text-red-600">{formatPrice(book.sellingPrice)}</span>
                                        </div>

                                        {/* Action buttons */}
                                        <div className="flex flex-row gap-3 mt-auto w-full justify-center items-end">
                                            {/* Thêm vào giỏ */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToCart(book._id);
                                                }}
                                                className="bg-white border border-blue-500 p-3 rounded-full hover:bg-blue-100 hover:scale-110 hover:shadow-lg flex items-center justify-center transition-all duration-200"
                                                title="Thêm vào giỏ hàng"
                                            >
                                                <Icon icon="mdi:cart" width="20" height="20" color="#2563eb" />
                                            </button>

                                            {/* Yêu thích */}
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleAddToWishlist(book._id);
                                                }}
                                                className="bg-white border border-red-500 p-3 rounded-full hover:bg-red-100 hover:scale-110 hover:shadow-lg flex items-center justify-center transition-all duration-200"
                                                title="Yêu thích"
                                            >
                                                <Icon icon="mdi:heart" width="20" height="20" color="#dc2626" />
                                            </button>

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
                                ))}
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

            {/* Testimonials Section */}
            <section className="py-16">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-800 mb-12">Độc giả nói gì về chúng tôi</h2>
                    <div className="space-y-10">
                        {testimonials.map((item, index) => (
                            <blockquote key={index} className="p-6 bg-gray-50 rounded-lg">
                                <p className="text-lg text-gray-700 italic">"{item.quote}"</p>
                                <footer className="mt-4 font-semibold text-gray-600">- {item.author}</footer>
                            </blockquote>
                        ))}
                    </div>
                </div>
            </section>

        </div>
    );
}

export default HomePage;
