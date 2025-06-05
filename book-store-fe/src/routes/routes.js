import HomePage from "../pages/HomePage";
import NotFoundPage from "../pages/NotFoundPage";
import ProductDetailPage from "../pages/products/ProductDetailPage";
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
    {
        path: "/getbook",
         page: ProductDetailPage,
        isShowHeader: true,
    },
    
];
