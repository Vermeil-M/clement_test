import 'ol/ol.css';
import Map from 'ol/Map.js';
import TileLayer from 'ol/layer/Tile.js';
import OSM from 'ol/source/OSM.js';
import View from 'ol/View.js';
import VectorLayer from 'ol/layer/Vector.js';
import VectorSource from 'ol/source/Vector.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Style from 'ol/style/Style.js';
import Stroke from 'ol/style/Stroke.js';


let cheminTrcIds = [];

const map = new Map({
  target: 'map',
  layers: [
    new TileLayer({
      source: new OSM()
    })
  ],
  view: new View({
    center: [864291 , 6209527], // Coordonnées de Strasbourg
    zoom: 15
  })
});

// Fonction pour retourner une couleur en fonction du score
function getColor(score) {
    switch (score) {
      case "5": return 'red';
      case "4": return 'orange';
      case "3": return 'yellow';
      case "2": return 'lightgreen';
      case "1": return 'green';
      default: return 'gray';
    }
  }
  
  // Fonction de style
  
 const styleFunction = (feature) => {
  const score = feature.get('variables_score_matrices_matrice_neutre');
  const trcId = feature.get('trc_id');
  console.log(cheminTrcIds)
    console.log('TrcId:', trcId);
  // Si ce tronçon fait partie du chemin, on le colore en violet
  if (cheminTrcIds.includes(trcId)) {
    return new Style({
      stroke: new Stroke({
        color: 'purple',
        width: 4
      })
    });
  }

  // Sinon, on applique la couleur standard par score
    
    return new Style({
      stroke: new Stroke({
        color: getColor(score),
        width: 3
      })
})

 };


const vectorLayer = new VectorLayer({
    source: new VectorSource({
      url: 'data/troncon.geojson', // Chemin depuis le dossier public
      format: new GeoJSON()
    }),
    style: styleFunction
  });

  map.addLayer(vectorLayer);


  // Référence au bouton "Départ"
  let pickingMode = null; // "depart" ou "arrivee"
  let trcIdDepart = null;
  let trcIdArrivee = null;
  
  // Boutons
  const btnDepart = document.querySelectorAll('.popup-button')[0];
  const btnTracer = document.querySelectorAll('.popup-button')[1];
  
  // Mode sélection pour départ
  btnDepart.addEventListener('click', () => {
    pickingMode = 'depart';
    alert('Cliquez sur un tronçon pour définir le point de départ');
  });
  
  // Mode sélection pour arrivée
  btnTracer.addEventListener('click', () => {
    pickingMode = 'arrivee';
    alert('Cliquez sur un tronçon pour définir le point d\'arrivée');
  });
  
  // Clic sur la carte
  map.on('click', function (evt) {
    if (!pickingMode) return;
  
    const coordinate = evt.coordinate;
    let closestFeature = null;
    let closestDistance = Infinity;
  
    vectorLayer.getSource().forEachFeature(function (feature) {
      const geometry = feature.getGeometry();
      const closestPoint = geometry.getClosestPoint(coordinate);
      const distance = Math.sqrt(
        (closestPoint[0] - coordinate[0]) ** 2 +
        (closestPoint[1] - coordinate[1]) ** 2
      );
  
      if (distance < closestDistance) {
        closestDistance = distance;
        closestFeature = feature;
      }
    });
  
    if (!closestFeature) {
      alert("Aucun tronçon trouvé.");
      pickingMode = null;
      return;
    }
  
    const trcId = closestFeature.get('trc_id');
  
    if (pickingMode === 'depart') {
      trcIdDepart = trcId;
      console.log('Départ sélectionné :', trcIdDepart);
    } else if (pickingMode === 'arrivee') {
      trcIdArrivee = trcId;
      console.log('Arrivée sélectionnée :', trcIdArrivee);
  
      // Appel API /chemin
      if (trcIdDepart && trcIdArrivee) {
        const url = `/chemin?de=${trcIdDepart}&vers=${trcIdArrivee}`;
        fetch(url)
          .then(response => {
            if (!response.ok) throw new Error('Erreur API');
            return response.json();
          })
          .then(data => {
            console.log('Résultat du chemin :', data);
            cheminTrcIds = data.chemin.map((x) => parseInt(x)); // on s'assure que ce sont bien des strings
            vectorLayer.changed();
          })
          .catch(err => {
            console.error('Erreur lors de l’appel à /chemin :', err);
          });
      } else {
        alert("Le départ n'est pas encore défini.");
      }
    }
  
    pickingMode = null;
  });