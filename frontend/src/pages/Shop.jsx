import React, { useState, useEffect } from 'react';
import { ShoppingBag, Coins, CheckCircle, AlertTriangle, Gift } from 'lucide-react';

const API_URL = "http://localhost:8000";

const Shop = ({ theme }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState({ type: '', msg: '' });
  const isDark = theme === 'dark';

  const token = localStorage.getItem("access_token");

  // Список товаров (в реальном проекте можно получать с бэкенда)
  const inventory = [
    { id: 1, name: "Эко-сумка", price: 150, icon: <ShoppingBag size={40} />, desc: "Прочная сумка из переработанного хлопка" },
    { id: 2, name: "Сертификат на дерево", price: 500, icon: <Gift size={40} />, desc: "Мы посадим реальное дерево от вашего имени" },
    { id: 3, name: "Мерч-футболка", price: 300, icon: <ShoppingBag size={40} />, desc: "Стильная футболка с логотипом EcoAction" },
    { id: 4, name: "Скидка в GreenCafe", price: 100, icon: <Coins size={40} />, desc: "Промокод на скидку 20% в веганском кафе" },
  ];

  useEffect(() => {
    fetchBalance();
  }, []);

  const fetchBalance = async () => {
    try {
      const res = await fetch(`${API_URL}/user/balance`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const data = await res.json();
      setBalance(data.eco_coins || 0);
    } catch (err) {
      console.error("Ошибка баланса:", err);
    }
  };

  const handleBuy = async (item) => {
    if (balance < item.price) {
      showStatus('error', 'Недостаточно EcoCoins!');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/shop/buy`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ item_id: item.id, price: item.price })
      });

      const data = await res.json();
      if (res.ok) {
        setBalance(data.new_balance);
        showStatus('success', `Успешно куплено: ${item.name}`);
      } else {
        showStatus('error', data.detail || 'Ошибка покупки');
      }
    } catch (err) {
      showStatus('error', 'Ошибка сервера');
    } finally {
      setLoading(false);
    }
  };

  const showStatus = (type, msg) => {
    setStatus({ type, msg });
    setTimeout(() => setStatus({ type: '', msg: '' }), 3000);
  };

  return (
    <div className={`min-h-screen p-6 transition-colors duration-300 ${isDark ? 'bg-gray-900 text-white' : 'bg-green-50 text-gray-900'}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Хедер магазина */}
        <header className={`flex flex-col md:flex-row justify-between items-center p-8 rounded-3xl shadow-xl mb-10 ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="mb-4 md:mb-0">
            <h1 className="text-4xl font-black text-green-500 flex items-center gap-3">
              EcoStore <ShoppingBag size={32} />
            </h1>
            <p className="opacity-70 text-lg">Обменивайте свои эко-достижения на реальные призы</p>
          </div>
          <div className="flex items-center gap-3 bg-green-500 text-white px-8 py-4 rounded-2xl shadow-lg transform hover:scale-105 transition">
            <Coins size={28} />
            <span className="text-2xl font-bold">{balance} EcoCoins</span>
          </div>
        </header>

        {/* Уведомления */}
        {status.msg && (
          <div className={`fixed top-5 right-5 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 animate-bounce ${status.type === 'success' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'}`}>
            {status.type === 'success' ? <CheckCircle /> : <AlertTriangle />}
            <span className="font-bold">{status.msg}</span>
          </div>
        )}

        {/* Сетка товаров */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {inventory.map((item) => (
            <div 
              key={item.id} 
              className={`p-6 rounded-3xl border-2 transition-all group ${
                isDark 
                ? 'bg-gray-800 border-gray-700 hover:border-green-500' 
                : 'bg-white border-transparent hover:border-green-400 shadow-md hover:shadow-xl'
              }`}
            >
              <div className={`w-20 h-20 rounded-2xl flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${isDark ? 'bg-gray-700 text-green-400' : 'bg-green-100 text-green-600'}`}>
                {item.icon}
              </div>
              <h3 className="text-xl font-bold mb-2">{item.name}</h3>
              <p className="text-sm opacity-60 mb-6 h-12 leading-tight">{item.desc}</p>
              
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-green-500 font-black text-xl">
                  {item.price} <Coins size={16} />
                </div>
                <button
                  disabled={loading || balance < item.price}
                  onClick={() => handleBuy(item)}
                  className={`px-5 py-2.5 rounded-xl font-bold transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed ${
                    balance >= item.price 
                    ? 'bg-green-500 text-white hover:bg-green-600 shadow-md' 
                    : 'bg-gray-500 text-gray-200'
                  }`}
                >
                  {loading ? '...' : 'Купить'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Инфо-блок */}
        <footer className="mt-20 text-center opacity-40 italic">
          <p>Каждая покупка поддерживает экологические инициативы по всему миру.</p>
        </footer>
      </div>
    </div>
  );
};

export default Shop;