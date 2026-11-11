
const throneImage = new Image();
throneImage.src = "assets/chapter1/egypt_throne_room.png";

let egyptThroneActive = false;
let pharaohMet = false;

const thronePlayer = {
  x: 400,
  y: 450,
  speed: 3
};

// Pharaoh's position on the map
const pharaoh = {
  x: 400,
  y: 135
};

function startEgyptThrone() {
  egyptThroneActive = true;
  egyptArrivalActive = false;

  thronePlayer.x = 400;
  thronePlayer.y = 450;

  walking = false;
  facing = "back";

  // Stop any held movement keys
  for (const key in keys) {
    keys[key] = false;
  }

  document.querySelector("h1").textContent =
    "Chapter 1: The Pharaoh's Throne Room";

  objective.textContent =
    "Objective: Approach the Pharaoh.";
}

// Player movement inside throne room
function updateEgyptThrone() {
  if (!egyptThroneActive || talking) {
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

  if (dy > 0) facing = "front";
  else if (dy < 0) facing = "back";
  else if (dx > 0) facing = "right";
  else if (dx < 0) facing = "left";

  if (length > 0) {
    const moveX = dx / length * thronePlayer.speed;
    const moveY = dy / length * thronePlayer.speed;

    const nextX = thronePlayer.x + moveX;
    const nextY = thronePlayer.y + moveY;

    if (canMoveInThrone(nextX, thronePlayer.y)) {
      thronePlayer.x = nextX;
    }

    if (canMoveInThrone(thronePlayer.x, nextY)) {
      thronePlayer.y = nextY;
    }
  }

  // Automatic dialogue near the Pharaoh
  const distance = Math.hypot(
    thronePlayer.x - pharaoh.x,
    thronePlayer.y - pharaoh.y
  );

  if (distance < 125 && !pharaohMet) {
    pharaohMet = true;
    walking = false;
    facing = "back";

    startPharaohDialogue();
  }
}

// Throne room boundaries
function canMoveInThrone(x, y) {
  const radius = 10;

  if (
    x < 140 + radius ||
    x > 660 - radius ||
    y < 225 + radius ||
    y > 475 - radius
  ) {
    return false;
  }

  return true;
}

// Draw student
function drawThroneStudent() {
  if (!studentSheet.complete || !studentSheet.naturalWidth) {
    return;
  }

  const frameWidth = 80;
  const frameHeight = 136;

  const row = walking ? 1 : 0;
  const frame = walking
    ? Math.floor(performance.now() / 140) % 4
    : 0;

  const column = directions[facing] * 4 + frame;

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
    thronePlayer.x - width / 2,
    thronePlayer.y - height,
    width,
    height
  );

  ctx.restore();
}

// Draw background and student
function drawEgyptThrone() {
  if (!egyptThroneActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.imageSmoothingEnabled = false;

  if (throneImage.complete && throneImage.naturalWidth) {
    ctx.drawImage(
      throneImage,
      0,
      0,
      canvas.width,
      canvas.height
    );
  }

  drawThroneStudent();
  drawSecretEntranceHint();
}

// First Pharaoh conversation

function startPharaohDialogue() {
  showDialogue(
    "Pharaoh",
    "A stranger enters my palace. What brings you before my throne?",
    [],
    () => {
      showDialogue(
        "Student",
        "Your Majesty, I am searching for an ancient lamp.",
        [],
        () => {
          showDialogue(
            "Pharaoh",
            "An ancient lamp? I may know something about it.",
            [],
            () => {
              showDialogue(
                "Pharaoh",
                "But first, you must prove your wisdom. You have six attempts to discover my hidden word.",
                [],
                () => {
                  closeDialogue();

                  objective.textContent =
                    "Objective: Solve the Pharaoh's hidden word.";

                  // Open the Node.js-powered Wordle game
                  startPharaohWordle();
                }
              );
            }
          );
        }
      );
    }
  );
}

