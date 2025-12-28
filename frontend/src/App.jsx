import { Routes, Route } from "react-router-dom";
import React, { useState } from "react";
import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";

import Posts from "./pages/Posts";
import Tasks from "./pages/Tasks";
import Shop from "./pages/Shop";
import Map from "./pages/Map";
import Account from "./pages/Account";
import EcoMap from "./pages/Map";

function App() {
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "light");

    const [token, setToken] = useState(
    localStorage.getItem('token')
  );

  const saveToken = (token) => {
    localStorage.setItem('token', token);
    setToken(token);
  };

  return (
    <div className="dark:bg-black relative">
      <Navbar theme={theme} setTheme={setTheme} />
      <Routes>
        <Route
          path="/"
          element={
            <>
              <Hero />
              <Features />
              <Footer />
            </>
          }
        />
        <Route path="/posts" element={<Posts theme={theme} setTheme={setTheme}/>} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/shop" element={<Shop />} />
        <Route path="/map" element={<EcoMap />} />
        <Route path="/login" element={<Login theme={theme} setTheme={setTheme} />} />
        <Route path="/register" element={<Register setToken={token} />} />
        <Route path="/account" element={<Account />} />
      </Routes>
    </div>
  );
}

export default App;
