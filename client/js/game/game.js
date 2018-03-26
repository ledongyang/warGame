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
  }
}
