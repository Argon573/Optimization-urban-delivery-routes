# 🚀 Optimization Urban Delivery Routes

Интеллектуальная система оптимизации логистики, разработанная для малого бизнеса и самозанятых. Проект позволяет минимизировать время и расходы на доставку, находя оптимальные пути объезда нескольких точек на карте.

## 🌟 Основные возможности
* **Умная оптимизация:** Использование алгоритмов Simulated Annealing и 2-opt для эффективного решения задачи коммивояжера.
* **Интерактивная карта:** Визуализация маршрутов на базе Leaflet с отображением всех точек доставки.
* **История и избранное:** Сохранение часто используемых маршрутов для быстрого доступа.
* **Локальная навигация:** Использование собственного поднятого инстанса OSRM для работы с дорожными данными.

---

## 📸 Интерфейс
| **Главный экран** | **Построение маршрута** | **Настройки** |
| :--- | :--- | :--- |
| ![Main](screenshots/mainScreen.jpg) | ![Route](screenshots/RouteScreen.jpg) | ![Settings](screenshots/SettingsScreen.jpg) |
| **History**  | **Favorite** | **Generation** |
| ![History](screenshots/History.jpg) | ![Favorite](screenshots/FavoriteRoutes.jpg) | ![Generation](screenshots/Generation.jpg) |

![Desktop](screenshots/DesktopScreen.png)

---

## 🛠 Технологический стек
* **Frontend:** React + Vite, Leaflet.
* **Backend:** FastAPI, OSRM (Open Source Routing Machine).
* **Infrastructure:** Docker, Docker Compose.

---

## ⚙️ Установка и запуск проекта

### Предварительные требования
* Установленный Docker и Docker Compose.
* Node.js (для разработки фронтенда).

### Бэкенд (Docker)
Запуск инфраструктуры и бэкенда:
```bash
docker-compose up -d

```

### Фронтенд (Development)

Установка зависимостей и запуск в режиме разработки:

```bash
cd frontend
npm install
npm run dev

```

`npm run dev` проксирует `/route`, `/geocode`, `/generate` на `http://localhost:8000` (см. `frontend/vite.config.js`).

---

## 🌐 Продакшен

Сайт: [https://optimization-urban.ru/](https://optimization-urban.ru/)

Фронтенд в production обращается к API **на том же домене** (`/route/geojson`, `/geocode`, `/generate`). Nginx проксирует их на бэкенд `:8000`.

Полный конфиг nginx: [`deploy/nginx-optimization-urban.conf.example`](deploy/nginx-optimization-urban.conf.example)

```bash
cd frontend && npm run build
sudo nginx -t && sudo systemctl reload nginx
```

---

## 👥 Команда проекта

Над проектом работали:

* **Argon573** (Тимлид, Frontend-разработчик): Архитектура интерфейса, интеграция карты Leaflet, общее руководство проектом.
* **Qushl** (Backend-разработчик): Реализация алгоритмов оптимизации маршрута, проектирование API на FastAPI.
* **vlad131206zap-beep** (DevOps): Настройка Docker-контейнеров, развертывание локального OSRM и CI/CD процессов.
* **konstanti-art** (дизайнер): Разработка макетов приложения, создание презентации
* **ylyastar007-cpu** (аналитк): Создание документации проекта, анализ пользовательского поведения
---

*Проект предназначен для оптимизации городских доставок.*
