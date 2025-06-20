import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import CartPage from "../pages/cart/CartPage";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import ProductListingPage from "../pages/products/ProductListingPage";
import AddBook from "../pages/products/Addbook";
import EditBook from "../pages/products/Editbook";
//check out pages
import ShippingPage from "../pages/checkout/ShippingPage";
import PaymentPage from "../pages/checkout/PaymentPage";
import OrderReviewPage from "../pages/checkout/OrderReviewPage";
import OrderSuccessPage from "../pages/checkout/OrderSuccessPage";
// Admin Pages
import AdminBooks from "../pages/admin/Books";
import AdminCategories from "../pages/admin/Categories";
import AdminDiscounts from "../pages/admin/Discounts";
import AdminUsers from "../pages/admin/Users";
import AdminOrders from "../pages/admin/Orders";
import AdminReviews from "../pages/admin/Reviews";
import AdminBlog from "../pages/admin/Blog";
import AdminReports from "../pages/admin/Reports";
import GoogleSuccess from "../pages/auth/GoogleSuccess";
import ProfilePage from "../pages/account/ProfilePage";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage";

import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import AdminActivity from "../pages/admin/AdminActivity";
import RoleBasedDashboard from "../pages/auth/RoleBasedDashboard";

export const routes = [
  {
    path: "/",
    page: HomePage,
    isShowHeader: true,
  },
  {
    path: "/auth/register",
    page: RegisterPage,
    isShowHeader: true,
  },
  {
    path: "/auth/login",
    page: LoginPage,
    isShowHeader: true,
  },
  {
    path: "/auth/cart",
    page: CartPage,
    isShowHeader: true,
  },
  {
    path: "/auth/forgot-password",
    page: ForgotPasswordPage,
    isShowHeader: true,
  },
  {
    path: "/auth/profile",
    page: ProfilePage,
    isShowHeader: true,
  },
  {
    path: "/auth/change-password",
    page: ChangePasswordPage,
    isShowHeader: true,
  },
  // --- THÊM CÁC ROUTE CHO CHECKOUT (VỚI PREFIX /auth) ---
  {
    path: "/auth/checkout/shipping",
    page: ShippingPage, // Render trực tiếp component ShippingPage
    isShowHeader: true, // Hoặc false nếu bạn có layout riêng cho checkout
  },
  {
    path: "/auth/checkout/payment",
    page: PaymentPage, // Render trực tiếp component PaymentPage
    isShowHeader: true,
  },
  {
    Đpath: "/auth/checkout/review",
    page: OrderReviewPage, // Render trực tiếp component OrderReviewPage
    isShowHeader: true,
  },
  {
    path: "/auth/checkout/success/:orderId", // Thêmã hiểu, bạn muốn đoạn code **chỉ riêng cho phần checkout routes** trong file :orderId để hiển thị chi tiết đơn hàng thành công
    page: OrderSuccessPage, // Render trực tiếp component OrderSuccessPage
    isShowHeader: true,
  },
  // --- KẾT THÚC ĐOẠN CODE CHO `routes.js` mà **không sử dụng `ProtectedRoute`** (hoặc `UserProtectedRoute`).
  // Admin Routes
  {
    path: "/admin",
    page: () => (
      <ProtectedRoute requiredRole={["admin", "superadmin"]}>
        <AdminLayout></AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/books",
    page: () => (
      <ProtectedRoute
        requiredRole={["admin", "superadmin"]}
        requiredDepartment="dev"
      >
        <AdminLayout>
          <AdminBooks />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/categories",
    page: () => (
      <ProtectedRoute
        requiredRole={["admin", "superadmin"]}
        requiredDepartment="dev"
      >
        <AdminLayout>
          <AdminCategories />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/discounts",
    page: () => (
      <ProtectedRoute
        requiredRole={["admin", "superadmin"]}
        requiredDepartment="business"
      >
        <AdminLayout>
          <AdminDiscounts />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/users",
    page: () => (
      <ProtectedRoute requiredRole="superadmin">
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/orders",
    page: () => (
      <ProtectedRoute
        requiredRole={["admin", "superadmin"]}
        requiredDepartment="business"
      >
        <AdminLayout>
          <AdminOrders />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/reviews",
    page: () => (
      <ProtectedRoute
        requiredRole={["admin", "superadmin"]}
        requiredDepartment="business"
      >
        <AdminLayout>
          <AdminReviews />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/blog",
    page: () => (
      <ProtectedRoute
        requiredRole={["admin", "superadmin"]}
        requiredDepartment="dev"
      >
        <AdminLayout>
          <AdminBlog />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/reports",
    page: () => (
      <ProtectedRoute
        requiredRole={["admin", "superadmin"]}
        requiredDepartment="business"
      >
        <AdminLayout>
          <AdminReports />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },

  {
    path: "/auth/google/success",
    page: GoogleSuccess,
    isShowHeader: false,
  },
  // {
  //     path: "/admin/logs",
  //     page: () => (
  //         <ProtectedRoute requiredRole={["admin", "superadmin"]} requiredDepartment="dev">
  //             <AdminLayout>
  //                 <AdminLogs />
  //             </AdminLayout>
  //         </ProtectedRoute>
  //     ),
  //     isShowHeader: false,
  // },
  {
    path: "*",
    page: NotFoundPage,
  },
];
