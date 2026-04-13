// components/deliveryMap/Marker.jsx
import React from 'react';

const Marker = ({ YMapMarker, coordinates, title, color = '#ff0000', isWarehouse = false, onClick }) => {
  const markerStyle = {
    width: '30px',
    height: '30px',
    backgroundColor: isWarehouse ? '#00cc00' : color,
    borderRadius: '50%',
    border: '2px solid white',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
    cursor: 'pointer',
    transform: 'translate(-50%, -50%)',
    transition: 'transform 0.2s ease'
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1.2)';
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = 'translate(-50%, -50%) scale(1)';
  };

  const handleClick = () => {
    if (onClick) {
      onClick({ coordinates, title, isWarehouse });
    }
  };

  // Используем YMapMarker из пропсов
  return (
      <YMapMarker coordinates={coordinates}>
        <div
            style={markerStyle}
            title={title}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={handleClick}
        />
      </YMapMarker>
  );
};

export default Marker;