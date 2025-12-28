import assets from "../assets/assets";
import React, { useState } from "react";
import ThemeToggleBtn from "./ThemeToggleBtn";
import { Link } from "react-router-dom"; // импортируем Link

const Navbar = ({ theme, setTheme }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const links = [
    { path: "/", label: "Главная" },
    { path: "/posts", label: "Посты" },
    { path: "/shop", label: "Магазин" },
    { path: "/map", label: "Эко-Карта" },
  ];

  return (
    <div
      className="flex justify-between items-center px-4
      sm:px-12 lg:px-12 xl:px-40 py-4 sticky top-0 z-20
      backdrop-blur-xl font-medium bg-white/50 dark:bg-gray-900/70"
    >
      <img
        src={theme === "dark" ? assets.logo_dark : assets.logo}
        className="w-32 sm:w-40"
        alt="Logo"
      />

      <div
        className={`text-gray-700 dark:text-white sm:text-sm
        ${!sidebarOpen ? 'max-sm:w-0 overflow-hidden' : 'max-sm:w-60 max-sm:pl-10'} max-sm:fixed top-0 bottom-0 right-0 max-sm:min-h-screen
        max-sm:h-full max-sm:flex-col max-sm:bg-primary max-sm:text-white
        max-sm:pt-20 flex sm:items-center gap-5 transition-all`}
      >
        <img
          src={assets.close_icon}
          className="w-5 absolute top-4 right-4 sm:hidden"
          onClick={() => setSidebarOpen(false)}
          alt="Close"
        />

        {links.map(({ path, label }) => (
          <Link
            key={path}
            to={path} 
            onClick={() => setSidebarOpen(false)}
            className="
              relative
              sm:pb-1
              sm:after:content-['']
              sm:after:absolute sm:after:left-0 sm:after:bottom-0
              sm:after:h-[2px] sm:after:w-full
              sm:after:bg-current
              sm:after:scale-x-0
              sm:after:origin-left
              sm:after:transition-transform sm:after:duration-300
              sm:hover:after:scale-x-100
            "
          >
            {label}
          </Link>
        ))}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <ThemeToggleBtn theme={theme} setTheme={setTheme} />

        <img
          src={theme === "dark" ? assets.menu_icon_dark : assets.menu_icon}
          alt="Menu"
          onClick={() => setSidebarOpen(true)}
          className="w-8 sm:hidden"
        />

        <Link
          to="/account"
          className="flex items-center justify-center w-10 h-10 rounded-full
                     hover:bg-gray-200 dark:hover:bg-gray-700
                     transition"
        >
          <img
            src={theme === "dark" ? assets.account_dark : assets.account}
            className="w-10 h-10 rounded-full hover:ring-2 ring-blue-500 transition"
            alt="Account"
          />
        </Link>
      </div>
    </div>
  );
};

export default Navbar;
