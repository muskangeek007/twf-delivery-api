// data.js

const productAvailability = {
    A: ['C1'],
    B: ['C1', 'C2'],
    C: ['C2', 'C3'],
    D: ['C3'],
    E: ['C1', 'C3'],
    F: ['C2'],
    G: ['C1', 'C3'],
    H: ['C2', 'C3'],
    I: ['C3'],
  };
  
  const centerDistances = {
    C1: 10,
    C2: 20,
    C3: 15,
  };
  
  const centers = ['C1', 'C2', 'C3'];
  
  module.exports = {
    productAvailability,
    centerDistances,
    centers,
  };
  