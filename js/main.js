function gameLoop(timestamp) {
  if (egyptArrivalActive) {
    updateEgyptArrival();
    drawEgyptArrival();
  } else {
    update();
    draw();
    drawTeleportEffects(timestamp);
  }

  requestAnimationFrame(gameLoop);
}

requestAnimationFrame(gameLoop);