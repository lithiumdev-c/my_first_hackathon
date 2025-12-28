import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Lock, AlertCircle } from 'lucide-react';

const API_URL = 'http://localhost:8000';

const Register = ({ setToken }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false); // Добавлено состояние загрузки
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!username || !password) {
      setError('Введите имя пользователя и пароль');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Выводим ошибку из бэкенда (например, "Пользователь уже существует")
        setError(data.detail || 'Ошибка регистрации');
        setLoading(false);
        return;
      }

      // ✅ ВАЖНО: Ключ изменен на 'access_token', чтобы совпадать с Login.jsx
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('token_type', 'bearer');

      // ✅ Синхронизируем состояние приложения, если нужно
      if (typeof setToken === 'function') {
        setToken(data.access_token);
      }

      // Успешный переход
      navigate('/posts');
    } catch (err) {
      console.error(err);
      setError('Ошибка сети: сервер недоступен');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen bg-gray-100 dark:bg-gray-900">
      <form
        onSubmit={handleRegister}
        className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md w-96 flex flex-col gap-4"
      >
        <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
          Регистрация
        </h2>

        {error && (
          <div className="flex items-center text-red-500 gap-2 bg-red-50 dark:bg-red-900/20 p-2 rounded">
            <AlertCircle size={20} />
            <span className="text-sm">{error}</span>
          </div>
        )}

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Имя пользователя</label>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-green-500">
            <User size={20} className="text-gray-400 dark:text-gray-300" />
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="ml-2 w-full bg-transparent outline-none text-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Пароль</label>
          <div className="flex items-center border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus-within:ring-2 focus-within:ring-green-500">
            <Lock size={20} className="text-gray-400 dark:text-gray-300" />
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ml-2 w-full bg-transparent outline-none text-gray-800 dark:text-gray-100"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={`font-semibold py-2 rounded-md transition text-white ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
          }`}
        >
          {loading ? 'Создание аккаунта...' : 'Зарегистрироваться'}
        </button>

        <p className="text-sm text-gray-600 dark:text-gray-400 text-center mt-2">
          Уже есть аккаунт?{' '}
          <span
            className="text-blue-500 cursor-pointer hover:underline font-medium"
            onClick={() => navigate('/login')}
          >
            Войти
          </span>
        </p>
      </form>
    </div>
  );
};

export default Register;