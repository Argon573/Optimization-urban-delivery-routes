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

    // Импортируем YMapDefaultMarker
    const { YMapDefaultMarker } = await window.ymaps3.import('@yandex/ymaps3-markers@0.0.1');

    // Добавляем маркер склада
    const warehouseMarker = new YMapDefaultMarker({
      coordinates: warehouse,
      title: 'Склад',
      color: '#00cc00',
      draggable: false
    });
    map.addChild(warehouseMarker);
    markersRef.current.push(warehouseMarker);

    // Добавляем маркеры точек доставки
    deliveryPoints.forEach(point => {
      const marker = new YMapDefaultMarker({
        coordinates: point.coords,
        title: point.title,
        color: '#ff0000',
        draggable: false
      });
      map.addChild(marker);
      markersRef.current.push(marker);
    });
  };

  useEffect(() => {
    if (mapRef.current) return;

    if (!window.ymaps3) {
      console.error('ymaps3 not loaded');
      return;
    }

    let map;

    const init = async () => {
      await window.ymaps3.ready;

      map = new window.ymaps3.YMap(containerRef.current, {
        location: { center, zoom }
      });

      mapRef.current = map;

      const scheme = new window.ymaps3.YMapDefaultSchemeLayer();
      const features = new window.ymaps3.YMapDefaultFeaturesLayer();

      map.addChild(scheme);
      map.addChild(features);

      // Инициализируем маркеры
      await updateMarkers(map);
    };

    init();

    return () => {
      markersRef.current.forEach(marker => {
        try {
          mapRef.current?.removeChild(marker);
        } catch (e) {
          console.warn('Error removing marker:', e);
        }
      });
      markersRef.current = [];

      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []); // Только инициализация карты

  // Отдельный эффект для обновления маркеров при изменении данных
  useEffect(() => {
    if (mapRef.current) {
      updateMarkers(mapRef.current);
    }
  }, [warehouse, deliveryPoints]);

  return <div ref={containerRef} className={styles.deliveryMap}/>;
};

export default DeliveryMap;