//student sheet
const studentSheet= new Image (); 
studentSheet.src="assets/student_spritesheet.png";
let walking = false;
let facing= "front";
const directions={
    front:0,
    right:1,
    back:2,
    left:3

};



// Distance between objects
function distance(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

// Move the player
function update() {
  if (talking || gameFinished) return;

  let dx = 0;
  let dy = 0;

  if (keys["w"] || keys["arrowup"]) dy--;
  if (keys["s"] || keys["arrowdown"]) dy++;
  if (keys["a"] || keys["arrowleft"]) dx--;
  if (keys["d"] || keys["arrowright"]) dx++;

  const length = Math.hypot(dx, dy);

  
if (length > 0) {
  const moveX = dx / length * player.speed;
  const moveY = dy / length * player.speed;

  // Horizontal movement
  if (canMoveTo(player.x + moveX, player.y)) {
    player.x += moveX;
  }

  // Vertical movement
  if (canMoveTo(player.x, player.y + moveY)) {
    player.y += moveY;
  }
}


  player.x = Math.max(20, Math.min(780, player.x));
  player.y = Math.max(35, Math.min(460, player.y));

  walking = dx !== 0 || dy !== 0;

if (dy > 0) {
  facing = "front";
} else if (dy < 0) {
  facing = "back";
} else if (dx > 0) {
  facing = "right";
} else if (dx < 0) {
  facing = "left";
}
}

// Draw a character
function drawCharacter(character, color, label) {
  const s = character.size;

  ctx.fillStyle = color;
  ctx.fillRect(character.x - s / 2, character.y - s / 2, s, s);

  ctx.fillStyle = "#ffffff";
  ctx.font = "13px Arial";
  ctx.textAlign = "center";
  ctx.fillText(label, character.x, character.y - s);
}


//draw student

function drawStudent() {
  if (!studentSheet.complete || !studentSheet.naturalWidth) {
    return;
  }

  const frameWidth = 80;
  const frameHeight = 136;

  // Row 0 = idle, Row 1 = walking
  const row = walking ? 1 : 0;

  // Walking animation
  const frame = walking
    ? Math.floor(performance.now() / 140) % 4
    : 0;

  const column = directions[facing] * 4 + frame;

  // Student size
  const width = 44;
  const height = 75;

  // Idle animation: slight squatting
  const phase = Math.floor(performance.now() / 300) % 4;

  let squat = 0;

  // Only squat when standing still
  if (!walking) {
    squat = (phase === 1 || phase === 2) ? 3 : 0;
  }

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
    studentSheet,
    column * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    player.x - width / 2,
    player.y + 12 - (height - squat),
    width,
    height - squat
  );
}


