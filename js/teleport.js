//time machine transition
let teleporting = false;
let teleportStart = 0;

const TELEPORT_DURATION = 3000;


const sparks = [];

// Approximate center of the time machine
const portalX = 675;
const portalY = 125;

function createSpark() {
  const angle = Math.random() * Math.PI * 2;
  const radius = 15 + Math.random() * 35;

  sparks.push({
    x: portalX + Math.cos(angle) * radius,
    y: portalY + Math.sin(angle) * radius,
    life: 15 + Math.random() * 15,
    maxLife: 30,
    size: 1 + Math.random() * 2
  });
}

function drawElectricity() {
  // Create small sparks continuously
  if (Math.random() < 0.8) {
    createSpark();
  }

  ctx.save();

  for (let i = sparks.length - 1; i >= 0; i--) {
    const spark = sparks[i];

    spark.life--;

    if (spark.life <= 0) {
      sparks.splice(i, 1);
      continue;
    }

    const alpha = spark.life / spark.maxLife;

    // Blue glowing particle
    ctx.globalAlpha = alpha;
    ctx.fillStyle = "#64e8ff";

    ctx.fillRect(
      spark.x,
      spark.y,
      spark.size,
      spark.size
    );

    // Occasional lightning bolt
    if (Math.random() < 0.08) {
      ctx.strokeStyle = "#a5f3ff";
      ctx.lineWidth = 1.5;

      ctx.beginPath();
      ctx.moveTo(spark.x, spark.y);
      ctx.lineTo(
        spark.x + (Math.random() - 0.5) * 12,
        spark.y - 7
      );
      ctx.lineTo(
        spark.x + (Math.random() - 0.5) * 18,
        spark.y - 15
      );
      ctx.stroke();
    }
  }

  ctx.restore();
}



// time machine or teleport transtion animation 
function startTeleport() {
  closeDialogue();

  gameFinished = true;
  teleporting = true;
  teleportStart = performance.now();
}

function drawTeleportEffects(timestamp) {
  if (!teleporting) return;

  const elapsed = timestamp - teleportStart;
  const progress = Math.min(elapsed / TELEPORT_DURATION, 1);

  // Electricity becomes stronger over time
  const intensity = Math.min(progress * 2.5, 1);

  ctx.save();

  // Blue energy glow
  const glow = ctx.createRadialGradient(
    machine.x, machine.y, 5,
    machine.x, machine.y, 95
  );

  glow.addColorStop(0, `rgba(135, 245, 255, ${0.4 * intensity})`);
  glow.addColorStop(1, "rgba(0, 120, 255, 0)");

  ctx.fillStyle = glow;
  ctx.fillRect(machine.x - 100, machine.y - 100, 200, 200);

  // More sparks as the machine charges
  const sparkCount = Math.floor(5 + intensity * 45);

  for (let i = 0; i < sparkCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 55;

    const x = machine.x + Math.cos(angle) * radius;
    const y = machine.y + Math.sin(angle) * radius;

    ctx.fillStyle = Math.random() > 0.5 ? "#73eaff" : "#ffffff";
    ctx.fillRect(x, y, 2 + intensity * 2, 2 + intensity * 2);
  }

  // Random zigzag lightning
  const boltCount = Math.floor(1 + intensity * 8);

  for (let i = 0; i < boltCount; i++) {
    const angle = Math.random() * Math.PI * 2;
    const radius = 15 + Math.random() * 35;

    let x = machine.x + Math.cos(angle) * radius;
    let y = machine.y + Math.sin(angle) * radius;

    ctx.beginPath();
    ctx.moveTo(x, y);

    for (let j = 0; j < 4; j++) {
      x += (Math.random() - 0.5) * 22;
      y += (Math.random() - 0.5) * 22;
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = "#a7f4ff";
    ctx.lineWidth = 1 + intensity * 2;
    ctx.stroke();
  }

  // Bright flash near the end
  if (progress > 0.75) {
    const flash = (progress - 0.75) / 0.25;

    ctx.fillStyle = `rgba(235, 250, 255, ${flash})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  ctx.restore();

  // Shake the entire game canvas
  const shake = progress < 0.2 ? 1 : intensity * 8;

  canvas.style.transform = `translate(
    ${(Math.random() - 0.5) * shake}px,
    ${(Math.random() - 0.5) * shake}px
  )`;

  if (progress >= 1) {
    teleporting = false;
    canvas.style.transform = "";
    showChapterOne();
  }
}



