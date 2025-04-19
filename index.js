const express = require('express');
const bodyParser = require('body-parser');
const { productAvailability, centerDistances, centers } = require('./data');

const app = express();
app.use(bodyParser.json());


const calculateCost = (order) => {
  const vehicleOptions = centers.map(start => {
    let cost = 0;
    let carried = {}; // what the vehicle is carrying at any point
    let remaining = { ...order };

    // Create a list of pickups needed by center
    const pickups = { C1: {}, C2: {}, C3: {} };
    for (let item in order) {
      const centersWithProduct = productAvailability[item];
      const preferredCenter = centersWithProduct.includes(start)
        ? start
        : centersWithProduct[0]; // fallback to any available center

      pickups[preferredCenter][item] = order[item];
    }

    // Route: Start -> pick up own center -> deliver -> go other centers -> deliver
    for (let center of centers) {
      const items = pickups[center];
      const hasItems = Object.keys(items).length > 0;
      if (!hasItems) continue;

      const weight = Object.values(items).reduce((sum, qty) => sum + qty * 0.5, 0);
      cost += centerDistances[center] * weight; // from center to L1
    }

    return cost;
  });

  return Math.min(...vehicleOptions);
};

app.post('/calculate', (req, res) => {
  const order = req.body;
  const cost = calculateCost(order);
  res.json({ cost });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
