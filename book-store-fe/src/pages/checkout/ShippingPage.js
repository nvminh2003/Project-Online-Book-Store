import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Input from "../../components/common/Input";
import Button from "../../components/common/Button";
import Select from "../../components/common/Select";

const PROVINCE_API =
  "https://open.oapi.vn/location/provinces?page=0&size=100&query=";
const DISTRICT_API = (provinceId) =>
  `https://open.oapi.vn/location/districts/${provinceId}?page=0&size=100&query=`;
const WARD_API = (districtId) =>
  `https://open.oapi.vn/location/wards/${districtId}?page=0&size=100&query=`;

const ShippingPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const existingShippingInfo = location.state?.shippingInfo;

  const [formData, setFormData] = useState({
    fullName: existingShippingInfo?.fullName || "",
    phone: existingShippingInfo?.phone || "",
    houseName: existingShippingInfo?.houseName || "",
    city: existingShippingInfo?.city || "",
    district: existingShippingInfo?.district || "",
    ward: existingShippingInfo?.ward || "",
  });

  const [errors, setErrors] = useState({});
  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);
  const [loadingWards, setLoadingWards] = useState(false);
  const [apiError, setApiError] = useState("");

  // Fetch all provinces on mount
  useEffect(() => {
    setLoadingCities(true);
    fetch(PROVINCE_API)
      .then((res) => res.json())
      .then((data) => {
        if (data && Array.isArray(data.data)) {
          setCityOptions(
            data.data.map((item) => ({
              value: item.id?.toString(),
              label: item.name,
            }))
          );
        } else {
          setApiError("Không thể tải danh sách tỉnh/thành phố.");
        }
      })
      .catch(() => setApiError("Không thể kết nối đến máy chủ địa chỉ."))
      .finally(() => setLoadingCities(false));
  }, []);

  // Fetch all districts for selected province
  useEffect(() => {
    if (formData.city) {
      setLoadingDistricts(true);
      fetch(DISTRICT_API(formData.city))
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            setDistrictOptions(
              data.data.map((item) => ({
                value: item.id?.toString(),
                label: item.name,
              }))
            );
          } else {
            setDistrictOptions([]);
            setApiError("Không thể tải danh sách quận/huyện.");
          }
        })
        .catch(() => {
          setDistrictOptions([]);
          setApiError("Không thể kết nối đến máy chủ địa chỉ.");
        })
        .finally(() => setLoadingDistricts(false));
    } else {
      setDistrictOptions([]);
    }
  }, [formData.city]);

  // Fetch all wards for selected district
  useEffect(() => {
    if (formData.district) {
      setLoadingWards(true);
      fetch(WARD_API(formData.district))
        .then((res) => res.json())
        .then((data) => {
          if (data && Array.isArray(data.data)) {
            setWardOptions(
              data.data.map((item) => ({
                value: item.id?.toString(),
                label: item.name,
              }))
            );
          } else {
            setWardOptions([]);
            setApiError("Không thể tải danh sách phường/xã.");
          }
        })
        .catch(() => {
          setWardOptions([]);
          setApiError("Không thể kết nối đến máy chủ địa chỉ.");
        })
        .finally(() => setLoadingWards(false));
    } else {
      setWardOptions([]);
    }
  }, [formData.district]);

  const validate = () => {
    const newErrors = {};
    if (!formData.fullName.trim())
      newErrors.fullName = "Vui lòng nhập họ tên người nhận.";
    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại.";
    } else if (!/^\d{10,11}$/.test(formData.phone.trim())) {
      newErrors.phone = "Số điện thoại không hợp lệ.";
    }
    if (!formData.houseName.trim())
      newErrors.houseName = "Vui lòng nhập số nhà và tên đường.";
    if (!formData.city) newErrors.city = "Vui lòng chọn thành phố/tỉnh.";
    if (!formData.district) newErrors.district = "Vui lòng chọn quận/huyện.";
    if (!formData.ward) newErrors.ward = "Vui lòng chọn phường/xã.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    if (errors[e.target.name]) {
      setErrors({ ...errors, [e.target.name]: null });
    }
  };

  const handleSelectChange = (name, value) => {
    if (name === "city") {
      setFormData({ ...formData, city: value, district: "", ward: "" });
    } else if (name === "district") {
      setFormData({ ...formData, district: value, ward: "" });
    } else {
      setFormData({ ...formData, [name]: value });
    }
    if (errors[name]) {
      setErrors({ ...errors, [name]: null });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      // Get city, district, and ward labels
      const cityLabel =
        cityOptions.find((c) => c.value === formData.city)?.label ||
        formData.city;
      const districtLabel =
        districtOptions.find((d) => d.value === formData.district)?.label ||
        formData.district;
      const wardLabel =
        wardOptions.find((w) => w.value === formData.ward)?.label ||
        formData.ward;
      const address = [formData.houseName, wardLabel, districtLabel, cityLabel]
        .filter(Boolean)
        .join(", ");
      const shippingInfo = {
        ...formData,
        cityLabel,
        districtLabel,
        wardLabel,
        address,
      };
      navigate("/auth/checkout/payment", { state: { shippingInfo } });
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      <h1 className="text-3xl font-bold mb-8 text-center text-gray-800">
        Thông tin giao hàng
      </h1>
      <div className="bg-white p-8 rounded-xl shadow-lg space-y-6">
        {apiError && (
          <div className="text-red-600 text-center font-semibold">
            {apiError}
          </div>
        )}
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
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
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
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Số nhà và tên đường */}
        <div>
          <Input
            label="Số nhà và tên đường"
            type="text"
            name="houseName"
            id="houseName"
            value={formData.houseName}
            onChange={handleChange}
            placeholder="123 Đường ABC"
            error={errors.houseName}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
          />
        </div>

        {/* Thành phố/Tỉnh */}
        <div>
          <Select
            label="Thành phố/Tỉnh"
            name="city"
            id="city"
            value={formData.city}
            onChange={(e) => handleSelectChange("city", e.target.value)}
            options={[
              { value: "", label: "-- Chọn thành phố/tỉnh --" },
              ...cityOptions,
            ]}
            error={errors.city}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={loadingCities}
          />
        </div>

        {/* Quận/Huyện */}
        <div>
          <Select
            label="Quận/Huyện"
            name="district"
            id="district"
            value={formData.district}
            onChange={(e) => handleSelectChange("district", e.target.value)}
            options={[
              { value: "", label: "-- Chọn quận/huyện --" },
              ...districtOptions,
            ]}
            error={errors.district}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={loadingDistricts || !formData.city}
          />
        </div>

        {/* Phường/Xã */}
        <div>
          <Select
            label="Phường/Xã"
            name="ward"
            id="ward"
            value={formData.ward || ""}
            onChange={(e) => handleSelectChange("ward", e.target.value)}
            options={[
              { value: "", label: "-- Chọn phường/xã --" },
              ...wardOptions,
            ]}
            error={errors.ward}
            isRequired
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            disabled={loadingWards || !formData.district}
          />
        </div>

        {/* Nút tiếp tục */}
        <Button
          type="submit"
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
        >
          Tiếp tục đến thanh toán
        </Button>
      </div>
    </div>
  );
};

export default ShippingPage;
