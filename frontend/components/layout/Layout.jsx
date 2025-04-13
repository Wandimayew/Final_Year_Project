"use client";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { memo, useState } from "react";
export const dynamic = "force-dynamic";

const Layout = memo(({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);

  return (
    <div
      className={`
        min-h-screen flex flex-col
        bg-[var(--background)] text-[var(--text)]
        dark:bg-[var(--background)] dark:text-[var(--text)]
        night:bg-[var(--background)] night:text-[var(--text)]
      `}
    >
      <div className="overflow-auto px-4 py-6">
        <Header setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      </div>
      <div className="flex flex-1">
        <Sidebar isMenuOpen={isMenuOpen} />
        <div
          className={`
            flex-1 transition-all duration-300
            ${isMenuOpen ? "ml-64" : "ml-16"}
          `}
        >
          <main
            className={`
              h-screen overflow-y-auto p-4
              bg-[var(--background)] text-[var(--text)]
              dark:bg-[var(--background)] dark:text-[var(--text)]
              night:bg-[var(--background)] night:text-[var(--text)]
            `}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
});

Layout.displayName = "Layout";
export default Layout;
