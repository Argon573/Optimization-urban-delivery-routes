# Backend для маршрутизатора API

## 🚀 Быстрый старт

1. **Установка зависимостей**
   ```bash
   pip install -r requirements.txt
   ```

2. **Запуск сервера**
   ```bash
   uvicorn main:app --reload
   ```


3. **Проверить работу**
   ```
   http://localhost:8000/docs
   ```

---


## 📡 ВСЕ ЭНДПОИНТЫ API

### **1. ПРОВЕРКА РАБОТОСПОСОБНОСТИ**

#### 🔹 **GET /health** — проверить, жив ли сервер

**Запрос:**
```
GET http://localhost:8000/health
```

**Ответ:**
```json
{
  "status": "healthy",
  "osrm_available": true
}
```
> *Если `osrm_available: false` - OSRM временно недоступен, будет использоваться прямое расстояние*

---

### **1.1. ГЕОКОДИНГ ПО АДРЕСУ**

#### 🔹 **POST /geocode** — получить lat/lon по city/street/house

**Запрос:**
```json
POST http://localhost:8000/geocode
{
  "city": "Москва",
  "street": "Тверская ул.",
  "house": "1"
}
```

**Ответ:**
```json
{
  "city": "Москва",
  "street": "Тверская ул.",
  "house": "1",
  "lat": 55.757, 
  "lon": 37.612
}
```

---

### **2. ГЕНЕРАЦИЯ ДАННЫХ**

#### 🔹 **POST /generate** — создать случайные точки в городе

**Запрос:**
```json
POST http://localhost:8000/generate
{
  "city_center": {
    "lat": 55.7558,
    "lon": 37.6176
  },
  "radius_km": 3,
  "points_count": 5
}
```

**Параметры:**
| Поле | Описание | Ограничения |
|------|----------|-------------|
| `city_center` | Координаты центра города (широта, долгота) | Обязательно |
| `radius_km` | Радиус разброса в км | 1-50 км |
| `points_count` | Количество точек | 2-50 точек |

**Ответ:**
```json
{
  "points": [
    {"id": 0, "lat": 55.7623, "lon": 37.6245},
    {"id": 1, "lat": 55.7489, "lon": 37.6098},
    {"id": 2, "lat": 55.7591, "lon": 37.6312}
  ],
  "center": {"lat": 55.7558, "lon": 37.6176},
  "radius_km": 3,
  "message": "Сгенерировано 5 точек в радиусе 3 км"
}
```

---

### **3. РАСЧЕТ МАРШРУТОВ**

#### 🔹 **POST /route/baseline** — базовый маршрут (без оптимизации, в отправленном порядке)

**Запрос:**
```json
POST http://localhost:8000/route/baseline
{
  "start_point": {"city": "Москва", "street": "Тверская ул.", "house": "1"},
  "end_point": {"city": "Москва", "street": "Пушкинская ул.", "house": "10"},
  "points": [
    {"id": 0, "lat": 55.7623, "lon": 37.6245, "street": "Авиамоторная"},
    {"id": 1, "lat": 55.7489, "lon": 37.6098, "street": "Арбат"},
    {"id": 2, "lat": 55.7591, "lon": 37.6312, "street": "Ленина"}
  ]
}
```

**Ответ:**
```json
{
  "order": [0, 1, 2],
  "sorted_by_street": true,
  "total_distance_meters": 8450.3,
  "total_distance_km": 8.45,
  "point_count": 3,
  "matrix_source": "osrm"
}
```

---

#### 🔹 **POST /route/optimize** — ОПТИМИЗИРОВАННЫЙ МАРШРУТ (сортировка точек)
1. **Сам находит оптимальный порядок** объезда точек
2. Возвращает сравнение "было vs стало"
3. Использует алгоритмы Nearest Neighbor + 2-opt

**Запрос:** (те же точки, что и в baseline)
```json
POST http://localhost:8000/route/optimize
{
  "start_point": {"city": "Москва", "street": "Тверская ул.", "house": "1"},
  "end_point": {"city": "Москва", "street": "Пушкинская ул.", "house": "10"},
  "points": [
    {"id": 0, "lat": 55.7623, "lon": 37.6245, "street": "Авиамоторная"},
    {"id": 1, "lat": 55.7489, "lon": 37.6098, "street": "Арбат"},
    {"id": 2, "lat": 55.7591, "lon": 37.6312, "street": "Ленина"},
    {"id": 3, "lat": 55.7512, "lon": 37.6156, "street": "Мира"},
    {"id": 4, "lat": 55.7645, "lon": 37.6023, "street": "Садовая"}
  ]
}
```

**Ответ:** (сравнение двух вариантов)
```json
{
  "original_order": [0, 1, 2, 3, 4],
  "sorted_by_street": true,
  "original_distance_km": 15.2,
  "optimized_order": [1, 0, 2, 3, 4],
  "optimized_distance_km": 11.8,
  "improvement_percent": 22.4,
  "algorithm_used": "Nearest Neighbor + 2-opt",
  "matrix_source": "osrm"
}
```

**Что означают поля:**
| Поле | Описание |
|------|----------|
| `original_order` | Как были отправлены точки |
| `original_distance_km` | Сколько км в отправленном порядке |
| `optimized_order` | оптимальный порядок |
| `optimized_distance_km` | Сколько будет в оптимальном порядке |
| `improvement_percent` | На сколько процентов путь короче |

---
## 🖼️ Пример запроса для получения картинки маршрута

### Через curl (PNG сохранится в файл route.png):

```bash
curl -X POST "http://localhost:8000/route/image" ^
  -H "Content-Type: application/json" ^
  --output route.png ^
  -d "{\"points\": [{\"id\": 0, \"lat\": 55.75, \"lon\": 37.61}, {\"id\": 1, \"lat\": 55.76, \"lon\": 37.62}, {\"id\": 2, \"lat\": 55.77, \"lon\": 37.63}]}"
```

### Через Swagger UI:
1. Откройте http://localhost:8000/docs
2. Найдите /route/image → "Try it out"
3. Вставьте пример:
   ```json
   {
     "points": [
       {"id": 0, "lat": 55.75, "lon": 37.61},
       {"id": 1, "lat": 55.76, "lon": 37.62},
       {"id": 2, "lat": 55.77, "lon": 37.63}
     ]
   }
   ```
4. Нажмите Execute и скачайте PNG.

### **4. СЛУЖЕБНЫЕ ЭНДПОИНТЫ**

#### 🔹 **POST /route/matrix** — получить матрицу расстояний

**Запрос:**
```json
POST http://localhost:8000/route/matrix
{
  "points": [
    {"id": 0, "lat": 55.7623, "lon": 37.6245},
    {"id": 1, "lat": 55.7489, "lon": 37.6098}
  ]
}
```

**Ответ:**
```json
{
  "matrix": [[0, 1250.5], [1250.5, 0]],
  "source": "osrm",
  "points_count": 2
}
```

#### 🔹 **GET /** — информация об API
**Запрос:**
```
GET http://localhost:8000/
```

**Ответ:**
```json
{
  "message": "Маршрутизатор API",
  "version": "1.0.0",
  "docs": "/docs",
  "endpoints": [
    "/generate - генерация точек",
    "/route/baseline - базовый маршрут",
    "/route/optimize - оптимизированный маршрут ✨",
    "/route/matrix - матрица расстояний",
    "/health - проверка статуса"
  ]
}
```

---

## ⚠️ ВАЖНО

1. **Минимум 2 точки** для расчета маршрута
2. **Максимум 50 точек** (чтобы не перегружать OSRM)
3. **Радиус от 1 до 50 км** при генерации
4. **Формат координат:** сначала широта (lat), потом долгота (lon)
5. Можно передавать не только `lat/lon`, но и адрес:
   - `city`, `street`, `house` (опционально),
   - тогда автогенерация координат идет через `/geocode`, а маршруты считают по появившимся `lat/lon`.
6. Если OSRM недоступен, используется прямое расстояние (по прямой)

### 🏁 Начальная и конечная точки

- В `POST /route/baseline` и `POST /route/optimize` можно указать опционально:
  - `start_point` (Point) — точка старта маршрута
  - `end_point` (Point) — точка финиша маршрута
- Если они заданы, то маршрут строится с фиксированным стартом/финишем, а остальные точки вставляются между ними.
- Для `start_point` и `end_point` действуют те же правила: лат/лон либо `city/street/house`.

---


## 🚀 TL;DR (Коротко о главном)

- **Генерация точек** → `/generate`
- **Расстояние в текущем порядке** → `/route/baseline`
- **Найти оптимальный порядок** → **✨ `/route/optimize` ✨**
- **Проверка работоспособности** → `/health`

