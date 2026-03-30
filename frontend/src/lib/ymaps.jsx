// src/lib/ymaps.jsx
import React from 'react';
import ReactDOM from 'react-dom';

// Функция для загрузки API
export const loadYmaps = async () => {
  // Проверяем, загружена ли уже библиотека
  if (typeof window.ymaps3 === 'undefined') {
    throw new Error('Яндекс.Карты не загружены. Проверьте подключение скрипта в index.html');
  }

  const [ymaps3React] = await Promise.all([
    window.ymaps3.import('@yandex/ymaps3-reactify'),
    window.ymaps3.ready
  ]);

  const reactify = ymaps3React.reactify.bindTo(React, ReactDOM);
  const { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker } = reactify.module(window.ymaps3);

  return { YMap, YMapDefaultSchemeLayer, YMapDefaultFeaturesLayer, YMapMarker, reactify };
};