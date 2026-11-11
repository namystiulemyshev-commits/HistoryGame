
let pharaohClueReceived = false;
let secretChamberActive = false;
let secretPuzzleProgress = 0;
let mapFragmentFound = false;

const chamberPlayer = {
  x: 400,
  y: 420,
  speed: 3
};

const hiddenEntrance = {
  x: 620,
  y: 270
};

const chamberSymbols = [
  { name: "SUN", x: 230, y: 220 },
  { name: "RIVER", x: 400, y: 220 },
  { name: "STAR", x: 570, y: 220 }
];

const chamberSolution = ["SUN", "RIVER", "STAR"];

const mapFragment = { x: 400, y: 110 };

function nearPoint(player, point, range = 55) {
  return Math.hypot(
    player.x - point.x,
    player.y - point.y
  ) < range;
}

// Dialogue after winning Pharaoh's Wordle
function startPharaohSecretDialogue() {
  showDialogue(
    "Pharaoh",
    "You have proven your wisdom. I shall share a secret kept by my ancestors.",
    [],
    () => {
      showDialogue(
        "Pharaoh",
        "Beneath this palace lies a forgotten chamber. It contains a fragment of an ancient map.",
        [],
        () => {
          showDialogue(
            "Student",
            "A map? Could it help me find the ancient lamp?",
            [],
            () => {
              showDialogue(
                "Pharaoh",
                "Perhaps. Seek the mark of the setting sun along the eastern side of this hall.",
                [],
                () => {
                  pharaohClueReceived = true;

                  objective.textContent =
                    "Objective: Find the hidden entrance.";

                  closeDialogue();
                }
              );
            }
          );
        }
      );
    }
  );
}

// Hidden symbol in the throne room
function drawSecretEntranceHint() {
  if (!pharaohClueReceived || secretChamberActive) return;

  ctx.save();
  ctx.textAlign = "center";
  ctx.font = "bold 22px Arial";
  ctx.fillStyle = "#d2a65c";

  // Small mysterious symbol
  ctx.fillText(
    "☀",
    hiddenEntrance.x,
    hiddenEntrance.y - 10
  );

  if (nearPoint(thronePlayer, hiddenEntrance, 50)) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";

    ctx.fillText(
      "Press E to investigate",
      hiddenEntrance.x,
      hiddenEntrance.y - 40
    );
  }

  ctx.restore();
}

// Interact with hidden entrance
function interactSecretEntrance() {
  if (!pharaohClueReceived) return false;

  if (!nearPoint(thronePlayer, hiddenEntrance, 50)) {
    return false;
  }

  showDialogue(
    "Student",
    "This symbol looks different from the others. There seems to be a hidden mechanism behind the stone.",
    [],
    () => {
      closeDialogue();
      startSecretChamber();
    }
  );

  return true;
}

// Enter the new map
function startSecretChamber() {
  secretChamberActive = true;
  egyptThroneActive = false;
  egyptArrivalActive = false;

  chamberPlayer.x = 400;
  chamberPlayer.y = 420;

  walking = false;
  facing = "back";

  for (const key in keys) {
    keys[key] = false;
  }

  document.querySelector("h1").textContent =
    "Chapter 1: The Secret Chamber";

  objective.textContent = mapFragmentFound
    ? "Objective: Return with the map fragment."
    : "Objective: Solve the ancient symbol puzzle.";
}

// Move around the chamber
function updateSecretChamber() {
  if (!secretChamberActive || talking) {
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
    chamberPlayer.x += dx / length * chamberPlayer.speed;
    chamberPlayer.y += dy / length * chamberPlayer.speed;
  }

  // Stay inside the chamber
  chamberPlayer.x = Math.max(
    60, Math.min(740, chamberPlayer.x)
  );

  chamberPlayer.y = Math.max(
    95, Math.min(450, chamberPlayer.y)
  );
}

// Interact with the chamber objects
function interactSecretChamber() {
  if (!secretChamberActive) return;

  // Collect the map after solving the puzzle
  if (
    secretPuzzleProgress === chamberSolution.length &&
    !mapFragmentFound &&
    nearPoint(chamberPlayer, mapFragment, 55)
  ) {
    mapFragmentFound = true;

    objective.textContent =
      "Objective: Return with the map fragment.";

    showDialogue(
      "Student",
      "An ancient map fragment! It points toward the Persian Empire. This could be my next destination.",
      [],
      closeDialogue
    );

    return;
  }

  // Activate puzzle symbols
  for (const symbol of chamberSymbols) {
    if (nearPoint(chamberPlayer, symbol, 50)) {
      activateChamberSymbol(symbol.name);
      return;
    }
  }

  // Leave through the southern passage
  const exit = { x: 400, y: 445 };

  if (
    mapFragmentFound &&
    nearPoint(chamberPlayer, exit, 40)
  ) {
    secretChamberActive = false;
    startEgyptThrone();

    objective.textContent =
      "Objective: Return to the time machine.";
  }
}

// Puzzle: activate the symbols in the right order
function activateChamberSymbol(name) {
  if (secretPuzzleProgress === 3) return;

  const expected = chamberSolution[secretPuzzleProgress];

  if (name === expected) {
    secretPuzzleProgress++;

    if (secretPuzzleProgress === 3) {
      objective.textContent =
        "Objective: Collect the ancient map fragment.";

      showDialogue(
        "Student",
        "The symbols are glowing! A hidden pedestal has opened.",
        [],
        closeDialogue
      );
    }
  } else {
    secretPuzzleProgress = 0;

    showDialogue(
      "Student",
      "The symbols have gone dark. I must have activated them in the wrong order.",
      [],
      closeDialogue
    );
  }
}

// Draw the temporary underground room
function drawSecretChamber() {
  if (!secretChamberActive) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();

  // Floor
  ctx.fillStyle = "#8d6840";
  ctx.fillRect(0, 0, 800, 480);

  // Stone floor tiles
  ctx.strokeStyle = "#a88354";
  ctx.lineWidth = 1;

  for (let x = 40; x < 800; x += 40) {
    for (let y = 40; y < 480; y += 40) {
      ctx.strokeRect(x, y, 40, 40);
    }
  }

  // Stone walls
  ctx.fillStyle = "#493524";
  ctx.fillRect(0, 0, 800, 70);
  ctx.fillRect(0, 0, 35, 480);
  ctx.fillRect(765, 0, 35, 480);

  ctx.fillStyle = "#d2a65c";
  ctx.font = "bold 24px Arial";
  ctx.textAlign = "center";
  ctx.fillText("THE FORGOTTEN CHAMBER", 400, 45);

  // Puzzle hint
  ctx.font = "16px Arial";
  ctx.fillStyle = "#f0d58a";
  ctx.fillText(
    "First comes the light, then the water, then the night.",
    400, 80
  );

  // Three puzzle pedestals
  for (const symbol of chamberSymbols) {
    const activeIndex = chamberSolution.indexOf(symbol.name);
    const activated = activeIndex < secretPuzzleProgress;

    ctx.fillStyle = activated ? "#b89a41" : "#493b43";
    ctx.fillRect(symbol.x - 55, symbol.y - 35, 110, 70);

    ctx.strokeStyle = "#f0d58a";
    ctx.lineWidth = 3;
    ctx.strokeRect(symbol.x - 55, symbol.y - 35, 110, 70);

    ctx.font = "bold 17px Arial";
    ctx.fillStyle = "#ffffff";
    ctx.fillText(symbol.name, symbol.x, symbol.y + 6);

    if (
      nearPoint(chamberPlayer, symbol, 50) &&
      secretPuzzleProgress < 3
    ) {
      ctx.font = "13px Arial";
      ctx.fillText("Press E", symbol.x, symbol.y - 48);
    }
  }

  // Hidden map fragment
  if (secretPuzzleProgress === 3) {
    ctx.fillStyle = mapFragmentFound ? "#665842" : "#e9cd8b";
    ctx.fillRect(375, 95, 50, 35);

    if (!mapFragmentFound) {
      ctx.fillStyle = "#35291d";
      ctx.font = "bold 13px Arial";
      ctx.fillText("MAP", 400, 117);
    }
  }

  // Exit
  ctx.fillStyle = "#221d21";
  ctx.fillRect(365, 452, 70, 28);

  if (
    mapFragmentFound &&
    nearPoint(chamberPlayer, { x: 400, y: 445 }, 40)
  ) {
    ctx.fillStyle = "#ffffff";
    ctx.font = "14px Arial";
    ctx.fillText("Press E to leave", 400, 435);
  }

  // Student sprite
  drawChamberStudent();

  ctx.restore();
}

function drawChamberStudent() {
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

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
    studentSheet,
    column * frameWidth,
    row * frameHeight,
    frameWidth,
    frameHeight,
    chamberPlayer.x - 17.5,
    chamberPlayer.y - 60,
    35,
    60
  );
}
