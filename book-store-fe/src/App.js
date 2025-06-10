import React, { Fragment } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { routes } from "./routes/routes";
import MainLayout from "./components/layout/MainLayout";
import { AuthProvider } from "./contexts/AuthContext";
import { Provider } from "react-redux";
import store from "./store/store";

function App() {
  return (
    <Provider store={store}>
      <AuthProvider>
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
      </AuthProvider>
    </Provider>
  );
}

export default App;
