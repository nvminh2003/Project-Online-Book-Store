import React, { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes/routes";
import MainLayout from "./components/layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminActivityProvider } from "./contexts/AdminActivityContext";
import { ToastManager } from "./components/common/ToastManager";
import ScrollToTop from "./components/common/ScrollToTop";
import { CartProvider } from "./contexts/CartContext";
import { WishlistProvider } from "./contexts/WishlistContext";

function App() {
  return (
    <AuthProvider>
      <AdminActivityProvider>
        <CartProvider>
          <WishlistProvider>
            <Router>
              <ScrollToTop />
              <ToastManager />
              <Routes>
                {routes.map((route) => {
                  const Page = route.page;
                  const Layout = route.isShowHeader ? MainLayout : Fragment;
                  return (
                    <Route
                      key={route.path}
                      path={route.path}
                      element={
                        <Layout>
                          <Page />
                        </Layout>
                      }
                    />
                  );
                })}
              </Routes>
            </Router>
          </WishlistProvider>
        </CartProvider>
      </AdminActivityProvider>
    </AuthProvider>
  );
}


export default App;
