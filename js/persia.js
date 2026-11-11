
const persiaMap = new Image();
persiaMap.src = "assets/chapter2/persia_map.png";

persiaMap.onerror = () => {
  console.error("Persian map image failed to load");
};

let persiaActive = false;
let persiaTeleporting = false;

const persiaPlayer = {
  x: 400,
  y: 420,
  speed: 3
};

// Transition from Egypt to Persia
function startPersiaTeleport() {
  if (persiaTeleporting) return;

  persiaTeleporting = true;
  walking = false;

  for (const key in keys) {
    keys[key] = false;
  }

  const overlay = document.createElement("div");
  overlay.id = "persiaTeleport";

  overlay.innerHTML = `
    <img
      src="assets/chapter2/persia_intro.png"
      class="persia-intro-image"
      alt="Chapter 2: The Persian Empire"
    >
  `;

  document.body.appendChild(overlay);

  setTimeout(() => {
    startPersia();
    overlay.remove();
    persiaTeleporting = false;
  }, 3000);
}

// Begin Chapter 2
function startPersia() {
  persiaActive = true;
  egyptThroneActive = false;
  egyptArrivalActive = false;

  if (typeof secretChamberActive !== "undefined") {
    secretChamberActive = false;
  }

  persiaPlayer.x = 400;
  persiaPlayer.y = 420;

  walking = false;
  facing = "back";

  for (const key in keys) {
    keys[key] = false;
  }

  document.querySelector("h1").textContent =
    "Chapter 2: The Persian Empire";

  objective.textContent =
    "Objective: Explore the Persian Empire.";
}

// Movement
function updatePersia() {
  if (!persiaActive || talking) {
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
    persiaPlayer.x += dx / length * persiaPlayer.speed;
    persiaPlayer.y += dy / length * persiaPlayer.speed;
  }

  persiaPlayer.x = Math.max(
    25,
    Math.min(775, persiaPlayer.x)
  );

  persiaPlayer.y = Math.max(
    80,
    Math.min(465, persiaPlayer.y)
  );
}

// Draw the Persian Empire
function drawPersia() {
  if (!persiaActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.imageSmoothingEnabled = false;

  if (persiaMap.complete && persiaMap.naturalWidth) {
    ctx.drawImage(
      persiaMap,
      0,
      0,
      canvas.width,
      canvas.height
    );
  } else {
    ctx.fillStyle = "#b99561";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  drawPersiaStudent();
}

// Draw existing student sprite
function drawPersiaStudent() {
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
    persiaPlayer.x - width / 2,
    persiaPlayer.y - height,
    width,
    height
  );

  ctx.restore();
}
