"use client";
import { useState, useRef, useEffect } from "react";
import { FiUser } from "react-icons/fi";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/api/userManagementService/user";

const UserMenu = ({ user, token }) => {
  const [isHydrated, setIsHydrated] = useState(false);
  const router = useRouter();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLogoutModalOpen, setIsLogoutModalOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { logout, isLoading: isLogoutLoading } = useAuth();

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen)
      document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isDropdownOpen]);

  if (!isHydrated) return null;

  const toggleDropdown = () => setIsDropdownOpen((prev) => !prev);
  const handleLogout = async () => {
    try {
      await logout();
      setIsLogoutModalOpen(false);
    } catch (error) {
      console.error("Logout error:", error);
      setIsLogoutModalOpen(false);
    }
  };
  const handleMenuClick = (action) => {
    setIsDropdownOpen(false);
    switch (action) {
      case "profile":
        router.push("/user/profile");
        break;
      case "logout":
        setIsLogoutModalOpen(true);
        break;
      case "help":
        router.push("/help");
        break;
      default:
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={toggleDropdown}
        className="flex items-end gap-3 focus:outline-none"
        title="User options"
      >
        <div className="flex flex-col text-right">
          <span className="font-bold text-[#333]">
            {user?.username || "Guest"}
          </span>
          <span className="text-[#555] font-medium">
            {user?.roles?.join(", ") || "No roles"}
          </span>
        </div>
        <span className="bg-white p-1 rounded-md glassmorphism">
          <FiUser size={35} className="text-[#999] font-bold" />
        </span>
      </button>
      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-50">
          <ul className="py-1">
            <li>
              <button
                onClick={() => handleMenuClick("profile")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Profile
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick("logout")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Logout
              </button>
            </li>
            <li>
              <button
                onClick={() => handleMenuClick("help")}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                Help & Support
              </button>
            </li>
          </ul>
        </div>
      )}
      {isLogoutModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 w-96 shadow-xl">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">
              Confirm Logout
            </h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to logout?
            </p>
            <div className="flex justify-end gap-4">
              <button
                onClick={() => setIsLogoutModalOpen(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
                disabled={isLogoutLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors flex items-center"
                disabled={isLogoutLoading}
              >
                {isLogoutLoading ? (
                  <svg
                    className="animate-spin h-5 w-5 mr-2 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-8 8 8 8 0 01-8-8z"
                    ></path>
                  </svg>
                ) : null}
                {isLogoutLoading ? "Logging out..." : "Logout"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserMenu;
