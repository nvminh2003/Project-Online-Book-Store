import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../components/common/Icon';
import logo from '../../src/assets/sction.webp';
import sachmoi from '../../src/assets/sachmoi.jpg';
import logo1 from '../../src/assets/section.jpg';
import logo2 from '../../src/assets/logo3.webp';
const images = [logo, logo1, logo2];

const HomePage = () => {

    const [index, setIndex] = useState(0);

    // Tự động chuyển ảnh mỗi 5 giây
    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    // Dữ liệu mẫu
    const featuredBooks = [
        { id: 1, title: 'Sách Tâm Lý Học', imageUrl: 'https://bizweb.dktcdn.net/thumb/large/100/488/330/products/2-4c0bab5a-9034-4817-a5e7-857fe79fb818.png?v=1743401428910', price: '150.000đ' },
        { id: 2, title: 'Tiểu Thuyết Lịch Sử', imageUrl: 'https://binhbanbook.com/wp-content/uploads/2024/05/z5474847723128_73f4c2e7c20e91d5d233d789218024b7.jpg', price: '250.000đ' },
        { id: 3, title: 'Khoa Học Viễn Tưởng', imageUrl: 'https://baodanang.vn/dataimages/202306/original/images1702941_1.gif', price: '180.000đ' },
        { id: 4, title: 'Sách Kinh Tế', imageUrl: 'https://ims.baoyenbai.com.vn/NewsImg/10_2023/302753_23-10-cuon-sach.jpg', price: '320.000đ' },
    ];

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
                        href="/products"
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
                            <Link
                                to="/products?filter=new-arrivals"
                                className="bg-black text-white font-bold text-lg py-2 px-6 inline-block text-center no-underline hover:bg-blue-600 transition-colors duration-300"
                            >
                                Xem Thêm
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Featured Products */}
            <section className="bg-white py-16">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-3xl font-bold text-center text-gray-800 mb-10">Sách nổi bật</h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {featuredBooks.map(book => (
                            <div key={book.id} className="border rounded-lg p-4 text-center shadow-sm hover:shadow-md transition-shadow duration-300">
                                <div className="aspect-[3/4] w-full overflow-hidden mb-3">
                                    <img
                                        src={book.imageUrl}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="font-semibold text-base text-gray-900">{book.title}</h3>
                                <p className="text-sm text-gray-500 mt-1">{book.author || "Tác giả không rõ"}</p>
                                <p className="text-gray-800 font-medium mt-2">{book.price}</p>
                                <button
                                    className="mt-2 inline-flex items-center justify-center px-4 py-2 border border-yellow-600 text-yellow-600 rounded-md hover:bg-yellow-600 hover:text-white transition-colors duration-200"
                                >
                                    <svg
                                        className="w-4 h-4 mr-2"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        viewBox="0 0 24 24"
                                    >
                                        <path d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 7M7 13l-1.2 6M17 13l1.2 6M6 19a1 1 0 100 2 1 1 0 000-2zm12 0a1 1 0 100 2 1 1 0 000-2z" />
                                    </svg>
                                    Thêm vào giỏ
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Link "Xem thêm" */}
                    <div className="text-center mt-10">
                        <Link
                            to="/products"
                            className="bg-black text-white font-bold text-lg py-2 px-6 inline-block text-center no-underline hover:bg-blue-600 transition-colors duration-300"
                        >
                            Xem thêm
                        </Link>
                    </div>
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
