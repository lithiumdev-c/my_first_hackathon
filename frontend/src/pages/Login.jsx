import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AlertCircle } from "lucide-react";

const API_URL = "http://localhost:8000";

const Login = ({ theme, setTheme }) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const isDark = theme === "dark";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const body = new URLSearchParams();
      body.append("username", username);
      body.append("password", password);

      const res = await fetch(`${API_URL}/token`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body,
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Ошибка авторизации");
        return;
      }

      localStorage.setItem("access_token", data.access_token);
      localStorage.setItem("token_type", data.token_type);

      navigate("/posts");
    } catch {
      setError("Сервер недоступен");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex items-center justify-center ${
        isDark ? "bg-gray-900" : "bg-green-50"
      }`}
    >
      <form
        onSubmit={handleSubmit}
        className={`w-[350px] p-8 rounded-2xl shadow-xl ${
          isDark ? "bg-gray-800 text-gray-100" : "bg-white text-gray-900"
        }`}
      >
        <h1 className="text-2xl font-bold mb-6 text-center">Авторизация</h1>

        {error && (
          <div className="mb-4 text-red-500 flex items-center gap-2">
            <AlertCircle />
            {error}
          </div>
        )}

        <label className="block mb-2 font-medium">Имя пользователя</label>
        <input
          className={`w-full p-2 border rounded mb-4 ${
            isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-900"
          }`}
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />

        <label className="block mb-2 font-medium">Пароль</label>
        <input
          type="password"
          className={`w-full p-2 border rounded mb-6 ${
            isDark ? "bg-gray-700 border-gray-600 text-gray-100" : "bg-gray-100 border-gray-300 text-gray-900"
          }`}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          disabled={loading}
          className="w-full py-2 bg-green-500 hover:bg-green-600 text-white rounded transition"
        >
          {loading ? "Загрузка..." : "Войти"}
        </button>

        <p className="mt-6 text-center text-sm">
          Нет аккаунта?{" "}
          <Link to="/register" className="text-green-500 hover:underline">
            Создать аккаунт
          </Link>
        </p>
      </form>
    </div>
  );
};

export default Login;
