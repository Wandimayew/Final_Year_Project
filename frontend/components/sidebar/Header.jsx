"use client"
import { FiMenu, FiMoon, FiUser } from 'react-icons/fi';
import Link from 'next/link';

const Header = ({ setIsMenuOpen, isMenuOpen }) => {
  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center py-4 px-6 bg-[#fff] shadow-md z-10">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#fff] rounded"></div>
          <span className="text-xl text-[#555] font-bold">Schola</span>
        </Link>
        <button className="ml-32 glassmorphism p-2 rotate-45" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FiMenu className='-rotate-45 text-[#999] font-bold' size={24} />
        </button>

      </div>
      <div className="flex items-center gap-4">
        <FiMoon size={24}/>
        <Link href="#" className="flex flex-col items-end">
          <span className="font-bold text-[#333]">John Doe</span>
          <span className="text-[#555] font-medium">Admin</span>
        </Link>
        <span className="bg-white p-1 rounded-md glassmorphism">
          <FiUser size={35} className='text-[#999] font-bold'/>
        </span>
      </div>
    </header>
  );
};

export default Header;