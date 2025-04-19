const express = require('express');
const bodyParser = require('body-parser');
const { productAvailability, centerDistances, centers } = require('./data');

const app = express();
app.use(bodyParser.json());


const calculateCost = (order) => {
    const allCenters = ['C1', 'C2', 'C3'];
    const productWeight = 0.5; // Every product weighs 0.5kg
    let lowestCost = Infinity; // Start with the highest number possible
  
    // Try starting the delivery from each center: C1, C2, C3
    for (let startingCenter of allCenters) {
      let totalCost = 0;
  
      // This keeps track of which center we'll get each product from
      const pickups = { C1: {}, C2: {}, C3: {} };
  
      // Go through each product in the order
      for (let product in order) {
        const quantity = order[product];
        const centersThatHaveIt = productAvailability[product];
  
        // If the starting center has it, we'll get it from there
        const chosenCenter = centersThatHaveIt.includes(startingCenter)
          ? startingCenter
          : centersThatHaveIt[0]; // Otherwise, pick the first available center
  
        pickups[chosenCenter][product] = quantity;
      }
  
      // STEP 1: Pick up from the starting center (if any products are there)
      if (Object.keys(pickups[startingCenter]).length > 0) {
        const items = pickups[startingCenter];
        const totalWeight = Object.values(items).reduce((sum, qty) => sum + qty * productWeight, 0);
        const distance = centerDistances[startingCenter];
  
        totalCost += distance * totalWeight; // go to L1 to drop them off
      }
  
      // STEP 2: Visit other centers (if needed)
      for (let center of allCenters) {
        // Skip the starting center — already handled
        if (center === startingCenter) continue;
  
        const items = pickups[center];
        if (Object.keys(items).length === 0) continue; // no products to get from this center
  
        const totalWeight = Object.values(items).reduce((sum, qty) => sum + qty * productWeight, 0);
        const distance = centerDistances[center];
  
        // Go from L1 to center to pick up items
        totalCost += distance * totalWeight;
  
        // Come back to L1 to deliver them
        totalCost += distance * totalWeight;
      }
  
      // After checking all paths, keep the lowest cost found
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
