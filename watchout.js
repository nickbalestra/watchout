// start slingin' some d3 here.
// ============================


// Defining all the game options
// width of the game board
// height of the game board
// number of enemies
// inner padding to restrict the player gameplay
// background
var gameOptions = {
  width: 500,
  height: 500,
  numEnemies: 30,
  innerPadding: 10,
  outerPadding: 20,
  background: 'grey',
  moveEnemiesEveryNMsecs: 2000
};


// Storing the game stats
// current score
// high score
// number of collisions
var gameStats = {
  score: 0,
  highscore: 0,
  collisions: 0
};


// GAMEBOARD
// ############################
//
// Setting the gameboard on DOM
var gameBoard = d3.select('body')
  .append('svg')
  .attr({
    width: gameOptions.width,
    height: gameOptions.height,
    class: 'gameBoard'
  })
  .style('background-color', gameOptions.background);


// PLAYER
// ############################
//
// Setting the draggable behaviour for
// for the player
var drag = d3.behavior.drag()
  .on('dragstart', function(){})
  .on('drag', function (){
    player
    // Horizontal dragging within the gameboard limits - padding
    .attr('cx', function(){
      if (d3.event.x < gameOptions.width - gameOptions.innerPadding && d3.event.x > gameOptions.innerPadding) {
        return d3.event.x;
      } else if (d3.event.x >= gameOptions.width - gameOptions.innerPadding) {
        return gameOptions.width -gameOptions.innerPadding;
      } else if (d3.event.x <= gameOptions.innerPadding) {
        return gameOptions.innerPadding;
      }
    })
    // Vertical dragging within the gameboard limits - padding
    .attr('cy', function(){
      if (d3.event.y < gameOptions.height - gameOptions.innerPadding && d3.event.y > gameOptions.innerPadding) {
        return d3.event.y;
      } else if (d3.event.y >= gameOptions.height - gameOptions.innerPadding) {
        return gameOptions.height - gameOptions.innerPadding;
      } else if (d3.event.y <= gameOptions.innerPadding) {
        return gameOptions.innerPadding;
      }
    })
  })
  .on('dragend', function(){});


var player = gameBoard.selectAll('.player')
  .data([1])
  .enter()
  .append('circle')
  .attr({ cx: gameOptions.width / 2, cy: gameOptions.height / 2, r: 10 })
  .call(drag)



// ENEMIES
// ############################
//
var enemies = gameBoard.selectAll('.enemies')
  .data(d3.range(gameOptions.numEnemies))
  .enter()
  .append('circle')
  .attr('cx', function(d){ return (Math.random() * gameOptions.width - 30) + 30 })
  .attr('cy', function(d){ return (Math.random() * gameOptions.height - 30) + 30 })
  .attr('r', 10)
  .attr('fill', 'red');

// Move enemies to a new random location
function move(){
  enemies
  .transition()
  .duration(2000)
  .attr('cx', function(d){return (Math.random() * gameOptions.width - 30) + 30})
  .attr('cy', function(d){return (Math.random() * gameOptions.height - 30) + 30})
}

// Move enemies every x second
setInterval(function(){
  move();
}, gameOptions.moveEnemiesEveryNMsecs);



// GAME DYNAMICS
// ############################
//
// Give one point to the player each second he survive
setInterval(function(){
  gameStats.score++;
}, 1000);


// Update the game stats displayed on the page
// Scores
// Collisions
function updateGameStats(){

  d3.select('.current span')
    .text(gameStats.score);

  d3.select('.collisions span')
    .text(gameStats.collisions);
}

setInterval(function(){
  updateGameStats();
}, 50);


// Detect Collisions
var running = true;

function CollisionDetection(){
  var collision;

  enemies
  .each(function(){
    var enemyCx = parseInt(this.cx.animVal.value);
    var enemyCy = parseInt(this.cy.animVal.value);
    var playerCX = parseInt(player[0][0].cx.animVal.value);
    var playerCY = parseInt(player[0][0].cy.animVal.value);

    if(Math.hypot(enemyCx - playerCX, enemyCy - playerCY) <= 20) {

      // Avoid running the following logic in case a collision happend already
      // during this each loop
      if (!collision) {
        collision = true;

        // Stop running the collision detection
        // see d3.timer
        running = false;

        gameStats.collisions++;
        if (gameStats.score >= gameStats.highscore) {
          gameStats.highscore = gameStats.score;
          d3.select('.high span')
            .text(gameStats.highscore);
        }
        gameStats.score = 0;

        // Restart the collision detection after 500ms
        // see d3.timer
        setTimeout(function(){
          running = true;
        }, 500)

      }
      return;
    }
  })
}


// d3 timer system to run the collision detection
// it allow to avoid using Tweens for retrievieng attr values during animations/transitions
var timer = d3.timer(function(){
  if (running){
    CollisionDetection();
  }
});