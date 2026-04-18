import React, { createContext, useContext, useState } from 'react';

const PointsContext = createContext();

export const usePoints = () => {
    const context = useContext(PointsContext);
    if (!context) {
        throw new Error('usePoints must be used within PointsProvider');
    }
    return context;
};

export const PointsProvider = ({ children }) => {
    const [points, setPoints] = useState([]);

    const addPoint = (point) => {
        setPoints(prev => [...prev, { ...point, id: Date.now() }]);
    };

    const removePoint = (id) => {
        setPoints(prev => prev.filter(point => point.id !== id));
    };

    return (
        <PointsContext.Provider value={{ points, addPoint, removePoint }}>
            {children}
        </PointsContext.Provider>
    );
};