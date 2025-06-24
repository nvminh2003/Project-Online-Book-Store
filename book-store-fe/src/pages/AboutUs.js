import React from 'react';
import Icon from '../components/common/Icon';

const AboutUs = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Về Chúng Tôi</h1>
                    <p className="text-lg text-gray-600">Tìm hiểu thêm về công ty MKMN Books</p>
                </div>

                {/* Company Information Card */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex items-center mb-6">
                        <Icon icon="mdi:information" className="w-8 h-8 text-blue-600 mr-3" />
                        <h2 className="text-2xl font-semibold text-gray-900">Thông tin MKMN</h2>
                    </div>

                    <div className="space-y-6">
                        {/* Company Name */}
                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Tên Công Ty</h3>
                            <p className="text-gray-700">Công ty cổ phần Sách MKMN</p>
                            <p className="text-gray-600 italic">(MKMN BOOKS JOINT STOCK COMPANY)</p>
                        </div>

                        {/* Address */}
                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Trụ Sở</h3>
                            <div className="flex items-start">
                                <Icon icon="mdi:map-marker" className="w-5 h-5 text-red-500 mr-2 mt-0.5" />
                                <p className="text-gray-700">12 Hàng Than - phường Nguyễn Trung Trực - quận Ba Đình - Hà Nội</p>
                            </div>
                        </div>

                        {/* Business License */}
                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Giấy Chứng Nhận Kinh Doanh</h3>
                            <div className="flex items-center">
                                <Icon icon="mdi:file-certificate" className="w-5 h-5 text-green-500 mr-2" />
                                <p className="text-gray-700 mb-0">5672 / XN-STTTT</p>
                            </div>
                        </div>

                        {/* Establishment Date */}
                        <div className="border-b border-gray-200 pb-4">
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Quyết Định Thành Lập</h3>
                            <div className="flex items-center">
                                <Icon icon="mdi:calendar" className="w-5 h-5 text-blue-500 mr-2" />
                                <p className="text-gray-700 mb-0">09/03/2015 - Sở Kế hoạch Đầu tư Thành phố Hà Nội</p>
                            </div>
                        </div>

                        {/* Tax Code */}
                        <div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">Mã Số Thuế</h3>
                            <div className="flex items-center">
                                <Icon icon="mdi:numeric" className="w-5 h-5 text-purple-500 mr-2" />
                                <p className="text-gray-700 mb-0 font-mono">0106785238</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mission & Vision */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                    {/* Mission */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <Icon icon="mdi:target" className="w-6 h-6 text-red-500 mr-2" />
                            <h3 className="text-xl font-semibold text-gray-900">Sứ Mệnh</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Chúng tôi cam kết mang đến những cuốn sách chất lượng cao, đa dạng về thể loại và phù hợp với mọi lứa tuổi.
                            Mục tiêu của chúng tôi là lan tỏa văn hóa đọc và kiến thức đến mọi người.
                        </p>
                    </div>

                    {/* Vision */}
                    <div className="bg-white rounded-lg shadow-lg p-6">
                        <div className="flex items-center mb-4">
                            <Icon icon="mdi:eye" className="w-6 h-6 text-blue-500 mr-2" />
                            <h3 className="text-xl font-semibold text-gray-900">Tầm Nhìn</h3>
                        </div>
                        <p className="text-gray-700 leading-relaxed">
                            Trở thành một trong những nhà sách hàng đầu tại Việt Nam, được tin tưởng và yêu mến bởi độc giả
                            trong và ngoài nước, góp phần phát triển văn hóa đọc sách.
                        </p>
                    </div>
                </div>

                {/* Values */}
                <div className="bg-white rounded-lg shadow-lg p-8">
                    <h3 className="text-2xl font-semibold text-gray-900 mb-6 text-center">Giá Trị Cốt Lõi</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="bg-blue-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:heart" className="w-8 h-8 text-blue-600" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Chất Lượng</h4>
                            <p className="text-gray-600">Cam kết cung cấp sách chất lượng cao, đảm bảo nội dung chính xác và hữu ích</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-green-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:handshake" className="w-8 h-8 text-green-600" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Uy Tín</h4>
                            <p className="text-gray-600">Xây dựng niềm tin với khách hàng thông qua dịch vụ tốt và sự minh bạch</p>
                        </div>
                        <div className="text-center">
                            <div className="bg-purple-100 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                                <Icon icon="mdi:lightbulb" className="w-8 h-8 text-purple-600" />
                            </div>
                            <h4 className="text-lg font-medium text-gray-900 mb-2">Sáng Tạo</h4>
                            <p className="text-gray-600">Không ngừng đổi mới và cải tiến để mang đến trải nghiệm tốt nhất</p>
                        </div>
                    </div>
                </div>

                {/* Contact Info */}
                <div className="bg-blue-50 rounded-lg p-6 mt-8">
                    <h3 className="text-xl font-semibold text-gray-900 mb-4 text-center">Liên Hệ</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-center">
                        <div className="flex items-center justify-center">
                            <Icon icon="mdi:phone" className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-gray-700">Hotline: 097 4148 047</span>
                        </div>
                        <div className="flex items-center justify-center">
                            <Icon icon="mdi:email" className="w-5 h-5 text-blue-600 mr-2" />
                            <span className="text-gray-700">Email: bookstore@gmail.com</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutUs; 