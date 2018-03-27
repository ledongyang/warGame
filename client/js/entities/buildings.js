var buildings = {
  list: {
    base: {
      name: 'base',
      // Properties for drawing the object
      pixelWidth: 60,
      pixelHeight: 60,
      baseWidth: 40,
      baseHeight: 40,
      pixelOffsetX: 0,
      pixelOffsetY: 20,
      // Properties for describing structure for pathfinding
      buildableGrid: [
        [1, 1],
        [1, 1]
      ],
      passableGrid: [
        [1, 1],
        [1, 1]
      ],
      sight: 3,
      hitPoints: 500,
      cost: 5000,
      spriteImages: [
        {name: 'healthy', count: 4},
        {name: 'damaged', count: 1},
        {name: 'constructing', count: 3}
      ],
      processOrders: function() {
        switch (this.orders.type) {
          case 'construct-building':
            this.action = 'construct'
            this.animationIndex = 0
            var itemDetails = this.orders.details
            // Teleport in building and substract the cost from player cash
            itemDetails.team = this.team
            itemDetails.action = 'teleport'
            var item = game.add(itemDetails)
            game.cash[this.team] -= item.cost
            this.orders = {type: 'stand'}
            break
        }
      }
    },
  }
}
