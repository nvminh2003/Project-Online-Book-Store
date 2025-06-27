import React, { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes/routes";
import MainLayout from "./components/layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { AdminActivityProvider } from "./contexts/AdminActivityContext";
import { CartProvider } from "./contexts/CartContext";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <AdminActivityProvider>
          <Router>
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
        </AdminActivityProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
