const express=require("express");
const path = require("path");
const { randomUUID, randomInt } = require("node:crypto");
const fs= require("node:fs")
const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.static(__dirname));

// Five-letter Egyptian-themed words
const words = [
  "TOMBS", "ANKHS", "SANDS", "MUMMY",
  "COBRA", "DELTA", "OASIS", "GRAIN",
  "RIVER", "CROWN", "STONE", "ALTAR",
  "REEDS", "CANAL", "LINEN", "FLOOD"
];

// Temporary active games, not a database
const games = new Map();
let validGuesses = new Set();

// Start a new Wordle game
app.post("/api/wordle/start", (req, res) => {
  const answer = words[randomInt(words.length)];
  const gameId = randomUUID();

  games.set(gameId, {
    answer,
    attempts: 0,
    finished: false
  });

  res.json({
    gameId,
    maxAttempts: 6,
    wordLength: 5
  });
});

// Check letters, including repeated letters
function checkLetters(guess, answer) {
  const result = Array(5).fill("absent");
  const remaining = {};

  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) {
      result[i] = "correct";
    } else {
      remaining[answer[i]] =
        (remaining[answer[i]] || 0) + 1;
    }
  }

  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;

    if ((remaining[guess[i]] || 0) > 0) {
      result[i] = "present";
      remaining[guess[i]]--;
    }
  }

  return result;
}

// Submit a guess
app.post("/api/wordle/guess", (req, res) => {
  const { gameId, guess } = req.body || {};
  const game = games.get(gameId);

  if (!game) {
    return res.status(404).json({
      error: "Game not found. Start a new puzzle."
    });
  }

  if (game.finished) {
    return res.status(400).json({
      error: "This puzzle is already finished."
    });
  }

  if (
    typeof guess !== "string" ||
    !/^[A-Z]{5}$/.test(guess)
  ) {
    return res.status(400).json({
      error: "Enter exactly five letters."
    });
  }
  // make sure if the word really exists
if (!validGuesses.has(guess)) {
  return res.status(400).json({
    error: "Not in word list. Try another word."
  });
}

  game.attempts++;

  const colors = checkLetters(guess, game.answer);
  const won = guess === game.answer;
  const finished = won || game.attempts >= 6;

  game.finished = finished;

  res.json({
    guess,
    colors,
    attempts: game.attempts,
    won,
    finished,
    // Reveal answer only after the puzzle ends
    ...(finished ? { answer: game.answer } : {})
  });
});


async function startServer() {
  // Load the word-list package from CommonJS
  const { default: wordListPath } = await import("word-list");

  const dictionary = fs.readFileSync(
    wordListPath,
    "utf8"
  );

  // Keep only five-letter English words
  validGuesses = new Set(
    dictionary
      .split(/\r?\n/)
      .map(word => word.trim().toUpperCase())
      .filter(word => /^[A-Z]{5}$/.test(word))
  );

  // Ensure every possible secret answer is accepted
  for (const word of words) {
    validGuesses.add(word);
  }

  console.log(`Loaded ${validGuesses.size} valid guesses`);

  app.listen(PORT, () => {
    console.log(
      `HistoryGame running at http://localhost:${PORT}`
    );
  });
}

startServer().catch(error => {
  console.error("Failed to start HistoryGame:", error);
  process.exit(1);
});

