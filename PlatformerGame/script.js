var canvas = document.createElement('canvas'); // Generate a canvas element when the dom has fully loaded using onReady event attached to screen.
canvas.id = 'canvas'; // Set the canvas id after creation so I can locate it again
document.getElementById("body").appendChild(canvas); // Locate the main-content section of the dom and append the canvas to that section
var ctx = canvas.getContext("2d"); // Set the context of the canvas to 2d
document.getElementById('canvas').style.cursor = "none";
canvas.width = "1280"; // Sets the canvas height and width to 720p
canvas.height = "720";
var elemLeft = canvas.offsetLeft;
var elemTop = canvas.offsetTop;
var width = canvas.width;
var height = canvas.height;
var gravity = 2; //  multiplier for how slow the player will fall back down to the ground
var friction = 0.95; // multiplier for speed the player loses while runnning
var mouseX = 0;
var mouseY = 0;
var cRect,canvasX,canvasY,shotX,shotY;
var enemies = []; // array to store enemies
var powerups = []; // array to store powerups 
var bullets = [];
var minEnemySpeed = 8;
var maxEnemySpeed = 15;
var playerDead = false;
var crosshairWidth = 20;
var gameover = false;
var score = 0;
var username = localStorage.getItem('username');
var deathString = username + ' has died, press enter to respawn';
var fps = 60; // Unlimited framerate was too high on my desktop so I had to add a limit



(function() {
        var requestAnimationFrame = window.requestAnimationFrame ||
            window.mozRequestAnimationFrame ||
            window.webkitRequestAnimationFrame ||
            window.msRequestAnimationFrame;
            window.requestAnimationFrame = requestAnimationFrame;
    })();

var player = {              // Creates a object literal for our player. Only 1
    x : canvas.width / 2,
    y : canvas.height - 50,
    width : 50,
    height : 50,
    speed : 10,
    velX : 0,
    velY : 0,
    isJumping : false,
    isShooting : false,
    canShoot : true
},
keys = [];


canvas.addEventListener("mousemove", function(e) {       // This functiond detects mouser movement inside the canvas and sets variables
    cRect = canvas.getBoundingClientRect();              // Gets the CSS positions along with width/height
    canvasX = Math.round(e.clientX - cRect.left);        // Subtract the 'left' of the canvas from the X/Y
    canvasY = Math.round(e.clientY - cRect.top);         // positions to get make (0,0) the top left of the 
});


function enemy(x,y,speedY,speedX) { // Constructor Function to create new enemies on command
    this.x = x;
    this.y = y;
    this.w = 30;
    this.h = 30;
    this.left = x;
    this.right = canvas.width-this.left;
    
    this.draw = function(){
        ctx.fillStyle = "red";
        ctx.fillRect(this.x, this.y, this.w, this.h);
    };
    this.move = function(){
        this.y += speedY;
        this.x += speedX;
    };
}

function powerUp(x){ // Constructor Function to create new powerUps on command
    this.x = x;
    this.height = 20;
    this.y = canvas.height - 20;
    
    this.draw = function(){
        ctx.fillStyle = "pink";
        ctx.fillRect(this.x, this.y, 20, this.height);
    };}

function bullet(x,y,speed){ // Constructor Function to create new powerUps on command
    this.x = x;
    this.y = y;
    this.width = 5;
    this.height = 20;
    
    
    this.draw = function(){
        ctx.fillStyle = "grey";
        ctx.fillRect(this.x, this.y, this.width, this.height);
    };
    this.move = function(){
        this.y -= speed;
    };}
    
function random(min, max) {
  return Math.floor(Math.random() * (max - min) ) + min;
}

 document.body.addEventListener("keydown", function(e) { // Event Listener that checks the key pressed
        keys[e.keyCode] = true;
    });

    document.body.addEventListener("keyup", function(e) { // Event Listener that checks for Key Up
        keys[e.keyCode] = false;
    });

 document.body.onkeydown = function(e){ // Checks for space key
    if(e.keyCode == 32){
       player.isShooting = true;
        if (player.isShooting){
            shoot();
    
    }
 } if (e.keyCode == 13){
     location.reload();
 }
 };
    
 document.body.onkeyup = function(e){
    if(e.keyCode == 32){
       player.isShooting = false;
    }};

function setBackground(){
    ctx.fillStyle = "black"; // Sets fill style to blue
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Creates a blue canvas background
    }

function drawPlayer(){ // Draws player to screen
    ctx.fillStyle = "white";
    ctx.fillRect(player.x, player.y, player.width, player.height); // Creates a black square that uses our player variables to define X,Y,width and height variables.
}
function shoot(){ // Adds a new bullet to bullet array
    var bull = new bullet(player.x + player.width/2,player.y- player.height,40);
    bullets.push(bull);
    console.log("SHOT!");
}

function handleMovement(){
     if (keys[38]) {
        // up arrow
        if (!player.jumping){
        player.jumping = true;
        player.velY = -player.speed * 2; 
        }
    }
    if (keys[39]) {
        // right arrow
        player.velX++;
        
    }
    if (keys[37]) {
        // left arrow
        player.velX--;
    }
    player.x += player.velX; // MOVES THE PLAYER
    player.y += player.velY; // MOVES THE PLAYER
    if (player.x >= width-player.width) { // collision detection for edge of screen
        player.x = width-player.width;
    } else if (player.x <= 0) {
        player.x = 0;
    }
    player.velX *= friction; // slows the player using friction
    if (player.y >= height-player.height) {
        player.y = height - player.height;
        player.jumping = false;
    }
    player.velY += gravity; // Adds gravity to the jump, stops the player flying away
}

function drawCrosshair(){
      ctx.beginPath();
      ctx.arc(canvasX, canvasY, crosshairWidth, 0, 2 * Math.PI, false);
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#003300';
      ctx.stroke();
      ctx.fillRect(canvasX,canvasY,2,2);
}

function addEnemies(){
    for (var i=0; i < random(3,10); i++){
            var speedY = random(minEnemySpeed,maxEnemySpeed);
            var speedX = random(-10,10); // Randomise falling direction, - num is left, + num is right.
            enemies[i] = new enemy(random(10,1280),random(10,40), speedY,speedX);
    }}

function drawAndMoveEnemies(){
    for (var i=0;i<enemies.length;i++){
        enemies[i].draw();
        enemies[i].move();
        if (enemies[i].y >= 720 + enemies[i].w){ // Detect if enemies go off screen
            enemies.splice(i,1);
            if (!gameover){
                if (enemies.length === 0){
                addEnemies();
    }}}}}

function drawBullets(){
    for (var i=0;i<bullets.length;i++){
        bullets[i].draw();
        bullets[i].move();
        if (bullets[i].y >= 720 + bullets[i].h || bullets[i].y <= 0 + bullets[i].height){ // Detect if enemies go off screen
            bullets.splice(i,1);
    }}}

 function RectColliding(enemy) { //function to detect if mouse is on enemy.
    var distX = Math.abs(canvasX - enemy.x - enemy.w / 2);
    var distY = Math.abs(canvasY - enemy.y - enemy.h / 2);

    if (distX > (enemy.w / 2 + crosshairWidth/2)) {
        return false;
    }
    if (distY > (enemy.h / 2 + crosshairWidth/2)) {
        return false;
    }

    if (distX <= (enemy.w / 2)) {
        return true;
    }
    if (distY <= (enemy.h / 2)) {
        return true;
    }

    var dx = distX - enemy.w / 2;
    var dy = distY - enemy.h / 2;
    return (dx * dx + dy * dy <= (crosshairWidth/2 * crosshairWidth/2));
}


function detectDeath(){ // Detects collision between the enemies and player.
    for (var i=0;i<enemies.length;i++){
        if (!(enemies[i].x>player.x+player.width || enemies[i].x+enemies[i].w<player.x || enemies[i].y>player.y+player.height || enemies[i].y+enemies[i].h<player.y)){
            playerDead = true;
        }
    }
}

var shown = false;
function checkForGameover(){  // Checks for the death of the player and shows the gameover screen
    if (playerDead){
        gameover = true;
        if (gameover){
            ctx.font = '30pt Calibri';
            ctx.textAlign = 'center';
            ctx.fillStyle = 'blue';
            ctx.fillText(deathString, canvas.width/2,canvas.height/2);
            ctx.fillText('Your score was ' + score , canvas.width/2,canvas.height - 50);
            if (!shown){
                
            }
            
}}}
setInterval(function(){
    if (!gameover){
    score += 1;    
}}, 1000);

function detectCollision(){ // Detects the collision between bullets and enemies by comparing their X and Y properties
        for (var i=0;i<enemies.length;i++){
            for (var b=0;b<bullets.length;b++){
                if (!(enemies[i].x>bullets[b].x+bullets[b].width || enemies[i].x+enemies[i].w<bullets[b].x || enemies[i].y>bullets[b].y+bullets[b].height || enemies[i].y+enemies[i].h<bullets[b].y)){
                    enemies.splice(i,1);
                    score = score +1;
        }}}}

function drawScore() { // Draws the score to the screen
    ctx.font = "16px Arial";
    ctx.fillStyle = "#0095DD";
    ctx.fillText("Score: "+score, 8, 20);
}

function update(){  // runs the loop each time
    setTimeout(function(){ 
        requestAnimationFrame(update); 
    }, 1000/fps);
    setBackground();    // Sets the background blue
    drawPlayer();   // Draw player to the screen
    handleMovement(); // Handles player movement
    drawCrosshair(); //  Draws crosshair to screen
    drawAndMoveEnemies();
    drawBullets();
    drawScore();
    detectCollision();
    detectDeath(); 
    checkForGameover();
}

addEnemies();
update();