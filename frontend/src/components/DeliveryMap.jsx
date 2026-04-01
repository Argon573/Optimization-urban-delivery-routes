import React, {useEffect, useRef} from 'react';
import styles from './deliveryMap.module.scss';

const DeliveryMap = ({center = [37.618423, 55.751244], zoom = 12}) => {
  const mapRef = useRef(null);
  const containerRef = useRef(null);

  const warehouse = [37.618423, 55.751244];

  const deliveryPoints = [
    {id: 1, coords: [37.588000, 55.735000], title: 'Магазин 1'},
    {id: 2, coords: [37.608000, 55.765000], title: 'Магазин 2'},
    {id: 3, coords: [37.628000, 55.740000], title: 'Магазин 3'}
  ];

  // 📍 Границы МО
  const bounds = {
    minLng: 35.0,
    maxLng: 40.5,
    minLat: 54.8,
    maxLat: 56.9
  };

  useEffect(() => {
    if (mapRef.current) return;

    if (!window.ymaps3) {
      console.error('ymaps3 not loaded');
      return;
    }

    let map;

    const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

    const init = async () => {
      await window.ymaps3.ready;

      map = new window.ymaps3.YMap(containerRef.current, {
        location: {center, zoom}
      });

      mapRef.current = map;

      const scheme = new window.ymaps3.YMapDefaultSchemeLayer();
      const features = new window.ymaps3.YMapDefaultFeaturesLayer();

      map.addChild(scheme);
      map.addChild(features);

      // 🔥 ЖЁСТКОЕ ограничение карты
      map.events.add('update', () => {
        const loc = map.location;

        const fixedCenter = [
          clamp(loc.center[0], bounds.minLng, bounds.maxLng),
          clamp(loc.center[1], bounds.minLat, bounds.maxLat)
        ];

        // если вышли за границы → возвращаем
        if (
            fixedCenter[0] !== loc.center[0] ||
            fixedCenter[1] !== loc.center[1]
        ) {
          map.update({
            location: {
              center: fixedCenter,
              zoom: loc.zoom
            }
          });
        }
      });

      const createMarker = (coords, color, icon) => {
        const el = document.createElement('div');

        el.innerHTML = icon;

        el.style.cssText = `
          background: ${color};
          border-radius: 50%;
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translate(-50%, -50%);
          cursor: pointer;
        `;

        const marker = new window.ymaps3.YMapMarker(
            {coordinates: coords},
            el
        );

        map.addChild(marker);
      };

      createMarker(warehouse, '#fbbc04', '📦');

      deliveryPoints.forEach(p =>
          createMarker(p.coords, '#ea4335', '📍')
      );
    };

    init();

    return () => {
      mapRef.current?.destroy();
      mapRef.current = null;
    };
  }, []);

  return <div ref={containerRef} className={styles.deliveryMap}/>;
};

export default DeliveryMap;