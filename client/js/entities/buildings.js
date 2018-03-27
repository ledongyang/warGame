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
    starport: {
      name: 'starport',
      pixelWidth: 40,
      pixelHeight: 60,
      baseWidth: 40,
      baseHeight: 55,
      pixelOffsetX: 1,
      pixelOffsetY: 5,
      buildableGrid: [
        [1, 1],
        [1, 1],
        [1, 1]
      ],
      passableGrid: [
        [1, 1],
        [0, 0],
        [0, 0]
      ],
      sight: 3,
      cost: 2000,
      hitPoints: 300,
      spriteImages: [
        {name: 'teleport', count: 9},
        {name: 'closing', count: 18},
        {name: 'healthy', count: 4},
        {name: 'damaged', count: 1}
      ],
      processOrders: function() {
        switch (this.orders.type) {
          case 'construct-unit':

            if (this.lifeCode !== 'healthy') {
              return
            }
            // First make sure there is no unit standing on top of the building
            var unitOnTop = false
            for (var i = game.items.length - 1; i >= 0; i--) {
              var item = game.items[i]
              if (item.type === 'vehicles' || item.type === 'aircraft') {
                if (item.x > this.x && item.x < this.x+2 && item.y > this.y && item.y < this.y+3) {
                  unitOnTop = true
                  break
                }
              }
            }
            var cost = window[this.orders.details.type].list[this.orders.details.name].cost
            if (unitOnTop) {
              if (this.team === game.team) {
                game.showMessage('system', 'Warning! Cannot teleport unit while landing bay is occupied.')
              }
            } else if (game.cash[this.team] < cost) {
              if (this.team === game.team) {
                game.showMessage('system', 'Warning! Insufficient Funds. Need '+cost+' credits.')
              }
            } else {
              this.action = 'open'
              this.animationIndex = 0
              // Position new unit above center of starport
              var itemDetails = this.orders.details
              itemDetails.x = this.x+0.5*this.pixelWidth/game.gridSize
              itemDetails.y = this.y+0.5*this.pixelHeight/game.gridSize
              // Teleport in unit and substract the cost from player cash
              itemDetails.action = 'teleport'
              itemDetails.team = this.team
              game.cash[this.team] -= cost
              this.constructUnit = $.extend(true, [], itemDetails)
            }
            this.orders = {type: 'stand'}
            break
        }
      }
    },
  },
  defaults: {
    // Default function for animating a building
    animate: function() {
      // Consider an item healthy if it has more than 40% life
      if (this.life > this.hitPoints*0.4) {
        this.lifeCode = 'healthy'
      } else if (this.life <= 0) {
        this.lifeCode = 'dead'
        game.remove(this)
        return
      } else {
        this.lifeCode = 'damaged'
      }
      switch(this.action) {
        case 'stand':
          this.imageList = this.spriteArray[this.lifeCode]
          this.imageOffset = this.imageList.offset + this.animationIndex
          this.animationIndex++
          if (this.animationIndex >= this.imageList.count) {
            this.animationIndex = 0
          }
          break
        case 'construct':
          this.imageList = this.spriteArray['constructing']
          this.imageOffset = this.imageList.offset + this.animationIndex
          this.animationIndex++
          // Once constructing is complete go back to standing
          if (this.animationIndex >= this.imageList.count) {
            this.animationIndex = 0
            this.action = 'stand'
          }
          break
        case 'teleport':
          this.imageList = this.spriteArray['teleport']
          this.imageOffset = this.imageList.offset + this.animationIndex
          this.animationIndex++
          // Once teleporting is complete, move to either guard or stand mode
          if (this.animationIndex >= this.imageList.count) {
            this.animationIndex = 0
            if (this.canAttack) {
              this.action = 'guard'
            } else {
              this.action = 'stand'
            }
          }
          break
        case 'close':
          this.imageList = this.spriteArray['closing']
          this.imageOffset = this.imageList.offset + this.animationIndex
          this.animationIndex++
          // Once closing is complete, go back to standing
          if (this.animationIndex >= this.imageList.count) {
            this.animationIndex = 0
            this.action = 'stand'
          }
          break
        case 'open':
          this.imageList = this.spriteArray['closing']
          // Opening is just the closing sprites running backwards
          this.imageOffset = this.imageList.offset + this.imageList.count - this.animationIndex
          this.animationIndex++
          // Once opening is complete, go back to close
          if (this.animationIndex >= this.imageList.count) {
            this.animationIndex = 0
            this.action = 'close'
            // If constructUnit has been set, add the new unit to the game
            if (this.constructUnit) {
              game.add(this.constructUnit)
              this.constructUnit = undefined
            }
          }
          break
        case 'deploy':
          this.imageList = this.spriteArray['deploy']
          this.imageOffset = this.imageList.offset + this.animationIndex
          this.animationIndex++
          // Once deploying is complete, go to harvest now
          if (this.animationIndex >= this.imageList.count) {
            this.animationIndex = 0
            this.action = 'harvest'
          }
          break
        case 'harvest':
          this.imageList = this.spriteArray[this.lifeCode]
          this.imageOffset = this.imageList.offset + this.animationIndex
          this.animationIndex++
          if (this.animationIndex >= this.imageList.count) {
            this.animationIndex = 0
            if (this.lifeCode === 'healthy') {
              // Harvesters mine 2 credits of cash per animation cycle
              game.cash[this.team] += 2
            }
          }
          break
        case 'guard':
          if (this.lifeCode === 'damaged') {
            // The damaged turret has no directions
            this.imageList = this.spriteArray[this.lifeCode]
          } else {
            // The healthy turret has 8 directions
            var direction = wrapDirection(Math.round(this.direction), this.directions)
            this.imageList = this.spriteArray[this.lifeCode + '-' + direction]
          }
          this.imageOffset = this.imageList.offset
          break
      }
    },
    // Default function for drawing a building
    draw: function() {
      // Absoulte x and y pixel coordinates
      var x = (this.x*game.gridSize) - game.offsetX - this.pixelOffsetX
      var y = (this.y*game.gridSize) - game.offsetY - this.pixelOffsetY

      this.drawingX = x
      this.drawingY = y
      if (this.selected) {
        this.drawSelection()
        this.drawLifeBar()
      }

      // All sprites sheets will have blue in the first row and green in the second row
      var colorIndex = (this.team === 'blue') ? 0 : 1
      var colorOffset = colorIndex * this.pixelHeight
      game.foregroundContext.drawImage(this.spriteSheet, this.imageOffset*this.pixelWidth, colorOffset, this.pixelWidth, this.pixelHeight, x, y, this.pixelWidth, this.pixelHeight)
    }
  }
}
