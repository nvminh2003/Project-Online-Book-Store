import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage"
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
import ProductListingPage from "../pages/products/ProductListingPage";
import AddBook from "../pages/products/Addbook";
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
        path: "/auth/forgot-password",
        page: ForgotPasswordPage,
        isShowHeader: true,
    },
    {
        path: "*",
        page: NotFoundPage,
    },
    {
        path: "/getbook",
         page: ProductListingPage,
        isShowHeader: true,
    },
    {
        path: "/detailbook/:bookId",
         page: ProductDetailPage,
        isShowHeader: true,
    },
    {
        path: "/addbook",
         page: AddBook,
        isShowHeader: true,
    },
];
