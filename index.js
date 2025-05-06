const express = require('express');
const Graph = require('node-dijkstra');

const app = express();
const port = 3000;

// Création du graphe
const route = new Graph();

route.addNode('A', { B: 1 });
route.addNode('B', { A: 1, C: 2, D: 4 });
route.addNode('C', { B: 2, D: 1 });
route.addNode('D', { C: 1, B: 4 });

// Route API pour calculer le chemin
app.get('/chemin', (req, res) => {
  const { de, vers } = req.query;

  if (!de || !vers) {
    return res.status(400).json({ erreur: 'Paramètres "de" et "vers" requis' });
  }

  const chemin = route.path(de, vers);

  if (!chemin) {
    return res.status(404).json({ erreur: `Aucun chemin trouvé entre ${de} et ${vers}` });
  }

  res.json({ chemin });
});

// Lancer le serveur
app.listen(port, () => {
  console.log(`Serveur en ligne sur http://localhost:${port}`);
});
