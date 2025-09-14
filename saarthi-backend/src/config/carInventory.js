const carInventory = {
  cars: [
    {
      id: 'tata_tiago',
      name: 'Tata Tiago',
      image: 'tiago.png',
      type: 'hatchback', 
      capacity: 4,
      luggage: 2,
      fareMultiplier: 1.0,
      available: true,
      features: ['AC', 'Music System', 'GPS']
    },
    {
      id: 'citron_c3',
      name: 'Citroën C3',
      image: 'citron.png',
      type: 'hatchback',
      capacity: 4,
      luggage: 2,
      fareMultiplier: 1.2,
      available: true,
      features: ['AC', 'Music System', 'GPS']
    }
  ],

  getAvailableCars() {
    return this.cars.filter(car => car.available);
  },

  getCarById(carId) {
    return this.cars.find(car => car.id === carId);
  },

  calculateCarFare(baseFare, carId) {
    const car = this.getCarById(carId);
    if (!car) {
      throw new Error(`Car with ID ${carId} not found`);
    }
    return Math.round(baseFare * car.fareMultiplier);
  },

  getCarOptions(baseFare) {
    return this.getAvailableCars().map(car => ({
      ...car,
      fare: this.calculateCarFare(baseFare, car.id)
    }));
  }
};

module.exports = carInventory;
