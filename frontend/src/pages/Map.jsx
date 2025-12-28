import React, { useState, useMemo, useEffect } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMapEvents } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import 'leaflet/dist/leaflet.css';

// Данные по 30 городам Казахстана
const citiesData = [
  { id: 1, name: "Алматы", lat: 43.2389, lng: 76.8897, status: "bad", problems: "Смог, ТЭЦ-2 на угле, высокая плотность автотранспорта." },
  { id: 2, name: "Астана", lat: 51.1605, lng: 71.4278, status: "medium", problems: "Дым от частного сектора, выбросы ТЭЦ, пыльные бури." },
  { id: 3, name: "Усть-Каменогорск", lat: 49.952, lng: 82.610, status: "bad", problems: "Выбросы тяжелых металлов (Казцинк, УМЗ), диоксид серы." },
  { id: 4, name: "Караганда", lat: 49.801, lng: 73.102, status: "bad", problems: "Угольная пыль, выбросы металлургических производств и ТЭЦ." },
  { id: 5, name: "Атырау", lat: 47.094, lng: 51.923, status: "bad", problems: "Сероводород, испарения «Тухлой балки», нефтезавод АНПЗ." },
  { id: 6, name: "Павлодар", lat: 52.287, lng: 76.967, status: "medium", problems: "Алюминиевый и электролизный заводы, выбросы сажи." },
  { id: 7, name: "Шымкент", lat: 42.324, lng: 69.590, status: "medium", problems: "Нефтехимические заводы, высокая загазованность дорог." },
  { id: 8, name: "Актобе", lat: 50.283, lng: 57.166, status: "bad", problems: "Запах канализации (сероводород), завод ферросплавов." },
  { id: 9, name: "Темиртау", lat: 50.054, lng: 72.964, status: "bad", problems: "Экстремальный уровень выбросов АрселорМиттал, черный снег." },
  { id: 10, name: "Кокшетау", lat: 53.283, lng: 69.403, status: "good", problems: "В основном печное отопление в частном секторе." },
  { id: 11, name: "Петропавловск", lat: 54.875, lng: 69.162, status: "good", problems: "Устаревшие очистные сооружения, цветение воды в Ишиме." },
  { id: 12, name: "Костанай", lat: 53.214, lng: 63.624, status: "good", problems: "Автомобильные выбросы, локальные свалки." },
  { id: 13, name: "Уральск", lat: 51.233, lng: 51.366, status: "good", problems: "Загрязнение реки Урал, трансграничные факторы." },
  { id: 14, name: "Кызылорда", lat: 44.839, lng: 65.511, status: "medium", problems: "Высокая запыленность, влияние высохшего дна Арала." },
  { id: 15, name: "Актау", lat: 43.65, lng: 51.16, status: "medium", problems: "Хвостохранилище Кошкар-Ата, дефицит пресной воды." },
  { id: 16, name: "Тараз", lat: 42.9, lng: 71.36, status: "medium", problems: "Фосфорное производство, химическое загрязнение почвы." },
  { id: 17, name: "Талдыкорган", lat: 45.01, lng: 78.37, status: "good", problems: "Сезонное сжигание мусора и угля." },
  { id: 18, name: "Семей", lat: 50.41, lng: 80.25, status: "medium", problems: "Остаточная радиация полигона, выбросы цементного завода." },
  { id: 19, name: "Балхаш", lat: 46.84, lng: 74.98, status: "bad", problems: "Медеплавильный завод, загрязнение акватории озера." },
  { id: 20, name: "Рудный", lat: 52.96, lng: 63.12, status: "medium", problems: "Пыль от разработки карьеров ССГПО." },
  { id: 21, name: "Жезказган", lat: 47.79, lng: 67.70, status: "bad", problems: "Выбросы медеплавильного завода, тяжелые металлы." },
  { id: 22, name: "Риддер", lat: 50.35, lng: 83.51, status: "bad", problems: "Хвостохранилища, загрязнение рек тяжелыми металлами." },
  { id: 23, name: "Экибастуз", lat: 51.72, lng: 75.32, status: "bad", problems: "Крупнейшие угольные разрезы, ГРЭС-1 и ГРЭС-2." },
  { id: 24, name: "Степногорск", lat: 53.16, lng: 71.88, status: "medium", problems: "Золоотвалы, химическая промышленность." },
  { id: 25, name: "Кентау", lat: 43.51, lng: 68.58, status: "medium", problems: "Пыление заброшенных рудников и шахт." },
  { id: 26, name: "Конаев", lat: 43.87, lng: 77.06, status: "good", problems: "Мусор в прибрежной зоне Капшагая." },
  { id: 27, name: "Сатпаев", lat: 47.90, lng: 67.53, status: "bad", problems: "Горнорудная промышленность, просадка грунта." },
  { id: 28, name: "Жанаозен", lat: 43.34, lng: 52.85, status: "medium", problems: "Нефтяные отходы, загрязнение подземных вод." },
  { id: 29, name: "Аркалык", lat: 50.24, lng: 66.91, status: "good", problems: "Заброшенные промышленные объекты." },
  { id: 30, name: "Шу", lat: 43.59, lng: 73.74, status: "good", problems: "Запыленность, транспортный узел." }
];

const getColor = (status) => {
  switch (status) {
    case 'bad': return '#ff4d4d';     // Красный
    case 'medium': return '#ffcc00';  // Желтый
    case 'good': return '#2eb82e';    // Зеленый
    default: return '#808080';
  }
};

// Вспомогательный компонент для отслеживания зума
const ZoomHandler = ({ setZoom }) => {
  useMapEvents({
    zoomend: (e) => setZoom(e.target.getZoom()),
  });
  return null;
};

const EcoMap = () => {
  const [zoom, setZoom] = useState(5);

  // Динамический радиус: точка становится визуально меньше при отдалении
  const markerRadius = useMemo(() => {
    if (zoom >= 11) return 6;
    if (zoom >= 9) return 8;
    if (zoom >= 7) return 11;
    return 14;
  }, [zoom]);

  const cardStyle = {
    background: '#fff',
    padding: '20px',
    borderRadius: '12px',
    boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
    border: '1px solid #edf2f7'
  };

  return (
    <div style={{ backgroundColor: '#f7fafc', minHeight: '100vh', fontFamily: '"Inter", sans-serif' }}>
      
      {/* Секция карты */}
      <div style={{ padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '20px', color: '#2d3748' }}>Экологическая карта Казахстана</h1>
        
        <div style={{ 
          position: 'relative', 
          height: '600px', 
          width: '100%', 
          borderRadius: '20px', 
          overflow: 'hidden',
          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
        }}>
          {/* Легенда внутри карты */}
          <div style={{
            position: 'absolute', top: 20, right: 20, zIndex: 1000,
            background: 'rgba(255, 255, 255, 0.9)', padding: '15px', borderRadius: '12px',
            backdropFilter: 'blur(8px)', border: '1px solid rgba(0,0,0,0.1)', fontSize: '14px'
          }}>
            <strong style={{ display: 'block', marginBottom: '8px' }}>Статус воздуха:</strong>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff4d4d' }} /> Ужасно
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#ffcc00' }} /> Средне
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ width: 12, height: 12, borderRadius: '50%', background: '#2eb82e' }} /> Нормально
            </div>
          </div>

          <MapContainer center={[48.0, 67.0]} zoom={5} style={{ height: '100%', width: '100%' }}>
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <ZoomHandler setZoom={setZoom} />
            
            <MarkerClusterGroup chunkedLoading>
              {citiesData.map((city) => (
                <CircleMarker
                  key={city.id}
                  center={[city.lat, city.lng]}
                  radius={markerRadius}
                  pathOptions={{
                    fillColor: getColor(city.status),
                    color: '#fff',
                    weight: 2,
                    fillOpacity: 0.8
                  }}
                  eventHandlers={{
                    mouseover: (e) => e.target.openPopup(),
                  }}
                >
                  <Popup>
                    <div style={{ minWidth: '180px' }}>
                      <h3 style={{ margin: '0 0 8px 0', color: '#1a202c' }}>{city.name}</h3>
                      <p style={{ fontSize: '14px', margin: 0, color: '#4a5568' }}>
                        <strong>Проблемы:</strong> {city.problems}
                      </p>
                    </div>
                  </Popup>
                </CircleMarker>
              ))}
            </MarkerClusterGroup>
          </MapContainer>
        </div>
      </div>

      {/* Информационный блок под картой */}
      <div style={{ maxWidth: '1100px', margin: '40px auto', padding: '0 20px' }}>
        
        <section style={{ marginBottom: '50px' }}>
          <h2 style={{ color: '#2d3748', borderLeft: '5px solid #ff4d4d', paddingLeft: '15px' }}>
            Критические экологические проблемы
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '25px', marginTop: '30px' }}>
            <div style={cardStyle}>
              <h3 style={{ color: '#e53e3e' }}>💨 Загрязнение воздуха</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>
                Основной источник — устаревшие угольные ТЭЦ и системы отопления частного сектора. В безветренную погоду над городами скапливается опасный смог (PM2.5).
              </p>
            </div>
            <div style={cardStyle}>
              <h3 style={{ color: '#3182ce' }}>🏭 Промышленные гиганты</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>
                В городах Темиртау, Усть-Каменогорск и Балхаш заводы выбрасывают тысячи тонн диоксида серы и тяжелых металлов ежегодно.
              </p>
            </div>
            <div style={cardStyle}>
              <h3 style={{ color: '#38a169' }}>🏜️ Пыльные и солевые бури</h3>
              <p style={{ color: '#718096', lineHeight: '1.6' }}>
                Опустынивание и обмеление Аральского моря приводит к переносу ядовитых солей на южные и западные регионы страны.
              </p>
            </div>
          </div>
        </section>

        

        <section style={{ backgroundColor: '#fff', padding: '40px', borderRadius: '20px', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
          <h2 style={{ color: '#2d3748', marginBottom: '25px' }}>Что нужно сделать для улучшения ситуации?</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px' }}>
            <ul style={{ lineHeight: '2', color: '#4a5568', paddingLeft: '20px' }}>
              <li><strong>Газификация ТЭЦ:</strong> Полный отказ от угля в пользу природного газа.</li>
              <li><strong>Эко-фильтры:</strong> Обязательная установка скрубберов и рукавных фильтров на заводах.</li>
              <li><strong>Зеленый транспорт:</strong> Переход общественного транспорта на газ и электричество.</li>
            </ul>
            <ul style={{ lineHeight: '2', color: '#4a5568', paddingLeft: '20px' }}>
              <li><strong>Мониторинг:</strong> Расширение сети независимых датчиков качества воздуха AirKaz.</li>
              <li><strong>Лесополосы:</strong> Создание барьеров для удержания влаги и защиты от степной пыли.</li>
              <li><strong>Переработка отходов:</strong> Внедрение раздельного сбора и строительство заводов полного цикла.</li>
            </ul>
          </div>
          
          <div style={{ 
            marginTop: '30px', 
            padding: '20px', 
            borderRadius: '10px', 
            background: '#ebf8ff', 
            borderLeft: '4px solid #3182ce',
            color: '#2a4365'
          }}>
            <strong>Важно понимать:</strong> Экологическое состояние напрямую влияет на продолжительность жизни. Улучшение экологии на 10% способно снизить риск респираторных заболеваний среди населения на 15-20%.
          </div>
        </section>
        
        <footer style={{ textAlign: 'center', padding: '40px 0', color: '#a0aec0', fontSize: '14px' }}>
          &copy; 2025 Эко-Карта Казахстана. Данные предоставлены в ознакомительных целях.
        </footer>
      </div>
    </div>
  );
};

export default EcoMap;