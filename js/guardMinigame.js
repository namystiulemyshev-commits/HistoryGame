


const guardTravelers = [
  {
    name: "Grain Merchant",
    story: "I have brought grain for the royal kitchens. My delivery papers are ready for inspection.",
    rule: "Only verified deliveries may enter the palace.",

    evidence:
      "The papyrus bears a faded seal. Some symbols resemble those used by royal officials, but a portion of the writing is missing.",

    choices: [
      "APPROVE ENTRY",
      "DENY ENTRY",
      "DETAIN FOR INVESTIGATION"
    ],

    correct: 2,
    explanation: "The damaged document requires further verification."
  },
  {
    name: "Royal Messenger",
    story: "I carry an urgent message for the royal adviser. The captain sent me.",
    rule: "Messengers require authorization from the guard captain.",

    evidence:
      "The messenger carries a clay tablet with a falcon insignia and several carved symbols. The reference tablet also contains a falcon, but with additional markings.",

    choices: [
      "APPROVE ENTRY",
      "DENY ENTRY",
      "DETAIN FOR INVESTIGATION"
    ],

    correct: 2,
    explanation: "The authorization markings do not fully match and require further investigation."
  },
  {
    name: "Suspicious Visitor",
    story: "I am a royal official from the southern provinces. I demand entry!",
    rule: "Royal officials must present valid identification.",

    evidence:
      "The visitor wears expensive linen and carries a golden necklace. He provides a personal name but no official identification.",

    choices: [
      "APPROVE ENTRY",
      "DENY ENTRY",
      "DETAIN FOR INVESTIGATION"
    ],

    correct: 1,
    explanation: "The visitor lacks the required identification."
  }
];



let guardMinigameActive = false;
let guardQuestionIndex = 0;
let guardCorrectAnswers = 0;
let guardAnswered = false;
let guardInspected = false;

function startGuardMinigame() {
  if (guardMinigameActive) return;

  guardMinigameActive = true;
  guardQuestionIndex = 0;
  guardCorrectAnswers = 0;

  for (const key in keys) {
    keys[key] = false;
  }

  walking = false;

  const overlay = document.createElement("div");
  overlay.id = "guardGameOverlay";

  overlay.innerHTML = `
  <div class="guard-game-panel">

    <button
      id="guardBackBtn"
      type="button"
      onclick="closeGuardMinigame()"
    >
      ← Back
    </button>

    <div id="guardGameContent"></div>

  </div>
`;

  document.body.appendChild(overlay);
  showGuardGameIntro();
}

function showGuardGameIntro() {
  const content = document.getElementById("guardGameContent");

  content.innerHTML = `
    <div class="guard-game-header">ANCIENT EGYPT</div>
    <h2>THE ROYAL GATE</h2>

    <div class="guard-game-dialogue">
      <strong>Royal Guard</strong>
      <p>
        Three travelers seek entry to the royal grounds.
        Study their claims and inspect their documents.
      </p>
      <p>Choose wisely, stranger. Your judgment will be tested.</p>
    </div>

    <button class="guard-game-button" id="startTrial">
      BEGIN THE TRIAL
    </button>
  `;

  document.getElementById("startTrial").onclick =
    showGuardQuestion;
}

function showGuardQuestion() {
  guardAnswered = false;
  guardInspected = false;

  const traveler = guardTravelers[guardQuestionIndex];
  const content = document.getElementById("guardGameContent");

  content.innerHTML = `
    <div class="guard-game-header">THE ROYAL GATE</div>

    <div class="guard-game-progress">
  Traveler ${guardQuestionIndex + 1} of ${guardTravelers.length}
</div>

    <h2>${traveler.name}</h2>

    <div class="guard-game-dialogue">
      <strong>TRAVELER'S STATEMENT</strong>
      <p>"${traveler.story}"</p>
    </div>

    <div class="guard-game-rule">
      <strong>PALACE SECURITY RULE</strong>
      <p>${traveler.rule}</p>
    </div>

    <button class="guard-game-button" id="inspectEvidence">
      INSPECT EVIDENCE
    </button>

    <div id="evidenceBox" class="guard-game-evidence"
         style="display:none;"></div>

    <h3>What will you do?</h3>

    <p id="inspectionHint">
      Inspect the evidence before making your decision.
    </p>

    <div id="guardChoices"></div>
    <div id="guardFeedback"></div>
  `;

  document.getElementById("inspectEvidence").onclick =
    inspectGuardEvidence;

  const choices = document.getElementById("guardChoices");

  traveler.choices.forEach((choice, index) => {
    const button = document.createElement("button");
    button.className = "guard-game-button";
    button.textContent = `${index + 1}. ${choice}`;
    button.disabled = true;

    button.onclick = () => checkGuardAnswer(index);
    choices.appendChild(button);
  });
  document.querySelector(".guard-game-panel").scrollTop = 0;
}

function inspectGuardEvidence() {
  if (guardInspected) return;

  guardInspected = true;

  const traveler = guardTravelers[guardQuestionIndex];
  const evidenceBox = document.getElementById("evidenceBox");

  evidenceBox.style.display = "block";
  evidenceBox.innerHTML = `
    <strong>INSPECTION FINDINGS</strong>
    <p>${traveler.evidence}</p>
  `;

  document.getElementById("inspectEvidence").disabled = true;
  document.getElementById("inspectionHint").textContent =
    "Evidence inspected. Make your decision.";

  document.querySelectorAll("#guardChoices button")
    .forEach(button => button.disabled = false);
}

function checkGuardAnswer(answer) {
  if (guardAnswered || !guardInspected) return;

  guardAnswered = true;

  const traveler = guardTravelers[guardQuestionIndex];
  const correct = answer === traveler.correct;

  if (correct) guardCorrectAnswers++;

  document.querySelectorAll("#guardChoices button")
    .forEach(button => button.disabled = true);

  const feedback = document.getElementById("guardFeedback");

 
const result = document.createElement("p");

result.className = "guard-game-progress";

result.textContent =
  "Your decision has been recorded. The guards will evaluate all decisions at the end of the trial.";

feedback.appendChild(result);


  const next = document.createElement("button");
  next.className = "guard-game-button";
  next.textContent =
    guardQuestionIndex === guardTravelers.length - 1
      ? "SEE RESULTS"
      : "NEXT TRAVELER";

  next.onclick = () => {
    guardQuestionIndex++;

    if (guardQuestionIndex >= guardTravelers.length) {
      showGuardGameResults();
    } else {
      showGuardQuestion();
    }
  };

  feedback.appendChild(next);
}

function showGuardGameResults() {
  const passed = guardCorrectAnswers >= 2;
  const content = document.getElementById("guardGameContent");

  content.innerHTML = `
    <div class="guard-game-header">TRIAL COMPLETE</div>

    <h2>${passed ? "THE GATE OPENS" : "TRIAL FAILED"}</h2>

    <div class="guard-game-score">
      ${guardCorrectAnswers} / ${guardTravelers.length}
    </div>

    <div class="guard-game-dialogue">
      <strong>Royal Guard</strong>
      <p>
        ${passed
          ? "You have shown good judgment. You may enter the royal grounds."
          : "Your decisions have not satisfied us. You must try again."}
      </p>
    </div>

    <button class="guard-game-button" id="finishTrial">
      ${passed ? "CONTINUE" : "TRY AGAIN"}
    </button>
  `;

 
  document.getElementById("finishTrial").onclick = () => {
    if (passed) {
      guardsEncountered = true;

      objective.textContent =
        "Objective: Find the royal adviser.";

      closeGuardMinigame();
    } else {
      guardQuestionIndex = 0;
      guardCorrectAnswers = 0;
      showGuardGameIntro();
    }
  };

  // Always show results from the top
  document.querySelector(".guard-game-panel").scrollTop = 0;
}


function closeGuardMinigame() {
  document.getElementById("guardGameOverlay")?.remove();

  guardMinigameActive = false;

  for (const key in keys) {
    keys[key] = false;
  }

  walking = false;
}
