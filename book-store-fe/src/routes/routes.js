import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import LoginPage from "../pages/auth/LoginPage";
import RegisterPage from "../pages/auth/RegisterPage"
import ForgotPasswordPage from "../pages/auth/ForgotPasswordPage";


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
];
