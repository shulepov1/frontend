var gameChar_x;
var gameChar_y;
var floorPos_y;
var scrollPos;
var gameChar_world_x;

var isLeft;
var isRight;
var isFalling;
var isPlummeting;
var isRising;

var game_score;
var lives;
var deathTextHeight = 0;
var topHeight = 0;

var jumpSound;
var collectedSound;
var fellSound;
var hitSound;
var gameOverSound;
var killSound;

function preload(){
  jumpSound = loadSound('assets/sounds/jump.wav');
  jumpSound.setVolume(0.3);
  collectedSound = loadSound('assets/sounds/collected.wav');
  collectedSound.setVolume(0.3);
  fellSound = loadSound('assets/sounds/falling.wav');
  fellSound.setVolume(0.3);
  hitSound = loadSound('assets/sounds/hit.mp3');
  hitSound.setVolume(0.3);
  gameOverSound = loadSound('assets/sounds/gameOver.wav');
  gameOverSound.setVolume(0.3);
  gameWonSound = loadSound('assets/sounds/gameWon.wav');
  gameWonSound.setVolume(0.3);
  killSound = loadSound('assets/sounds/kill.mp3');
  killSound.setVolume(0.3);

  myFont = loadFont('assets/fonts/joystix.ttf');

  leftKeyImg = loadImage('assets/images/leftarrow.jpg');
  rightKeyImg = loadImage('assets/images/rightarrow.jpg');
  spaceImg = loadImage('assets/images/spacekey.jpg');
  guideImg = loadImage('assets/images/guide.png');
}

function setup()
{
  createCanvas(1024, 576);
	floorPos_y = height * 3/4;
  lives = 3;
  startGame();
  textFont(myFont);
}

function draw()
{
	push();
	translate(scrollPos, 0);

	background('grey'); // fill the sky blue

	stroke(0);
	fill("#344e41");
	rect(-1500, floorPos_y, width*2.7,  height/4); // draw some green ground

  renderFlagpole();

  if(!flagpole.isReached){
    checkFlagpole(flagpole);
  }

	drawClouds();
	drawMountains();
	drawTrees();
  createEnemy();
	  
	// Draw canyons.
	for (let i = 0; i < canyons.length; i++) {
		drawCanyon(canyons[i]);
		checkCanyon(canyons[i]);
	}

  // Draw platforms
  for (let i = 0; i < platforms.length; i++){
    drawPlatform(platforms[i]);
  }

	// Draw collectable items.
	for (let i = 0; i < collectables.length; i++){
		if(collectables[i].isFound === false){
			drawCollectable(collectables[i]);
		}
    else{
      collectables[i].y_pos = 50;
    }
		checkCollectable(collectables[i]);
	}

  image(leftKeyImg, width/2, floorPos_y + 30 , 50,30);
  image(rightKeyImg, width/2 + 70, floorPos_y + 30, 50, 30);
  image(spaceImg, width/2 + 140, floorPos_y + 30, 80, 30);
  image(guideImg, width/2 - 150, floorPos_y - 250);
  fill(255);
  stroke('purple');
  textSize(15);
  text('- to move', width/2 + 230, floorPos_y + 50);
  stroke('red');
  text('to kill', width/2 - 160, floorPos_y - 88);
	pop();

  checkRightBorder();
  checkPlayerDie();
  checkIfJump();

	drawGameChar();

  //if game is over
  if(lives < 1){
    
    if(!gameOverSoundAlreadyPlayed){
      gameOverSound.play();
      gameOverSoundAlreadyPlayed = true;
    }
    stroke(3);
    fill('#fa003f');
    textSize(55);
    text('GAME OVER', width/2 - 200, deathTextHeight);
    textSize(35);
    fill('#fa003f');
    text('Press SPACE to continue', width/2 - 325, deathTextHeight - 80);
    if(deathTextHeight < height/2){
      deathTextHeight++;
    }
    return;
  }

  //if reached the flag
  if(flagpole.isReached){
    if(!gameWonSoundAlreadyPlayed){
      gameWonSound.play();
      gameWonSoundAlreadyPlayed = true;
    }
    textSize(30);
    stroke('white');
    fill('gold');
    text('Level complete. Press space to continue', 35, height/2);
    return;
  }
  

	// Logic to make the game character move or the background scroll.
	if(isLeft && !isPlummeting && !(gameChar_world_x <= flagpole.x_pos))
	{
		if(gameChar_x > width * 0.2){
			gameChar_x -= 5;
		}
		else{
			scrollPos += 5;
		}
	}

	if(isRight && !isPlummeting)
	{
		if(gameChar_x < width * 0.8){
			gameChar_x  += 5;
		}
		else{
			scrollPos -= 5; // negative for moving against the background
		}
	}

	// Logic to make the game character rise and fall.

	// Update real position of gameChar for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

  //show game_score
  stroke('gold');
  textSize(25);
  fill(0);
  text(`collectables: ${game_score}/${collectables.length}`, 10, 30);

  //show lives
  stroke('green');
  text(`lives: ${lives}`, 850, 30);
}


function createEnemy(){
  for(let i = 0; i < enemyX.length; i++){
      fill('#A64100');
      stroke('#A64100');
      strokeWeight(18);
      strokeJoin(ROUND);
      triangle(enemyX[i],enemyY, enemyX[i] + 20,enemyY, enemyX[i]+10,enemyY-10);
      fill(255);
      noStroke();
      ellipse(enemyX[i] + 5,enemyY - 5, 7,10);
      ellipse(enemyX[i] + 15,enemyY - 5, 7,10);
      strokeWeight(3);
      stroke(0);
      point(enemyX[i] + 6, enemyY - 5);
      point(enemyX[i] + 14, enemyY - 5);
      line(enemyX[i] + 3, enemyY - 11, enemyX[i] + 8, enemyY - 9);
      line(enemyX[i] + 17, enemyY - 11, enemyX[i] + 12, enemyY - 9);
      strokeWeight(2);
      line(enemyX[i] + 2, enemyY + 4, enemyX[i] + 18, enemyY + 4);

      if(toRight){
        if(enemyX[i] === rightBounds[i]){
          toRight = false;
          toLeft = true;
        } else{
          enemyX[i]++;
        }
      }
      if (toLeft){
        if(enemyX[i] === leftBounds[i]){
          toLeft = false;
          toRight = true;
        } else{
          enemyX[i]--;
        }
      }
    if(gameChar_y >= floorPos_y - 18 && gameChar_y <= floorPos_y - 15 && !isRising && gameChar_world_x >= enemyX[i] - 20 && gameChar_world_x <= enemyX[i] + 40){
      killSound.play();
      enemyX[i] = 5000;
    }
    if(
      gameChar_y >= floorPos_y - 15 && gameChar_world_x + 10 >= enemyX[i] && gameChar_world_x - 10 <= enemyX[i] + 20
      ){
      touchedEnemy = true;
      if(!hitSoundAlreadyPlayed){
        hitSound.play();
        hitSoundAlreadyPlayed = true;
      }
    }
  }
}

function keyPressed(){

	if (keyCode === LEFT_ARROW) {isLeft = true;}
    else if (keyCode === RIGHT_ARROW) {isRight = true;}
    else if (keyCode === 32 && (flagpole.isReached || lives < 1)){
      location.reload();
    }
    else if(keyCode === 32 && (gameChar_y === floorPos_y || onThePlatform())){
      jumpSound.play();  
      topHeight = gameChar_y - 100;
      isRising = true;
    }
}

function checkIfJump(){
  if(isRising){
    if(gameChar_y >= topHeight){
      gameChar_y = gameChar_y - 5;
    }
    else {
      isRising = false;
      isFalling = true;
    }
  }
  else{
    if(onThePlatform() || gameChar_y === floorPos_y){
      isFalling = false;
    }
    else if(closeToThePlatform() || gameChar_y >= floorPos_y - 3){
      gameChar_y ++;
      
    }
    else{
      gameChar_y +=3;
    }
  }
}


function keyReleased()
{

	if (keyCode === LEFT_ARROW) {isLeft = false;}
  else if (keyCode === RIGHT_ARROW) {isRight = false;}

	console.log("release" + keyCode);
	console.log("release" + key);

}

// ------------------------------
// Game character render function
// ------------------------------

// Function to draw the game character.
function drawGameChar()
{
	// draw game character
	if(isLeft && isFalling)
	{
		// add your jumping-left code
        strokeWeight(1);
        stroke(0);
    
        //head
        fill('#cfbaf0');
        rect(gameChar_x - 3, gameChar_y - 73, 6, 13);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 56);

        //eyes
        stroke('green');
        rect(gameChar_x - 2, gameChar_y - 70, 1, 1);
        stroke('black');

        //mouth
        line(gameChar_x - 3, gameChar_y - 64, gameChar_x - 1 ,gameChar_y - 64);

        //body
        fill('#bde0fe');
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 55);
        vertex(gameChar_x + 6, gameChar_y - 55);
        vertex(gameChar_x + 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 55);
        endShape();

        beginShape();
        vertex(gameChar_x - 2, gameChar_y - 55);
        vertex(gameChar_x - 2, gameChar_y - 50);
        vertex(gameChar_x + 3, gameChar_y - 50);
        vertex(gameChar_x + 3, gameChar_y - 55);
        vertex(gameChar_x - 3, gameChar_y - 55);
        endShape();

        //hands
        line(gameChar_x, gameChar_y - 52.5, gameChar_x - 8, gameChar_y - 55);    
        line(gameChar_x - 8, gameChar_y - 55, gameChar_x - 8, gameChar_y - 65);    
        line(gameChar_x - 6, gameChar_y - 56, gameChar_x - 6, gameChar_y - 65);


        //legs
        fill('#ffc8dd');
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 30);
        vertex(gameChar_x - 8, gameChar_y - 5);
        vertex(gameChar_x - 4, gameChar_y - 5);
        vertex(gameChar_x - 2, gameChar_y - 30);

        vertex(gameChar_x + 2, gameChar_y - 30);
        vertex(gameChar_x + 4, gameChar_y - 5);
        vertex(gameChar_x + 8, gameChar_y - 5);
        vertex(gameChar_x + 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 30);
        endShape();

        //ankles
        line(gameChar_x - 6, gameChar_y - 5, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x + 6, gameChar_y - 5, gameChar_x + 6, gameChar_y - 3);

        //shoes
        fill('#b9fbc0');
        rect(gameChar_x - 12, gameChar_y - 3, 7, 3);
        rect(gameChar_x, gameChar_y - 3, 7, 3);

	}
	else if(isRight && isFalling)
	{
		// add your jumping-right code
        stroke(0);
        strokeWeight(1);

        //head
        fill('#cfbaf0');
        rect(gameChar_x - 3, gameChar_y - 73, 6, 13);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 56);

        //eyes
        stroke('green');
        rect(gameChar_x + 1, gameChar_y - 70, 1, 1);
        stroke('black');

        //mouth
        line(gameChar_x + 3, gameChar_y - 64, gameChar_x + 1 ,gameChar_y - 64);

        //body
        fill('#bde0fe');
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 55);
        vertex(gameChar_x + 6, gameChar_y - 55);
        vertex(gameChar_x + 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 55);
        endShape();

        beginShape();
        vertex(gameChar_x - 2, gameChar_y - 55);
        vertex(gameChar_x - 2, gameChar_y - 45);
        vertex(gameChar_x + 3, gameChar_y - 45);
        vertex(gameChar_x + 3, gameChar_y - 55);
        vertex(gameChar_x - 3, gameChar_y - 55);
        endShape();

        //hands
        line(gameChar_x, gameChar_y - 52.5, gameChar_x + 8, gameChar_y - 55);    
        line(gameChar_x + 8, gameChar_y - 55, gameChar_x + 8, gameChar_y - 65);    
        line(gameChar_x + 6, gameChar_y - 56, gameChar_x + 6, gameChar_y - 65); 

        //legs
        fill('#ffc8dd');
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 30);
        vertex(gameChar_x - 8, gameChar_y - 5);
        vertex(gameChar_x - 4, gameChar_y - 5);
        vertex(gameChar_x - 2, gameChar_y - 30);

        vertex(gameChar_x + 2, gameChar_y - 30);
        vertex(gameChar_x + 4, gameChar_y - 5);
        vertex(gameChar_x + 8, gameChar_y - 5);
        vertex(gameChar_x + 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 30);
        endShape();

        //ankles
        line(gameChar_x - 6, gameChar_y - 5, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x + 6, gameChar_y - 5, gameChar_x + 6, gameChar_y - 3);

        //shoes
        fill('#b9fbc0');
        rect(gameChar_x - 8, gameChar_y - 3, 7, 3);
        rect(gameChar_x + 5, gameChar_y - 3, 7, 3);

	}
	else if(isLeft)
	{
		// add your walking left code
        stroke(0);
        strokeWeight(1);

        //head
        fill('#cfbaf0');
        rect(gameChar_x - 3, gameChar_y - 73, 6, 13);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 56);

        //eyes
        stroke('red');
        rect(gameChar_x - 2, gameChar_y - 70, 1, 1);
        stroke('black');

        //mouth
        line(gameChar_x - 3, gameChar_y - 64, gameChar_x - 1 ,gameChar_y - 64);

        //body
        fill('#bde0fe');
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 55);
        vertex(gameChar_x + 6, gameChar_y - 55);
        vertex(gameChar_x + 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 55);
        endShape();

        beginShape();
        vertex(gameChar_x - 2, gameChar_y - 55);
        vertex(gameChar_x - 2, gameChar_y - 45);
        vertex(gameChar_x + 3, gameChar_y - 45);
        vertex(gameChar_x + 3, gameChar_y - 55);
        vertex(gameChar_x - 3, gameChar_y - 55);
        endShape();

        //hands
        line(gameChar_x, gameChar_y - 45, gameChar_x - 1.5, gameChar_y - 32);    

        //legs
        fill('#ffc8dd');
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 30);
        vertex(gameChar_x - 8, gameChar_y - 5);
        vertex(gameChar_x - 4, gameChar_y - 5);
        vertex(gameChar_x - 2, gameChar_y - 30);

        vertex(gameChar_x + 2, gameChar_y - 30);
        vertex(gameChar_x + 4, gameChar_y - 5);
        vertex(gameChar_x + 8, gameChar_y - 5);
        vertex(gameChar_x + 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 30);
        endShape();

        //ankles
        line(gameChar_x - 6, gameChar_y - 5, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x + 6, gameChar_y - 5, gameChar_x + 6, gameChar_y - 3);

        //shoes
        fill('#b9fbc0');
        rect(gameChar_x - 12, gameChar_y - 3, 7, 3);
        rect(gameChar_x, gameChar_y - 3, 7, 3);
        
	}
	else if(isRight)
	{
		// add your walking right code
        stroke(0);
        strokeWeight(1);
    
        //head
        fill('#cfbaf0');
        rect(gameChar_x - 3, gameChar_y - 73, 6, 13);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 56);

        //eyes
        stroke('red');
        rect(gameChar_x + 1, gameChar_y - 70, 1, 1);
        stroke('black');

        //mouth
        line(gameChar_x + 3, gameChar_y - 64, gameChar_x + 1 ,gameChar_y - 64);

        //body
        fill('#bde0fe');
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 55);
        vertex(gameChar_x + 6, gameChar_y - 55);
        vertex(gameChar_x + 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 55);
        endShape();

        beginShape();
        vertex(gameChar_x - 2, gameChar_y - 55);
        vertex(gameChar_x - 2, gameChar_y - 45);
        vertex(gameChar_x + 3, gameChar_y - 45);
        vertex(gameChar_x + 3, gameChar_y - 55);
        vertex(gameChar_x - 3, gameChar_y - 55);
        endShape();

        //hands
        line(gameChar_x, gameChar_y - 45, gameChar_x + 1.5, gameChar_y - 32);    

        //legs
        fill('#ffc8dd');
        beginShape();
        vertex(gameChar_x - 6, gameChar_y - 30);
        vertex(gameChar_x - 8, gameChar_y - 5);
        vertex(gameChar_x - 4, gameChar_y - 5);
        vertex(gameChar_x - 2, gameChar_y - 30);

        vertex(gameChar_x + 2, gameChar_y - 30);
        vertex(gameChar_x + 4, gameChar_y - 5);
        vertex(gameChar_x + 8, gameChar_y - 5);
        vertex(gameChar_x + 6, gameChar_y - 30);
        vertex(gameChar_x - 6, gameChar_y - 30);
        endShape();

        //ankles
        line(gameChar_x - 6, gameChar_y - 5, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x + 6, gameChar_y - 5, gameChar_x + 6, gameChar_y - 3);

        //shoes
        fill('#b9fbc0');
        rect(gameChar_x - 8, gameChar_y - 3, 7, 3);
        rect(gameChar_x + 5, gameChar_y - 3, 7, 3);

	}
	else if(isFalling || isPlummeting)
	{
		// add your jumping facing forwards code
        stroke(0);
        strokeWeight(1);

        //head
        fill('#cfbaf0');
        rect(gameChar_x - 5, gameChar_y - 73, 10, 13);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 56);

        //eyes
        stroke('green');
        rect(gameChar_x - 3, gameChar_y - 70, 1, 1);
        rect(gameChar_x + 2, gameChar_y - 70, 1, 1);
        stroke('black');

        //mouth
        line(gameChar_x - 2, gameChar_y - 64, gameChar_x + 2 ,gameChar_y - 64);

        //body
        fill('#bde0fe');
        beginShape();
        vertex(gameChar_x - 17, gameChar_y - 55);
        vertex(gameChar_x + 17, gameChar_y - 55);
        vertex(gameChar_x + 17, gameChar_y - 50);
        vertex(gameChar_x + 9, gameChar_y - 50);
        vertex(gameChar_x + 9, gameChar_y - 30);
        vertex(gameChar_x - 9, gameChar_y - 30);
        vertex(gameChar_x - 9, gameChar_y - 50);
        vertex(gameChar_x - 17, gameChar_y - 50);
        vertex(gameChar_x - 17, gameChar_y - 55);    
        endShape();

        //hands
        line(gameChar_x - 18, gameChar_y - 53, gameChar_x - 22, gameChar_y - 53);
        line(gameChar_x - 22, gameChar_y - 53, gameChar_x - 22, gameChar_y - 65);
        line(gameChar_x + 17, gameChar_y - 53, gameChar_x + 21, gameChar_y - 53);
        line(gameChar_x + 21, gameChar_y - 53, gameChar_x + 21, gameChar_y - 65);

        //legs
        fill('#ffc8dd');
        beginShape();
        vertex(gameChar_x - 9, gameChar_y - 30);
        vertex(gameChar_x - 9, gameChar_y - 5);
        vertex(gameChar_x - 4, gameChar_y - 5);
        vertex(gameChar_x - 4, gameChar_y - 30);
        vertex(gameChar_x + 4, gameChar_y - 30);
        vertex(gameChar_x + 4, gameChar_y - 5);
        vertex(gameChar_x + 9, gameChar_y - 5);
        vertex(gameChar_x + 9, gameChar_y - 30);
        vertex(gameChar_x - 9, gameChar_y - 30);
        endShape();

        //ankles
        line(gameChar_x - 6, gameChar_y - 5, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x + 6, gameChar_y - 5, gameChar_x + 6, gameChar_y - 3);

        //shoes
        fill('#b9fbc0');
        rect(gameChar_x - 12, gameChar_y - 3, 7, 3);
        rect(gameChar_x + 4.5, gameChar_y - 3, 7, 3);
    }
    
	else
	{
        // add your standing front facing code
        stroke(0);
        strokeWeight(1);

        //head
        fill('#cfbaf0');
        rect(gameChar_x - 5, gameChar_y - 73, 10, 13);
        line(gameChar_x, gameChar_y - 60, gameChar_x, gameChar_y - 56);

        //eyes
        stroke('red');
        rect(gameChar_x - 3, gameChar_y - 70, 1, 1);
        rect(gameChar_x + 2, gameChar_y - 70, 1, 1);
        stroke('black');

        //mouth
        line(gameChar_x - 2, gameChar_y - 64, gameChar_x + 2 ,gameChar_y - 64);

        //body
        fill('#bde0fe');
        beginShape();
        vertex(gameChar_x - 13, gameChar_y - 55);
        vertex(gameChar_x + 13, gameChar_y - 55);
        vertex(gameChar_x + 13, gameChar_y - 45);
        vertex(gameChar_x + 9, gameChar_y - 45);
        vertex(gameChar_x + 9, gameChar_y - 50);
        vertex(gameChar_x + 9, gameChar_y - 30);
        vertex(gameChar_x - 9, gameChar_y - 30);
        vertex(gameChar_x - 9, gameChar_y - 50);
        vertex(gameChar_x - 9, gameChar_y - 45);
        vertex(gameChar_x - 13, gameChar_y - 45);
        vertex(gameChar_x - 13, gameChar_y - 55);    
        endShape();

        //hands
        line(gameChar_x - 11.5, gameChar_y - 45, gameChar_x - 11.5, gameChar_y - 32);
        line(gameChar_x + 11, gameChar_y - 45, gameChar_x + 11, gameChar_y - 32);

        //legs
        fill('#ffc8dd');
        beginShape();
        vertex(gameChar_x - 9, gameChar_y - 30);
        vertex(gameChar_x - 9, gameChar_y - 5);
        vertex(gameChar_x - 4, gameChar_y - 5);
        vertex(gameChar_x - 4, gameChar_y - 30);
        vertex(gameChar_x + 4, gameChar_y - 30);
        vertex(gameChar_x + 4, gameChar_y - 5);
        vertex(gameChar_x + 9, gameChar_y - 5);
        vertex(gameChar_x + 9, gameChar_y - 30);
        vertex(gameChar_x - 9, gameChar_y - 30);
        endShape();

        //ankles
        line(gameChar_x - 6, gameChar_y - 5, gameChar_x - 6, gameChar_y - 3);
        line(gameChar_x + 6, gameChar_y - 5, gameChar_x + 6, gameChar_y - 3);

        //shoes
        fill('#b9fbc0');
        rect(gameChar_x - 12, gameChar_y - 3, 7, 3);
        rect(gameChar_x + 4.5, gameChar_y - 3, 7, 3);

	}

	
}

// Function to draw cloud objects.
function drawClouds(){
	for (let i = 0; i < clouds.length; i++) {
		fill(255);
		noStroke();
		ellipse(clouds[i].x_pos, clouds[i].y_pos, 70, 50);
		ellipse(clouds[i].x_pos + 20, clouds[i].y_pos + 20, 70, 50);
		ellipse(clouds[i].x_pos - 30, clouds[i].y_pos + 16, 70, 50);
	  }
}

// Function to draw mountains objects.
function drawMountains(){
	for (let i = 0; i < mountains.length; i++) {
		fill("orange");
		stroke("red");
		beginShape();
		let mountValues1=[475,130,490,120,520,100,580,90,630,110,680,130,690,200,690,200];
		curveVertex(mountains[i].x_pos, mountains[i].y_pos);
		curveVertex(mountains[i].x_pos, mountains[i].y_pos);
		for(let j = 0; j < mountValues1.length; j+=2){
			curveVertex(mountains[i].x_pos - 450 + mountValues1[j], mountains[i].y_pos - 200 + mountValues1[j + 1]);
		}
		endShape();
	
		fill("#2A373D");
		stroke(0);
		strokeWeight(2);
		beginShape();
		let mountValues2 = [320,450,320,450,410,250,450,120,500,150,550,140,600,120,650,160,700,120,750,250,850,450,850,450];
		for(let j = 0; j < mountValues2.length; j+=2){
			curveVertex(mountains[i].x_pos - 450 + mountValues2[j], mountains[i].y_pos - 200 + mountValues2[j + 1]);
		}
		endShape();
	
		beginShape();
		vertex(mountains[i].x_pos - 450 + 850, mountains[i].y_pos - 200 + 450);
		vertex(mountains[i].x_pos - 450 + 320, mountains[i].y_pos - 200 + 450);
		endShape();
	
		stroke("black");
		fill("black");
		beginShape();
		let mountValues3 = [700,450,700,450,750,400,770,430,820,400,850,450,850,450];
		for(let j = 0; j < mountValues3.length; j+=2){
			curveVertex(mountains[i].x_pos - 450 + mountValues3[j], mountains[i].y_pos - 200 + mountValues3[j + 1]);
		}
		endShape();
	
		beginShape();
		let mountValues4 = [370,450,370,450,460,330,490,400,540,370,599,450,599,450];
		for(let j = 0; j < mountValues4.length; j+=2){
			curveVertex(mountains[i].x_pos - 450 + mountValues4[j], mountains[i].y_pos - 200 + mountValues4[j + 1]);
		}
		endShape();
	  }
  }
// Function to draw trees objects.
function drawTrees(){
	for (let i = 0; i < trees_x.length; i++) {
		drawTree(trees_x[i]);
	  }
	  function drawTree(treePos_x) {
      
    fill("#c8b6ff");
		noStroke();
		let treeValues1 = [30,230,50,50, 53,221,50,50, 66,212,50,50, 80,212,50,50, 90,202,50,50, 10,225,50,50, -10,210,50,50, -30,200,56,60, 0,180,78,45, 0,150,55,70, 
			30,160,78,93, 70,150,50,50, 68,188,50,50, 90,165,50,50, 30,230,50,50];
		for(let j = 0; j < treeValues1.length; j+= 4){
			ellipse(treePos_x + treeValues1[j], treePos_y - treeValues1[j+1], treeValues1[j+2], treeValues1[j+3]);
		}
	
		stroke('#3d1308');
		strokeWeight(0.9);
		fill("#5e503f");
	
		beginShape();
		let treeValues2 = [0,0, 7,30, 5,60, 10,100 ,0,130 ,4,165 ,20,130 ,34,175, 40,120 ,60,96 ,44,100 ,40,60, 50,20 ,44,0, 35,10 ,0,0];
		for (let j = 0; j < treeValues2.length; j+=2){
			vertex(treePos_x + treeValues2[j], treePos_y - treeValues2[j + 1]);
		}
		endShape();
	  }
  }


  function getRandomInt(max) {
    return Math.floor(Math.random() * max);
  }

// ---------------------------------
// Canyon render and check functions
// ---------------------------------

// Function to draw canyon objects.
function drawCanyon(t_canyon)
{
	beginShape();
	noStroke();
	fill("#344e41");
	vertex(t_canyon.x_pos, 436);
	vertex(t_canyon.x_pos + t_canyon.width, 436);
	vertex(t_canyon.x_pos + t_canyon.width, 450);
	vertex(t_canyon.x_pos, 450);
	endShape();
	//stroke(0);
	strokeWeight(2);
	
  let w = t_canyon.width;
  let canyonValues1 = [0,450, 0+w,450, -2+w,465, -1+w,474, 4+w,491, 11+w,501, 20+w,520, 30+w,540, 32+w,576, -185+150,576, -185+156,564, -185+162,550, -185+160,530, -185+180,500, -185+183,475, -185+190,465, 0,450];

	beginShape();
	fill("#9f2042");
    
  for (let i = 0; i < canyonValues1.length; i += 2){
     vertex(t_canyon.x_pos + canyonValues1[i], canyonValues1[i + 1]);
  }
	endShape();
	
	beginShape();
	fill("#3d1308");
  let canyonValues2 = [0,433, -2,465, -1,474, 4,491, 11,501, 20,520, 30,540, 32,576, 63,576, 58,560, 60,530, 50,515, 44,490, 30,482, 20,465, 10,453, 0,433];
  for (let i = 0; i < canyonValues2.length; i += 2){
    vertex(t_canyon.x_pos + t_canyon.width + canyonValues2[i], canyonValues2[i+1]);
  }
	endShape();
	
	beginShape();
	fill("#3d1308");
  let canyonValues3 = [186,433, 180,439, 175,450, 160,478, 158,493, 140,503, 132,530, 125,559, 115,576, 150,576, 156,564, 162,550, 160,530, 180,500, 183,475, 190,465, 186,433];
  for (let i = 0; i < canyonValues3.length; i += 2){
    vertex(t_canyon.x_pos - 185 + canyonValues3[i], canyonValues3[i+1]);
  }
	endShape();
}

// Function to check character is over a canyon.
function checkCanyon(t_canyon)
{
  if(gameChar_world_x > t_canyon.x_pos && gameChar_world_x < t_canyon.x_pos + t_canyon.width && gameChar_y >= floorPos_y){
    isPlummeting = true;
    if(!fellSound.isPlaying() && !fellSoundAlreadyPlayed){
      fellSound.play();
      fellSoundAlreadyPlayed = true;      
    }

    if(gameChar_y < height + 100){
      gameChar_y ++;
     }
   }
}

function drawPlatform(t_platform){
  fill('#00916e');
  strokeWeight(1);
  stroke('black');
  rect(t_platform.x, t_platform.y, t_platform.width, t_platform.height);
}

function onThePlatform(){
  for(let i = 0; i < platforms.length; i++){
    if(
      gameChar_world_x + 10 >= platforms[i].x && gameChar_world_x - 10 <= platforms[i].x + platforms[i].width && gameChar_y === platforms[i].y){
      return true;
    }
  }
}

function closeToThePlatform(){
  for(let i = 0; i < platforms.length; i++){
    if(
      gameChar_world_x + 10 >= platforms[i].x && gameChar_world_x - 10 <= platforms[i].x + platforms[i].width && gameChar_y >= platforms[i].y - 6 && gameChar_y <= platforms[i].y + 1){
      return true;
    }
  }
}

//Function to check character is over right border.
function checkRightBorder(){
  if(gameChar_world_x > (-1500 + width*2.7) && gameChar_y >= floorPos_y){
    gameChar_y++;
    isPlummeting = true;
    if(!fellSound.isPlaying() && !fellSoundAlreadyPlayed){
      fellSound.play();
      fellSoundAlreadyPlayed = true;      
    }
  }
}

// Function to draw collectable objects.
function drawCollectable(t_collectable)
{
  stroke("gold");
  strokeWeight(2);
  noFill();
	triangle(t_collectable.x_pos, t_collectable.y_pos, t_collectable.x_pos + 22 * t_collectable.size, t_collectable.y_pos, t_collectable.x_pos + 11 * t_collectable.size, t_collectable.y_pos - 15 * t_collectable.size);
	triangle(t_collectable.x_pos, t_collectable.y_pos - 10 * t_collectable.size,t_collectable.x_pos + 22 * t_collectable.size,t_collectable.y_pos - 10 * t_collectable.size,t_collectable.x_pos + 10 * t_collectable.size,t_collectable.y_pos + 5 * t_collectable.size);
}

// Function to check character has collected an item.
function checkCollectable(t_collectable)
{
    if ( dist(t_collectable.x_pos + 22,t_collectable.y_pos,gameChar_world_x,gameChar_y - 50) <= 15 * t_collectable.size ||
    dist(t_collectable.x_pos + 22,t_collectable.y_pos,gameChar_world_x,gameChar_y) <= 30 * t_collectable.size){
      t_collectable.isFound = true;
      collectedSound.play();
      game_score++;
    }	
}

function renderFlagpole(){
  stroke('black');
  strokeWeight(2);
  let flagpoleX = -1499;
  let flagpoleY = floorPos_y;

  line(-1499, flagpoleY, -1499, flagpoleY - 100);

  if(flagpole.isReached){
    flagpoleY -= 100;
  }

  fill('red');
  triangle(flagpoleX, flagpoleY, flagpoleX, flagpoleY - 30, flagpoleX + 40, flagpoleY);
}

function checkFlagpole(t_flagpole){
  if(dist(gameChar_world_x, gameChar_y, t_flagpole.x_pos, t_flagpole.y_pos) < 30){
    if(game_score === collectables.length){
      t_flagpole.isReached = true;
    }
    else{
      textSize(22);
      fill('#ffbc0a');
      text('Come back\nwhen you collect all the stars', flagpole.x_pos + 15, floorPos_y + 50);
    }
  }
}

function checkPlayerDie(){
  if (gameChar_y >= height || touchedEnemy){
    lives -= 1;
    if(lives > 0){
      startGame();
    }
  }
}

function startGame(){
  enemyX = [-1000, -600, -190, 0, 600, 1160];
    enemyY = floorPos_y;
  rightBounds=[];
  leftBounds=[];
  for(let i = 0; i < enemyX.length; i++){
    rightBounds[i] = enemyX[i] + 100;
    leftBounds[i] = enemyX[i] - 100;
  }
  toRight = true;
  toLeft = false;
  touchedEnemy = false;

  fellSoundAlreadyPlayed = false;   
  hitSoundAlreadyPlayed = false;
  gameOverSoundAlreadyPlayed = false;
  gameWonSoundAlreadyPlayed = false;
  
  game_score = 0;

	gameChar_x = width/2;
	gameChar_y = floorPos_y;

	// Variable to control the background scrolling.
	scrollPos = 0;

	// Variable to store the real position of the gameChar in the game
	// world. Needed for collision detection.
	gameChar_world_x = gameChar_x - scrollPos;

	// Boolean variables to control the movement of the game character.
	isLeft = false;
	isRight = false;
	isFalling = false;
	isPlummeting = false;
  isRising = false;

	// Initialise arrays of scenery objects.
	treePos_y = 442;
  trees_x = [-1200, -1000, -650, -250, 150, 555, 777, 1150];

	//Initialize array of clouds
  clouds = [];
  cloudsValues = [-1000,70, -843,75, -760,65, -530,83, -390,79, -120,83, 30,65, 280,87, 490,81, 720,60, 999,83, 1010,82, 1330,80, 1520,80, 100,80, 1800,80];

  for (let i = 0; i < cloudsValues.length; i += 2){
    cloud = {
      x_pos: cloudsValues[i],
      y_pos: cloudsValues[i + 1]
    }
    clouds.push(cloud);
  }
  
  //Initialize array of mountains
  mountains = [];
  mountainsValues = [-1300,183, -700,183, 200,183, 850,183];
  
  for (let i = 0; i < mountainsValues.length; i += 2){
    mountain = {
      x_pos: mountainsValues[i],
      y_pos: mountainsValues[i+1]
    }
    mountains.push(mountain);
  }
  
  //Initialize array of canyons
  canyons = [];
  canyonsValues = [-400,100, 255,150, 955,100];

  for (let i = 0; i < canyonsValues.length; i += 2){
    canyon = {
      x_pos: canyonsValues[i],
      width: canyonsValues[i+1]
    }
    canyons.push(canyon);
  }
  
  //Initialize array of collectables
  collectables = [];
  collectablesValues = [300,410,1,false, 0,410,1,false, -500,410,1,false, 1365,380,1,false, 1565,350,1,false, 1765,250,1,false, -1200,350,1,false, -1150,370,1,false, -1100,390,1,false, -1250,370,1,false, -1050,350,1,false, -1200, 130,1,false, 650,floorPos_y - 25,1,false];

  for(let i = 0; i < collectablesValues.length; i += 4){
    collectable = {
      x_pos: collectablesValues[i],
      y_pos: collectablesValues[i+1],
      size: collectablesValues[i+2],
      isFound: collectablesValues[i+3]
    }
    collectables.push(collectable);
  }

  //Initialize flagpole object
  flagpole = {
    x_pos: -1500,
    y_pos: floorPos_y,
    isReached: false
  }

  //Initialize array of platforms
  platforms = [];
  platformsValues = [550,350,200,20, 1350,floorPos_y-1,100,20, 1700,floorPos_y-1,100,20, 1865,350,10,5, -1200,350,15,5, -1000,300,15,5, -1170,229,10,5];
  for (let i = 0; i < platformsValues.length; i += 4){
    platform = {
      x: platformsValues[i],
      y: platformsValues[i+1],
      width: platformsValues[i+2],
      height: platformsValues[i+3]
    }
    platforms.push(platform);
  }
}