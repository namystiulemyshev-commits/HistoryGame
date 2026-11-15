
/* Chapter 2 — Seven Borders Map Challenge */

const PERSIA_NEIGHBORS = {
  TUR: "Turkey",
  IRQ: "Iraq",
  ARM: "Armenia",
  AZE: "Azerbaijan",
  TKM: "Turkmenistan",
  AFG: "Afghanistan",
  PAK: "Pakistan"
};

const persiaQuizState = {
  stage: 1,
  found: new Set(),
  selected: null,
  features: [],
  paths: new Map(),
  bounds: null,
  open: false
};

const MAP_W = 900;
const MAP_H = 520;

const WORLD_VIEW = {
  x: 0,
  y: 0,
  width: MAP_W,
  height: MAP_H
};

// View focused on Iran and surrounding countries.
const REGION_VIEW = {
  x: 495,
  y: 103,
  width: 175,
  height: 125
};

function countryCode(feature) {
  return feature.properties["ISO3166-1-Alpha-3"];
}

function mapX(longitude) {
  return (longitude + 180) / 360 * MAP_W;
}

function mapY(latitude) {
  return (90 - latitude) / 180 * MAP_H;
}

function coordinatesToPath(coordinates, type) {
  const polygons =
    type === "Polygon" ? [coordinates] : coordinates;

  let path = "";

  for (const polygon of polygons) {
    for (const ring of polygon) {
      if (!ring.length) continue;

      ring.forEach((point, index) => {
        const x = mapX(point[0]);
        const y = mapY(point[1]);

        path +=
          `${index === 0 ? "M" : "L"}${x.toFixed(2)},${y.toFixed(2)} `;
      });

      path += "Z ";
    }
  }

  return path;
}

function setPersiaMapView(view) {
  const svg = document.getElementById("persiaWorldMap");
  if (!svg) return;

  persiaQuizState.bounds = { ...view };

  svg.setAttribute(
    "viewBox",
    `${view.x} ${view.y} ${view.width} ${view.height}`
  );
}

function zoomPersiaMap(factor) {
  const v = persiaQuizState.bounds;
  if (!v) return;

  const width = Math.max(
    30,
    Math.min(MAP_W, v.width * factor)
  );

  const height = Math.max(
    20,
    Math.min(MAP_H, v.height * factor)
  );

  const centerX = v.x + v.width / 2;
  const centerY = v.y + v.height / 2;

  setPersiaMapView({
    x: Math.max(0, Math.min(MAP_W - width, centerX - width / 2)),
    y: Math.max(0, Math.min(MAP_H - height, centerY - height / 2)),
    width,
    height
  });
}

function refreshPersiaCountryColors() {
  for (const [code, path] of persiaQuizState.paths) {
    path.classList.remove(
      "iran-found",
      "correct-country",
      "selected-country",
      "wrong-country"
    );

    if (persiaQuizState.stage === 2 && code === "IRN") {
      path.classList.add("iran-found");
    }

    if (persiaQuizState.found.has(code)) {
      path.classList.add("correct-country");
    }

    if (persiaQuizState.selected === code) {
      path.classList.add("selected-country");
    }
  }
}

function setPersiaQuizFeedback(message) {
  document.getElementById("persiaQuizFeedback").textContent =
    message;
}

async function loadPersiaMap() {
  if (persiaQuizState.features.length) return;

  const response = await fetch(
    "assets/chapter2/countries.geojson"
  );

  if (!response.ok) {
    throw new Error("Country map file could not be loaded.");
  }

  const data = await response.json();

  persiaQuizState.features = data.features;
}

function drawPersiaMap() {
  const svg = document.getElementById("persiaWorldMap");
  svg.replaceChildren();
  persiaQuizState.paths.clear();

  const NS = "http://www.w3.org/2000/svg";

  for (const feature of persiaQuizState.features) {
    if (!feature.geometry ||
        !["Polygon", "MultiPolygon"].includes(feature.geometry.type)) {
      continue;
    }

    const code = countryCode(feature);

    const path = document.createElementNS(NS, "path");

    path.setAttribute(
      "d",
      coordinatesToPath(
        feature.geometry.coordinates,
        feature.geometry.type
      )
    );

    path.setAttribute("class", "persia-country");
    path.setAttribute("fill-rule", "evenodd");

    // No country names are displayed on the map.
    path.addEventListener("click", () => {
      selectPersiaCountry(code);
    });

    svg.appendChild(path);

    // Store all quiz-relevant country paths.
    if (code === "IRN" || PERSIA_NEIGHBORS[code]) {
      persiaQuizState.paths.set(code, path);
    }
  }

  refreshPersiaCountryColors();
}

function selectPersiaCountry(code) {
  if (persiaQuizState.stage === 3) return;

  if (persiaQuizState.stage === 1) {
    if (code !== "IRN") {
      setPersiaQuizFeedback(
        "That isn't Iran. Try another country."
      );
      return;
    }

    persiaQuizState.stage = 2;

    document.getElementById(
      "persiaQuizInstruction"
    ).textContent =
      "Click each country bordering Iran, then type its name.";

    document.getElementById(
      "persiaQuizScore"
    ).textContent = "Countries found: 0 / 7";

    setPersiaMapView(REGION_VIEW);

    refreshPersiaCountryColors();

    setPersiaQuizFeedback(
      "Iran found! Now identify its seven neighbors."
    );

    return;
  }

  if (code === "IRN") {
    setPersiaQuizFeedback(
      "Iran is already identified. Choose a neighboring country."
    );
    return;
  }

  if (!PERSIA_NEIGHBORS[code]) {
    persiaQuizState.selected = null;
    document.getElementById(
      "persiaCountryAnswer"
    ).classList.add("hidden");

    setPersiaQuizFeedback(
      "That country doesn't share a land border with Iran."
    );

    refreshPersiaCountryColors();
    return;
  }

  if (persiaQuizState.found.has(code)) {
    setPersiaQuizFeedback(
      "You have already identified this country."
    );
    return;
  }

  persiaQuizState.selected = code;

  document.getElementById(
    "persiaCountryAnswer"
  ).classList.remove("hidden");

  document.getElementById(
    "persiaCountryInput"
  ).value = "";

  document.getElementById(
    "persiaCountryInput"
  ).focus();

  setPersiaQuizFeedback("Name the selected country.");
  refreshPersiaCountryColors();
}

function submitPersiaCountryName(event) {
  event.preventDefault();

  const code = persiaQuizState.selected;
  if (!code) return;

  const input = document.getElementById(
    "persiaCountryInput"
  );

  const answer = input.value
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ");

  const expected = PERSIA_NEIGHBORS[code].toLowerCase();

  if (answer !== expected) {
    setPersiaQuizFeedback(
      "Incorrect name. Try again, or ask someone for a hint."
    );
    return;
  }

  persiaQuizState.found.add(code);
  persiaQuizState.selected = null;

  document.getElementById(
    "persiaCountryAnswer"
  ).classList.add("hidden");

  document.getElementById(
    "persiaQuizScore"
  ).textContent =
    `Countries found: ${persiaQuizState.found.size} / 7`;

  refreshPersiaCountryColors();

  if (persiaQuizState.found.size === 7) {
    finishPersiaMapQuiz();
  } else {
    setPersiaQuizFeedback(
      `${PERSIA_NEIGHBORS[code]} is correct!`
    );
  }
}

function finishPersiaMapQuiz() {
  persiaQuizState.stage = 3;

  // Palace entry will use this flag.
  window.persiaGateUnlocked = true;

  document.getElementById(
    "persiaQuizInstruction"
  ).textContent =
    "Challenge complete! The royal guards grant you passage.";

  setPersiaQuizFeedback(
    "All seven countries identified! Return to the palace guards."
  );

  document.getElementById(
    "persiaCountryAnswer"
  ).classList.add("hidden");

  const restart = document.getElementById(
    "persiaQuizRestart"
  );

  restart.textContent = "Return to Courtyard";
}

function resetPersiaMapQuiz() {
  persiaQuizState.stage = 1;
  persiaQuizState.found.clear();
  persiaQuizState.selected = null;

  document.getElementById(
    "persiaQuizInstruction"
  ).textContent = "Find Iran on the map.";

  document.getElementById(
    "persiaQuizScore"
  ).textContent = "Find Iran first";

  document.getElementById(
    "persiaCountryAnswer"
  ).classList.add("hidden");

  document.getElementById(
    "persiaQuizRestart"
  ).textContent = "Restart challenge";

  setPersiaQuizFeedback("");
  setPersiaMapView(WORLD_VIEW);
  refreshPersiaCountryColors();
}

function closePersiaMapQuiz() {
  persiaQuizState.open = false;

  document.getElementById(
    "persiaQuiz"
  ).classList.add("hidden");
}

async function startPersiaMapQuiz() {
  const overlay = document.getElementById("persiaQuiz");

  overlay.classList.remove("hidden");
  persiaQuizState.open = true;

  try {
    await loadPersiaMap();

    drawPersiaMap();

    if (window.persiaGateUnlocked) {
      persiaQuizState.stage = 3;
      document.getElementById(
        "persiaQuizRestart"
      ).textContent = "Return to Courtyard";
      setPersiaMapView(REGION_VIEW);
    } else if (!persiaQuizState.bounds) {
      resetPersiaMapQuiz();
    } else {
      setPersiaMapView(persiaQuizState.bounds);
    }

    refreshPersiaCountryColors();
  } catch (error) {
    console.error(error);

    setPersiaQuizFeedback(
      "Could not load the map. Check countries.geojson."
    );
  }
}

// Attach quiz controls once.
document.getElementById(
  "persiaCountryForm"
).addEventListener("submit", submitPersiaCountryName);

document.getElementById(
  "persiaQuizClose"
).addEventListener("click", closePersiaMapQuiz);

document.getElementById(
  "persiaZoomIn"
).addEventListener("click", () => zoomPersiaMap(0.7));

document.getElementById(
  "persiaZoomOut"
).addEventListener("click", () => zoomPersiaMap(1.4));

document.getElementById(
  "persiaZoomReset"
).addEventListener("click", () => {
  setPersiaMapView(
    persiaQuizState.stage === 1
      ? WORLD_VIEW
      : REGION_VIEW
  );
});

document.getElementById(
  "persiaQuizHint"
).addEventListener("click", () => {
  if (persiaQuizState.stage === 1) {
    setPersiaQuizFeedback(
      "Iran is in Western Asia, east of Iraq."
    );
  } else {
    const missing = Object.entries(PERSIA_NEIGHBORS)
      .filter(([code]) => !persiaQuizState.found.has(code));

    if (missing.length) {
      setPersiaQuizFeedback(
        `Hint: One missing country is ${missing[0][1]}. Find it on the map.`
      );
    }
  }
});

document.getElementById(
  "persiaQuizRestart"
).addEventListener("click", () => {
  if (persiaQuizState.stage === 3) {
    closePersiaMapQuiz();
  } else {
    resetPersiaMapQuiz();
  }
});

// Keep WASD/E controls from moving the character
// while interacting with the map.
window.addEventListener("keydown", event => {
  if (!persiaQuizState.open) return;

  if (
    ["w", "a", "s", "d", "e",
     "arrowup", "arrowdown",
     "arrowleft", "arrowright"].includes(
       event.key.toLowerCase()
     ) &&
    event.target.tagName !== "INPUT"
  ) {
    event.preventDefault();
    event.stopImmediatePropagation();
  }
}, true);
