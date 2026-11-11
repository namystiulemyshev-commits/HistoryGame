
const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");

// Chapter 0 characters and objects
const player = {
  x: 390,
  y: 405,
  size: 24,
  speed: 3
};

const teacher = {
  x: 490,
  y: 175,
  size: 28
};

const machine = {
  x: 675,
  y: 130,
  size: 48
};

const keys = {};

let talking = false;
let teacherFinished = false;
let gameFinished = false;

// Distance between objects
function distance(a, b) {
  return Math.hypot(
    a.x - b.x,
    a.y - b.y
  );
}

// Keyboard controls
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();
  // Press P while in Egypt to enter the throne room.
if (
  key === "p" &&
  !e.repeat &&
  egyptArrivalActive &&
  typeof startEgyptThrone === "function"
) {
  startEgyptThrone();
  return;
}

  if (
    ["arrowup", "arrowdown", "arrowleft", "arrowright", " "]
      .includes(key)
  ) {
    e.preventDefault();
  }

  // Don't interact with the world during the minigame.
  const minigameOpen =
    typeof guardMinigameActive !== "undefined" &&
    guardMinigameActive;

  if (minigameOpen) {
    return;
  }

  keys[key] = true;

  // E = Interact
  
if (key === "e" && !e.repeat && !talking) {

  if (secretChamberActive) {
    // Interact with chamber symbols and objects
    interactSecretChamber();

  } else if (egyptThroneActive) {
    // Search for the secret entrance
    interactSecretEntrance();

  } else if (egyptArrivalActive) {
    // Existing guards interaction
    interactEgyptGuard();

  } else {
    // Chapter 0 classroom interaction
    interact();
  }
}

});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});
