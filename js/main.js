function gameLoop(timestamp) {
  if (persiaActive) {
    updatePersia();
    drawPersia();

  } else if (secretChamberActive) {
    updateSecretChamber();
    drawSecretChamber();

  } else if (egyptThroneActive) {
    updateEgyptThrone();
    drawEgyptThrone();

  } else if (egyptArrivalActive) {
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