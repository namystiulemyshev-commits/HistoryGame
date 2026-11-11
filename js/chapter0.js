// classroom
const classroomImage = new Image();
classroomImage.src = "assets/classroom.png";

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

function drawCollisionDebug() {
  ctx.strokeStyle = "red";
  ctx.lineWidth = 2;

  for (const obstacle of obstacles) {
    ctx.strokeRect(
      obstacle.x,
      obstacle.y,
      obstacle.width,
      obstacle.height
    );
  }
}




 drawTeacher();
drawStudent();
//drawCollisionDebug();
drawElectricity();

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


