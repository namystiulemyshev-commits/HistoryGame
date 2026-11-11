function showChapterOne() {
  let screen = document.getElementById("chapterTransition");

  if (!screen) {
    screen = document.createElement("div");
    screen.id = "chapterTransition";
    document.getElementById("game").appendChild(screen);
  }

  screen.innerHTML = `
  <div class="egypt-scene">
    <canvas
      id="egyptEffects"
      width="800"
      height="450"
    ></canvas>
  </div>

  <button id="enterEgyptBtn">
    Begin Chapter 1
  </button>
`;

document.getElementById("enterEgyptBtn").onclick = startEgyptArrival;

  objective.textContent = "Chapter 1: Ancient Egypt";

  startEgyptEffects();
}





function startEgyptEffects() {
  const egyptCanvas = document.getElementById("egyptEffects");
  const egyptCtx = egyptCanvas.getContext("2d");

  const W = 800;
  const H = 450;

  const images = {};
  const files = {
    background: "egypt_background.png",
    palmLeft: "palm_left.png",
    palmMiddle: "palm_middle.png",
    palmRight: "palm_right.png",
    boatLeft: "boat_left.png",
    boatRight: "boat_right.png",
    fire: "fire_spritesheet.png"
  };

  // Load chapter assets
  for (const [name, filename] of Object.entries(files)) {
    const img = new Image();
    img.src = "assets/chapter1/" + filename;
    img.onerror = () => console.error("Failed to load:", filename);
    images[name] = img;
  }

  function ready(img) {
    return img && img.complete && img.naturalWidth > 0;
  }

  // Draw one palm canopy with gentle rotation
  function drawPalm(img, x, y, width, height, time, offset = 0) {
    if (!ready(img)) return;

    const angle = Math.sin(time * 0.0012 + offset) * 0.035;

    egyptCtx.save();

    egyptCtx.translate(x, y);
    egyptCtx.rotate(angle);

    egyptCtx.drawImage(
      img,
      -width / 2,
      -height / 2,
      width,
      height
    );

    egyptCtx.restore();
  }

  // Draw a slowly moving boat
  function drawBoat(img, x, y, width, height, time, offset = 0) {
    if (!ready(img)) return;

    const drift = Math.sin(time * 0.00065 + offset) * 6;
    const bob = Math.sin(time * 0.0025 + offset) * 2;

    egyptCtx.drawImage(
      img,
      x + drift - width / 2,
      y + bob - height / 2,
      width,
      height
    );
  }

  // Animate 3 frames of fire
  
function drawFire(time) {
  const img = images.fire;
  if (!ready(img)) return;

  const totalFrames = 4;
  const frameWidth = img.naturalWidth / totalFrames;
  const frameHeight = img.naturalHeight;
  const frame = Math.floor(time / 180) % totalFrames;

  egyptCtx.save();
  egyptCtx.imageSmoothingEnabled = false;

  egyptCtx.drawImage(
    img,
    frame * frameWidth,
    0,
    frameWidth,
    frameHeight,

    // move left + slightly up
    32,
    295,


    62,
    54
  );

  egyptCtx.restore();
}

  function animate(time) {
    // Stop if this chapter screen has been removed
    if (!egyptCanvas.isConnected) return;

    egyptCtx.clearRect(0, 0, W, H);
    egyptCtx.imageSmoothingEnabled = false;

    // 1. Static Egypt background
    if (ready(images.background)) {
      egyptCtx.drawImage(images.background, 0, 0, W, H);
    }

    // 2. Moving palm leaves
    drawPalm(images.palmLeft, 76, 75, 175, 150, time);
    drawPalm(images.palmMiddle, 270, 270, 90, 75, time, 1.5);
    drawPalm(images.palmRight, 620, 350, 90, 75, time, 2.5);

    // 3. Moving boats
    drawBoat(images.boatLeft, 355, 305, 48, 48, time);
    drawBoat(images.boatRight, 520, 305, 58, 58, time, 2);

    // 4. Flickering fire
    drawFire(time);

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}



