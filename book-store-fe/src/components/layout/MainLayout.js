import React from "react";
import Header from "./Header";
import Footer from "./Footer";
import { ToastManager } from "../common/ToastManager";

const MainLayout = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <ToastManager />
      <Header />
      <main className="flex-grow container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default MainLayout;
