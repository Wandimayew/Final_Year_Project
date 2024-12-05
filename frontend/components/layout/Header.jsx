"use client"

import { FiBell, FiMenu, FiSun, FiUser } from 'react-icons/fi';
import Link from 'next/link';
import { FaCalendarAlt } from 'react-icons/fa';
import logo from '@/public/logo.svg';                                                                                                                      
import Image from 'next/image';
import { useEffect, useState } from 'react';

const Header = ({ setIsMenuOpen, isMenuOpen }) => { 
  const [user, setUser] = useState({});
  const [token, setToken] = useState("");

  useEffect(()=>{
    const userData=localStorage.getItem('auth-store');
    console.log("user is :", userData);

    console.log("log user: ",user);
    console.log("log token: ",token);
    if (userData) {
      try {
        // Parse the JSON data
        const parsedData = JSON.parse(userData);
        console.log("parsed :",parsedData);
        
        setToken(parsedData.token);
        setUser(parsedData.user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  },[]);


  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center py-4 px-6 bg-[#fff] shadow-md z-10">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center gap-3">
          
          <Image src={logo} alt="Schola logo" height={40} />
          
        </Link>
        <button className="ml-28 glassmorphism p-1 rotate-45" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          <FiMenu className='-rotate-45 text-[#999] font-bold' size={24} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className='flex gap-4'>
          <button className="glassmorphism p-1 rotate-45">
            <FiSun className='-rotate-45 text-[#999] font-bold' size={24} />
          </button>
          <button className="glassmorphism p-1 rotate-45">
            <FaCalendarAlt className='-rotate-45 text-[#999] font-bold' size={24} />
          </button>
          <button className="glassmorphism p-1 rotate-45">
            <FiBell className='-rotate-45 text-[#999] font-bold' size={24} />
          </button>
        </div>
        <Link href="#" className="flex items-end gap-3">
          <div className='flex flex-col'>
            <span className="font-bold text-[#333]">{user.name}</span>
            <span className="text-[#555] font-medium">{user.role}</span>
          </div>
          <span className="bg-white p-1 rounded-md glassmorphism">
            <FiUser size={35} className='text-[#999] font-bold'/>
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;