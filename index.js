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
  
        // If starting center has the product, get it from there, otherwise pick first available center
        const selectedCenter = availableCenters.includes(startingCenter)
          ? startingCenter
          : availableCenters[0];
  
        pickups[selectedCenter][product] = quantity;
      }
  
      // Keep track of visited centers
      let tripSequence = [];
  
      // STEP 1: Pickup from starting center
      if (Object.keys(pickups[startingCenter]).length > 0) {
        const weight = Object.values(pickups[startingCenter]).reduce(
          (sum, qty) => sum + qty * productWeight,
          0
        );
  
        const distance = centerDistances[startingCenter];
  
        // Vehicle starts at startingCenter, picks up items, and goes to L1 to deliver
        totalCost += distance * weight;
        tripSequence.push(`${startingCenter} ➝ L1 (${weight}kg)`);
      }
  
      // STEP 2: For other centers, vehicle travels from L1 to center (empty),
      // picks up items, and returns to L1 (loaded)
      for (let center of allCenters) {
        if (center === startingCenter) continue;
  
        const items = pickups[center];
        if (Object.keys(items).length === 0) continue;
  
        const weight = Object.values(items).reduce(
          (sum, qty) => sum + qty * productWeight,
          0
        );
  
        const distance = centerDistances[center];
  
        // L1 ➝ center (empty): no weight, so 0 cost
        // center ➝ L1 (carrying weight): pay for this
        totalCost += distance * weight;
  
        tripSequence.push(`L1 ➝ ${center} (0kg)`);
        tripSequence.push(`${center} ➝ L1 (${weight}kg)`);
      }
  
      // Keep the minimum cost
      if (totalCost < lowestCost) {
        lowestCost = totalCost;
      }
  
      // Optional: For debugging
      // console.log(`Start at ${startingCenter}: ${tripSequence.join(', ')} = Cost: ${totalCost}`);
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
