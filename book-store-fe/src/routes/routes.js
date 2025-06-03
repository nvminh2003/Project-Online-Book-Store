import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";

export const routes = [
    {
        path: "/",
        page: HomePage,
        isShowHeader: true,
    },
    {
        path: "/account",
        // page: AccountPage,
        isShowHeader: true,
    },
    {
        path: "*",
        page: NotFoundPage,
    },
];
