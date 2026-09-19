export const foodCommandService = {
  getFoodMenu() {
    return [
      { id: 'f1', name: 'Caramel Popcorn (Large)', category: 'Snacks', price: 220, popular: true },
      { id: 'f2', name: 'Salted Butter Popcorn (Medium)', category: 'Snacks', price: 180, popular: false },
      { id: 'f3', name: 'Crispy Cheese Nachos & Salsa', category: 'Snacks', price: 190, popular: true },
      { id: 'f4', name: 'Chilled Coke / Pepsi (750ml)', category: 'Beverages', price: 130, popular: true },
      { id: 'f5', name: 'SmartCine Duo Combo (Large Popcorn + 2 Drinks)', category: 'Combos', price: 390, popular: true, discount: 'Save ₹90' },
      { id: 'f6', name: 'Cinema Party Box (2 Popcorns + 4 Drinks + 2 Nachos)', category: 'Combos', price: 890, popular: true, discount: 'Save ₹240' },
    ];
  },

  async handleFoodCommand(entities = {}) {
    const menu = this.getFoodMenu();
    const foodItems = entities.foodItems || [];

    if (foodItems.length > 0) {
      const subtotal = foodItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return {
        type: 'FOOD_SELECTION',
        message: `🍿 Selected Food & Concessions:`,
        items: foodItems,
        subtotal,
        note: 'Concession items will be delivered directly to your seat during intermission.',
      };
    }

    // Default to food recommendation
    const recommendedCombos = menu.filter((item) => item.category === 'Combos');
    return {
      type: 'FOOD_RECOMMENDATION',
      message: `🍿 SmartCine Concessions & Popular Combos:`,
      menu,
      combos: recommendedCombos,
    };
  },
};
