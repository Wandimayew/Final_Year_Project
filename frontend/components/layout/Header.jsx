"use client";

import { useEffect, useState, useRef } from "react";
import { FiBell, FiMenu } from "react-icons/fi";
import { FaCalendarAlt } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import logo from "@/public/logo.svg";
import NotificationBell from "@/components/notification/NotificationBell";
import NotificationCounter from "../notification/NotificationCounter";
import UserMenu from "../user/UserMenu";
import { useAuthStore } from "@/lib/auth";
import { useTheme } from "@/lib/theme/ThemeContext";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isToday,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { Menu, Transition } from "@headlessui/react";

const Header = ({ setIsMenuOpen, isMenuOpen }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState("");
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isThemeDropdownOpen, setIsThemeDropdownOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const notificationRef = useRef(null);
  const themeRef = useRef(null);
  const { theme, toggleTheme } = useTheme();

  // Initialize state from Zustand
  useEffect(() => {
    const { user: authUser, token: authToken } = useAuthStore.getState();
    setUser(authUser || null);
    setToken(authToken || "");

    const unsubscribe = useAuthStore.subscribe((state) => {
      setUser(state.user || null);
      setToken(state.token || "");
    });

    return () => unsubscribe();
  }, []);

  const schoolId = user?.schoolId || null;
  const userId = user?.userId || null;

  const toggleNotificationDropdown = () =>
    setIsNotificationOpen((prev) => !prev);
  const toggleThemeDropdown = () => setIsThemeDropdownOpen((prev) => !prev);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        notificationRef.current &&
        !notificationRef.current.contains(event.target)
      ) {
        setIsNotificationOpen(false);
      }
      if (themeRef.current && !themeRef.current.contains(event.target)) {
        setIsThemeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Calendar logic
  const firstDayOfMonth = startOfMonth(currentMonth);
  const lastDayOfMonth = endOfMonth(currentMonth);
  const daysInMonth = eachDayOfInterval({
    start: firstDayOfMonth,
    end: lastDayOfMonth,
  });
  const startingDayOfWeek = getDay(firstDayOfMonth);

  const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  return (
    <header
      className={`
        fixed top-0 left-0 right-0 flex justify-between items-center py-4 px-6
        shadow-md z-20
        bg-[var(--surface)] text-[var(--text)]
        dark:bg-[var(--surface)] dark:text-[var(--text)]
        night:bg-[var(--surface)] night:text-[var(--text)]
      `}
    >
      <div className="flex items-center">
        <Link href="/dashboard" className="flex items-center gap-3">
          <Image src={logo} alt="Schola logo" height={40} />
        </Link>
        <button
          className={`
            ml-28 p-1 rotate-45
            bg-[var(--background)] bg-opacity-50
            hover:bg-opacity-70
            dark:bg-[var(--background)] dark:bg-opacity-50
            night:bg-[var(--background)] night:bg-opacity-50
          `}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          <FiMenu
            className={`
              -rotate-45 font-bold
              text-[var(--secondary)]
              dark:text-[var(--secondary)]
              night:text-[var(--secondary)]
            `}
            size={24}
          />
        </button>
      </div>
      <div className="flex items-center gap-4">
        <div className="flex gap-4">
          {/* Theme Toggle Dropdown */}
          <div className="relative inline-block" ref={themeRef}>
            <button
              className={`
                p-1 rotate-45
                bg-[var(--background)] bg-opacity-50
                hover:bg-opacity-70
                dark:bg-[var(--background)] dark:bg-opacity-50
                night:bg-[var(--background)] night:bg-opacity-50
              `}
              onClick={toggleThemeDropdown}
            >
              <span
                className={`
                  -rotate-45 font-bold text-[var(--secondary)]
                  dark:text-[var(--secondary)]
                  night:text-[var(--secondary)]
                `}
              >
                {theme === "light" ? "☀️" : theme === "dark" ? "🌙" : "🌌"}
              </span>
            </button>
            {isThemeDropdownOpen && (
              <div
                className={`
                  absolute right-0 mt-2 w-32 rounded-md shadow-lg z-50
                  bg-[var(--surface)]
                  dark:bg-[var(--surface)] night:bg-[var(--surface)]
                `}
              >
                <button
                  onClick={() => {
                    toggleTheme("light");
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-2 text-sm
                    text-[var(--text)] hover:bg-[var(--background)]
                    dark:text-[var(--text)] dark:hover:bg-[var(--background)]
                    night:text-[var(--text)] night:hover:bg-[var(--background)]
                  `}
                >
                  Light
                </button>
                <button
                  onClick={() => {
                    toggleTheme("dark");
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-2 text-sm
                    text-[var(--text)] hover:bg-[var(--background)]
                    dark:text-[var(--text)] dark:hover:bg-[var(--background)]
                    night:text-[var(--text)] night:hover:bg-[var(--background)]
                  `}
                >
                  Dark
                </button>
                <button
                  onClick={() => {
                    toggleTheme("night");
                    setIsThemeDropdownOpen(false);
                  }}
                  className={`
                    w-full text-left px-4 py-2 text-sm
                    text-[var(--text)] hover:bg-[var(--background)]
                    dark:text-[var(--text)] dark:hover:bg-[var(--background)]
                    night:text-[var(--text)] night:hover:bg-[var(--background)]
                  `}
                >
                  Night
                </button>
              </div>
            )}
          </div>

          {/* Calendar Dropdown */}
          <div className="relative inline-block">
            <Menu as="div" className="relative">
              <Menu.Button
                className={`
                  p-1 rotate-45
                  bg-[var(--background)] bg-opacity-50
                  hover:bg-opacity-70
                  dark:bg-[var(--background)] dark:bg-opacity-50
                  night:bg-[var(--background)] night:bg-opacity-50
                `}
              >
                <FaCalendarAlt
                  className={`
                    -rotate-45 font-bold
                    text-[var(--secondary)]
                    dark:text-[var(--secondary)]
                    night:text-[var(--secondary)]
                  `}
                  size={24}
                />
              </Menu.Button>
              <Transition
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items
                  className={`
                    absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50 p-4
                    bg-[var(--surface)] text-[var(--text)]
                    dark:bg-[var(--surface)] dark:text-[var(--text)]
                    night:bg-[var(--surface)] night:text-[var(--text)]
                  `}
                >
                  <div className="flex justify-between items-center mb-2">
                    <button
                      onClick={prevMonth}
                      className={`
                        p-1
                        text-[var(--secondary)] hover:text-[var(--primary)]
                        dark:text-[var(--secondary)] dark:hover:text-[var(--primary)]
                        night:text-[var(--secondary)] night:hover:text-[var(--primary)]
                      `}
                    >
                      &larr;
                    </button>
                    <h3
                      className={`
                        text-lg font-semibold
                        text-[var(--text)]
                        dark:text-[var(--text)]
                        night:text-[var(--text)]
                      `}
                    >
                      {format(currentMonth, "MMMM yyyy")}
                    </h3>
                    <button
                      onClick={nextMonth}
                      className={`
                        p-1
                        text-[var(--secondary)] hover:text-[var(--primary)]
                        dark:text-[var(--secondary)] dark:hover:text-[var(--primary)]
                        night:text-[var(--secondary)] night:hover:text-[var(--primary)]
                      `}
                    >
                      &rarr;
                    </button>
                  </div>
                  <div className="grid grid-cols-7 gap-1 text-center">
                    {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                      (day) => (
                        <div
                          key={day}
                          className={`
                          text-sm font-medium
                          text-[var(--secondary)]
                          dark:text-[var(--secondary)]
                          night:text-[var(--secondary)]
                        `}
                        >
                          {day}
                        </div>
                      )
                    )}
                    {Array(startingDayOfWeek)
                      .fill(null)
                      .map((_, i) => (
                        <div key={`empty-${i}`} />
                      ))}
                    {daysInMonth.map((day) => (
                      <button
                        key={day.toString()}
                        className={`
                          p-2 rounded-full text-sm
                          ${
                            isToday(day)
                              ? `
                              bg-[var(--primary)] text-white
                              dark:bg-[var(--primary)] dark:text-white
                              night:bg-[var(--primary)] night:text-white
                            `
                              : `
                              text-[var(--text)] hover:bg-[var(--background)]
                              dark:text-[var(--text)] dark:hover:bg-[var(--background)]
                              night:text-[var(--text)] night:hover:bg-[var(--background)]
                            `
                          }
                        `}
                      >
                        {format(day, "d")}
                      </button>
                    ))}
                  </div>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>

          {/* Notification Dropdown */}
          <div className="relative inline-block" ref={notificationRef}>
            <button
              className={`
                p-1 rotate-45
                bg-[var(--background)] bg-opacity-50
                hover:bg-opacity-70
                dark:bg-[var(--background)] dark:bg-opacity-50
                night:bg-[var(--background)] night:bg-opacity-50
              `}
              onClick={toggleNotificationDropdown}
            >
              <FiBell
                className={`
                  -rotate-45 font-bold
                  text-[var(--secondary)]
                  dark:text-[var(--secondary)]
                  night:text-[var(--secondary)]
                `}
                size={24}
              />
              <NotificationCounter schoolId={schoolId} userId={userId} />
            </button>
            {isNotificationOpen && (
              <div
                className={`
                  absolute right-0 mt-2 w-80 rounded-md shadow-lg z-50 max-h-96 overflow-y-auto
                  bg-[var(--surface)]
                  dark:bg-[var(--surface)] night:bg-[var(--surface)]
                `}
              >
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
