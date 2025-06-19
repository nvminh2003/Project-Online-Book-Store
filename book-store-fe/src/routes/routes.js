import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage"
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import CartPage from "../pages/cart/CartPage";
import AdminLayout from "../components/layout/AdminLayout";
import ProtectedRoute from "../components/auth/ProtectedRoute";

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
import AboutUs from "../pages/AboutUs";
import PaymentInfo from "../pages/PaymentInfo";
import SalesPolicy from "../pages/SalesPolicy";

// Blog Pages
import BlogListingPage from "../pages/blog/BlogListingPage";
import BlogDetailPage from "../pages/blog/BlogDetailPage";

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
    {
        path: "/reset-password",
        page: ResetPasswordPage,
        isShowHeader: true
    },
    {
        path: "/about",
        page: AboutUs,
        isShowHeader: true,
    },
    {
        path: "/payment-info",
        page: PaymentInfo,
        isShowHeader: true,
    },
    {
        path: "/sales-policy",
        page: SalesPolicy,
        isShowHeader: true,
    },
    {
        path: "/blogs",
        page: BlogListingPage,
        isShowHeader: true,
    },
    {
        path: "/blogs/:id",
        page: BlogDetailPage,
        isShowHeader: true,
    },
    // Admin Routes
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
    {
        path: "/admin/discounts",
        page: () => (
            <ProtectedRoute requiredRole="adminbusiness" requiredPermission="VIEW_DISCOUNT">
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
        path: "/admin/reviews",
        page: () => (
            <ProtectedRoute requiredRole="adminbusiness" requiredPermission="VIEW_REVIEW">
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
    {
        path: '/auth/google/success',
        page: GoogleSuccess,
        isShowHeader: false,
    },
    {
        path: "*",
        page: NotFoundPage,
    },
];
