
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

    // Horizontal collision
    const nextX = egyptPlayer.x + moveX;

    if (
      canMovePastGuards(nextX, egyptPlayer.y) &&
      canEnterRoyalArea(nextX, egyptPlayer.y)
    ) {
      egyptPlayer.x = nextX;
    }

    // Vertical collision
    const nextY = egyptPlayer.y + moveY;

    if (
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
