"use client";

import { useState, memo } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

// Memoize Layout to prevent unnecessary re-renders
const Layout = memo(({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="overflow-auto px-4 py-6">
        <Header setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      </div>
      <div className="flex flex-1">
        <Sidebar isMenuOpen={isMenuOpen} />
        <div
          className={`flex-1 transition-all duration-300 ${
            isMenuOpen ? "ml-64" : "ml-16"
          }`}
        >
          <main className="h-screen overflow-y-auto p-4">{children}</main>
        </div>
      </div>
    </div>
  );
});

Layout.displayName = "Layout";

export default Layout;
