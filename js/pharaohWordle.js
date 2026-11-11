
let pharaohWordleActive = false;
let pharaohWordleFinished = false;

let pharaohGameId = null;
let pharaohWordleGuesses = [];
let pharaohSubmitting = false;

// Start a new game using Node.js
async function startPharaohWordle() {
  if (pharaohWordleActive) return;

  pharaohWordleActive = true;
  pharaohWordleFinished = false;
  pharaohWordleGuesses = [];
  pharaohSubmitting = false;

  walking = false;

  for (const key in keys) {
    keys[key] = false;
  }

  const overlay = document.createElement("div");
  overlay.id = "pharaohWordleOverlay";

  overlay.innerHTML = `
    <div class="pharaoh-wordle-panel">
      <div class="pharaoh-wordle-title">
        THE PHARAOH'S CHALLENGE
      </div>

      <h2>The Hidden Word</h2>

      <p>Guess the five-letter word in six attempts.</p>

      <div id="wordleBoard"></div>

      <form id="wordleForm">
        <input
          id="wordleInput"
          maxlength="5"
          autocomplete="off"
          spellcheck="false"
          placeholder="ENTER 5 LETTERS"
        />

        <button type="submit">SUBMIT GUESS</button>

</form>

<div id="wordleKeyboard"></div>

<p id="wordleMessage"></p>


      </form>

      <p id="wordleMessage"></p>
      <div id="wordleResult"></div>
    </div>
  `;

  document.body.appendChild(overlay);

  const form = document.getElementById("wordleForm");

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    await submitPharaohGuess();
  });

  form.querySelector("button").disabled = true;
  drawPharaohWordleBoard();
  drawWordleKeyboard();

  try {
    const response = await fetch("/api/wordle/start", {
      method: "POST"
    });

    if (!response.ok) {
      throw new Error("Could not start Wordle.");
    }

    const data = await response.json();
    pharaohGameId = data.gameId;

    form.querySelector("button").disabled = false;
    document.getElementById("wordleInput").focus();

  } catch (error) {
    document.getElementById("wordleMessage").textContent =
      "Cannot connect to the game server.";

    console.error(error);
  }
}

// Display guesses and server-provided tile colors
function drawPharaohWordleBoard() {
  const board = document.getElementById("wordleBoard");
  board.innerHTML = "";

  for (let row = 0; row < 6; row++) {
    const rowElement = document.createElement("div");
    rowElement.className = "wordle-row";

    const entry = pharaohWordleGuesses[row];

    for (let col = 0; col < 5; col++) {
      const tile = document.createElement("div");
      tile.className = "wordle-tile";

      if (entry) {
        tile.textContent = entry.guess[col];
        tile.classList.add(entry.colors[col]);
      }

      rowElement.appendChild(tile);
    }

    board.appendChild(rowElement);
  }
}

// Send the guess to Node.js
async function submitPharaohGuess() {
  if (
    pharaohWordleFinished ||
    pharaohSubmitting ||
    !pharaohGameId
  ) {
    return;
  }

  const input = document.getElementById("wordleInput");
  const message = document.getElementById("wordleMessage");
  const guess = input.value.trim().toUpperCase();

  if (!/^[A-Z]{5}$/.test(guess)) {
    message.textContent =
      "Enter exactly five letters.";
    return;
  }

  pharaohSubmitting = true;

  try {
    const response = await fetch("/api/wordle/guess", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        gameId: pharaohGameId,
        guess
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Guess failed.");
    }

    pharaohWordleGuesses.push({
      guess: data.guess,
      colors: data.colors
    });

    input.value = "";
    message.textContent = "";

    drawPharaohWordleBoard();

    if (data.finished) {
      finishPharaohWordle(data.won, data.answer);
    }

  } catch (error) {
    message.textContent = error.message;
  } finally {
    pharaohSubmitting = false;
  }
}

// Display result
function finishPharaohWordle(won, answer) {
  pharaohWordleFinished = true;

  document.getElementById("wordleForm").style.display =
    "none";

  const result = document.getElementById("wordleResult");

  result.innerHTML = `
    <h3>${won ? "YOU HAVE SUCCEEDED!" : "THE TRIAL IS OVER"}</h3>

    <p>
      ${won
        ? "The Pharaoh recognizes your wisdom."
        : `The hidden word was ${answer}.`}
    </p>

    <button id="wordleContinue">
      ${won ? "CONTINUE" : "TRY AGAIN"}
    </button>
  `;

  
document.getElementById("wordleContinue").onclick = () => {
  closePharaohWordle();

  if (won) {
    startPharaohVictoryDialogue();
  } else {
    startPharaohWordle();
  }
};

}

function closePharaohWordle() {
  document.getElementById("pharaohWordleOverlay")?.remove();

  pharaohWordleActive = false;
  pharaohGameId = null;
  walking = false;

  for (const key in keys) {
    keys[key] = false;
  }
}

function drawWordleKeyboard() {
  const keyboard = document.getElementById("wordleKeyboard");
  if (!keyboard) return;

  keyboard.innerHTML = "";

  const rows = [
    "QWERTYUIOP",
    "ASDFGHJKL",
    "ZXCVBNM"
  ];

  rows.forEach(row => {
    const rowElement = document.createElement("div");
    rowElement.className = "wordle-keyboard-row";

    for (const letter of row) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "wordle-key";
      button.textContent = letter;

      button.onclick = () => {
        const input = document.getElementById("wordleInput");

        if (!input || pharaohWordleFinished) return;

        if (input.value.length < 5) {
          input.value += letter;
        }

        input.focus();
      };

      rowElement.appendChild(button);
    }

    keyboard.appendChild(rowElement);
  });

  // Backspace
  const backspace = document.createElement("button");
  backspace.type = "button";
  backspace.className = "wordle-key wordle-special";
  backspace.textContent = "⌫";

  backspace.onclick = () => {
    const input = document.getElementById("wordleInput");
    if (!input) return;

    input.value = input.value.slice(0, -1);
    input.focus();
  };

  keyboard.lastElementChild.appendChild(backspace);
}

function startPharaohVictoryDialogue() {
  showDialogue(
    "Pharaoh",
    "You have proven your wisdom, traveler. Perhaps you are worthy of the knowledge you seek.",
    [],
    () => {
      showDialogue(
        "Pharaoh",
        "Long ago, a mysterious object passed through Egypt. Some believed it possessed an extraordinary power.",
        [],
        () => {
          showDialogue(
            "Pharaoh",
            "But it did not remain here. Follow the path toward the rising sun, to the lands of Persia.",
            [],
            () => {
              showDialogue(
                "Student",
                "Persia? But how am I supposed to get there?",
                [],
                () => {
                  showDialogue(
                    "Pharaoh",
                    "That is a question only you can answer, stranger.",
                    [],
                    () => {
                      closeDialogue();
                      startPersiaTeleport();
                    }
                  );
                }
              );
            }
          );
        }
      );
    }
  );
}


