
const arrivalImage = new Image();
arrivalImage.src = "assets/chapter1/egypt_arrival.png";

let egyptArrivalActive = false;

// Starting position
const egyptPlayer = {
  x: 400,
  y: 380,
  speed: 3
};

// Start Chapter 1
function startEgyptArrival() {
  egyptArrivalActive = true;

  egyptPlayer.x = 400;
  egyptPlayer.y = 380;

  walking = false;
  facing = "front";

  const transition =
    document.getElementById("chapterTransition");

  if (transition) {
    transition.remove();
  }

  const title = document.querySelector("h1");

  if (title) {
    title.textContent = "Chapter 1: Ancient Egypt";
  }

  objective.textContent =
    "Objective: Speak to the royal guards.";
}

// Update player movement
function updateEgyptArrival() {
  if (!egyptArrivalActive) return;

  const minigameOpen =
    typeof guardMinigameActive !== "undefined" &&
    guardMinigameActive;

  if (talking || minigameOpen) {
    walking = false;
    return;
  }

  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["arrowup"]) dy--;
  if (keys["s"] || keys["arrowdown"]) dy++;
  if (keys["a"] || keys["arrowleft"]) dx--;
  if (keys["d"] || keys["arrowright"]) dx++;

  const length = Math.hypot(dx, dy);

  walking = length > 0;

  // Update direction
  if (dy > 0) {
    facing = "front";
  } else if (dy < 0) {
    facing = "back";
  } else if (dx > 0) {
    facing = "right";
  } else if (dx < 0) {
    facing = "left";
  }

  // Move the player
  if (length > 0) {
  const moveX = dx / length * egyptPlayer.speed;
  const moveY = dy / length * egyptPlayer.speed;

  // Try horizontal movement
  const nextX = egyptPlayer.x + moveX;

  if (
    canMoveInEgypt(nextX, egyptPlayer.y) &&
    canMovePastGuards(nextX, egyptPlayer.y) &&
    canEnterRoyalArea(nextX, egyptPlayer.y)
  ) {
    egyptPlayer.x = nextX;
  }

  // Try vertical movement
  const nextY = egyptPlayer.y + moveY;

  if (
    canMoveInEgypt(egyptPlayer.x, nextY) &&
    canMovePastGuards(egyptPlayer.x, nextY) &&
    canEnterRoyalArea(egyptPlayer.x, nextY)
  ) {
    egyptPlayer.y = nextY;
  }
}

  // Map boundaries
  egyptPlayer.x = Math.max(
    20,
    Math.min(canvas.width - 20, egyptPlayer.x)
  );

  egyptPlayer.y = Math.max(
    35,
    Math.min(canvas.height - 40, egyptPlayer.y)
  );
}

// Draw Chapter 1
function drawEgyptArrival() {
  if (!egyptArrivalActive) return;

  ctx.clearRect(
    0,
    0,
    canvas.width,
    canvas.height
  );

  ctx.imageSmoothingEnabled = false;

  // Draw background
  if (
    arrivalImage.complete &&
    arrivalImage.naturalWidth
  ) {
    ctx.drawImage(
      arrivalImage,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  // Draw student and guards
  drawEgyptCharacters();
  drawEgyptCollisions();

  const minigameOpen =
    typeof guardMinigameActive !== "undefined" &&
    guardMinigameActive;

  // E interaction prompt
  const nearbyGuard = getNearbyGuard();

  if (nearbyGuard && !talking && !minigameOpen) {
    ctx.save();

    ctx.fillStyle = "#ffffff";
    ctx.font = "16px Arial";
    ctx.textAlign = "center";

    ctx.fillText(
      "Press E to talk",
      nearbyGuard.x,
      nearbyGuard.y - 85
    );

    ctx.restore();
  }
}

// Draw animated student
function drawEgyptStudent() {
  if (
    !studentSheet.complete ||
    !studentSheet.naturalWidth
  ) {
    return;
  }

  const frameWidth = 80;
  const frameHeight = 136;

  const row = walking ? 1 : 0;

  const frame = walking
    ? Math.floor(performance.now() / 140) % 4
    : 0;

  const column =
    directions[facing] * 4 + frame;

  const width = 35;
  const height = 60;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
    studentSheet,
    column * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    egyptPlayer.x - width / 2,
    egyptPlayer.y - height,
    width,
    height
  );

  ctx.restore();
}

// Draw student and guards in depth order
function drawEgyptCharacters() {
  const time = performance.now();

  const characters = [
    {
      y: egyptPlayer.y,
      draw: () => drawEgyptStudent()
    },

    ...egyptGuards.map(guard => ({
      y: guard.y,
      draw: () => drawOneEgyptGuard(guard, time)
    }))
  ];

  // Characters lower on screen render in front
  characters.sort((a, b) => a.y - b.y);

  for (const character of characters) {
    character.draw();
  }
}
const egyptWalls=[
  // Top left stones 
  { x: 0, y: 0, w: 290, h: 155 },
  //Top right river with rocks
  { x: 515, y: 0, w: 285, h: 155 },
  //Left market 
  { x: 0, y: 170, w: 155, h: 115 },
  //Right building 
  { x: 615, y: 145, w: 185, h: 145 },
  //Sphinx
  { x: 0, y: 315, w: 225, h: 165 },
  //Bottom right 
  { x: 615, y: 330, w: 185, h: 150 },
  //Trees
  { x: 240, y: 300, w: 20, h: 30 }

];

function canMoveInEgypt(x, y) {
  const radius = 9;

  // Check map boundaries
  if (
    x - radius < 0 ||
    x + radius > canvas.width ||
    y - radius < 0 ||
    y + radius > canvas.height
  ) {
    return false;
  }

  // Check solid objects
  for (const wall of egyptWalls) {
    const closestX = Math.max(
      wall.x,
      Math.min(x, wall.x + wall.w)
    );

    const closestY = Math.max(
      wall.y,
      Math.min(y, wall.y + wall.h)
    );

    const dx = x - closestX;
    const dy = y - closestY;

    if (dx * dx + dy * dy < radius * radius) {
      return false;
    }
  }
  return true;}



const showEgyptCollisions = false;

function drawEgyptCollisions() {
  if (!showEgyptCollisions) return;

  ctx.save();

  ctx.fillStyle = "rgba(255, 0, 0, 0.20)";
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;

  for (const wall of egyptWalls) {
    ctx.fillRect(
      wall.x,
      wall.y,
      wall.w,
      wall.h
    );

    ctx.strokeRect(
      wall.x,
      wall.y,
      wall.w,
      wall.h
    );
  }

  ctx.restore();
}
