var maps = {
  'singleplayer': [
    {
      'name': 'Rescue',
      'briefing': 'In the months since the great war, mankind has fallen into chaos. Billions are dead with cities in ruins.\nSmall group of survivors band together to try and survive as best as they can.\nWe are trying to reach out to all the survivors in this sector before we join back with the main colony.',
      // Map Details
      'mapImage': 'images/maps/level-one.png',
      'startX': 36,
      'startY': 0,
      // Entities to be loaded
      'requirements': {
        'buildings': ['base'],
        'vehicles': ['transport', 'scout-tank', 'heavy-tank'],
        'aircraft': [],
        'terrain': []
      },
      // Entities to be added
      "items":[
        // Slightly damaged base
        {"type":"buildings","name":"base","x":55,"y":6,"team":"blue", 'life': 100},
        {"type":"vehicles","name":"heavy-tank","x":57,"y":12,"team":"blue","direction":4, 'uid': -1},
        // Two transport vehicles waiting just outside the visible map
        {"type":"vehicles","name":"transport","x":-3,"y":2, 'team': 'blue', 'direction': 2, 'uid': -3, 'selectable': false},
        {"type":"vehicles","name":"transport","x":-3,"y":4, 'team': 'blue', 'direction': 2, 'uid': -4, 'selectable': false},

        // Two damaged enemy scout-tanks patroling the area
        {"type":"vehicles","name":"scout-tank","x":40,"y":20, 'team': 'green', 'direction': 4, 'uid': -2, 'life': 20, 'orders': {'type': 'patrol', 'from': {'x': 34, 'y': 20}, 'to': {'x': 42, 'y': 25}}},
        {"type":"vehicles","name":"scout-tank","x":14,"y":0, 'team': 'green', 'direction': 4, 'uid': -5, 'life': 20, 'orders': {'type': 'patrol', 'from': {'x': 14, 'y': 0}, 'to': {'x': 14, 'y': 14}}}
      ],
      /* Economy related */
      'cash': {
        'blue': 0,
        'green': 0
      },

      /* Conditional and Timed Trigger Events */
      'triggers': [
        // Timed Events
        {'type': 'timed', 'time': 3000, 'action': function() {
          game.showMessage('op', 'Commander!! We haven\'t heard from the last convoy in over two hours. They should have arrived by now.')
        }},
        {'type': 'timed', 'time': 10000, 'action': function() {
          game.showMessage('op', 'They were last seen in the North West Sector. Could you investigate?')
        }},
        // Conditional Events
        {'type': 'conditional',
         'condition': function() {
           return (isItemDead(-1) || isItemDead(-3) || isItemDead(-4))
         },
         'action': function() {
          singleplayer.endLevel(false)
         }},
         {'type': 'conditional',
         'condition': function() {
           // Check if first enemy is dead
           return isItemDead(-2)
         },
         'action': function() {
           game.showMessage('op', 'The rebels have been getting very aggressive lately. I hope the convoy is safe. Find them and escort them back to the base.')
         }},
         {'type': 'conditional',
         'condition': function() {
           var hero = game.getItemByUid(-1)
            return (hero && hero.x<30 && hero.y<30)
         },
         'action': function() {
           game.showMessage('driver', 'Can anyone hero us? Our convoy has been pinned down by rebel tanks. We need help.')
         }},
         {'type': 'conditional',
         'condition': function() {
           var hero = game.getItemByUid(-1)
           return (hero && hero.x<10 && hero.y<10)
         },
         'action': function() {
           var hero = game.getItemByUid(-1)
           game.showMessage('driver', 'Thank you. We thought we would never get out of here alive.')
           game.sendCommand([-3, -4], {type: 'guard', to: hero})
         }},
         {'type': 'conditional',
         'condition': function() {
            var transport1 = game.getItemByUid(-3)
            var transport2 = game.getItemByUid(-4)
            return (transport1 && transport2 && transport1.x>52 && transport2.x>52 && transport1.y<18 && transport2.y<18)
         },
         'action': function() {
           singleplayer.endLevel(true)
         }},
      ],

      /* Map coordinates that are obstructed by terrain */
      'mapGridWidth': 60,
      'mapGridHeight': 40,
      'mapObstructedTerrain': [[0,0],[1,0],[2,0],[3,0],[4,0],[14,0],[15,0],[21,0],[22,0],[23,0],[24,0],[25,0],[26,0],[27,0],[28,0],[29,0],[30,0],[31,0],[32,0],[40,0],[41,0],[42,0],[49,0],[50,0],[55,0],[56,0],[57,0],[58,0],[59,0],[0,1],[1,1],[2,1],[3,1],[4,1],[13,1],[14,1],[15,1],[20,1],[21,1],[22,1],[23,1],[24,1],[25,1],[26,1],[27,1],[28,1],[29,1],[30,1],[31,1],[32,1],[40,1],[41,1],[42,1],[49,1],[50,1],[55,1],[56,1],[57,1],[58,1],[59,1],[0,2],[13,2],[14,2],[15,2],[20,2],[21,2],[22,2],[23,2],[24,2],[25,2],[26,2],[27,2],[28,2],[29,2],[30,2],[31,2],[40,2],[41,2],[59,2],[0,3],[13,3],[14,3],[15,3],[21,3],[22,3],[23,3],[24,3],[25,3],[26,3],[27,3],[28,3],[29,3],[30,3],[31,3],[39,3],[40,3],[41,3],[59,3],[13,4],[14,4],[15,4],[39,4],[40,4],[41,4],[42,4],[14,5],[15,5],[40,5],[41,5],[42,5],[43,5],[14,6],[15,6],[40,6],[41,6],[42,6],[43,6],[40,7],[41,7],[42,7],[57,7],[58,7],[59,7],[38,8],[39,8],[40,8],[41,8],[42,8],[57,8],[58,8],[59,8],[38,9],[39,9],[40,9],[41,9],[58,9],[59,9],[3,10],[4,10],[5,10],[10,10],[11,10],[12,10],[3,11],[4,11],[5,11],[6,11],[7,11],[8,11],[9,11],[10,11],[11,11],[12,11],[20,11],[21,11],[4,12],[5,12],[6,12],[7,12],[8,12],[9,12],[10,12],[11,12],[20,12],[21,12],[47,12],[48,12],[49,12],[4,13],[5,13],[30,13],[31,13],[32,13],[47,13],[48,13],[49,13],[4,14],[5,14],[29,14],[30,14],[31,14],[32,14],[33,14],[47,14],[48,14],[0,15],[29,15],[30,15],[31,15],[32,15],[33,15],[0,16],[1,16],[0,17],[1,17],[0,18],[1,18],[13,18],[14,18],[15,18],[39,18],[40,18],[55,18],[56,18],[57,18],[12,19],[13,19],[14,19],[15,19],[25,19],[38,19],[39,19],[40,19],[41,19],[53,19],[54,19],[55,19],[56,19],[57,19],[58,19],[59,19],[38,20],[39,20],[40,20],[41,20],[51,20],[52,20],[53,20],[54,20],[55,20],[56,20],[57,20],[58,20],[59,20],[30,21],[31,21],[32,21],[38,21],[39,21],[40,21],[51,21],[52,21],[53,21],[54,21],[55,21],[56,21],[57,21],[58,21],[59,21],[31,22],[32,22],[38,22],[39,22],[52,22],[53,22],[54,22],[55,22],[56,22],[57,22],[58,22],[31,23],[32,23],[4,24],[5,24],[4,25],[5,25],[18,25],[19,25],[4,26],[5,26],[6,26],[7,26],[16,26],[17,26],[18,26],[19,26],[20,26],[21,26],[4,27],[5,27],[6,27],[7,27],[16,27],[17,27],[18,27],[19,27],[20,27],[21,27],[41,27],[42,27],[43,27],[50,27],[51,27],[52,27],[5,28],[6,28],[7,28],[16,28],[17,28],[18,28],[19,28],[20,28],[21,28],[39,28],[40,28],[41,28],[42,28],[43,28],[50,28],[51,28],[52,28],[17,29],[18,29],[19,29],[20,29],[21,29],[39,29],[40,29],[41,29],[42,29],[43,29],[50,29],[51,29],[24,32],[25,32],[26,32],[27,32],[23,33],[24,33],[25,33],[26,33],[27,33],[11,34],[12,34],[13,34],[23,34],[24,34],[25,34],[26,34],[27,34],[38,34],[11,35],[12,35],[13,35],[25,35],[26,35],[38,35],[39,35],[0,36],[11,36],[12,36],[37,36],[38,36],[39,36],[59,36],[0,37],[10,37],[11,37],[12,37],[36,37],[37,37],[38,37],[39,37],[59,37],[0,38],[1,38],[2,38],[3,38],[4,38],[10,38],[11,38],[12,38],[36,38],[37,38],[38,38],[39,38],[55,38],[56,38],[57,38],[58,38],[59,38],[0,39],[1,39],[2,39],[3,39],[4,39],[10,39],[11,39],[12,39],[36,39],[37,39],[38,39],[39,39],[55,39],[56,39],[57,39],[58,39],[59,39]]
    }
  ]
}
