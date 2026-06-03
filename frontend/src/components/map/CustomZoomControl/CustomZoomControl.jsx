import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import styles from './CustomZoomControl.module.scss';

const ZOOM_IN_ICON = `
  <svg class="${styles.zoomIcon}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M12 6v12M6 12h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>
`;

const ZOOM_OUT_ICON = `
  <svg class="${styles.zoomIcon}" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
    <path d="M6 12h12" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  </svg>
`;

const CustomZoomControl = () => {
    const map = useMap();

    useEffect(() => {
        const CustomZoom = L.Control.extend({
            onAdd() {
                const container = L.DomUtil.create('div', `${styles.zoomContainer} custom-icon-zoom`);

                L.DomEvent.disableClickPropagation(container);
                L.DomEvent.disableScrollPropagation(container);

                const zoomIn = L.DomUtil.create('button', styles.zoomBtn, container);
                zoomIn.type = 'button';
                zoomIn.id = 'zoom-in';
                zoomIn.setAttribute('aria-label', 'Приблизить');
                zoomIn.innerHTML = ZOOM_IN_ICON;

                const zoomOut = L.DomUtil.create('button', styles.zoomBtn, container);
                zoomOut.type = 'button';
                zoomOut.id = 'zoom-out';
                zoomOut.setAttribute('aria-label', 'Отдалить');
                zoomOut.innerHTML = ZOOM_OUT_ICON;

                L.DomEvent.on(zoomIn, 'click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    map.zoomIn();
                });
                L.DomEvent.on(zoomOut, 'click', (e) => {
                    L.DomEvent.stopPropagation(e);
                    map.zoomOut();
                });

                return container;
            },
        });

        const zoomControl = new CustomZoom({ position: 'topright' });
        map.addControl(zoomControl);

        return () => {
            map.removeControl(zoomControl);
        };
    }, [map]);

    return null;
};

export default CustomZoomControl;
