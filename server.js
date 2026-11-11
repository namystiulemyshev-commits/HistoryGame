
const express = require("express");
const path = require("path");
const fs = require("node:fs");
const { randomUUID, randomInt } = require("node:crypto");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Serve only the public game files.
// Do not expose .env, db.js, or other backend files.
app.use("/assets", express.static(path.join(__dirname, "assets")));
app.use("/js", express.static(path.join(__dirname, "js")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

app.get("/style.css", (req, res) => {
  res.sendFile(path.join(__dirname, "style.css"));
});

// Five-letter Egyptian-themed answers
const words = [
  "TOMBS", "ANKHS", "SANDS", "MUMMY",
  "COBRA", "DELTA", "OASIS", "GRAIN",
  "RIVER", "CROWN", "STONE", "ALTAR",
  "REEDS", "CANAL", "LINEN", "FLOOD"
];

// Active puzzles remain in memory.
const games = new Map();

let validGuesses = new Set();

// Start a new Wordle puzzle
app.post("/api/wordle/start", async (req, res) => {
  const answer = words[randomInt(words.length)];
  const gameId = randomUUID();

  try {
    // Create a database session for this puzzle.
    await pool.query(
      `INSERT INTO game_sessions
       (session_id, current_chapter)
       VALUES ($1, $2)`,
      [gameId, 1]
    );

    games.set(gameId, {
      answer,
      attempts: 0,
      finished: false,
      processing: false
    });

    console.log("Started Wordle:", gameId);

    res.json({
      gameId,
      maxAttempts: 6,
      wordLength: 5
    });
  } catch (error) {
    console.error("Could not create Wordle session:", error);

    res.status(500).json({
      error: "Could not start puzzle. Please try again."
    });
  }
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

// Submit a Wordle guess
app.post("/api/wordle/guess", async (req, res) => {
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

  // Reject nonexistent words.
  if (!validGuesses.has(guess)) {
    return res.status(400).json({
      error: "Not in word list. Try another word."
    });
  }

  // Prevent simultaneous requests from using
  // the same attempt number.
  if (game.processing) {
    return res.status(409).json({
      error: "Previous guess is still processing."
    });
  }

  game.processing = true;

  const attemptNumber = game.attempts + 1;
  const colors = checkLetters(guess, game.answer);
  const won = guess === game.answer;
  const finished = won || attemptNumber >= 6;

  let client;

  try {
    client = await pool.connect();

    await client.query("BEGIN");

    // Save the valid attempt.
    await client.query(
      `INSERT INTO wordle_attempts
       (session_id, puzzle_id, attempt_number,
        guess, is_correct)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        gameId,
        gameId,
        attemptNumber,
        guess,
        won
      ]
    );

    // Record the final result for analytics.
    if (finished) {
      await client.query(
        `INSERT INTO game_events
         (session_id, event_type, chapter)
         VALUES ($1, $2, $3)`,
        [
          gameId,
          won ? "wordle_won" : "wordle_lost",
          1
        ]
      );
    }

    await client.query("COMMIT");

    // Update active game only after the database
    // has saved the results successfully.
    game.attempts = attemptNumber;
    game.finished = finished;

    console.log(
      `Saved Wordle attempt ${attemptNumber}: ${guess}`
    );

    res.json({
      guess,
      colors,
      attempts: game.attempts,
      won,
      finished,
      ...(finished ? { answer: game.answer } : {})
    });
  } catch (error) {
    if (client) {
      try {
        await client.query("ROLLBACK");
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError);
      }
    }

    console.error("Could not save Wordle attempt:", error);

    res.status(500).json({
      error: "Could not save guess. Please try again."
    });
  } finally {
    game.processing = false;

    if (client) {
      client.release();
    }
  }
});

// Load word list and start the server
async function startServer() {
  const { default: wordListPath } = await import("word-list");

  const dictionary = fs.readFileSync(
    wordListPath,
    "utf8"
  );

  validGuesses = new Set(
    dictionary
      .split(/\r?\n/)
      .map(word => word.trim().toUpperCase())
      .filter(word => /^[A-Z]{5}$/.test(word))
  );

  // Ensure all possible answers are valid guesses.
  for (const word of words) {
    validGuesses.add(word);
  }

  console.log(`Loaded ${validGuesses.size} valid guesses`);

  // Verify PostgreSQL before accepting game requests.
  await pool.query("SELECT 1");

  console.log("PostgreSQL connected successfully!");

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
