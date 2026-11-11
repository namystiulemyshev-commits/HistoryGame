const portraits = {
  "Professor": "assets/professor_portrait.png",
  "Student": "assets/student_portrait.png",

  "Royal Guard": "assets/chapter1/royal_guard_portrait.png",
  "Second Guard": "assets/chapter1/royal_guard_portrait.png",
  "Pharaoh":"assets/chapter1/pharaoh_portrait.png"
};


const dialogue = document.getElementById("dialogue");
const speaker = document.getElementById("speaker");
const message = document.getElementById("message");
const choices = document.getElementById("choices");
const continueBtn = document.getElementById("continue");
const objective = document.getElementById("objective");
const portrait = document.getElementById("portrait");


// Dialogue interface
function showDialogue(name, text, options = [], next = null) {
  talking = true;
  dialogue.classList.remove("hidden");

  speaker.textContent = name;
  message.textContent = text;
  choices.innerHTML = "";

  // Set portrait
  if (portraits[name]) {
    portrait.src = portraits[name];
    portrait.style.display = "block";
  } else {
    portrait.style.display = "none";
  }

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

  objective.textContent = "Objective: Prepare for time travel.";

  showDialogue(
    "Professor",
    "Remember, choose your words carefully. Good luck!",
    [],
    () => {
      showDialogue(
        "Student",
        "Wait... is this thing even safe?!",
        [],
        () => {
          showDialogue(
            "Narrator",
            "The machine begins to hum. Blue electricity fills the room.",
            [],
            startTeleport
          );
        }
      );
    }
  );
}


