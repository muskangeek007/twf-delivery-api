const express = require('express');
const bodyParser = require('body-parser');
const { productAvailability, centerDistances, centers } = require('./data');

const app = express();
app.use(bodyParser.json());


const calculateCost = (order) => {
    const allCenters = ['C1', 'C2', 'C3'];
    const productWeight = 0.5; // each product weighs 0.5kg
    let lowestCost = Infinity;
  
    for (let startingCenter of allCenters) {
      let totalCost = 0;
  
      // Create pickup plan by center
      const pickups = { C1: {}, C2: {}, C3: {} };
      for (let product in order) {
        const quantity = order[product];
        const availableCenters = productAvailability[product];
  
        const selectedCenter = availableCenters.includes(startingCenter)
          ? startingCenter
          : availableCenters[0];
  
        pickups[selectedCenter][product] = quantity;
      }
  
      // STEP 1: Pickup from starting center
      if (Object.keys(pickups[startingCenter]).length > 0) {
        const weight = Object.values(pickups[startingCenter]).reduce(
          (sum, qty) => sum + qty * productWeight,
          0
        );
  
        const distance = centerDistances[startingCenter];
        totalCost += distance * weight; // start ➝ L1
      }
  
      // STEP 2: Other centers
      for (let center of allCenters) {
        if (center === startingCenter) continue;
  
        const items = pickups[center];
        if (Object.keys(items).length === 0) continue;
  
        const weight = Object.values(items).reduce(
          (sum, qty) => sum + qty * productWeight,
          0
        );
  
        const distance = centerDistances[center];
  
        // L1 ➝ center (empty) is free
        // center ➝ L1 (loaded) costs
        totalCost += distance * weight;
      }
  
      if (totalCost < lowestCost) {
        lowestCost = totalCost;
      }
    }
  
    return lowestCost;
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
