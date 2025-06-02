import AccountPage from "../pages/AccountPage";
import HomePage from "../pages/HomPage";
import NotFoundPage from "../pages/NotFoundPage";
import OrderPage from "../pages/OrderPage";

export const routes = [
    {
        path: "/",
        page: HomePage,
        isShowHeader: true,
    },
    {
        path: "/account",
        page: AccountPage,
        isShowHeader: true,
    },
    {
        path: "/order",
        page: OrderPage,
        isShowHeader: true,
    },
    {
        path: "*",
        page: NotFoundPage,
    },
];
