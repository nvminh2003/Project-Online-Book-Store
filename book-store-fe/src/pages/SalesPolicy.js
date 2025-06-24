import React from 'react';
import Icon from '../components/common/Icon';

const SalesPolicy = () => {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-4">
                        CHÍNH SÁCH BÁN HÀNG VÀ ĐỔI TRẢ
                    </h1>
                    <div className="w-24 h-1 bg-blue-600 mx-auto"></div>
                </div>

                {/* Content */}
                <div className="bg-white rounded-lg shadow-md p-8 space-y-8">
                    {/* Section I */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                                I
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                CHÍNH SÁCH BÁN VÀ VẬN CHUYỂN
                            </h2>
                        </div>
                        <div className="ml-11 space-y-3">
                            <div className="flex items-start">
                                <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    Các đơn hàng sẽ được MKMN xác nhận trong thời gian tối đa <strong>03 ngày</strong> kể từ khi tạo đơn.
                                </p>
                            </div>
                            <div className="flex items-start">
                                <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    Các đơn hàng đã thanh toán hoặc thanh toán khi nhận hàng sẽ được MKMN gửi đi sau tối đa <strong>03 ngày làm việc</strong> từ Kho MKMN Hà Nội, qua các đơn vị chuyển phát. Tùy theo địa điểm giao hàng, sách sẽ được gửi tới khách hàng trong không quá <strong>02 tuần</strong>.
                                </p>
                            </div>
                            <div className="flex items-start">
                                <Icon icon="mdi:check-circle" className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    Các trường hợp chậm trễ phát sinh do vận chuyển, MKMN sẽ thông báo cho khách hàng qua email, mạng xã hội hoặc điện thoại.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section II */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                                II
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                CHÍNH SÁCH BẢO HÀNH ĐỔI TRẢ
                            </h2>
                        </div>
                        <div className="ml-11 space-y-3">
                            <div className="flex items-start">
                                <Icon icon="mdi:shield-check" className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    Với các sách mua trực tiếp từ MKMN gặp lỗi in ấn hoặc hư hỏng do vận chuyển, sẽ được MKMN đổi trả miễn phí.
                                </p>
                            </div>
                            <div className="flex items-start">
                                <Icon icon="mdi:clock-outline" className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    <strong>Thời gian thực hiện đổi trả:</strong> Trong vòng <strong>01 tháng</strong> kể từ khi MKMN tiếp nhận yêu cầu đổi trả.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section III */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                                III
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                CHÍNH SÁCH BẢO MẬT THÔNG TIN KHÁCH HÀNG
                            </h2>
                        </div>
                        <div className="ml-11 space-y-3">
                            <div className="flex items-start">
                                <Icon icon="mdi:lock" className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    Các thông tin cá nhân của khách hàng sẽ được MKMN bảo mật tuyệt đối, không cung cấp cho bất kỳ đơn vị thứ 3 nào.
                                </p>
                            </div>
                            <div className="flex items-start">
                                <Icon icon="mdi:account-check" className="w-5 h-5 text-blue-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    MKMN sẽ chỉ sử dụng các thông tin này để hỗ trợ khách hàng trong việc đặt sách và vận chuyển.
                                </p>
                            </div>
                            <div className="flex items-start">
                                <Icon icon="mdi:email-off" className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    MKMN sẽ không sử dụng thông tin của khách hàng với mục đích quảng cáo, thương mại nếu khách hàng không cho phép.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Section IV */}
                    <div>
                        <div className="flex items-center mb-4">
                            <div className="bg-blue-600 text-white rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm mr-3">
                                IV
                            </div>
                            <h2 className="text-xl font-semibold text-gray-900">
                                CHÍNH SÁCH THANH TOÁN
                            </h2>
                        </div>
                        <div className="ml-11">
                            <div className="flex items-start">
                                <Icon icon="mdi:alert-circle" className="w-5 h-5 text-orange-600 mr-3 mt-0.5 flex-shrink-0" />
                                <p className="text-gray-700">
                                    Với các đơn hàng giảm giá, sale dọn kho giá trị lớn (trên <strong>1 triệu</strong>) mong bác bạn vui lòng thanh toán trước giúp MKMN.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default SalesPolicy; 