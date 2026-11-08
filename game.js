
const canvas = document.getElementById("world");
const ctx = canvas.getContext("2d");
// classroom
const classroomImage = new Image();
classroomImage.src = "assets/classroom.png";

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

//teacher sheet
const teacherSheet = new Image();

teacherSheet.onload = () => {
  console.log("Teacher loaded!");
  console.log("Width:", teacherSheet.naturalWidth);
  console.log("Height:", teacherSheet.naturalHeight);
};

teacherSheet.onerror = () => {
  console.error("Teacher image failed to load!");
};

teacherSheet.src = "assets/teacher_pixel_spritesheet.png";


const dialogue = document.getElementById("dialogue");
const speaker = document.getElementById("speaker");
const message = document.getElementById("message");
const choices = document.getElementById("choices");
const continueBtn = document.getElementById("continue");
const objective = document.getElementById("objective");

// Characters and objects
const player = { x: 400, y: 395, size: 24, speed: 3 };
const teacher = { x: 490, y: 175, size: 28 };
const machine = { x: 675, y: 130, size: 48 };


const obstacles = [];

// Student desks and chairs
const deskColumns = [130, 270, 415, 560];
const deskRows = [210, 262, 314, 366];

for (const y of deskRows) {
  for (const x of deskColumns) {
    obstacles.push({
      x: x,
      y: y,
      width: 80,
      height: 39
    });
  }
}

// Professor's desk
obstacles.push({
  x: 330,
  y: 150,
  width: 120,
  height: 48
});

// Time machine
obstacles.push({
  x: 630,
  y: 75,
  width: 110,
  height: 110
});


const keys = {};
let talking = false;
let teacherFinished = false;
let gameFinished = false;

// Keyboard input
document.addEventListener("keydown", (e) => {
  const key = e.key.toLowerCase();

  if (["arrowup", "arrowdown", "arrowleft", "arrowright", " "].includes(key)) {
    e.preventDefault();
  }

  keys[key] = true;

  if (key === "e" && !e.repeat && !talking) {
    interact();
  }
});

document.addEventListener("keyup", (e) => {
  keys[e.key.toLowerCase()] = false;
});

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


function drawDeskForeground() {
  if (!classroomImage.naturalWidth) return;

  const feetY = player.y + 8;

  const desks = [
    ...obstacles.slice(0, 16),
    obstacles[16] // Professor's desk
  ];

  for (const desk of desks) {
    const behindDesk =
      player.x > desk.x - 20 &&
      player.x < desk.x + desk.width + 20 &&
      feetY < desk.y + desk.height &&
      feetY > desk.y - 55;

    if (!behindDesk) continue;

    // Redraw the desk region on top of the student
    ctx.drawImage(
      classroomImage,
      desk.x,
      desk.y,
      desk.width,
      desk.height,
      desk.x,
      desk.y,
      desk.width,
      desk.height
    );
  }
}


//collision function
function canMoveTo(x, y) {
  // Character collision radius
  const radius = 7;

  // Classroom boundaries
  if (x < 45 || x > 755 || y < 75 || y > 445) {
    return false;
  }

  // Character's feet determine collision
  const feetY = y + 8;

  for (const obstacle of obstacles) {
    if (
      x + radius > obstacle.x &&
      x - radius < obstacle.x + obstacle.width &&
      feetY + radius > obstacle.y &&
      feetY - radius < obstacle.y + obstacle.height
    ) {
      return false;
    }
  }

  return true;
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


//draw teacher


function drawTeacher() {
  if (!teacherSheet.complete || !teacherSheet.naturalWidth) {
    return;
  }

  // Teacher sprite coordinates
  const sourceX = 25;
  const sourceY = 15;
  const sourceWidth = 100;
  const sourceHeight = 160;

  // Character size
  const width = 44;
  const height = 70;

  // Idle animation: 4 repeating phases
  const phase = Math.floor(performance.now() / 300) % 4;

  // Slightly crouch during phases 1 and 2
  const squat = (phase === 1 || phase === 2) ? 3 : 0;

  ctx.imageSmoothingEnabled = false;

  ctx.drawImage(
    teacherSheet,
    sourceX,
    sourceY,
    sourceWidth,
    sourceHeight,
    teacher.x - width / 2,
    teacher.y - height + squat,
    width,
    height - squat
  );
}


function drawTeacherDeskForeground() {
  if (!classroomImage.naturalWidth) return;

  ctx.imageSmoothingEnabled = false;

  // Redraw only the front of the professor's desk
  ctx.drawImage(
    classroomImage,
    340, 173, 110, 30,
    340, 173, 110, 30
  );
}







// Draw classroom
function draw() {
  ctx.clearRect(0, 0, 800, 480);

  // Draw classroom background
  if (classroomImage.complete && classroomImage.naturalWidth) {
    ctx.imageSmoothingEnabled = false;

    ctx.drawImage(
      classroomImage,
      0, 0,
      800, 480
    );
  }

 drawTeacher();
drawStudent();

  // Interaction prompts
  if (!talking && !gameFinished) {
    if (distance(player, teacher) < 85) {
      drawPrompt("Press E to talk");
    } else if (distance(player, machine) < 85) {
      drawPrompt("Press E to inspect");
    }
  }
}


function drawPrompt(text) {
  ctx.fillStyle = "#ffffff";
  ctx.font = "16px Arial";
  ctx.textAlign = "center";
  ctx.fillText(text, 400, 450);
}

// Start interactions
function interact() {
  if (distance(player, teacher) < 85) {
    if (!teacherFinished) {
      startTeacherDialogue();
    } else {
      showDialogue(
        "Professor",
        "Go on. The machine is waiting for you.",
        [],
        closeDialogue
      );
    }
  } else if (distance(player, machine) < 85) {
    if (!teacherFinished) {
      showDialogue(
        "Student",
        "What is this strange machine?",
        [],
        closeDialogue
      );
    } else {
      activateMachine();
    }
  }
}

// Dialogue interface
function showDialogue(name, text, options = [], next = null) {
  talking = true;
  dialogue.classList.remove("hidden");

  speaker.textContent = name;
  message.textContent = text;
  choices.innerHTML = "";

  continueBtn.classList.add("hidden");
  continueBtn.onclick = null;

  if (options.length > 0) {
    options.forEach(option => {
      const button = document.createElement("button");
      button.textContent = option.text;
      button.onclick = option.action;
      choices.appendChild(button);
    });
  } else if (next) {
    continueBtn.classList.remove("hidden");
    continueBtn.onclick = next;
  }
}

function closeDialogue() {
  dialogue.classList.add("hidden");
  talking = false;
  continueBtn.onclick = null;
}

// Teacher and student conversation
function startTeacherDialogue() {
  showDialogue(
    "Professor",
    "Before you leave, I have a rather unusual assignment for you.",
    [],
    () => {
      showDialogue(
        "Student",
        "Professor, we literally just finished our exams.",
        [],
        () => {
          showDialogue(
            "Professor",
            "Excellent. Then you should have plenty of time. I need you to bring me an ancient lamp.",
            [
              {
                text: "1. Can't you just buy one?",
                action: () => teacherReply(
                  "I could buy a thousand lamps. None would be the one I need."
                )
              },
              {
                text: "2. Why is this lamp special?",
                action: () => teacherReply(
                  "That is something I intend to discover."
                )
              },
              {
                text: "3. What's in it for me?",
                action: () => teacherReply(
                  "Let's just say your final grade could benefit."
                )
              }
            ]
          );
        }
      );
    }
  );
}

function teacherReply(reply) {
  showDialogue("Professor", reply, [], () => {
    showDialogue(
      "Professor",
      "You won't find this lamp in a shop. You need to retrieve it from the past.",
      [],
      () => {
        showDialogue(
          "Student",
          "And how exactly am I supposed to travel to the past?",
          [],
          () => {
            showDialogue(
              "Professor",
              "Look at the machine in the corner. I believe you will find it quite interesting.",
              [],
              () => {
                teacherFinished = true;
                objective.textContent = "Objective: Inspect the time machine.";
                closeDialogue();
              }
            );
          }
        );
      }
    );
  });
}

function activateMachine() {
  showDialogue(
    "Student",
    "You really expect me to use this thing?",
    [
      {
        text: "1. Fine. Let's see what happens.",
        action: finishChapter
      },
      {
        text: "2. I need a moment to think.",
        action: closeDialogue
      }
    ]
  );
}

function finishChapter() {
  gameFinished = true;
  objective.textContent = "Chapter 0 completed!";

  showDialogue(
    "Professor",
    "Remember, choose your words carefully. Good luck!",
    [],
    () => {
      showDialogue(
        "Narrator",
        "The machine begins to glow. A blinding flash fills the room. Your journey through history is about to begin...",
        [],
        closeDialogue
      );
    }
  );
}

// Game loop
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();
