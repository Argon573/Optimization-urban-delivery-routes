import io
import math
from staticmap import StaticMap, CircleMarker, Line
from PIL import Image


def render_route_map(route_coords, geometry, arrow_style=None):
    """
    Рисует маршрут на карте с направлением движения и маркерами точек.
    route_coords: [(lon, lat), ...] — точки маршрута в нужном порядке
    geometry: [(lon, lat), ...] — координаты линии маршрута (OSRM polyline)
    arrow_style: dict — параметры стрелок (опционально)
    Возвращает: BytesIO с PNG
    """
    m = StaticMap(600, 600, url_template='https://a.tile.openstreetmap.org/{z}/{x}/{y}.png')

    # Линия маршрута
    line = Line(geometry, 'blue', 3)
    m.add_line(line)

    # Стрелки направления
    arrow_length = arrow_style.get('length', 0.0012) if arrow_style else 0.0012
    arrow_angle = math.radians(arrow_style.get('angle', 35)) if arrow_style else math.radians(35)
    def angle_between(dx1, dy1, dx2, dy2):
        dot = dx1 * dx2 + dy1 * dy2
        det = dx1 * dy2 - dy1 * dx2
        return math.atan2(det, dot)

    # Найти индексы поворотов
    turn_indices = []
    for i in range(1, len(geometry) - 1):
        x0, y0 = geometry[i - 1]
        x1, y1 = geometry[i]
        x2, y2 = geometry[i + 1]
        dx1, dy1 = x1 - x0, y1 - y0
        dx2, dy2 = x2 - x1, y2 - y1
        angle = angle_between(dx1, dy1, dx2, dy2)
        if abs(math.degrees(angle)) > 20:
            turn_indices.append(i)

    def draw_fancy_arrow(px, py, seg_angle, color_main='black', color_outline='white'):
        m.add_line(Line([
            (px - arrow_length * math.cos(seg_angle), py - arrow_length * math.sin(seg_angle)),
            (px, py)
        ], color_outline, 7))
        m.add_line(Line([
            (px - arrow_length * math.cos(seg_angle), py - arrow_length * math.sin(seg_angle)),
            (px, py)
        ], color_main, 3))
        for ang in [-arrow_angle, arrow_angle]:
            ax = px - arrow_length * 0.7 * math.cos(seg_angle + ang)
            ay = py - arrow_length * 0.7 * math.sin(seg_angle + ang)
            m.add_line(Line([(ax, ay), (px, py)], color_outline, 7))
            m.add_line(Line([(ax, ay), (px, py)], color_main, 3))

    if not turn_indices:
        mid_idx = len(geometry) // 2
        x0, y0 = geometry[mid_idx - 1]
        x1, y1 = geometry[mid_idx]
        dx, dy = x1 - x0, y1 - y0
        px = (x0 + x1) / 2
        py = (y0 + y1) / 2
        seg_angle = math.atan2(dy, dx)
        draw_fancy_arrow(px, py, seg_angle)
    else:
        for idx in range(len(turn_indices) - 1):
            start = turn_indices[idx]
            end = turn_indices[idx + 1]
            mid = (start + end) // 2
            x0, y0 = geometry[mid - 1]
            x1, y1 = geometry[mid]
            dx, dy = x1 - x0, y1 - y0
            px = (x0 + x1) / 2
            py = (y0 + y1) / 2
            seg_angle = math.atan2(dy, dx)
            draw_fancy_arrow(px, py, seg_angle)

    # Маркеры точек
    for idx, (x, y) in enumerate(route_coords):
        if idx == 0:
            marker = CircleMarker((x, y), 'green', 16)
        elif idx == len(route_coords) - 1:
            marker = CircleMarker((x, y), 'blue', 16)
        else:
            marker = CircleMarker((x, y), 'red', 12)
        m.add_marker(marker)

    image = m.render()
    out_buf = io.BytesIO()
    image.save(out_buf, format="PNG")
    out_buf.seek(0)
    return out_buf
