
/* Chapter 2 — Persian Courtyard NPCs */

const persianGuardSheet = new Image();
persianGuardSheet.src = "assets/chapter2/persian_guards.png";

const persianCivilianSheet = new Image();
persianCivilianSheet.src = "assets/chapter2/persian_civilians.png";


const persiaNPCs = [
  {
    name: "Royal Guard",
    type: "guard",
    x: 325,
    y: 205,
    color: "#a53035",
    message:
      "The king's palace is closed. To pass, you must find Iran on a map and name the seven lands bordering it."
  },
  {
    name: "Royal Guard",
    type: "guard",
    x: 475,
    y: 205,
    color: "#a53035",
    message:
      "Only those who complete the Seven Borders Challenge may enter the royal palace."
  },
  {
    name: "Merchant",
    type: "hint",
    x: 180,
    y: 330,
    color: "#348c73",
    message:
      "Looking west of Iran? Think of Turkey and Iraq. Both share borders with this land."
  },
  {
    name: "Scholar",
    type: "hint",
    x: 630,
    y: 330,
    color: "#7952a5",
    message:
      "To the northwest lie Armenia and Azerbaijan. To the northeast lies Turkmenistan."
  },
  {
    name: "Traveler",
    type: "hint",
    x: 265,
    y: 365,
    color: "#4d7dba",
    message:
      "My travels take me eastward, toward Afghanistan and Pakistan."
  }
];


function drawPersiaNPCs() {
  if (!persiaActive) return;

  ctx.save();
  ctx.imageSmoothingEnabled = false;

  const guardReady =
    persianGuardSheet.complete &&
    persianGuardSheet.naturalWidth > 0;

  const civilianReady =
    persianCivilianSheet.complete &&
    persianCivilianSheet.naturalWidth > 0;

  // Characters within the 2x2 civilian image
  const civilianPositions = {
    Merchant: [1, 0],
    Scholar: [0, 0],
    Traveler: [0, 1],
    "Palace Official": [1, 1]
  };

  for (const npc of persiaNPCs) {
    const x = Math.round(npc.x);
    const y = Math.round(npc.y);

    const isGuard = npc.type === "guard";

    if (isGuard && guardReady) {
      // Guards: 4 columns x 4 rows
      const frameW = persianGuardSheet.naturalWidth / 4;
const frameH = persianGuardSheet.naturalHeight / 4;

      // First frame: standing, facing forward
      ctx.drawImage(
        persianGuardSheet,
        0, 0,
        frameW, frameH,
        x - 28, y - 65,
        56, 65
      );
    } else if (!isGuard && civilianReady) {
      // Civilians: 2 columns x 2 rows
      const frameW = persianCivilianSheet.naturalWidth / 2;
const frameH = persianCivilianSheet.naturalHeight/2;

      const [column, row] =
        civilianPositions[npc.name] || [0, 0];

      ctx.drawImage(
        persianCivilianSheet,
        column * frameW,
        row * frameH,
        frameW,
        frameH,
        x - 27, y - 63,
        54, 63
      );
    } else {
      // Placeholder while the images load
      ctx.fillStyle = npc.color || "#a53035";
      ctx.fillRect(x - 10, y - 40, 20, 40);
    }

    // Show interaction prompt when near an NPC
    const distance = Math.hypot(
      persiaPlayer.x - npc.x,
      persiaPlayer.y - npc.y
    );

    if (distance < 60 && !persiaQuizState.open) {
      ctx.font = "bold 14px Arial";
      ctx.textAlign = "center";
      ctx.fillStyle = "#fff2bd";
      ctx.fillText("Press E", x, y - 70);
    }
  }

  ctx.restore();
}


function getNearbyPersiaNPC() {
  if (!persiaActive || persiaQuizState.open) {
    return null;
  }

  return persiaNPCs.find(npc =>
    Math.hypot(
      persiaPlayer.x - npc.x,
      persiaPlayer.y - npc.y
    ) < 60
  );
}

function showPersiaNPCDialogue(npc) {
  let overlay = document.getElementById("persiaNPCDialogue");

  if (!overlay) {
    overlay = document.createElement("div");
    overlay.id = "persiaNPCDialogue";
    document.body.appendChild(overlay);
  }

  overlay.replaceChildren();

  const panel = document.createElement("div");
  panel.className = "persia-npc-panel";

  const heading = document.createElement("h3");
  heading.textContent = npc.name;

  const paragraph = document.createElement("p");

  paragraph.textContent =
    npc.type === "guard" && window.persiaGateUnlocked
      ? "You have proven your knowledge. The palace gates are open to you."
      : npc.message;

  const close = document.createElement("button");
  close.textContent = "Continue";
  close.onclick = () => overlay.remove();

  panel.append(heading, paragraph);

  if (npc.type === "guard" && !window.persiaGateUnlocked) {
    const challenge = document.createElement("button");
    challenge.textContent = "Accept Map Challenge";

    challenge.onclick = () => {
      overlay.remove();
      startPersiaMapQuiz();
    };

    panel.appendChild(challenge);
  }

  panel.appendChild(close);
  overlay.appendChild(panel);
}

function handlePersiaNPCInteraction() {
  if (document.getElementById("persiaNPCDialogue")) {
    return true;
  }

  const npc = getNearbyPersiaNPC();
  if (!npc) return false;

  showPersiaNPCDialogue(npc);
  return true;
}

// Capture E before the generic game interaction handler.
window.addEventListener("keydown", event => {
  if (event.key.toLowerCase() !== "e") return;

  if (persiaQuizState.open) return;

  if (handlePersiaNPCInteraction()) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);
