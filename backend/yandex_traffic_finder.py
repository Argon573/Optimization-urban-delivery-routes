import math
import json
import requests
import logging
import time
from datetime import datetime
from typing import List, Dict, Any

# Настройка логирования
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


class SimpleYandexTrafficFinder:
    def __init__(self):
        self.session = requests.Session()
        self.setup_headers()

    def setup_headers(self):
        """Простая настройка заголовков"""
        self.session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
            "Accept": "application/json, text/javascript, */*; q=0.01",
            "Accept-Language": "ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7",
            "Referer": "https://yandex.ru/maps/",
        })

    def haversine(self, lat1: float, lon1: float, lat2: float, lon2: float) -> float:
        """Расчет расстояния между точками в метрах"""
        R = 6371000
        phi1, phi2 = math.radians(lat1), math.radians(lat2)
        dphi = math.radians(lat2 - lat1)
        dlambda = math.radians(lon2 - lon1)
        a = math.sin(dphi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(dlambda / 2) ** 2
        return 2 * R * math.atan2(math.sqrt(a), math.sqrt(1 - a))

    def get_traffic_data_simple(self, lat: float, lon: float) -> Dict:
        """
        Простой запрос к рабочему API Яндекс Пробок
        Используем только проверенные домены
        """
        try:
            # Основной рабочий эндпоинт
            url = "https://jams.maps.yandex.net/mtrproxy/trf/"

            params = {
                'lang': 'ru_RU',
                'll': f'{lon},{lat}',
                'z': '13',
                'l': 'trf,trfe',
                'size': '10,10',
                'tm': str(int(time.time())),
            }

            logger.info("Отправляем запрос к API пробок...")
            response = self.session.get(url, params=params, timeout=10)

            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Статус ответа: {response.status_code}")
                return None

        except Exception as e:
            logger.error(f"Ошибка запроса: {e}")
            return None

    def analyze_traffic_data(self, data: Dict, lat: float, lon: float) -> List[Dict]:
        """Анализ данных о пробках"""
        events = []

        if not data or not isinstance(data, dict):
            return events

        try:
            # Анализируем данные о пробках
            if 'jams' in data and isinstance(data['jams'], list):
                for jam in data['jams']:
                    event = self.parse_jam(jam, lat, lon)
                    if event:
                        events.append(event)

            # Анализируем дорожные события
            if 'events' in data and isinstance(data['events'], list):
                for event_data in data['events']:
                    event = self.parse_road_event(event_data, lat, lon)
                    if event:
                        events.append(event)

        except Exception as e:
            logger.error(f"Ошибка анализа данных: {e}")

        return events

    def parse_jam(self, jam: Dict, lat: float, lon: float) -> Dict:
        """Парсинг данных о пробке"""
        try:
            if 'geometry' in jam and 'coordinates' in jam['geometry']:
                coords = jam['geometry']['coordinates']
                if coords and isinstance(coords, list) and len(coords) >= 2:
                    jam_lon, jam_lat = coords[0], coords[1]
                    distance = self.haversine(lat, lon, jam_lat, jam_lon)

                    severity = jam.get('level', 'unknown')
                    speed = jam.get('speed', 0)

                    return {
                        'id': f"jam_{jam.get('id', int(time.time()))}",
                        'title': self.get_jam_title(severity),
                        'type': 'traffic_jam',
                        'position': [jam_lon, jam_lat],
                        'source': 'Yandex.Traffic',
                        'description': f"Уровень пробки: {severity}, скорость: {speed} км/ч",
                        'distance_m': round(distance, 1),
                        'severity': severity,
                        'speed_kmh': speed
                    }

        except Exception as e:
            logger.debug(f"Ошибка парсинга пробки: {e}")

        return None

    def get_jam_title(self, severity: str) -> str:
        """Заголовок для пробки"""
        titles = {
            '0': 'Свободно',
            '1': 'Небольшая пробка',
            '2': 'Пробка',
            '3': 'Сильная пробка',
            '4': 'Очень сильная пробка'
        }
        return titles.get(severity, 'Пробка на дороге')

    def parse_road_event(self, event_data: Dict, lat: float, lon: float) -> Dict:
        """Парсинг дорожного события"""
        try:
            if 'point' in event_data and isinstance(event_data['point'], list) and len(event_data['point']) >= 2:
                event_lon, event_lat = event_data['point'][0], event_data['point'][1]
                distance = self.haversine(lat, lon, event_lat, event_lon)

                event_type = event_data.get('type', 'unknown')
                description = event_data.get('description', '')

                return {
                    'id': f"event_{event_data.get('id', int(time.time()))}",
                    'title': self.get_event_title(event_type, description),
                    'type': self.map_event_type(event_type),
                    'position': [event_lon, event_lat],
                    'source': 'Yandex.Traffic',
                    'description': description,
                    'distance_m': round(distance, 1),
                    'original_type': event_type
                }

        except Exception as e:
            logger.debug(f"Ошибка парсинга события: {e}")

        return None

    def get_event_title(self, event_type: str, description: str) -> str:
        """Заголовок для дорожного события"""
        titles = {
            'accident': 'ДТП',
            'road_works': 'Дорожные работы',
            'road_closure': 'Перекрытие дороги',
            'danger': 'Опасность на дороге',
            'police': 'Патруль ДПС'
        }

        base_title = titles.get(event_type, 'Дорожное событие')
        if description and len(description) < 50:
            return f"{base_title}: {description}"
        return base_title

    def map_event_type(self, event_type: str) -> str:
        """Маппинг типов событий"""
        mapping = {
            'accident': 'accident',
            'road_works': 'repair',
            'road_closure': 'closure',
            'danger': 'hazard',
            'police': 'police'
        }
        return mapping.get(event_type, 'unknown')

    def find_events(self, lat: float, lon: float, radius_m: int) -> List[Dict]:
        """Основной метод поиска событий"""
        logger.info(f"Поиск вокруг: {lat}, {lon}, радиус: {radius_m}м")

        # Делаем только ОДИН запрос
        traffic_data = self.get_traffic_data_simple(lat, lon)

        events = []
        if traffic_data:
            events = self.analyze_traffic_data(traffic_data, lat, lon)

        # Фильтруем по радиусу
        filtered_events = [
            event for event in events
            if event and event.get('distance_m', float('inf')) <= radius_m
        ]

        return filtered_events


def main():
    """Запуск программы"""
    print("🚦 Поиск дорожных событий Яндекс Карт")
    print("=" * 50)

    finder = SimpleYandexTrafficFinder()

    # Всего 2 локации для теста
    locations = [
        ("Москва, центр", 55.7558, 37.6173),
        ("СПб, центр", 59.9343, 30.3351),
    ]

    radius = 5000  # 5 км
    results = []

    for name, lat, lon in locations:
        try:
            print(f"\n📍 {name}")
            print(f"📌 Координаты: {lat}, {lon}")

            # Делаем по одному запросу на локацию
            events = finder.find_events(lat, lon, radius)

            result = {
                "location": name,
                "coordinates": [lat, lon],
                "radius_m": radius,
                "found_events": len(events),
                "events": events,
                "timestamp": datetime.now().isoformat()
            }

            results.append(result)

            print(f"🎯 Найдено событий: {len(events)}")

            # Вывод событий
            for i, event in enumerate(events, 1):
                print(f"   {i}. {event['title']}")
                print(f"      📍 {event['distance_m']}м | 🏢 {event['source']}")
                if event['description']:
                    print(f"      📝 {event['description']}")
                print()

            # Пауза между запросами
            if len(locations) > 1:
                print("⏳ Ожидание 5 секунд...")
                time.sleep(5)

        except Exception as e:
            print(f"❌ Ошибка: {e}")
            continue

    # Сохранение результатов
    if results:
        filename = f"traffic_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        with open(filename, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        print(f"💾 Результаты сохранены в {filename}")

    # Статистика
    total_events = sum(r['found_events'] for r in results)
    print(f"\n📊 Итого: {total_events} событий на {len(results)} локациях")


if __name__ == "__main__":
    main()