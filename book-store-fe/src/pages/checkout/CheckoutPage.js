import React, { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import MainLayout from "../../components/layout/MainLayout";
import Button from "../../components/common/Button";
import Spinner from "../../components/common/Spinner";
import Modal from "../../components/common/Modal";
import { useAuth } from "../../contexts/AuthContext";
import { useCart } from "../../contexts/CartContext"; // Use CartContext
import { createOrderAPI } from "../../services/orderService";
import accountService from "../../services/accountService";

const PROVINCE_API = "https://open.oapi.vn/location/provinces?page=0&size=100";
const DISTRICT_API = (provinceId) =>
  `https://open.oapi.vn/location/districts/${provinceId}?page=0&size=100`;
const WARD_API = (districtId) =>
  `https://open.oapi.vn/location/wards/${districtId}?page=0&size=100`;

const CheckoutPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    cart,
    loading: cartLoading,
    error: cartError,
    applyCoupon,
  } = useCart();

  const [loading, setLoading] = useState(true); // For profile/location fetching
  const [error, setError] = useState(null); // For profile/location errors

  const [shippingInfo, setShippingInfo] = useState({
    fullName: "",
    phone: "",
    address: "",
    city: "",
    district: "",
    ward: "",
    note: "",
  });

  const [cityOptions, setCityOptions] = useState([]);
  const [districtOptions, setDistrictOptions] = useState([]);
  const [wardOptions, setWardOptions] = useState([]);
  const [loadingLocations, setLoadingLocations] = useState({
    cities: false,
    districts: false,
    wards: false,
  });

  const [paymentMethod, setPaymentMethod] = useState("COD");
  const [couponCode, setCouponCode] = useState("");
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState({ title: "", body: "" });
  const [formErrors, setFormErrors] = useState({});

  const openModal = (title, body) => {
    setModalContent({ title, body });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const shippingFee = 30000;

  const discountAmount = useMemo(() => {
    return cart?.couponDetails?.discountAmountCalculated || 0;
  }, [cart]);

  const finalTotal = useMemo(() => {
    const subtotal = cart?.subtotal || 0;
    return Math.max(0, subtotal - discountAmount + shippingFee);
  }, [cart, discountAmount, shippingFee]);

  useEffect(() => {
    const fetchDataAndLocation = async () => {
      if (!isAuthenticated) {
        navigate("/auth/login");
        return;
      }
      try {
        setLoading(true);
        setError(null);

        const accountRes = await accountService.getProfile();
        const customerInfo = accountRes.data.data;
        const userAddress = customerInfo?.address;

        if (customerInfo) {
          setShippingInfo((prev) => ({
            ...prev,
            fullName: customerInfo.fullName || "",
            phone: customerInfo.phone || "",
            address: userAddress?.address || "",
          }));
        }

        setLoadingLocations((prev) => ({ ...prev, cities: true }));
        const provinceResponse = await fetch(PROVINCE_API);
        const provinceData = await provinceResponse.json();
        if (!provinceData || !Array.isArray(provinceData.data)) {
          throw new Error("Could not fetch provinces.");
        }
        const fetchedCityOptions = provinceData.data.map((item) => ({
          value: item.id?.toString(),
          label: item.name,
        }));
        setCityOptions(fetchedCityOptions);
        setLoadingLocations((prev) => ({ ...prev, cities: false }));

        if (userAddress?.city && fetchedCityOptions.length > 0) {
          const matchedCity = fetchedCityOptions.find(
            (c) => c.label.toLowerCase() === userAddress.city.toLowerCase()
          );

          if (matchedCity) {
            const cityId = matchedCity.value;
            setShippingInfo((prev) => ({ ...prev, city: cityId }));

            setLoadingLocations((prev) => ({ ...prev, districts: true }));
            const districtResponse = await fetch(DISTRICT_API(cityId));
            const districtData = await districtResponse.json();
            if (!districtData || !Array.isArray(districtData.data)) {
              throw new Error("Could not fetch districts.");
            }
            const fetchedDistrictOptions = districtData.data.map((item) => ({
              value: item.id?.toString(),
              label: item.name,
            }));
            setDistrictOptions(fetchedDistrictOptions);
            setLoadingLocations((prev) => ({ ...prev, districts: false }));

            if (userAddress?.district && fetchedDistrictOptions.length > 0) {
              const matchedDistrict = fetchedDistrictOptions.find(
                (d) =>
                  d.label.toLowerCase() === userAddress.district.toLowerCase()
              );

              if (matchedDistrict) {
                const districtId = matchedDistrict.value;
                setShippingInfo((prev) => ({ ...prev, district: districtId }));

                setLoadingLocations((prev) => ({ ...prev, wards: true }));
                const wardResponse = await fetch(WARD_API(districtId));
                const wardData = await wardResponse.json();
                if (!wardData || !Array.isArray(wardData.data)) {
                  throw new Error("Could not fetch wards.");
                }
                const fetchedWardOptions = wardData.data.map((item) => ({
                  value: item.id?.toString(),
                  label: item.name,
                }));
                setWardOptions(fetchedWardOptions);
                setLoadingLocations((prev) => ({ ...prev, wards: false }));

                if (userAddress?.ward && fetchedWardOptions.length > 0) {
                  const matchedWard = fetchedWardOptions.find(
                    (w) =>
                      w.label.toLowerCase() === userAddress.ward.toLowerCase()
                  );
                  if (matchedWard) {
                    setShippingInfo((prev) => ({
                      ...prev,
                      ward: matchedWard.value,
                    }));
                  }
                }
              }
            }
          }
        }
      } catch (err) {
        console.error("Checkout page error:", err);
        setError(
          err.message || "Failed to load checkout data. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    if (isAuthenticated) {
      fetchDataAndLocation();
    }
  }, [isAuthenticated, navigate]);

  const validateField = (name, value) => {
    let error = "";
    switch (name) {
      case "fullName":
        if (!value.trim()) error = "Họ và tên là bắt buộc.";
        break;
      case "phone":
        const phoneRegex = /^0[35789][0-9]{8}$/;
        if (!value.trim()) {
          error = "Số điện thoại là bắt buộc.";
        } else if (!phoneRegex.test(value)) {
          error = "Số điện thoại không hợp lệ. Ví dụ: 0912345678";
        }
        break;
      case "address":
        if (!value.trim()) error = "Địa chỉ là bắt buộc.";
        break;
      case "city":
        if (!value) error = "Vui lòng chọn Tỉnh/Thành phố.";
        break;
      case "district":
        if (!value) error = "Vui lòng chọn Quận/Huyện.";
        break;
      case "ward":
        if (!value) error = "Vui lòng chọn Phường/Xã.";
        break;
      default:
        break;
    }
    return error;
  };

  const handleShippingChange = async (e) => {
    const { name, value } = e.target;

    setShippingInfo((prev) => ({ ...prev, [name]: value }));

    const error = validateField(name, value);
    setFormErrors((prev) => ({ ...prev, [name]: error }));

    if (name === "city") {
      setShippingInfo((prev) => ({ ...prev, district: "", ward: "" }));
      setDistrictOptions([]);
      setWardOptions([]);
      if (value) {
        setLoadingLocations((prev) => ({ ...prev, districts: true }));
        try {
          const response = await fetch(DISTRICT_API(value));
          const data = await response.json();
          setDistrictOptions(
            data.data.map((item) => ({
              value: item.id?.toString(),
              label: item.name,
            }))
          );
        } catch (err) {
          setError("Failed to load districts.");
        } finally {
          setLoadingLocations((prev) => ({ ...prev, districts: false }));
        }
      }
    }

    if (name === "district") {
      setShippingInfo((prev) => ({ ...prev, ward: "" }));
      setWardOptions([]);
      if (value) {
        setLoadingLocations((prev) => ({ ...prev, wards: true }));
        try {
          const response = await fetch(WARD_API(value));
          const data = await response.json();
          setWardOptions(
            data.data.map((item) => ({
              value: item.id?.toString(),
              label: item.name,
            }))
          );
        } catch (err) {
          setError("Failed to load wards.");
        } finally {
          setLoadingLocations((prev) => ({ ...prev, wards: false }));
        }
      }
    }
  };

  const handleApplyCoupon = async () => {
    if (!couponCode) {
      openModal("Thông báo", "Vui lòng nhập mã giảm giá.");
      return;
    }
    const result = await applyCoupon(couponCode);
    if (result.success) {
      openModal("Thành công", "Áp dụng mã giảm giá thành công!");
      setCouponCode("");
    } else {
      openModal("Lỗi", result.message || "Mã giảm giá không hợp lệ.");
    }
  };

  const validateForm = () => {
    const newErrors = {};
    const fieldsToValidate = [
      "fullName",
      "phone",
      "address",
      "city",
      "district",
      "ward",
    ];
    fieldsToValidate.forEach((field) => {
      const error = validateField(field, shippingInfo[field]);
      if (error) {
        newErrors[field] = error;
      }
    });

    setFormErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm()) {
      openModal(
        "Lỗi",
        "Vui lòng điền đầy đủ và chính xác các thông tin bắt buộc."
      );
      return;
    }

    setIsPlacingOrder(true);
    try {
      const cityLabel =
        cityOptions.find((c) => c.value === shippingInfo.city)?.label || "";
      const districtLabel =
        districtOptions.find((d) => d.value === shippingInfo.district)?.label ||
        "";
      const wardLabel =
        wardOptions.find((w) => w.value === shippingInfo.ward)?.label || "";

      const fullAddress = [
        shippingInfo.address,
        wardLabel,
        districtLabel,
        cityLabel,
      ]
        .filter(Boolean)
        .join(", ");

      const orderData = {
        fullName: shippingInfo.fullName,
        phone: shippingInfo.phone,
        address: fullAddress,
        paymentMethod,
        discountCode: cart?.couponDetails?.code,
        note: shippingInfo.note,
      };
      const res = await createOrderAPI(orderData);
      if (paymentMethod === "PAYOS" && res.data.checkoutUrl) {
        window.location.href = res.data.checkoutUrl;
      } else {
        navigate(`/auth/checkout/success/${res.data.orderId}`);
      }
    } catch (err) {
      openModal(
        "Order Failed",
        err.response?.data?.message || "Failed to create order"
      );
    } finally {
      setIsPlacingOrder(false);
    }
  };

  if (loading || authLoading || cartLoading) {
    return (
      <MainLayout>
        <div className="flex justify-center items-center h-64">
          <Spinner />
        </div>
      </MainLayout>
    );
  }

  if (error || cartError) {
    return (
      <MainLayout>
        <div className="text-center text-red-500">{error || cartError}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="container mx-auto mt-10 p-4 md:p-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Thanh toán</h1>
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
            <strong className="font-bold">Lỗi!</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        )}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <h2 className="text-xl font-semibold mb-4">Thông tin mua hàng</h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              {/* Shipping Info Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="fullName"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Họ và tên <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={shippingInfo.fullName}
                    onChange={handleShippingChange}
                    placeholder="Họ và tên"
                    className={`p-2 border rounded w-full ${
                      formErrors.fullName ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.fullName && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.fullName}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Số điện thoại <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="phone"
                    name="phone"
                    value={shippingInfo.phone}
                    onChange={handleShippingChange}
                    placeholder="Số điện thoại"
                    className={`p-2 border rounded w-full ${
                      formErrors.phone ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.phone && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.phone}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="address"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Địa chỉ (số nhà, tên đường){" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={shippingInfo.address}
                    onChange={handleShippingChange}
                    placeholder="Địa chỉ (số nhà, tên đường)"
                    className={`p-2 border rounded w-full ${
                      formErrors.address ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {formErrors.address && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.address}
                    </p>
                  )}
                </div>

                {/* City Dropdown */}
                <div>
                  <label
                    htmlFor="city"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Tỉnh/Thành phố <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="city"
                    name="city"
                    value={shippingInfo.city}
                    onChange={handleShippingChange}
                    className={`p-2 border rounded w-full ${
                      formErrors.city ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loadingLocations.cities}
                  >
                    <option value="">
                      {loadingLocations.cities
                        ? "Đang tải..."
                        : "-- Chọn Tỉnh/Thành phố --"}
                    </option>
                    {cityOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.city && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.city}
                    </p>
                  )}
                </div>

                {/* District Dropdown */}
                <div>
                  <label
                    htmlFor="district"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Quận/Huyện <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="district"
                    name="district"
                    value={shippingInfo.district}
                    onChange={handleShippingChange}
                    className={`p-2 border rounded w-full ${
                      formErrors.district ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loadingLocations.districts || !shippingInfo.city}
                  >
                    <option value="">
                      {loadingLocations.districts
                        ? "Đang tải..."
                        : "-- Chọn Quận/Huyện --"}
                    </option>
                    {districtOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.district && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.district}
                    </p>
                  )}
                </div>

                {/* Ward Dropdown */}
                <div>
                  <label
                    htmlFor="ward"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phường/Xã <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="ward"
                    name="ward"
                    value={shippingInfo.ward}
                    onChange={handleShippingChange}
                    className={`p-2 border rounded w-full ${
                      formErrors.ward ? "border-red-500" : "border-gray-300"
                    }`}
                    disabled={loadingLocations.wards || !shippingInfo.district}
                  >
                    <option value="">
                      {loadingLocations.wards
                        ? "Đang tải..."
                        : "-- Chọn Phường/Xã --"}
                    </option>
                    {wardOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {formErrors.ward && (
                    <p className="text-red-500 text-xs mt-1">
                      {formErrors.ward}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <label
                    htmlFor="note"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Ghi chú
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    value={shippingInfo.note}
                    onChange={handleShippingChange}
                    placeholder="Ghi chú (tùy chọn)"
                    className="p-2 border rounded w-full border-gray-300"
                  ></textarea>
                </div>
              </div>
            </div>

            <h2 className="text-xl font-semibold mb-4 mt-8">
              Phương thức thanh toán
            </h2>
            <div className="bg-white p-6 rounded-lg shadow-md">
              <div className="space-y-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Thanh toán khi giao hàng (COD)
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYOS"
                    checked={paymentMethod === "PAYOS"}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-2"
                  />
                  Thanh toán qua PayOS
                </label>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md">
              <h2 className="text-xl font-semibold mb-4">
                Đơn hàng ({cart?.items?.length || 0} sản phẩm)
              </h2>
              <div className="space-y-4">
                {cart?.items?.map((item) => (
                  <div
                    key={item.book._id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      <img
                        src={item.book.images[0]}
                        alt={item.book.title}
                        className="w-16 h-16 object-cover rounded mr-4"
                      />
                      <div>
                        <p className="font-semibold">{item.book.title}</p>
                        <p className="text-sm text-gray-600">
                          Số lượng: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <p>
                      {(
                        (item.book.sellingPrice || 0) * (item.quantity || 0)
                      ).toLocaleString()}
                      đ
                    </p>
                  </div>
                ))}
              </div>
              <hr className="my-4" />
              <div className="flex justify-between">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                  placeholder="Nhập mã giảm giá"
                  className="p-2 border rounded w-full mr-2"
                />
                <Button onClick={handleApplyCoupon}>Áp dụng</Button>
              </div>
              <hr className="my-4" />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <p>Tạm tính</p>
                  <p>{(cart?.subtotal || 0).toLocaleString()}đ</p>
                </div>
                <div className="flex justify-between">
                  <p>Phí vận chuyển</p>
                  <p>{shippingFee.toLocaleString()}đ</p>
                </div>
                {cart?.couponDetails && (
                  <div className="flex justify-between text-green-600">
                    <p>Giảm giá ({cart.couponDetails.code})</p>
                    <p>-{discountAmount.toLocaleString()}đ</p>
                  </div>
                )}
                <div className="flex justify-between font-bold text-xl">
                  <p>Tổng cộng</p>
                  <p>{finalTotal.toLocaleString()}đ</p>
                </div>
              </div>
              <Button
                onClick={handlePlaceOrder}
                disabled={isPlacingOrder || !cart?.items?.length}
                className="w-full mt-6"
              >
                {isPlacingOrder ? <Spinner /> : "ĐẶT HÀNG"}
              </Button>
            </div>
          </div>
        </div>
      </div>
      <Modal
        isOpen={isModalOpen}
        onClose={closeModal}
        title={modalContent.title}
        footerContent={<Button onClick={closeModal}>Close</Button>}
      >
        <p>{modalContent.body}</p>
      </Modal>
    </MainLayout>
  );
};

export default CheckoutPage;
