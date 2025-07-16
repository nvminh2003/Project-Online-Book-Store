import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage";
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ResetPasswordPage from "../pages/auth/ResetPasswordPage";
import CartPage from "../pages/cart/CartPage";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";
import ProfilePage from "../pages/account/ProfilePage";
import ChangePasswordPage from "../pages/auth/ChangePasswordPage";
import GoogleSuccess from "../pages/auth/GoogleSuccess";
import RoleBasedDashboard from "../pages/auth/RoleBasedDashboard";
import WishlistPage from "../pages/wishlist/WishlistPage";

// Product Pages
import ProductListingPage from "../pages/products/ProductListingPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import AddBook from "../pages/products/Addbook";
import EditBook from "../pages/products/Editbook";
import UploadExcel from "../pages/products/UploadExcel";

// Checkout Pages
import OrderSuccessPage from "../pages/checkout/OrderSuccessPage";
import OrderCancelPage from "../pages/checkout/OrderCancelPage";
import OrderHistoryPage from "../pages/checkout/OrderHistoryPage";
import OrderDetailPage from "../pages/checkout/OrderDetailPage";

// Admin Pages
import AdminBooks from "../pages/admin/Books";
import AdminCategories from "../pages/admin/Categories";
// import AdminDiscounts from "../pages/admin/Discounts";
import AdminUsers from "../pages/admin/Users";
import AdminOrders from "../pages/admin/Orders";
import AdminBlog from "../pages/admin/Blog";
import AdminReview from "../pages/admin/Reviews";
import AdminReports from "../pages/admin/Reports";
import AdminActivity from "../pages/admin/AdminActivity";

// Blog Pages
import BlogListingPage from "../pages/blog/BlogListingPage";
import BlogDetailPage from "../pages/blog/BlogDetailPage";

// Static Pages
import AboutUs from "../pages/AboutUs";
// import PaymentInfo from "../pages/PaymentInfo";
import SalesPolicy from "../pages/SalesPolicy";
import ReviewForm from "../components/user/ReviewForm";
import CheckoutPage from "../pages/checkout/CheckoutPage";

export const routes = [
  // Public Pages
  { path: "/", page: HomePage, isShowHeader: true },
  { path: "/auth/register", page: RegisterPage, isShowHeader: true },
  { path: "/auth/login", page: LoginPage, isShowHeader: true },
  { path: "/auth/cart", page: CartPage, isShowHeader: true },
  { path: "/auth/forgot-password", page: ForgotPasswordPage, isShowHeader: true },
  { path: "/auth/profile", page: ProfilePage, isShowHeader: true },
  { path: "/auth/change-password", page: ChangePasswordPage, isShowHeader: true },
  { path: "/reset-password", page: ResetPasswordPage, isShowHeader: true },
  { path: "/about", page: AboutUs, isShowHeader: true },
  // { path: "/payment-info", page: PaymentInfo, isShowHeader: true },
  { path: "/sales-policy", page: SalesPolicy, isShowHeader: true },
  { path: "/blogs", page: BlogListingPage, isShowHeader: true },
  { path: "/blogs/:id", page: BlogDetailPage, isShowHeader: true },

  // Product Routes
  { path: "/getbook", page: ProductListingPage, isShowHeader: true },
  { path: "/detailbook/:bookId", page: ProductDetailPage, isShowHeader: true },
  { path: "/addbook", page: AddBook, isShowHeader: true },
  { path: "/editbook/:id", page: EditBook, isShowHeader: true },
  { path: "/autoadd", page: UploadExcel, isShowHeader: true },

  // Checkout Routes
  { path: "/auth/checkout", page: CheckoutPage, isShowHeader: true },
  {
    path: "/auth/checkout/success/:orderId",
    page: OrderSuccessPage,
    isShowHeader: true,
  },
  {
    path: "/auth/checkout/cancel/:orderId",
    page: OrderCancelPage,
    isShowHeader: true,
  },

  { path: "/orders", page: OrderHistoryPage, isShowHeader: true },
  { path: "/orders/:id", page: OrderDetailPage, isShowHeader: true },

  { path: "/review/:orderId/:bookId", page: ReviewForm, isShowHeader: true },
  { path: "/review/:orderId/:bookId/:reviewId", page: ReviewForm, isShowHeader: true },

  { path: "/auth/wishlist", page: WishlistPage, isShowHeader: true },
  // Auth Callback
  { path: "/auth/google/success", page: GoogleSuccess, isShowHeader: false },

  // Admin Routes (role + permission)
  {
    path: "/admin",
    page: () => (
      <ProtectedRoute requiredRole={["admindev", "adminbusiness", "superadmin"]}>
        <AdminLayout>
          <RoleBasedDashboard />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/books",
    page: () => (
      <ProtectedRoute requiredRole="admindev" requiredPermission="VIEW_BOOK">
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
      <ProtectedRoute requiredRole="admindev" requiredPermission="VIEW_CATEGORY">
        <AdminLayout>
          <AdminCategories />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  // {
  //   path: "/admin/discounts",
  //   page: () => (
  //     <ProtectedRoute requiredRole="adminbusiness" requiredPermission="VIEW_DISCOUNT">
  //       <AdminLayout>
  //         <AdminDiscounts />
  //       </AdminLayout>
  //     </ProtectedRoute>
  //   ),
  //   isShowHeader: false,
  // },
  {
    path: "/admin/users",
    page: () => (
      <ProtectedRoute requiredRole="superadmin" requiredPermission="VIEW_USER">
        <AdminLayout>
          <AdminUsers />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/view-admin-activity",
    page: () => (
      <ProtectedRoute requiredRole="superadmin" requiredPermission="VIEW_ADMIN_ACTIVITY">
        <AdminLayout>
          <AdminActivity />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/orders",
    page: () => (
      <ProtectedRoute requiredRole="adminbusiness" requiredPermission="VIEW_ORDER">
        <AdminLayout>
          <AdminOrders />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/review",
    page: () => (
      <ProtectedRoute requiredRole="adminbusiness" requiredPermission="VIEW_REVIEW">
        <AdminLayout>
          <AdminReview />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },
  {
    path: "/admin/blog",
    page: () => (
      <ProtectedRoute requiredRole="admindev" requiredPermission="VIEW_BLOG">
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
      <ProtectedRoute requiredRole="adminbusiness" requiredPermission="VIEW_SALES_REPORT">
        <AdminLayout>
          <AdminReports />
        </AdminLayout>
      </ProtectedRoute>
    ),
    isShowHeader: false,
  },

  // Not found fallback
  { path: "*", page: NotFoundPage },
];
