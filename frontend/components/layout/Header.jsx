"use client";
import { FiBell, FiMenu, FiSun } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import logo from "@/public/logo.svg";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import NotificationBell from "@/components/notification/NotificationBell";
import NotificationCounter from "../notification/NotificationCounter";
import UserMenu from "../user/UserMenu";
import { useAuthStore } from "@/lib/auth";

const Header = ({ setIsMenuOpen, isMenuOpen }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef(null);

  // Initialize state from Zustand only on the client
  useEffect(() => {
    const { user: authUser, token: authToken } = useAuthStore.getState();
    setUser(authUser || null);
    setToken(authToken || "");

    // Subscribe to store updates
    const unsubscribe = useAuthStore.subscribe((state) => {
      setUser(state.user || null);
      setToken(state.token || "");
    });

    return () => unsubscribe(); // Cleanup subscription
  }, []);

  const schoolId = user?.schoolId || null;
  const userId = user?.userId || null;

  const toggleNotificationDropdown = () =>
    setIsNotificationOpen((prev) => !prev);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
    };
    if (isNotificationOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isNotificationOpen]);

  return (
    <header className="fixed top-0 left-0 right-0 flex justify-between items-center py-4 px-6 bg-white shadow-md z-20">
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src={logo} alt="Schola logo" height={40} />
        </Link>
        <button
          className="ml-28 p-1 rotate-45 glassmorphism"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FiMenu className="-rotate-45 text-[#999] font-bold" size={24} />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-4">
          <button className="p-1 rotate-45 glassmorphism">
            <FiSun className="-rotate-45 text-[#999] font-bold" size={24} />
          </button>
          <button className="p-1 rotate-45 glassmorphism">
            <FaCalendarAlt
              className="-rotate-45 text-[#999] font-bold"
              size={24}
            />
          </button>
          <div className="relative inline-block" ref={notificationRef}>
            <button
              className="p-1 rotate-45 glassmorphism"
              onClick={toggleNotificationDropdown}
            >
              <FiBell className="-rotate-45 text-[#999] font-bold" size={24} />
              <NotificationCounter schoolId={schoolId} userId={userId} />
            </button>
            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg z-50 max-h-96 overflow-y-auto">
                <NotificationBell schoolId={schoolId} userId={userId} />
              </div>
            )}
          </div>
        </div>
        <UserMenu user={user || {}} token={token} />
      </div>
    </header>
  );
};

export default Header;
