"use client"

import Header from './Header';
import Sidebar from './Sidebar';
import { useState } from 'react';

const Layout = ({ children }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <Header setIsMenuOpen={setIsMenuOpen} isMenuOpen={isMenuOpen} />
      <div className="flex flex-1">
        <Sidebar isMenuOpen={isMenuOpen} />
        <div className={`flex-1 transition-all duration-300 ${isMenuOpen ? 'ml-64' : 'ml-16'}`}>
          <main className="h-screen overflow-auto p-4">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
};

export default Layout;