import L from 'leaflet';

const PIN_PATH = 'M11.5 0C17.8513 0 23 5.12837 23 11.4545C23 12.2267 22.9233 12.9811 22.7771 13.7104C21.7621 21.329 11.5605 30 11.5605 30C11.5605 30 2.87877 22.6209 0.736307 15.4961C0.260397 14.2393 0 12.8773 0 11.4545C0 5.12837 5.14873 0 11.5 0Z';

export function createWaypointMarkerIcon(color, visitOrder = null) {
    const label = visitOrder != null
        ? `<text x="11.5" y="14.5" text-anchor="middle" dominant-baseline="middle" fill="white" font-size="10" font-weight="700" font-family="system-ui, sans-serif">${visitOrder}</text>`
        : '';

    return L.divIcon({
        className: 'custom-marker',
        html: `<svg width="23" height="30" viewBox="0 0 23 30" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path fill-rule="evenodd" clip-rule="evenodd" d="${PIN_PATH}" fill="${color}"/>
  ${label}
</svg>`,
        iconSize: [34, 44],
        iconAnchor: [17, 44],
    });
}

export const userLocationIcon = L.divIcon({
    className: 'custom-marker',
    html: `<svg width="25" height="25" viewBox="0 0 25 25" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.5 25C19.4035 25 25 19.4035 25 12.5C25 5.59645 19.4035 0 12.5 0C5.59645 0 0 5.59645 0 12.5C0 19.4035 5.59645 25 12.5 25Z" fill="#3478F5" fill-opacity="0.2"/>
  <path d="M12.5 18.5C15.8137 18.5 18.5 15.8137 18.5 12.5C18.5 9.18629 15.8137 6.49999 12.5 6.49999C9.18629 6.49999 6.49999 9.18629 6.49999 12.5C6.49999 15.8137 9.18629 18.5 12.5 18.5Z" fill="white"/>
  <path d="M12.5 17.5C15.2614 17.5 17.5 15.2614 17.5 12.5C17.5 9.7386 15.2614 7.5 12.5 7.5C9.7386 7.5 7.5 9.7386 7.5 12.5C7.5 15.2614 9.7386 17.5 12.5 17.5Z" fill="#3478F5"/>
</svg>`,
    iconSize: [40, 40],
    iconAnchor: [20, 40],
});
