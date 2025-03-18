"use client";
import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MENU_ITEMS } from "@/config/menuItems";
import { FaChevronDown, FaChevronRight } from "react-icons/fa";

const Sidebar = ({ isMenuOpen }) => {
  const pathname = usePathname();
  const [expandedItems, setExpandedItems] = useState([]);

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
            ${isItemActive ? "bg-indigo-100 text-indigo-600" : "text-[#555] hover:text-indigo-600"}
            rounded-lg transition-colors duration-150 px-2
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
          {isMenuOpen && hasSubItems && (
            isExpanded ? (
              <FaChevronDown className="w-3 h-3" />
            ) : (
              <FaChevronRight className="w-3 h-3" />
            )
          )}
        </div>

        {isMenuOpen && hasSubItems && isExpanded && (
          <div className="ml-8 mt-1 space-y-1">
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
      <nav className="h-full p-2 overflow-y-auto scroll-smooth">
        {MENU_ITEMS.map((menu) => renderMenuItem(menu))}
      </nav>
    </aside>
  );
};

export default Sidebar;