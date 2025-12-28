import React, { useEffect } from "react";
import assets from "../assets/assets";

const ThemeToggleBtn = ({ theme, setTheme }) => {
  
  // Защита от отсутствия пропсов
  if (typeof setTheme !== "function") {
    console.error("ThemeToggleBtn: setTheme must be a function");
    return null;
  }

  // 1. Инициализация темы (с учетом системных настроек)
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    
    // Если тема еще не установлена в стейте, берем из localstorage или системы
    if (!theme) {
      setTheme(savedTheme || (prefersDark ? "dark" : "light"));
    }
  }, [setTheme, theme]);

  useEffect(() => {
    if (theme) {
      document.documentElement.classList.toggle("dark", theme === "dark");
      localStorage.setItem("theme", theme);
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <button 
      onClick={toggleTheme}
      type="button"
      className="focus:outline-none"
      aria-label="Toggle Theme"
    >
      <img
        src={theme === "dark" ? assets.sun_icon : assets.moon_icon}
        className="size-8.5 p-1.5 border border-gray-500 rounded-full transition-all hover:bg-gray-100 dark:hover:bg-gray-800"
        alt={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
      />
    </button>
  );
};

export default ThemeToggleBtn;