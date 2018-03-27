$(window).on('load', function() {
  game.init()
})

var game = {
  // Start preloading assets
  init: function() {
    loader.init()
    mouse.init()
    sidebar.init()
    sounds.init()

    $('.gamelayer').hide()
    $('#gamestartscreen').show()
    game.backgroundCanvas = document.getElementById('gamebackgroundcanvas')
    game.backgroundContext = game.backgroundCanvas.getContext('2d')
    game.foregroundCanvas = document.getElementById('gameforegroundcanvas')
    game.foregroundContext = game.foregroundCanvas.getContext('2d')
    game.canvasWidth = game.backgroundCanvas.width
    game.canvasHeight = game.backgroundCanvas.height
  },
  start: function() {
    $('.gamelayer').hide()
    $('#gameinterfacescreen').show()
    game.running = true
    game.refreshBackground = true
    game.drawingLoop()

    $('#gamemessage').html('')
    // Initialize All Game Triggers
    for (var i = game.currentLevel.triggers.length - 1; i >= 0; i--) {
      game.initTrigger(game.currentLevel.triggers[i])
    }
  },
  // The map is broken into square tiles of this size (20 pixels * 20 pixels)
  gridSize: 20,

  // Store whether or not the background moved and needs to be redrawn
  backgroundChanged: true,

  // A control loop that runs at a fixed period of time
  animationTimeout: 100, // 100 milliseconds or 10 times a second
  offsetX: 0,
  offsetY: 0,
  panningThreshold: 60, // Distance from edge of canvas at which panning starts
  panningSpeed: 10, // Pixels to pan every drawing loop
  handlePanning: function() {
    // Do not pan if mouse leaves the canvas
    if (!mouse.insideCanvas) {
      return
    }
    // mouse on left edge
    if (mouse.x <= game.panningThreshold) {
      // Check if there is still space on left
      if (game.offsetX >= game.panningSpeed) {
        game.refreshBackground = true
        game.offsetX -= game.panningSpeed
      }
    }
    // mouse on right edge
    else if (mouse.x >= game.canvasWidth - game.panningThreshold) {
      // Check if there is still space on right
      if (game.offsetX + game.canvasWidth + game.panningSpeed <= game.currentMapImage.width) {
        game.refreshBackground = true
        game.offsetX += game.panningSpeed
      }
    }
    // mouse on right edge
    if (mouse.y <= game.panningThreshold) {
      // Check if there is space on top
      if (game.offsetY >= game.panningSpeed) {
        game.refreshBackground = true
        game.offsetY -= game.panningSpeed
      }
    }
    // mouse on bottom edge
    else if (mouse.y >= game.canvasHeight - game.panningThreshold) {
      // Check if there is space on bottom
      if (game.offsetY + game.canvasHeight + game.panningSpeed <= game.currentMapImage.height) {
        game.refreshBackground = true
        game.offsetY += game.panningSpeed
      }
    }

    if (game.refreshBackground) {
      // Update mouse game coordinates based on game offsets
      mouse.calculateGameCoordinates()
    }
  },
  animationLoop: function() {
    // Animate the sidebar
    sidebar.animate()

    // Process orders for any item that handles it
    for (var i = game.items.length - 1; i >= 0; i--) {
      if (game.items[i].processOrders) {
        game.items[i].processOrders()
      }
    }

    // Animate each of elements within the game
    for (var i = game.items.length - 1; i >= 0; i--) {
      game.items[i].animate()
    }

    // Sort game items into a sortedItems array based on their x, y coordinates
    game.sortedItems = $.extend([], game.items)
    game.sortedItems.sort(function(a, b) {
      return b.y - a.y + ((b.y === a.y) ? (a.x - b.x) : 0)
    })

    fog.animate()

    // Save the timt that the last animation loop completed
    game.lastAnimationTime = (new Date()).getTime()
  },
  drawingLoop: function() {
    // Handle panning the map
    game.handlePanning()

    // Check the time since the game was animated and calculate a linear interpolation factor (-1 to 0)
    // Since drawing will happen more often than animation
    game.lastDrawTime = (new Date()).getTime()
    if (game.lastAnimationTime) {
      game.drawingInterpolationFactor = (game.lastDrawTime-game.lastAnimationTime)/game.animationTimeout - 1
      if (game.drawingInterpolationFactor > 0) {
        // No point interpolating beyond the next animation loop
        game.drawingInterpolationFactor = 0
      }
    } else {
      game.drawingInterpolationFactor = -1
    }
    // Since drawing the background map is fairly large operation,
    // we only redraw the background if it changes (due to panning)
    if (game.refreshBackground) {
      game.backgroundContext.drawImage(game.currentMapImage, game.offsetX, game.offsetY, game.canvasWidth, game.canvasHeight, 0, 0, game.canvasWidth, game.canvasHeight)
      game.refreshBackground = false
    }
    // Clear the foreground canvas
    game.foregroundContext.clearRect(0, 0, game.canvasWidth, game.canvasHeight)

    //Start drawing the foreground elements
    for (var i = game.sortedItems.length - 1; i >= 0; i--) {
      if (game.sortedItems[i].type !== 'bullets') {
        game.sortedItems[i].draw()
      }
    }

    // Draw the bullets on top of all the other elements
    for (var i = game.bullets.length - 1; i >= 0; i--) {
      if (game.sortedItems[i].type !== 'bullets') {
        game.bullets[i].draw()
      }
    }

    fog.draw()

    // Draw the mouse
    mouse.draw()

    // Draw highlight

    // Call the drawing loop for the next frame using request animation frame
    if (game.running) {
      requestAnimationFrame(game.drawingLoop)
    }
  },

  resetArrays: function() {
    game.counter = 1
    game.items = []
    game.sortedItems = []
    game.buildings = []
    game.vehicles = []
    game.aircraft = []
    game.terrain = []
    game.triggerdEvents = []
    game.selectedItems = []
    game.sortedItems = []
    game.bullets = []
  },

  add: function(itemDetails) {
    // Set a unique id for the item
    if (!itemDetails.uid) {
      itemDetails.uid = game.counter++
    }
    var item = window[itemDetails.type].add(itemDetails)
    // Add the item to the items array
    game.items.push(item)
    // Add the item to the type specific array
    game[item.type].push(item)

    if (item.type === 'buildings' || item.type === 'terrain') {
      game.currentMapPassableGrid = undefined
    }
    if (item.type === 'bullets') {
      sounds.play(item.name)
    }
    return item
  },

  remove: function(item) {
    // Unselect item if it is selected
    item.selected = false
    for (var i = game.selectedItems.length - 1; i >= 0; i--) {
      if (game.selectedItems[i].uid === item.uid) {
        game.selectedItems.splice(i, 1)
        break
      }
    }
    // Remove item from the items array
    for (var i = game.items.length - 1; i >= 0; i--) {
      if (game.items[i].uid === item.uid) {
        game.items.splice(i, 1)
        break
      }
    }
    // Remove items from the type specific array
    for (var i = game[item.type].length - 1; i >= 0; i--) {
      if (game[item.type][i].uid === item.uid) {
        game[item.type].splice(i, 1)
        break
      }
    }

    if (item.type === 'buildings' || item.type === 'terrain') {
      game.currentMapPassableGrid = undefined
    }
  },
}
