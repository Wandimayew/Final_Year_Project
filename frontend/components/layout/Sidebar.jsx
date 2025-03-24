"use client";
<<<<<<< HEAD
import { useState } from "react";
=======

import { useState, useEffect, memo } from "react";
>>>>>>> 5f7cb358532ddc87b0dec9622e460731c27a18d7
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/config/menuItems";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { filterMenuByRole } from "../utility/RoleFilter";
import { useAuthStore } from "@/lib/auth";

// Memoize the Sidebar to prevent unnecessary re-renders
const Sidebar = memo(({ isMenuOpen }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);

  // Use a stable selector to avoid re-creating the object on every render
  const user = useAuthStore((state) => state.user);
  const userRole = user?.roles || "ROLE_GUEST";
  console.log("user information is ",user);
  

  useEffect(() => {
    const filteredItems = filterMenuByRole(MENU_ITEMS, userRole);
    setMenuItems(filteredItems);
  }, [userRole]);

  const toggleExpand = (itemId) => {
    setExpandedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isActive = (href) => pathname === href;

  const renderMenuItem = (item) => {
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedItems.includes(item.id);
    const isItemActive =
      isActive(item.href) ||
      item.subItems?.some((subItem) => isActive(subItem.href));

    return (
      <div key={item.id}>
        <div
          className={`
            flex items-center justify-between py-1 cursor-pointer font-bold
<<<<<<< HEAD
            ${isItemActive ? "bg-indigo-100 text-indigo-600" : "text-[#555] hover:text-indigo-600"}
            rounded-lg transition-colors duration-150 px-2
=======
            ${
              isItemActive
                ? "bg-navy-700 text-[#1672EE]"
                : "text-[#555] hover:text-[#1672EE]"
            }
            rounded-lg transition-colors duration-150
>>>>>>> 5f7cb358532ddc87b0dec9622e460731c27a18d7
          `}
          onClick={() => (hasSubItems ? toggleExpand(item.id) : null)}
        >
          <Link
            href={item.href}
            className="flex items-center flex-1 gap-3"
            onClick={(e) => hasSubItems && e.preventDefault()}
          >
            <span className="glassmorphism p-2 rounded-md text-indigo-600">
              <item.icon size={25} />
            </span>
            {isMenuOpen && <span className="text-sm">{item.label}</span>}
          </Link>
          {isMenuOpen &&
            hasSubItems &&
            (isExpanded ? (
              <FaChevronDown className="w-3 h-3" />
            ) : (
              <FaChevronRight className="w-3 h-3" />
            ))}
        </div>

        {isMenuOpen && hasSubItems && isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
<<<<<<< HEAD
            {item.subItems.map((subItem) => (
              <Link
                key={subItem.id}
                href={subItem.href}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-bold
                  ${isActive(subItem.href)
                    ? "bg-indigo-100 text-indigo-600"
                    : "text-[#555] hover:text-indigo-600"}
                `}
              >
                {subItem.icon && (
                  <span className="text-indigo-600">
                    <subItem.icon size={18} />
                  </span>
                )}
                <span>{subItem.label}</span>
              </Link>
            ))}
=======
            <div className="max-h-60 overflow-y-auto">
              {item.subItems.map((subItem) => (
                <Link
                  key={subItem.id}
                  href={subItem.href}
                  className={`
                    flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-bold
                    ${
                      isActive(subItem.href)
                        ? "bg-navy-700 text-[#1672EE]"
                        : "text-[#555] hover:text-[#1672EE]"
                    }
                  `}
                >
                  {subItem.icon && (
                    <span className="text-[#1672EE]">
                      <subItem.icon size={18} />
                    </span>
                  )}
                  <span>{subItem.label}</span>
                </Link>
              ))}
            </div>
>>>>>>> 5f7cb358532ddc87b0dec9622e460731c27a18d7
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`fixed left-0 top-20 bottom-0 transition-all duration-300 bg-white text-[#555] shadow-md z-10 ${
        isMenuOpen ? "w-64" : "w-16"
      }`}
    >
<<<<<<< HEAD
      <nav className="h-full p-2 overflow-y-auto scroll-smooth">
        {MENU_ITEMS.map((menu) => renderMenuItem(menu))}
=======
      <nav className="flex-1 p-2 space-y-2 overflow-y-auto">
        {menuItems.map((menu) => renderMenuItem(menu))}
>>>>>>> 5f7cb358532ddc87b0dec9622e460731c27a18d7
      </nav>
    </aside>
  );
});

// Add display name for better debugging
Sidebar.displayName = "Sidebar";

export default Sidebar;