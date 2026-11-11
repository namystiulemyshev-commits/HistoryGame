
const guardSheet = new Image();

guardSheet.src =
  "assets/chapter1/egyptian_guard_pixel_art_spritesheet.png";

guardSheet.onerror = () => {
  console.error("Egyptian guard spritesheet failed to load");
};

// Guard positions
const egyptGuards = [
  {
    x: 330,
    y: 170,
    name: "Royal Guard"
  },
  {
    x: 445,
    y: 170,
    name: "Royal Guard"
  }
];

let guardsEncountered = false;

// Draw a guard sprite
function drawOneEgyptGuard(guard, time) {
  if (!guardSheet.complete || !guardSheet.naturalWidth) {
    return;
  }

  const columns = 16;
  const rows = 5;

  const frameWidth = guardSheet.naturalWidth / columns;
  const frameHeight = guardSheet.naturalHeight / rows;

  const frame = Math.floor(time / 350) % 4;
  const bob = Math.floor(time / 450) % 2;

  const width = 52;
  const height = 70;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
    guardSheet,
    frame * frameWidth,
    0,
    frameWidth,
    frameHeight,
    guard.x - width / 2,
    guard.y - height + bob,
    width,
    height
  );

  ctx.restore();
}

// Draw both guards
function drawEgyptGuards() {
  if (!egyptArrivalActive) return;

  const time = performance.now();

  for (const guard of egyptGuards) {
    drawOneEgyptGuard(guard, time);
  }
}

// Find nearby guard
function getNearbyGuard() {
  for (const guard of egyptGuards) {
    const distance = Math.hypot(
      egyptPlayer.x - guard.x,
      egyptPlayer.y - guard.y
    );

    if (distance < 75) {
      return guard;
    }
  }

  return null;
}

// Interact with guards
function interactEgyptGuard() {
  const guard = getNearbyGuard();

  if (!guard) return;

  if (
    typeof guardMinigameActive !== "undefined" &&
    guardMinigameActive
  ) {
    return;
  }

  // Already passed the challenge
  if (guardsEncountered) {
    showDialogue(
      "Royal Guard",
      "You have passed the royal trial. The royal adviser is expecting you.",
      [],
      closeDialogue
    );

    return;
  }

  // Launch the checkpoint minigame
  if (typeof startGuardMinigame === "function") {
    startGuardMinigame();
  } else {
    // Fallback to the original dialogue
    startGuardDialogue();
  }
}

// Original dialogue (preserved for later use)
function startGuardDialogue() {
  showDialogue(
    "Royal Guard",
    "Halt! Who are you, stranger? Your clothing is unlike anything I have seen.",
    [],
    () => {
      showDialogue(
        "Student",
        "I... honestly don't know how to explain this.",
        [
          {
            text: "1. I'm a traveler from a distant land.",
            action: () => guardResponse(
              "A traveler? Then explain how you entered the royal grounds."
            )
          },
          {
            text: "2. I'm from the future.",
            action: () => guardResponse(
              "The future? Do you take me for a fool?"
            )
          },
          {
            text: "3. That's none of your business.",
            action: () => guardResponse(
              "Mind your tongue! You stand before the royal guard."
            )
          }
        ]
      );
    }
  );
}

function guardResponse(reply) {
  showDialogue(
    "Royal Guard",
    reply,
    [],
    () => {
      showDialogue(
        "Second Guard",
        "Enough. We should take this stranger to the royal adviser. Let him decide what to do.",
        [],
        () => {
          showDialogue(
            "Student",
            "Wait... am I being arrested?!",
            [],
            () => {
              guardsEncountered = true;

              objective.textContent =
                "Objective: Find the royal adviser.";

              closeDialogue();
            }
          );
        }
      );
    }
  );
}

// Collision with guards
function canMovePastGuards(x, y) {
  const playerRadius = 10;
  const guardRadius = 18;

  for (const guard of egyptGuards) {
    const distance = Math.hypot(
      x - guard.x,
      y - guard.y
    );

    if (distance < playerRadius + guardRadius) {
      return false;
    }
  }

  return true;
}

// Prevent entering the royal area early
function canEnterRoyalArea(x, y) {
  const gateY = 150;

  // Unlock after passing the checkpoint
  if (guardsEncountered) {
    return true;
  }

  // Block the northern section
  if (y < gateY) {
    return false;
  }

  return true;
}

function startGuardFinalDialogue() {
  showDialogue(
    "Royal Guard",
    "You have passed our trial, stranger. Your judgment has impressed us.",
    [],
    () => {
      showDialogue(
        "Student",
        "Does that mean I can finally enter the palace?",
        [],
        () => {
          showDialogue(
            "Second Guard",
            "Yes. The royal court has been informed of your arrival. You may proceed.",
            [],
            () => {
              showDialogue(
                "Royal Guard",
                "Step forward. The Pharaoh awaits you beyond these gates.",
                [],
                () => {
                  // Close the final conversation
                  closeDialogue();

                  // Transition to the next map
                  startEgyptThrone();
                }
              );
            }
          );
        }
      );
    }
  );
}

