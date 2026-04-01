// components/deliveryMap/DeliveryMap.jsx
import React, { useEffect, useRef } from 'react';
import styles from './deliveryMap.module.scss';

const DeliveryMap = ({
                       center = [37.618423, 55.751244],
                       zoom = 12,
                       warehouse = [37.618423, 55.751244],
                       deliveryPoints = []
                     }) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);
  const markersRef = useRef([]);

  // Функция для создания HTML-элемента маркера
  const createMarkerElement = (title, color = '#ff0000') => {
    const el = document.createElement('div');
    el.style.width = '30px';
    el.style.height = '30px';
    el.style.backgroundColor = color;
    el.style.borderRadius = '50%';
    el.style.border = '2px solid white';
    el.style.boxShadow = '0 2px 6px rgba(0,0,0,0.3)';
    el.style.cursor = 'pointer';
    el.style.transform = 'translate(-50%, -50%)';
    el.style.transition = 'transform 0.2s ease';
    el.title = title;

    el.onmouseenter = () => {
      el.style.transform = 'translate(-50%, -50%) scale(1.2)';
    };
    el.onmouseleave = () => {
      el.style.transform = 'translate(-50%, -50%) scale(1)';
    };
    el.onclick = () => {
      console.log('Клик по маркеру:', title);
    };

    return el;
  };

  // Функция для обновления маркеров
  const updateMarkers = async (map) => {
    // Удаляем старые маркеры
    markersRef.current.forEach(marker => {
      try {
        map?.removeChild(marker);
      } catch (e) {
        console.warn('Error removing marker:', e);
      }
    });
    markersRef.current = [];

    if (!map) return;

    const { YMapMarker } = window.ymaps3;

    // Добавляем маркер склада
    const warehouseElement = createMarkerElement('Склад', '#00cc00');
    const warehouseMarker = new YMapMarker(
        { coordinates: warehouse, draggable: false },
        warehouseElement
    );
    map.addChild(warehouseMarker);
    markersRef.current.push(warehouseMarker);

    // Добавляем маркеры точек доставки
    deliveryPoints.forEach(point => {
      const markerElement = createMarkerElement(point.title, '#ff0000');
      const marker = new YMapMarker(
          { coordinates: point.coords, draggable: false },
          markerElement
      );
      map.addChild(marker);
      markersRef.current.push(marker);
    });
  };

  // Инициализация карты
  useEffect(() => {
    // Защита от двойной инициализации в React StrictMode
    if (mapRef.current) return;

    if (!window.ymaps3) {
      console.error('ymaps3 not loaded');
      return;
    }

    let map;

    const init = async () => {
      await window.ymaps3.ready;

      // Создаем карту
      map = new window.ymaps3.YMap(containerRef.current, {
        location: { center, zoom }
      });

      mapRef.current = map;

      // 🔥 ВАЖНО: добавляем слой схематической карты
      const scheme = new window.ymaps3.YMapDefaultSchemeLayer();
      map.addChild(scheme);

      // Добавляем слой с объектами (можно опционально)
      const features = new window.ymaps3.YMapDefaultFeaturesLayer();
      map.addChild(features);

      // Инициализируем маркеры
      await updateMarkers(map);
    };

    init();

    return () => {
      // Очищаем маркеры
      markersRef.current.forEach(marker => {
        try {
          mapRef.current?.removeChild(marker);
        } catch (e) {
          console.warn('Error removing marker:', e);
        }
      });
      markersRef.current = [];

      // Уничтожаем карту
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []); // Пустой массив — инициализация только один раз

  // Обновляем маркеры при изменении данных
  useEffect(() => {
    if (mapRef.current) {
      updateMarkers(mapRef.current);
    }
  }, [warehouse, deliveryPoints]);

  return <div ref={containerRef} className={styles.deliveryMap} />;
};

export default DeliveryMap;