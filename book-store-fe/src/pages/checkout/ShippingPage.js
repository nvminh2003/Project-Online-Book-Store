// src/pages/checkout/ShippingPage.js
import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
// import { useDispatch, useSelector } from 'react-redux'; // Nếu bạn dùng Redux

import MainLayout from "../../components/layout/MainLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
// import { updateCheckoutShippingInfo } from '../../store/slices/orderSlice'; // Nếu lưu qua Redux

const ShippingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Nếu cần lấy shipping info cũ từ location.state
  const existingShippingInfo = location.state?.shippingInfo;

  const [formData, setFormData] = useState({
    fullName: existingShippingInfo?.fullName || "",
    phone: existingShippingInfo?.phone || "",
    address: existingShippingInfo?.address || "",
  });

  const [errors, setErrors] = useState({});

  // Hàm validate form
  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Vui lòng nhập họ tên người nhận.";
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^\d{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ.";
    }
    if (!formData.address.trim())
      newErrors.address = "Vui lòng nhập địa chỉ nhận hàng.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      console.log("Shipping Info:", formData);

      // Nếu dùng Redux:
      // dispatch(updateCheckoutShippingInfo(formData));

      // Điều hướng đến bước thanh toán, truyền state
      navigate("/checkout/payment", { state: { shippingInfo: formData } });
    }
  };

  return (
    // <MainLayout>
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
        Thông tin giao hàng
      </h1>
      <form
        onSubmit={handleSubmit}
        className="space-y-6 bg-white p-8 shadow-xl rounded-lg"
      >
        {/* Họ tên */}
        <div>
          <Input
            label="Họ và tên người nhận"
            type="text"
            name="fullName"
            id="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Nguyễn Văn A"
            error={errors.fullName}
            isRequired
          />
        </div>

        {/* Số điện thoại */}
        <div>
          <Input
            label="Số điện thoại"
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="09xxxxxxxx"
            error={errors.phone}
            isRequired
          />
        </div>

        {/* Địa chỉ */}
        <div>
          <label
            htmlFor="address"
            className={`block text-sm font-medium mb-1 ${
              errors.address ? "text-red-600" : "text-gray-700"
            }`}
          >
            Địa chỉ nhận hàng {errors.address && "*"}
          </label>
          <textarea
            id="address"
            name="address"
            rows="3"
            value={formData.address}
            onChange={handleChange}
            placeholder="Số nhà, tên đường, phường/xã, quận/huyện, tỉnh/thành phố"
            className={`mt-1 block w-full px-3 py-2 border ${
              errors.address ? "border-red-500" : "border-gray-300"
            } rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
            required
          />
          {errors.address && (
            <p className="mt-1 text-xs text-red-500">{errors.address}</p>
          )}
        </div>

        {/* Nút tiếp tục */}
        <Button type="submit" className="w-full !mt-8" variant="primary">
          Tiếp tục đến thanh toán
        </Button>
      </form>
    </div>
    // </MainLayout>
  );
};

export default ShippingPage;
