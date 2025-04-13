"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/config/menuItems";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";
import { filterMenuByRole } from "../utility/RoleFilter";
import { useAuthStore } from "@/lib/auth";
import { memo } from "react";

const Sidebar = memo(({ isMenuOpen }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const authData = useMemo(() => useAuthStore.getState(), []);
  const userRole = authData?.user?.roles || [];

  console.log("Auth data for users : ", authData);

  useEffect(() => {
    const filteredItems = filterMenuByRole(MENU_ITEMS, userRole);
    console.log("meun items before filtering : ", MENU_ITEMS);
    console.log("user roles for filtering : ", userRole);
    console.log("user roles menu after filtered : ", filteredItems);
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
            flex items-center justify-between py-1 cursor-pointer font-bold rounded-lg
            transition-colors duration-150 px-2
            ${
              isItemActive
                ? "bg-[var(--primary)] bg-opacity-20 text-[var(--primary)]"
                : "text-[var(--text)] hover:text-[var(--primary)]"
            }
            dark:bg-opacity-30 dark:text-[var(--text)] dark:hover:text-[var(--primary)]
            night:bg-opacity-30 night:text-[var(--text)] night:hover:text-[var(--primary)]
          `}
          onClick={() => (hasSubItems ? toggleExpand(item.id) : null)}
        >
          <Link
            href={item.href}
            className="flex items-center flex-1 gap-3"
            onClick={(e) => hasSubItems && e.preventDefault()}
          >
            <span
              className={`
                glassmorphism p-2 rounded-md
                text-[var(--primary)]
                dark:text-[var(--primary)]
                night:text-[var(--primary)]
              `}
            >
              <item.icon size={25} />
            </span>
            {isMenuOpen && (
              <span
                className={`
                  text-sm
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              >
                {item.label}
              </span>
            )}
          </Link>
          {isMenuOpen &&
            hasSubItems &&
            (isExpanded ? (
              <FaChevronDown
                className={`
                  w-3 h-3
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              />
            ) : (
              <FaChevronRight
                className={`
                  w-3 h-3
                  text-[var(--text)]
                  dark:text-[var(--text)]
                  night:text-[var(--text)]
                `}
              />
            ))}
        </div>
        {isMenuOpen && hasSubItems && isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
            {item.subItems.map((subItem) => (
              <Link
                key={subItem.id}
                href={subItem.href}
                className={`
                  flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-bold
                  ${
                    isActive(subItem.href)
                      ? "bg-[var(--primary)] bg-opacity-20 text-[var(--primary)]"
                      : "text-[var(--text)] hover:text-[var(--primary)]"
                  }
                  dark:bg-opacity-30 dark:text-[var(--text)] dark:hover:text-[var(--primary)]
                  night:bg-opacity-30 night:text-[var(--text)] night:hover:text-[var(--primary)]
                `}
              >
                {subItem.icon && (
                  <span
                    className={`
                      text-[var(--primary)]
                      dark:text-[var(--primary)]
                      night:text-[var(--primary)]
                    `}
                  >
                    <subItem.icon size={18} />
                  </span>
                )}
                <span
                  className={`
                    text-[var(--text)]
                    dark:text-[var(--text)]
                    night:text-[var(--text)]
                  `}
                >
                  {subItem.label}
                </span>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside
      className={`
        fixed left-0 top-20 bottom-0 transition-all duration-300
        shadow-md z-10
        bg-[var(--surface)] text-[var(--text)]
        dark:bg-[var(--surface)] dark:text-[var(--text)]
        night:bg-[var(--surface)] night:text-[var(--text)]
        ${isMenuOpen ? "w-64" : "w-16"}
      `}
    >
      <nav className="h-full p-2 overflow-y-auto scroll-smooth">
        {menuItems.map((menu) => renderMenuItem(menu))}
      </nav>
    </aside>
  );
});

Sidebar.displayName = "Sidebar";
export default Sidebar;
