// components/deliveryMap/MarkersList.jsx
import React, { memo } from 'react';
import Marker from './Marker';

const MarkersList = memo(({ YMapMarker, warehouse, deliveryPoints, onMarkerClick }) => {
  return (
      <>
        {/* Маркер склада */}
        {warehouse && (
            <Marker
                YMapMarker={YMapMarker}
                key="warehouse"
                coordinates={warehouse.coordinates}
                title={warehouse.title}
                isWarehouse={true}
                onClick={onMarkerClick}
            />
        )}

        {/* Маркеры точек доставки */}
        {deliveryPoints.map(point => (
            <Marker
                YMapMarker={YMapMarker}
                key={point.id}
                coordinates={point.coords}
                title={point.title}
                color="#ff0000"
                onClick={onMarkerClick}
            />
        ))}
      </>
  );
});

MarkersList.displayName = 'MarkersList';

export default MarkersList;