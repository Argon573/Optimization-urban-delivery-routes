import React, { useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';

const DeliveryMap = ({ center = [37.618423, 55.751244], zoom = 12 }) => {
  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const rootRef = useRef(null);

  // Координаты для Яндекс.Карт: [долгота, широта]
  const warehouse = [37.618423, 55.751244];
  const deliveryPoints = [
    { id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1', address: 'ул. Примерная, 1' },
    { id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2', address: 'ул. Тестовая, 2' },
    { id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3', address: 'пр. Демонстрационный, 3' }
  ];

  useEffect(() => {
    // Ждем загрузки API
    if (typeof window.ymaps3 === 'undefined') {
      console.error('❌ Яндекс.Карты не загружены. Проверьте подключение скрипта в index.html');
      return;
    }

    let map = null;

    const initMap = async () => {
      try {
        await window.ymaps3.ready;

        // Создаем карту
        map = new window.ymaps3.YMap(mapContainerRef.current, {
          location: {
            center: center,
            zoom: zoom,
          },
        });

        // Добавляем базовые слои
        const schemeLayer = new window.ymaps3.YMapDefaultSchemeLayer();
        const featuresLayer = new window.ymaps3.YMapDefaultFeaturesLayer();
        map.addChild(schemeLayer);
        map.addChild(featuresLayer);

        // Функция для создания маркера
        const createMarker = (coords, color, icon, title = '') => {
          const markerElement = document.createElement('div');
          markerElement.innerHTML = icon;
          markerElement.style.cssText = `
            background-color: ${color};
            border-radius: 50%;
            width: 36px;
            height: 36px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            transform: translate(-50%, -50%);
            font-size: 18px;
            cursor: pointer;
            box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            transition: transform 0.2s;
          `;

          markerElement.onmouseenter = () => {
            markerElement.style.transform = 'translate(-50%, -50%) scale(1.1)';
          };
          markerElement.onmouseleave = () => {
            markerElement.style.transform = 'translate(-50%, -50%) scale(1)';
          };

          if (title) {
            markerElement.title = title;
          }

          const marker = new window.ymaps3.YMapMarker(
              { coordinates: coords },
              markerElement
          );
          map.addChild(marker);
        };

        // Добавляем маркер склада
        createMarker(warehouse, '#FBBC04', '📦', 'Склад');

        // Добавляем маркеры точек доставки
        deliveryPoints.forEach(point => {
          createMarker(point.coords, '#EA4335', '📍', point.title);
        });

        mapInstanceRef.current = map;
        console.log('✅ Карта Яндекс.Карт успешно загружена');
      } catch (error) {
        console.error('❌ Ошибка при создании карты:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
      if (rootRef.current) {
        rootRef.current.unmount();
        rootRef.current = null;
      }
    };
  }, [center, zoom]);

  return (
      <div
          ref={mapContainerRef}
          style={{ width: '100%', height: '100%' }}
      />
  );
};

export default DeliveryMap;