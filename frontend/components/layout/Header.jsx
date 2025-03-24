// app/components/Header.js
"use client";

import { FiBell, FiMenu, FiSun, FiUser } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import logo from "@/public/logo.svg";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import NotificationBell from "@/components/notification/NotificationBell";
import NotificationCounter from "../notification/NotificationCounter";

const Header = ({ setIsMenuOpen, isMenuOpen }) => {
  const [user, setUser] = useState({});
  const [token, setToken] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null); // Ref for the notification dropdown

  useEffect(() => {
    const userData = localStorage.getItem("auth-store");
    console.log("user is:", userData);

    if (userData) {
      try {
        const parsedData = JSON.parse(userData);
        console.log("parsed:", parsedData);
        setToken(parsedData.token);
        setUser(parsedData.user);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  const {
    schoolId = "new",
    id: userId = "new1",
    name = "Guest",
    role = "Unknown",
  } = user;

  // Toggle notification dropdown
  const toggleNotificationDropdown = () =>
    setIsNotificationOpen((prev) => !prev);

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };

    if (isNotificationOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isNotificationOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center py-4 px-6 bg-[#fff] shadow-md z-10">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src={logo} alt="Schola logo" height={40} />
        </Link>
        <button
          className="ml-28 glassmorphism p-1 rotate-45"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FiMenu className="-rotate-45 text-[#999] font-bold" size={24} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-4">
          <button className="glassmorphism p-1 rotate-45">
            <FiSun className="-rotate-45 text-[#999] font-bold" size={24} />
          </button>
          <button className="glassmorphism p-1 rotate-45">
            <FaCalendarAlt
              className="-rotate-45 text-[#999] font-bold"
              size={24}
            />
          </button>
          <div className="relative inline-block" ref={notificationRef}>
            <button
              className="glassmorphism p-1 rotate-45"
              onClick={toggleNotificationDropdown}
            >
              <FiBell className="-rotate-45 text-[#999] font-bold" size={24} />
              <NotificationCounter schoolId={schoolId} userId={userId} />
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                <NotificationBell
                  schoolId={schoolId}
                  userId={userId}
                  token={token}
                  isOpen={isNotificationOpen}
                  setIsOpen={setIsNotificationOpen}
                />
              </div>
            )}
          </div>
        </div>
        <Link href="#" className="flex items-end gap-3">
          <div className="flex flex-col">
            <span className="font-bold text-[#333]">{name}</span>
            <span className="text-[#555] font-medium">{role}</span>
          </div>
          <span className="bg-white p-1 rounded-md glassmorphism">
            <FiUser size={35} className="text-[#999] font-bold" />
          </span>
        </Link>
      </div>
    </header>
  );
};

export default Header;
