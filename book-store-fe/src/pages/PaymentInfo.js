import React from 'react';
import Icon from '../components/common/Icon';

const PaymentInfo = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-12">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">Thông Tin Thanh Toán</h1>
                    <p className="text-lg text-gray-600">Hướng dẫn các phương thức thanh toán</p>
                </div>

                {/* Bank Transfer Information */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex items-center mb-6">
                        <Icon icon="mdi:bank" className="w-8 h-8 text-green-600 mr-3" />
                        <h2 className="text-2xl font-semibold text-gray-900">Chuyển Khoản Ngân Hàng</h2>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                        <p className="text-green-800 font-medium mb-4">
                            Bạn có thể chuyển khoản vào tài khoản dưới đây:
                        </p>

                        <div className="space-y-4">
                            {/* Account Holder */}
                            <div className="flex items-center">
                                <Icon icon="mdi:account" className="w-5 h-5 text-green-600 mr-3" />
                                <div>
                                    <span className="font-medium text-gray-900">Chủ tài khoản:</span>
                                    <span className="ml-2 text-gray-700">Nguyễn Văn Minh</span>
                                </div>
                            </div>

                            {/* Bank Information */}
                            <div className="flex items-start">
                                <Icon icon="mdi:bank" className="w-5 h-5 text-green-600 mr-3 mt-0.5" />
                                <div>
                                    <span className="font-medium text-gray-900">Ngân hàng:</span>
                                    <span className="ml-2 text-gray-700">MB Bank</span>
                                </div>
                            </div>

                            {/* Account Number */}
                            <div className="flex items-center">
                                <Icon icon="mdi:credit-card" className="w-5 h-5 text-green-600 mr-3" />
                                <div>
                                    <span className="font-medium text-gray-900">Số tài khoản:</span>
                                    <span className="ml-2 text-gray-700 font-mono text-lg">0968960084</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Contact Information */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex items-center mb-6">
                        <Icon icon="mdi:phone" className="w-8 h-8 text-blue-600 mr-3" />
                        <h2 className="text-2xl font-semibold text-gray-900">Thông Tin Liên Hệ</h2>
                    </div>

                    <p className="text-gray-700 mb-6">
                        Mọi thông tin xin liên hệ:
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Email */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <Icon icon="mdi:email" className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="font-medium text-gray-900">Email</span>
                            </div>
                            bookstore@gmail.com
                        </div>

                        {/* Phone Numbers */}
                        <div className="bg-blue-50 rounded-lg p-4">
                            <div className="flex items-center mb-2">
                                <Icon icon="mdi:phone" className="w-5 h-5 text-blue-600 mr-2" />
                                <span className="font-medium text-gray-900">Điện thoại</span>
                            </div>
                            <div className="space-y-1">
                                077 7720 254 {" - "}
                                097 4148 047
                            </div>
                        </div>
                    </div>
                </div>

                {/* Payment Instructions */}
                <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
                    <div className="flex items-center mb-6">
                        <Icon icon="mdi:information" className="w-8 h-8 text-orange-600 mr-3" />
                        <h2 className="text-2xl font-semibold text-gray-900">Hướng Dẫn Thanh Toán</h2>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-start">
                            <div className="bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-orange-600 font-bold text-sm">1</span>
                            </div>
                            <p className="text-gray-700">Sao chép số tài khoản ngân hàng MB Bank: <strong>0968960084</strong></p>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-orange-600 font-bold text-sm">2</span>
                            </div>
                            <p className="text-gray-700">Thực hiện chuyển khoản với nội dung: <strong>"Tên khách hàng - Mã đơn hàng"</strong></p>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-orange-600 font-bold text-sm">3</span>
                            </div>
                            <p className="text-gray-700">Gửi biên lai chuyển khoản qua email hoặc gọi điện thoại để xác nhận</p>
                        </div>

                        <div className="flex items-start">
                            <div className="bg-orange-100 rounded-full w-6 h-6 flex items-center justify-center mr-3 mt-0.5">
                                <span className="text-orange-600 font-bold text-sm">4</span>
                            </div>
                            <p className="text-gray-700">Chúng tôi sẽ xác nhận và xử lý đơn hàng trong thời gian sớm nhất</p>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                    <div className="flex items-start">
                        <Icon icon="mdi:alert-circle" className="w-6 h-6 text-yellow-600 mr-3 mt-0.5" />
                        <div>
                            <h3 className="text-lg font-semibold text-yellow-800 mb-2">Lưu Ý Quan Trọng</h3>
                            <ul className="text-yellow-700 space-y-1">
                                <li>• Vui lòng kiểm tra kỹ thông tin tài khoản trước khi chuyển khoản</li>
                                <li>• Đảm bảo nội dung chuyển khoản chính xác để tránh nhầm lẫn</li>
                                <li>• Thời gian xử lý: 1-2 giờ làm việc sau khi nhận được xác nhận</li>
                                <li>• Mọi thắc mắc vui lòng liên hệ trực tiếp qua điện thoại hoặc email</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentInfo; 