import { useEffect } from "react";
import {useMap} from "react-leaflet";
import styles from "./customZoomControl.module.scss";

const CustomZoomControl = () => {
    const map = useMap();

    useEffect(() => {
        const CustomIconZoom = L.Control.extend({
            onAdd: function () {
                const container = L.DomUtil.create('div', 'custom-icon-zoom');

                container.innerHTML = `
                    <div id="zoom-in" style="cursor:pointer">
                      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg" class="plus">
                          <g filter="url(#filter0_d)">
                            <rect x="0" y="0" width="30" height="30" rx="30" fill="white" stroke="#6C63FF" stroke-width="1"/>
                            <path d="M22.5 15C22.5 15.1658 22.4341 15.3247 22.3169 15.4419C22.1997 15.5591 22.0407 15.625 21.875 15.625H15.625V21.875C15.625 22.0407 15.5591 22.1997 15.4419 22.3169C15.3247 22.4341 15.1658 22.5 15 22.5C14.8342 22.5 14.6753 22.4341 14.5581 22.3169C14.4409 22.1997 14.375 22.0407 14.375 21.875V15.625H8.125C7.95924 15.625 7.80027 15.5591 7.68306 15.4419C7.56585 15.3247 7.5 15.1658 7.5 15C7.5 14.8342 7.56585 14.6753 7.68306 14.5581C7.80027 14.4409 7.95924 14.375 8.125 14.375H14.375V8.125C14.375 7.95924 14.4409 7.80027 14.5581 7.68306C14.6753 7.56585 14.8342 7.5 15 7.5C15.1658 7.5 15.3247 7.56585 15.4419 7.68306C15.5591 7.80027 15.625 7.95924 15.625 8.125V14.375H21.875C22.0407 14.375 22.1997 14.4409 22.3169 14.5581C22.4341 14.6753 22.5 14.8342 22.5 15Z" fill="#6C63FF"/>
                          </g>
                          <defs>
                              <feFlood flood-opacity="0"/>
                              <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"/>
                              <feOffset dx="1" dy="1"/>
                              <feGaussianBlur stdDeviation="4"/>
                              <feComposite operator="out"/>
                              <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                              <feBlend mode="normal"/>
                              <feBlend mode="normal" in2="SourceGraphic"/>
                          </defs>
                      </svg>
                    </div>
                    <div id="zoom-out" style="cursor:pointer">
                      <svg width="30" height="30" viewBox="0 0 30 30" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect x="0" y="0" width="30" height="30" rx="15" fill="white" stroke="#6C63FF" stroke-width="1"//>
                        <path d="M22.5 15C22.5 15.1657 22.4341 15.3247 22.3169 15.4419C22.1997 15.5591 22.0407 15.625 21.875 15.625H8.125C7.95924 15.625 7.80027 15.5591 7.68306 15.4419C7.56585 15.3247 7.5 15.1657 7.5 15C7.5 14.8343 7.56585 14.6753 7.68306 14.5581C7.80027 14.4409 7.95924 14.375 8.125 14.375H21.875C22.0407 14.375 22.1997 14.4409 22.3169 14.5581C22.4341 14.6753 22.5 14.8343 22.5 15Z" fill="#6C63FF"/>
                      </svg>
                    </div>
                `;

                container.querySelector('#zoom-in').onclick = () => map.zoomIn();
                container.querySelector('#zoom-out').onclick = () => map.zoomOut();

                return container;
            }
        });

        if (map.zoomControl) {
            map.removeControl(map.zoomControl);
        }

        const control = new CustomIconZoom({ position: "topright" });
        map.addControl(control);

        return () => {
            map.removeControl(control);
        };
    }, [map]);

    return null;
};

export default CustomZoomControl;