// ver. 1
Math.radians = function (degrees) {
  return (degrees * Math.PI) / 180;
};

function update() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  drawPlayer();
  drawFrame();
  bestTime();

  if (start == 1) {
    movement();
    destroyEnemy();
    destroyEffect();
    enemyMovement();
    drawAttackBall();
    attackRange();
    destroyAttackBall();
    drawEnemy();
    drawEater();
    drawEffect();
    controllEffect();
    drawTime();
    checkDead();

    var tmp = new Date();
    curTime = (tmp - startTime) / 1000;

    if (curTime > 30 && startAttack == 0) {
      attackDelay();
      startAttack = 1;
    }
  } else if (start == 0) {
    curTime = 0;
    movement();
    startText();
    frameControll();
  } else {
    drawTime();
    endPage();
  }
}

function attackRange() {
  var scale = 1000;

  ctx.strokeStyle =
    "rgba(" +
    attackLineColor[0] +
    ", " +
    attackLineColor[1] +
    ", 0, " +
    attackLineColor[2] +
    ")";
  if (attackOption == 1 || attackOption == 2) {
    ctx.lineWidth = 3;
    attackX = playerX + blockSize / 2 - canvas.width / 2;
    attackY = playerY + blockSize / 2 - canvas.height / 2;

    var dist = Math.sqrt(attackX * attackX + attackY * attackY);

    attackX = attackX / dist;
    attackY = attackY / dist;

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(
      attackX * scale + canvas.width / 2,
      attackY * scale + canvas.height / 2
    );
    // ctx.lineTo(playerX, playerY);
    ctx.stroke();
    ctx.closePath();
  } else if (attackOption == 3) {
    ctx.lineWidth = 6;
    curRad += (Math.PI * 3) / 105;

    attackX = Math.cos(curRad);
    attackY = -Math.sin(curRad);

    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, canvas.height / 2);
    ctx.lineTo(
      attackX * scale + canvas.width / 2,
      attackY * scale + canvas.height / 2
    );
    ctx.stroke();
    ctx.closePath();
  }
}

function attackDelay() {
  attackLineColor[2] = 1.0;

  // 최초 한번만 실행
  if (attackDelayCount == 0) {
    attackCount += 1;
    chooseAttack();
  }

  // red
  if (attackLineColor[1] == 0) attackLineColor[1] = 255;
  // yellow
  else if (attackLineColor[1] == 255) attackLineColor[1] = 0;

  attackDelayCount += 1;

  if (attackDelayCount == 8) {
    attackDelayCount = 0;
    attackLineColor[2] = 0;
    attack();
  } else setTimeout(attackDelay, 250);
}

function chooseAttack() {
  if (attackCount % 3 == 0) attackOption = 2;
  else attackOption = 1;

  if (attackCount % 6 == 0) attackOption = 3;
}

function attack() {
  // Classic Attack
  if (attackOption == 1) {
    if (attackNum < 3) {
      setAttackBall();
      attackNum += 1;
      setTimeout(attack, 200);
    } else {
      attackNum = 0;
      setTimeout(attackDelay, 3000);
    }
  }

  // Laser Attack
  else if (attackOption == 2) {
    if (attackNum < 35) {
      setAttackBall();
      attackNum += 1;
      setTimeout(attack, 30);
    } else {
      attackNum = 0;
      setTimeout(attackDelay, 3000);
    }
  }

  // Spin Attack
  else if (attackOption == 3) {
    if (attackNum < 15) {
      setAttackBall();
      attackNum += 1;
      setTimeout(attack, 200);
    } else {
      attackNum = 0;
      setTimeout(attackDelay, 3000);
    }
  }
}

function setAttackBall() {
  attackBallX.push(canvas.width / 2);
  attackBallY.push(canvas.height / 2);

  // Classic, Laser
  if (attackOption == 1 || attackOption == 2) {
    attackVecX.push(attackX);
    attackVecY.push(attackY);
  }

  // Spin
  else if (attackOption == 3) {
    var rad = Math.radians(attackNum * 48);
    attackVecX.push(Math.cos(rad));
    attackVecY.push(-Math.sin(rad));
  }
}

function controllAttackBall() {
  for (var i = 0; i < attackBallX.length; i++) {
    if (attackOption == 1 || attackOption == 3) {
      attackBallX[i] += attackVecX[i] * 5;
      attackBallY[i] += attackVecY[i] * 5;
    } else if (attackOption == 2) {
      attackBallX[i] += attackVecX[i] * 5.5;
      attackBallY[i] += attackVecY[i] * 5.5;
    }
  }
}

function drawAttackBall() {
  controllAttackBall();
  for (var i = 0; i < attackBallX.length; i++) {
    ctx.beginPath();
    ctx.arc(attackBallX[i], attackBallY[i], 15, 0, Math.PI * 2);
    ctx.fillStyle = "rgb(255, 255, 255)";
    ctx.fill();
    ctx.closePath();
  }
}

function destroyAttackBall() {
  for (var i = 0; i < attackBallX.length; i++) {
    if (
      !(
        attackBallX[i] < canvas.width &&
        attackBallX[i] > 0 &&
        attackBallY[i] < canvas.height &&
        attackBallY[i] > 0
      )
    ) {
      attackBallX.splice(i, 1);
      attackBallY.splice(i, 1);
      attackVecX.splice(i, 1);
      attackVecY.splice(i, 1);

      i -= 1;
    }
  }
}

function endPage() {
  if (newBest) {
    ctx.font = "25px Comic Sans MS";
    ctx.fillStyle = "#ff9900";
    ctx.fillText("New Best!", canvas.width / 2, canvas.height / 2 - 100);

    if (newBestEffectAlpha > 0) {
      ctx.strokeStyle = "rgba(255, 153, 0, " + newBestEffectAlpha + ")";
      ctx.lineWidth = 6;
      ctx.beginPath();
      ctx.arc(
        canvas.width / 2,
        canvas.height / 2 - 100,
        newBestEffectSize,
        0,
        Math.PI * 2
      );
      ctx.stroke();
      ctx.closePath();

      newBestEffectSize += 5;
      newBestEffectAlpha -= 1.7 / 60;
    }
  }

  ctx.font = "30px Comic Sans MS";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText(
    "Press Space to Main.",
    canvas.width / 2,
    canvas.height / 2 + 230
  );
}

function bestTime() {
  if (!sessionStorage.getItem("bestTime")) {
    sessionStorage.setItem("bestTime", "0.00");
  }

  if (start == 0) {
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "#FFCC00";
    ctx.fillText(
      "Best Time: " + sessionStorage.getItem("bestTime"),
      canvas.width / 2,
      canvas.height / 2 - 100
    );
  } else if (start == 1) {
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "#FFCC00";

    if (lastTime <= sessionStorage.getItem("bestTime"))
      ctx.fillText(
        "Best Time: " + sessionStorage.getItem("bestTime"),
        canvas.width / 2,
        canvas.height / 2 - 230
      );
    else
      ctx.fillText(
        "Best Time: " + lastTime,
        canvas.width / 2,
        canvas.height / 2 - 230
      );
  } else {
    ctx.font = "20px Comic Sans MS";
    ctx.fillStyle = "#FFCC00";
    ctx.fillText(
      "Best Time: " + sessionStorage.getItem("bestTime"),
      canvas.width / 2,
      canvas.height / 2 - 230
    );
    checkBestTime();
  }
}

function checkBestTime() {
  if (lastTime > sessionStorage.getItem("bestTime")) {
    sessionStorage.setItem("bestTime", lastTime);
    newBest = 1;
  }
}

function startText() {
  ctx.font = "20px Comic Sans MS";
  ctx.fillStyle = "#ababab";

  var customized = Number(sessionStorage.getItem("customized"));

  if (customized == 0) {
    ctx.fillText(
      "Customize your Frame Size.",
      canvas.width / 2,
      canvas.height / 2 - 190
    );
    ctx.beginPath();
    ctx.moveTo(canvas.width / 4 + 35, canvas.height / 2 - 13);
    ctx.lineTo(canvas.width / 4 + 35, canvas.height / 2 + 13);
    ctx.lineTo(
      canvas.width / 4 + 35 - (20 * Math.sqrt(3)) / 2,
      canvas.height / 2
    );
    ctx.fill();
    ctx.moveTo((canvas.width * 3) / 4 - 35, canvas.height / 2 - 13);
    ctx.lineTo((canvas.width * 3) / 4 - 35, canvas.height / 2 + 13);
    ctx.lineTo(
      (canvas.width * 3) / 4 - 35 + (20 * Math.sqrt(3)) / 2,
      canvas.height / 2
    );
    ctx.fill();
  } else {
    if (tooLarge == 0)
      ctx.fillText("Nice!", canvas.width / 2, canvas.height / 2 - 190);
    else ctx.fillText("Too Large!", canvas.width / 2, canvas.height / 2 - 190);

    ctx.fillText(
      "Press R to Initiallize.",
      canvas.width / 2,
      canvas.height / 2 + 100
    );
  }

  ctx.font = "30px Comic Sans MS";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Avoid Blobs!", canvas.width / 2, canvas.height / 2 - 220);

  ctx.fillText(
    "Press Space to Start.",
    canvas.width / 2,
    canvas.height / 2 + 230
  );
}

function drawTime() {
  ctx.font = "25px Comic Sans MS";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";

  var time = Math.floor(curTime * 100) / 100;

  // 소수점 초가 없다면.
  if (time == Math.floor(time)) time += ".00";
  // 소수점 1자리까지만 있다면.
  else if (time * 10 == Math.floor(time * 10)) time += "0";

  lastTime = Number(time);
  ctx.fillText(time, canvas.width / 2, canvas.height / 2 - 200);
}

function frameControll() {
  var frameX = Number(sessionStorage.getItem("frameX"));
  var frameY = Number(sessionStorage.getItem("frameY"));
  var frameWidth = Number(sessionStorage.getItem("frameWidth"));
  var frameHeight = Number(sessionStorage.getItem("frameHeight"));
  var customized = Number(sessionStorage.getItem("customized"));

  if (right && coll[1]) {
    if (frameX + frameWidth + 2.5 > canvas.width - 1) {
      tooLarge = 1;
    } else {
      tooLarge = 0;
      frameWidth += 1;

      if (customized == 0) sessionStorage.setItem("customized", 1);
    }
  }

  if (left && coll[3]) {
    if (frameX - 2.5 < 0) {
      tooLarge = 1;
    } else {
      tooLarge = 0;
      frameX -= 1;
      frameWidth += 1;

      if (customized == 0) sessionStorage.setItem("customized", 1);
    }
  }

  if (up && coll[0]) {
    if (frameY - 2.5 < 0) {
      tooLarge = 1;
    } else {
      tooLarge = 0;
      frameY -= 1;
      frameHeight += 1;

      if (customized == 0) sessionStorage.setItem("customized", 1);
    }
  }

  if (down && coll[2]) {
    if (frameY + frameHeight + 2.5 > canvas.height - 1) {
      tooLarge = 1;
    } else {
      tooLarge = 0;
      frameHeight += 1;

      if (customized == 0) sessionStorage.setItem("customized", 1);
    }
  }

  sessionStorage.setItem("frameX", frameX);
  sessionStorage.setItem("frameY", frameY);
  sessionStorage.setItem("frameWidth", frameWidth);
  sessionStorage.setItem("frameHeight", frameHeight);
}

function drawFrame() {
  var frameX = Number(sessionStorage.getItem("frameX"));
  var frameY = Number(sessionStorage.getItem("frameY"));
  var frameWidth = Number(sessionStorage.getItem("frameWidth"));
  var frameHeight = Number(sessionStorage.getItem("frameHeight"));

  ctx.strokeStyle = "white";
  ctx.lineWidth = frameBold;
  ctx.beginPath();

  ctx.strokeRect(frameX, frameY, frameWidth, frameHeight);

  ctx.stroke();
  ctx.closePath();
}

function drawEater() {
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, eaterSize, 0, Math.PI * 2);

  // ctx.fillStyle = "rgba(51, 204, 51, "+eaterAlpha+")"
  ctx.fillStyle = "rgba(" + r + ", " + g + ", " + b + ", 0.5)";
  ctx.fill();
  ctx.closePath();
}

function drawEnemy() {
  for (var i = 0; i < randX.length; i++) {
    ctx.beginPath();
    ctx.arc(enemyX[i], enemyY[i], enemySize[i] * sizeFactor[i], 0, Math.PI * 2);
    ctx.fillStyle =
      "rgb(" +
      enemyColor[i][0] +
      ", " +
      enemyColor[i][1] +
      ", " +
      enemyColor[i][2] +
      ")";
    // ctx.fillStyle = "rgba(255, 255, 255, 0.08)";     // Darkness
    ctx.fill();
    ctx.closePath();
  }
}

function drawPlayer() {
  ctx.beginPath();
  ctx.rect(playerX, playerY, blockSize, blockSize);
  ctx.fillStyle = "red";
  // ctx.fillStyle = "rgba(255, 255, 255, 0.05)";     // Darkness
  ctx.fill();
  ctx.closePath();
}

function movement() {
  checkCollide();

  var gravity;
  if (start == 1) gravity = gravitation();
  else gravity = [0, 0];

  var x = getHorizontal();
  var y = getVertical();

  playerX += speed * x + gravity[0];
  playerY += speed * y + gravity[1];
}

function gravitation() {
  var scale = 1.5;

  var x = canvas.width / 2 - (playerX + blockSize / 2);
  var y = canvas.height / 2 - (playerY + blockSize / 2);

  var dist = Math.sqrt(x * x + y * y);
  if (dist < eaterSize) {
    // Dead
    start = 2;
  }

  var gravX = (x / dist) * scale;
  var gravY = (y / dist) * scale;

  return [gravX, gravY];
}

function keyDownHandler(e) {
  // UP
  if (e.keyCode == 38 || e.keyCode == 87) up = true;

  // RIHGT
  if (e.keyCode == 39 || e.keyCode == 68) right = true;

  // DOWN
  if (e.keyCode == 40 || e.keyCode == 83) down = true;

  // LEFT
  if (e.keyCode == 37 || e.keyCode == 65) left = true;

  if (start == 0) {
    if (e.keyCode == 32) {
      start = 1;
      startTime = new Date();

      setTimeout(setEnemy, createSpeed);
    }

    if (e.keyCode == 82) {
      sessionStorage.setItem("frameX", canvas.width / 4);
      sessionStorage.setItem("frameY", canvas.height / 4);
      sessionStorage.setItem("frameWidth", canvas.width / 2);
      sessionStorage.setItem("frameHeight", canvas.height / 2);
      sessionStorage.setItem("customized", 0);
    }
  } else if (start == 2) {
    if (e.keyCode == 32) {
      location.reload();
    }
  }
}

function keyUpHandler(e) {
  // UP
  if (e.keyCode == 38 || e.keyCode == 87) up = false;

  // RIHGT
  if (e.keyCode == 39 || e.keyCode == 68) right = false;

  // DOWN
  if (e.keyCode == 40 || e.keyCode == 83) down = false;

  // LEFT
  if (e.keyCode == 37 || e.keyCode == 65) left = false;
}

function getVertical() {
  if (up && !down) return -1;
  else if (!up && down) return 1;
  else return 0;
}

function getHorizontal() {
  if (right && !left) return 1;
  else if (!right && left) return -1;
  else return 0;
}

function checkCollide() {
  var frameX = Number(sessionStorage.getItem("frameX"));
  var frameY = Number(sessionStorage.getItem("frameY"));
  var frameWidth = Number(sessionStorage.getItem("frameWidth"));
  var frameHeight = Number(sessionStorage.getItem("frameHeight"));

  if (playerX - frameBold / 2 <= frameX) {
    playerX = frameX + 2.5;
    coll[3] = true;
  } else coll[3] = false;

  if (playerX + blockSize + frameBold / 2 >= frameX + frameWidth) {
    playerX = -blockSize + frameX + frameWidth - 2.5;
    coll[1] = true;
  } else coll[1] = false;

  if (playerY + blockSize + frameBold / 2 >= frameY + frameHeight) {
    playerY = frameY + frameHeight - 2.5 - blockSize;
    coll[2] = true;
  } else coll[2] = false;

  if (playerY - frameBold / 2 <= frameY) {
    playerY = frameY + 2.5;
    coll[0] = true;
  } else coll[0] = false;
}

function setEnemy() {
  createSpeed = Math.floor(startCreateSpeed - curTime * 3);
  randDir = Math.floor(Math.random() * 4 + 1);

  var tmpSize = Math.random() * 20 + 100;
  enemySize.push(tmpSize);

  enemyColor.push([
    Math.random() * 255,
    Math.random() * 255,
    Math.random() * 255,
  ]);

  if (randDir == 1) {
    randX.push(Math.random() * canvas.width);
    randY.push(-tmpSize);
    enemyX.push(randX[randX.length - 1]);
    enemyY.push(randY[randY.length - 1]);
  } else if (randDir == 2) {
    randX.push(canvas.width + tmpSize);
    randY.push(Math.random() * canvas.height);
    enemyX.push(randX[randX.length - 1]);
    enemyY.push(randY[randY.length - 1]);
  } else if (randDir == 3) {
    randX.push(Math.random() * canvas.width);
    randY.push(canvas.height + tmpSize);
    enemyX.push(randX[randX.length - 1]);
    enemyY.push(randY[randY.length - 1]);
  } else {
    randX.push(-tmpSize);
    randY.push(Math.random() * canvas.height);
    enemyX.push(randX[randX.length - 1]);
    enemyY.push(randY[randY.length - 1]);
  }

  // calculate ememySpeed
  var curX = randX[randX.length - 1];
  var curY = randY[randY.length - 1];

  curX = canvas.width / 2 - curX;
  curY = canvas.height / 2 - curY;
  var randSpeed = Math.random() * 2 + 4;

  var dist = Math.sqrt(curX * curX + curY * curY);

  enemySpeed.push([(curX / dist) * randSpeed, (curY / dist) * randSpeed]);
  enemyDist.push(dist);
  sizeFactor.push(1);

  setTimeout(setEnemy, createSpeed);
}

function enemyMovement() {
  for (var i = 0; i < randX.length; i++) {
    enemyX[i] += enemySpeed[i][0];
    enemyY[i] += enemySpeed[i][1];

    var x = enemyX[i] - randX[i];
    var y = enemyY[i] - randY[i];
    var curDist = Math.sqrt(x * x + y * y);

    sizeFactor[i] = 1 - curDist / enemyDist[i];
    if (sizeFactor[i] < 0) sizeFactor[i] = 0;
  }
}

function destroyEnemy() {
  for (var i = 0; i < randX.length; i++) {
    if (sizeFactor[i] < 0.05) {
      setEatEffect(i);

      r = enemyColor[i][0];
      g = enemyColor[i][1];
      b = enemyColor[i][2];

      randX.splice(i, 1);
      randY.splice(i, 1);
      enemyX.splice(i, 1);
      enemyY.splice(i, 1);
      enemySpeed.splice(i, 1);
      enemySize.splice(i, 1);
      enemyDist.splice(i, 1);
      sizeFactor.splice(i, 1);
      enemyColor.splice(i, 1);
      i -= 1;
      eaterSize += 0.5;

      if (eaterSize > 90) eaterSize = 90;
    }
  }
}

function checkDead() {
  // Enemy
  for (var i = 0; i < randX.length; i++) {
    var x = playerX + blockSize / 2 - enemyX[i];
    var y = playerY + blockSize / 2 - enemyY[i];

    var dist = Math.sqrt(x * x + y * y);

    if (
      dist + 10 <
      (blockSize * Math.sqrt(2)) / 2 + enemySize[i] * sizeFactor[i]
    ) {
      start = 2;
    }
  }

  // attackBall
  for (var i = 0; i < attackBallX.length; i++) {
    var x = playerX + blockSize / 2 - attackBallX[i];
    var y = playerY + blockSize / 2 - attackBallY[i];

    var dist = Math.sqrt(x * x + y * y);

    if (dist + 3 < (blockSize * Math.sqrt(2)) / 2 + 15) {
      start = 2;
    }
  }
}

function setEatEffect(curIdx) {
  enemyColor[curIdx].push(1);

  effectSize.push(eaterSize);
  effectColor.push(enemyColor[curIdx]);
  effectSpeed.push(Math.random() * 4 + 3);
}

function drawEffect() {
  for (var i = 0; i < effectSize.length; i++) {
    ctx.strokeStyle =
      "rgba(" +
      effectColor[i][0] +
      ", " +
      effectColor[i][1] +
      ", " +
      effectColor[i][2] +
      ", " +
      effectColor[i][3] +
      ")";
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.arc(canvas.width / 2, canvas.height / 2, effectSize[i], 0, Math.PI * 2);
    ctx.stroke();
    ctx.closePath();
  }
}

function controllEffect() {
  for (var i = 0; i < effectSize.length; i++) {
    effectSize[i] += effectSpeed[i];
    effectColor[i][3] -= 0.3 / frame;

    if (effectColor[i][3] <= 0) effectColor[i][3] = 0;
  }
}

function destroyEffect() {
  var limit = (canvas.width / 2) * Math.sqrt(2);
  for (var i = 0; i < effectSize.length; i++) {
    if (effectSize[i] > limit) {
      effectSize.splice(i, 1);
      effectColor.splice(i, 1);
      effectSpeed.splice(i, 1);

      i -= 1;
    }
  }
}

var canvas = document.getElementById("myCanvas");
var timeScore = document.getElementById("timeScore");
var ctx = canvas.getContext("2d");
var frame = 1000 / 60; // 10 frame

var row = 30;
var column = 30;
var blockSize = canvas.width / row;

var playerX = blockSize * (row / 2) - 10;
var playerY = blockSize * (column / 2) + 50;

var curDir = 2;
var speed = 3;

var up = false;
var left = false;
var down = false;
var right = false;

var colPos = 0;
var first = 0;

var frameBold = 5;

var randX = [];
var randY = [];
var enemyX = [];
var enemyY = [];
var enemySpeed = [];
var enemySize = [];
var enemyDist = [];
var sizeFactor = [];
var enemyColor = [];

var effectSize = [];
var effectColor = [];
var effectSpeed = [];

var eaterSize = 5;

var r = 255;
var g = 255;
var b = 255;

var startTime, endTime, curTime;

var createSpeed;
var startCreateSpeed = 500;
var start = 0;

var coll = [false, false, false, false]; // up, right, down, left

if (!sessionStorage.getItem("frameX")) {
  sessionStorage.setItem("frameX", canvas.width / 4);
  sessionStorage.setItem("frameY", canvas.height / 4);
  sessionStorage.setItem("frameWidth", canvas.width / 2);
  sessionStorage.setItem("frameHeight", canvas.width / 2);
}

if (!sessionStorage.getItem("customized")) {
  sessionStorage.setItem("customized", 0);
}

var tooLarge = 0;
var lastTime = 0;
var newBest = 0;

var eaterAlpha = 1.0;
var r = 255,
  g = (b = 0);

var attackNum = 0;
var attackOption = 4; // 1: Classic 2: Laser 3: Spin 4: Infinity Laser
var attackCount = 0;
var attackX, attackY;
var attackBallX = [];
var attackBallY = [];
var attackVecX = [];
var attackVecY = [];
var attackLineColor = [255, 0, 0]; // R, G, Alpha
var attackDelayCount = 0;
var startAttack = 0;

var newBestEffectSize = 5;
var newBestEffectAlpha = 1.0;

var curRad = 0;

document.addEventListener("keydown", keyDownHandler, false);
document.addEventListener("keyup", keyUpHandler, false);

setInterval(update, frame);

//
