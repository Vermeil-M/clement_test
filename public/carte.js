import 'https://cdn.jsdelivr.net/npm/ol/ol.css';
import Map from 'https://cdn.jsdelivr.net/npm/ol/Map.js';
import TileLayer from 'https://cdn.jsdelivr.net/npm/ol/layer/Tile.js';
import OSM from 'https://cdn.jsdelivr.net/npm/ol/source/OSM.js';
import View from 'https://cdn.jsdelivr.net/npm/ol/View.js';

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [0, 0],
    zoom: 2
  })
});
