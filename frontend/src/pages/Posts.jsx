import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, Coins, Image as ImageIcon, Loader2, AlertCircle, Plus, X, Upload } from "lucide-react";

const API_URL = "http://localhost:8000";

const Posts = ({ theme }) => {
  const [posts, setPosts] = useState([]);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Состояния для формы загрузки
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);

  const navigate = useNavigate();
  const isDark = theme === "dark";
  const token = localStorage.getItem("access_token");

  const fetchData = useCallback(async () => {
    if (!token) { navigate("/login"); return; }
    setLoading(true);
    try {
      const headers = { "Authorization": `Bearer ${token}` };
      const [postsRes, balanceRes] = await Promise.all([
        fetch(`${API_URL}/images`, { headers }),
        fetch(`${API_URL}/user/balance`, { headers }),
      ]);
      if (postsRes.status === 401) { navigate("/login"); return; }
      const postsData = await postsRes.json();
      const balanceData = await balanceRes.json();
      setPosts(Array.isArray(postsData) ? postsData : []);
      setBalance(balanceData.eco_coins || 0);
    } catch (err) {
      setError("Ошибка загрузки данных");
    } finally {
      setLoading(false);
    }
  }, [token, navigate]);

  useEffect(() => { fetchData(); }, [fetchData]);

  // Обработка выбора файла
  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
    }
  };

  // Отправка фото на бэкенд (где работает YOLO)
  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file || !title) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);
    formData.append("title", title);
    formData.append("description", description);

    try {
      const res = await fetch(`${API_URL}/images`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${token}` },
        body: formData, // Браузер сам выставит Content-Type: multipart/form-data
      });

      if (res.ok) {
        const newPost = await res.json();
        setPosts([newPost, ...posts]); // Добавляем новый пост в начало
        setIsModalOpen(false);
        setTitle(""); setDescription(""); setFile(null); setPreview(null);
        // Обновляем баланс после анализа YOLO
        fetchData();
      } else {
        alert("Ошибка при анализе или загрузке");
      }
    } catch (err) {
      alert("Ошибка сети");
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Удалить это фото?")) return;
    try {
      const res = await fetch(`${API_URL}/images/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` },
      });
      if (res.ok) {
        setPosts(posts.filter(p => p.id !== id));
        fetchData();
      }
    } catch (err) { alert("Ошибка при удалении"); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <Loader2 className="animate-spin text-green-500" size={40} />
    </div>
  );

  return (
    <div className={`min-h-screen p-6 ${isDark ? "bg-gray-900 text-white" : "bg-green-50 text-gray-900"}`}>
      <div className="max-w-6xl mx-auto">
        
        {/* Хедер */}
        <div className={`flex justify-between items-center mb-8 p-6 rounded-2xl shadow-lg ${isDark ? "bg-gray-800" : "bg-white"}`}>
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-bold">EcoGallery</h1>
            <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-1.5 rounded-full">
              <Coins size={18} />
              <span className="font-bold">{balance}</span>
            </div>
          </div>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-xl transition"
          >
            <Plus size={20} /> Добавить фото
          </button>
        </div>

        {/* Сетка */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {posts.map(post => (
            <div key={post.id} className={`rounded-2xl overflow-hidden shadow-md ${isDark ? "bg-gray-800" : "bg-white"} group relative`}>
              <img src={post.url} alt={post.title} className="w-full h-56 object-cover" />
              <button 
                onClick={() => handleDelete(post.id)}
                className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg opacity-0 group-hover:opacity-100 transition"
              >
                <Trash2 size={18} />
              </button>
              <div className="p-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold truncate">{post.title}</h3>
                  <span className="text-green-500 text-xs font-black">+{post.reward}</span>
                </div>
                <p className="text-xs opacity-60 line-clamp-2">{post.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Модальное окно загрузки */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className={`w-full max-w-md p-8 rounded-3xl shadow-2xl ${isDark ? "bg-gray-800 text-white" : "bg-white"}`}>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Новый Эко-Пост</h2>
                <button onClick={() => setIsModalOpen(false)}><X /></button>
              </div>
              
              <form onSubmit={handleUpload} className="space-y-4">
                <div 
                  className="border-2 border-dashed border-gray-400 rounded-2xl h-48 flex flex-col items-center justify-center relative overflow-hidden"
                  onClick={() => document.getElementById('fileInput').click()}
                >
                  {preview ? (
                    <img src={preview} className="w-full h-full object-cover" alt="Preview" />
                  ) : (
                    <>
                      <Upload className="text-gray-400 mb-2" size={32} />
                      <span className="text-sm text-gray-500">Нажмите, чтобы выбрать фото</span>
                    </>
                  )}
                  <input type="file" id="fileInput" hidden onChange={handleFileChange} accept="image/*" />
                </div>

                <input 
                  type="text" placeholder="Заголовок (например: Сбор пластика)" 
                  className={`w-full p-3 rounded-xl border ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50"}`}
                  value={title} onChange={(e) => setTitle(e.target.value)} required
                />
                
                <textarea 
                  placeholder="Описание..." 
                  className={`w-full p-3 rounded-xl border h-24 ${isDark ? "bg-gray-700 border-gray-600" : "bg-gray-50"}`}
                  value={description} onChange={(e) => setDescription(e.target.value)}
                />

                <button 
                  disabled={uploading}
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-xl font-bold transition disabled:opacity-50"
                >
                  {uploading ? "YOLO анализирует фото..." : "Опубликовать и получить баллы"}
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Posts;