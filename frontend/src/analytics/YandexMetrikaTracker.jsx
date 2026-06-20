import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { hitYandexMetrika, scheduleYandexMetrikaInit } from './yandexMetrika';

const YandexMetrikaTracker = () => {
    const location = useLocation();

    useEffect(() => {
        scheduleYandexMetrikaInit();
    }, []);

    useEffect(() => {
        hitYandexMetrika(`${location.pathname}${location.search}`);
    }, [location.pathname, location.search]);

    return null;
};

export default YandexMetrikaTracker;
