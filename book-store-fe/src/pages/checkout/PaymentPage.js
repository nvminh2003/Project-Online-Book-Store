// import React, { useState, useEffect } from "react";
// import { useLocation, useNavigate } from "react-router-dom";
// import MainLayout from "../../components/layout/MainLayout";
// import Button from "../../components/common/Button";
// import Spinner from "../../components/common/Spinner";
// import { useAuth } from "../../contexts/AuthContext";

// const PaymentPage = () => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const { isAuthenticated, loading: authLoading } = useAuth();

//   const shippingInfo = location.state?.shippingInfo;
//   const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("");
//   const [pageLoading, setPageLoading] = useState(true);
//   const [error, setError] = useState("");

//   useEffect(() => {
//     if (!authLoading) {
//       if (!isAuthenticated) {
//         alert("Vui lòng đăng nhập để tiếp tục thanh toán.");
//         navigate("/auth/login", { state: { from: location }, replace: true });
//       } else if (!shippingInfo) {
//         console.warn(
//           "PaymentPage: Missing shippingInfo, redirecting to shipping page."
//         );
//         alert("Vui lòng hoàn tất thông tin giao hàng trước.");
//         navigate("/auth/checkout/shipping", { replace: true });
//       } else {
//         setPageLoading(false);
//       }
//     }
//   }, [isAuthenticated, authLoading, shippingInfo, navigate, location]);

//   const paymentMethods = [
//     { id: "PAYOS", name: "Thanh toán qua PayOS (VietQR)" },
//   ];

//   const handlePaymentMethodChange = (event) => {
//     setSelectedPaymentMethod(event.target.value);
//     setError("");
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!selectedPaymentMethod) {
//       setError("Vui lòng chọn một phương thức thanh toán.");
//       return;
//     }
//     setError("");
//     // Only navigate to review page, do not call any payment API here
//     navigate("/auth/checkout/review", {
//       state: {
//         shippingInfo: shippingInfo,
//         paymentMethodInfo: { paymentMethod: selectedPaymentMethod },
//       },
//     });
//   };

//   if (authLoading || pageLoading) {
//     return (
//       <div className="container mx-auto px-4 py-12 text-center">
//         <Spinner />
//         <p className="mt-4 text-lg text-gray-600">Đang tải...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto px-4 py-8 max-w-xl">
//       <h1 className="text-3xl font-semibold mb-8 text-center text-gray-800">
//         Chọn phương thức thanh toán
//       </h1>

//       <div className="mb-8 p-4 bg-gray-50 rounded-lg border border-gray-200">
//         <h3 className="text-lg font-medium text-gray-700 mb-2">
//           Thông tin giao hàng đã nhập:
//         </h3>
//         <p className="text-sm text-gray-600">
//           <strong>Người nhận:</strong> {shippingInfo?.fullName}
//         </p>
//         <p className="text-sm text-gray-600">
//           <strong>Điện thoại:</strong> {shippingInfo?.phone}
//         </p>
//         <p className="text-sm text-gray-600">
//           <strong>Địa chỉ:</strong>{" "}
//           {[
//             shippingInfo?.houseName,
//             shippingInfo?.districtLabel,
//             shippingInfo?.cityLabel,
//           ]
//             .filter(Boolean)
//             .join(", ")}
//         </p>
//         <Button
//           variant="link"
//           size="sm"
//           onClick={() =>
//             navigate("/auth/checkout/shipping", { state: { shippingInfo } })
//           }
//           className="text-blue-600 hover:text-blue-800 mt-2 text-sm"
//         >
//           Thay đổi địa chỉ
//         </Button>
//       </div>

//       <form
//         onSubmit={handleSubmit}
//         className="space-y-6 bg-white p-6 md:p-8 shadow-xl rounded-lg"
//       >
//         <fieldset>
//           <legend className="text-xl font-semibold text-gray-800 mb-4">
//             Chọn phương thức:
//           </legend>
//           <div className="space-y-3">
//             {paymentMethods.map((method) => (
//               <label
//                 key={method.id}
//                 htmlFor={`payment-${method.id}`}
//                 className={`flex items-center p-4 border rounded-lg hover:border-blue-500 cursor-pointer transition-all ${
//                   selectedPaymentMethod === method.id
//                     ? "bg-blue-50 border-blue-500 ring-2 ring-blue-500"
//                     : "border-gray-300"
//                 }`}
//               >
//                 <input
//                   type="radio"
//                   id={`payment-${method.id}`}
//                   name="paymentMethod"
//                   value={method.id}
//                   checked={selectedPaymentMethod === method.id}
//                   onChange={handlePaymentMethodChange}
//                   className="h-5 w-5 text-blue-600 border-gray-300 focus:ring-blue-500"
//                 />
//                 <span className="ml-3 block text-sm font-medium text-gray-700">
//                   {method.name}
//                 </span>
//               </label>
//             ))}
//           </div>
//         </fieldset>

//         {error && (
//           <p className="text-red-500 text-sm mt-2 text-center">{error}</p>
//         )}

//         <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8">
//           <Button
//             type="button"
//             variant="outline"
//             onClick={() =>
//               navigate("/auth/checkout/shipping", { state: { shippingInfo } })
//             }
//             className="w-full sm:w-auto"
//           >
//             ← Quay lại
//           </Button>
//           <Button
//             type="submit"
//             variant="primary"
//             disabled={!selectedPaymentMethod}
//             className="w-full sm:w-auto"
//           >
//             Tiếp tục
//           </Button>
//         </div>
//       </form>
//     </div>
//   );
// };

// export default PaymentPage;
