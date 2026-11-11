const obstacles = [];

// Classroom desks: 4 columns and 4 rows

const deskColumns = [130, 265, 410, 555];
const deskRows = [207, 259, 311, 363];

for (const y of deskRows) {
  for (const x of deskColumns) {
    obstacles.push({
      x: x + 5,
      y: y + 5,
      width: 68,
      height: 27
    });
  }
}

// Professor's desk
obstacles.push({
  x: 330,
  y: 150,
  width: 120,
  height: 45
});

// Time machine
obstacles.push({
  x: 625,
  y: 70,
  width: 110,
  height: 115
});

// Bookshelves and cabinets
obstacles.push({ x: 85, y: 65, width: 120, height: 95 });
obstacles.push({ x: 720, y: 255, width: 55, height: 110 });


//collision function

function canMoveTo(x, y) {
  const radius = 5;
  const feetY = y + 8;

if (
  x < 55 ||
  x > 745 ||
  feetY < 180 ||
  feetY > 425
) {
  return false;
}
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


