import osmtogeojson from 'osmtogeojson';

export async function getMap() {
    const url = 'https://api.openstreetmap.org/api/0.6/map?bbox=-0.125,51.499,-0.122,51.501';

    try {
        const response = await fetch(url);

        // Проверяем, успешен ли ответ
        if (!response.ok) {
            throw new Error(`HTTP ошибка! статус: ${response.status}`);
        }

        const xml = await response.text();

        // Парсим XML
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xml, "text/xml");

        // Проверяем ошибки парсинга XML
        const parserError = xmlDoc.querySelector('parsererror');
        if (parserError) {
            throw new Error('Ошибка парсинга XML');
        }

        // Получаем все узлы (nodes)
        const nodes = xmlDoc.getElementsByTagName("node");
        console.log(`Карта успешно загружена! Найдено ${nodes.length} узлов`);

        // Преобразуем OSM XML в GeoJSON
        const geojson = osmtogeojson(xmlDoc);
        console.log('GeoJSON готов к использованию:', geojson);

        return geojson;

    } catch (error) {
        console.error('Ошибка загрузки карты:', error);
        throw error; // Пробрасываем ошибку дальше
    }
}

// Пример использования:
// const geoJsonData = await getMap();