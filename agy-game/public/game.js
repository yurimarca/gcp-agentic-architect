/**
 * VOYAGER: STARCATCHER - Core Engine (Agent A)
 */

(function () {
  // 1. Global Bridge Setup
  window.Voyager = window.Voyager || {};
  window.Voyager.STATE = {
    START: 'START',
    PLAYING: 'PLAYING',
    FAIL: 'FAIL',
    WIN: 'WIN',
    LEADERBOARD: 'LEADERBOARD'
  };
  window.Voyager.state = window.Voyager.state || window.Voyager.STATE.START;
  window.Voyager.score = 0;

  // Stub for showLeaderboard if Agent B has not initialized it yet
  if (typeof window.Voyager.showLeaderboard !== 'function') {
    window.Voyager.showLeaderboard = function (score) {
      console.log('[Voyager Core Engine] Handoff: showLeaderboard called with score:', score);
      window.Voyager.state = window.Voyager.STATE.LEADERBOARD;
      showOverlay('leaderboard-screen');
    };
  }

  // 2. Constellation Coordinate Mappings (Canvas 800x600)
  const CONSTELLATIONS = [
    {
      name: "ARIES (The Ram)",
      stars: [
        { x: 200, y: 360 },
        { x: 360, y: 320 },
        { x: 500, y: 220 },
        { x: 580, y: 180 }
      ]
    },
    {
      name: "TAURUS (The Bull)",
      stars: [
        { x: 180, y: 420 },
        { x: 300, y: 350 },
        { x: 420, y: 270 },
        { x: 560, y: 190 },
        { x: 620, y: 320 },
        { x: 480, y: 380 }
      ]
    },
    {
      name: "GEMINI (The Twins)",
      stars: [
        { x: 180, y: 180 },
        { x: 280, y: 250 },
        { x: 400, y: 310 },
        { x: 540, y: 390 },
        { x: 640, y: 230 },
        { x: 490, y: 160 }
      ]
    },
    {
      name: "CANCER (The Crab)",
      stars: [
        { x: 400, y: 290 },
        { x: 290, y: 210 },
        { x: 510, y: 210 },
        { x: 220, y: 410 },
        { x: 580, y: 410 }
      ]
    },
    {
      name: "LEO (The Lion)",
      stars: [
        { x: 180, y: 380 },
        { x: 300, y: 400 },
        { x: 430, y: 360 },
        { x: 560, y: 330 },
        { x: 610, y: 230 },
        { x: 520, y: 170 },
        { x: 430, y: 210 }
      ]
    },
    {
      name: "VIRGO (The Maiden)",
      stars: [
        { x: 170, y: 200 },
        { x: 290, y: 230 },
        { x: 410, y: 290 },
        { x: 520, y: 370 },
        { x: 630, y: 430 },
        { x: 390, y: 430 },
        { x: 270, y: 340 }
      ]
    },
    {
      name: "LIBRA (The Scales)",
      stars: [
        { x: 400, y: 170 },
        { x: 230, y: 290 },
        { x: 570, y: 290 },
        { x: 310, y: 440 },
        { x: 490, y: 440 }
      ]
    },
    {
      name: "SCORPIO (The Scorpion)",
      stars: [
        { x: 150, y: 210 },
        { x: 230, y: 250 },
        { x: 310, y: 310 },
        { x: 390, y: 400 },
        { x: 470, y: 450 },
        { x: 560, y: 430 },
        { x: 640, y: 330 }
      ]
    },
    {
      name: "SAGITTARIUS (The Archer)",
      stars: [
        { x: 210, y: 420 },
        { x: 310, y: 350 },
        { x: 410, y: 270 },
        { x: 530, y: 210 },
        { x: 630, y: 330 },
        { x: 490, y: 440 }
      ]
    },
    {
      name: "CAPRICORN (The Sea-Goat)",
      stars: [
        { x: 190, y: 230 },
        { x: 340, y: 190 },
        { x: 560, y: 210 },
        { x: 630, y: 370 },
        { x: 400, y: 450 }
      ]
    },
    {
      name: "AQUARIUS (The Water-Bearer)",
      stars: [
        { x: 190, y: 170 },
        { x: 330, y: 210 },
        { x: 450, y: 270 },
        { x: 590, y: 310 },
        { x: 390, y: 410 },
        { x: 250, y: 470 }
      ]
    },
    {
      name: "PISCES (The Fishes)",
      stars: [
        { x: 170, y: 350 },
        { x: 250, y: 250 },
        { x: 370, y: 190 },
        { x: 490, y: 210 },
        { x: 590, y: 290 },
        { x: 640, y: 410 },
        { x: 510, y: 460 }
      ]
    }
  ];

  // Time limits per level (Level 12 gives 15s)
  const LEVEL_TIMES = [32, 30, 28, 26, 24, 22, 21, 20, 19, 18, 16, 15];

  // 3. DOM & Canvas Setup
  let canvas, ctx;
  let animFrameId = null;
  let lastTimestamp = 0;

  // Game Engine State
  let currentLevelIndex = 0;
  let targetStarIndex = 0;
  let levelTimeRemaining = 0;
  let particles = [];
  let starPulseTimer = 0;

  // Ship Setup
  const ship = {
    x: 400,
    y: 500,
    vx: 0,
    vy: 0,
    angle: -Math.PI / 2,
    radius: 12
  };

  // Input State
  const keys = {
    ArrowUp: false,
    ArrowDown: false,
    ArrowLeft: false,
    ArrowRight: false,
    Shift: false,
    KeyZ: false
  };

  // Background Ambient Stars
  const ambientStars = [];
  for (let i = 0; i < 90; i++) {
    ambientStars.push({
      x: Math.random() * 800,
      y: Math.random() * 600,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.8 + 0.2,
      speed: Math.random() * 0.02 + 0.01
    });
  }

  // Helper to switch active HTML overlay
  function showOverlay(id) {
    const overlays = ['start-screen', 'fail-screen', 'win-screen', 'leaderboard-screen'];
    overlays.forEach(overlayId => {
      const el = document.getElementById(overlayId);
      if (el) {
        el.style.display = (overlayId === id) ? 'flex' : 'none';
      }
    });
  }

  function setState(newState) {
    window.Voyager.state = newState;

    if (newState === window.Voyager.STATE.START) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      showOverlay('start-screen');
    } else if (newState === window.Voyager.STATE.PLAYING) {
      showOverlay(null); // Hide all overlays
      startNewGame();
    } else if (newState === window.Voyager.STATE.FAIL) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      showOverlay('fail-screen');
    } else if (newState === window.Voyager.STATE.WIN) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      const valEl = document.getElementById('final-score-val');
      if (valEl) valEl.textContent = window.Voyager.score;
      showOverlay('win-screen');
    } else if (newState === window.Voyager.STATE.LEADERBOARD) {
      if (animFrameId) cancelAnimationFrame(animFrameId);
      showOverlay('leaderboard-screen');
    }
  }

  // Global restart API for Agent B
  window.Voyager.resetGame = function () {
    setState(window.Voyager.STATE.PLAYING);
  };

  // Start new game run
  function startNewGame() {
    currentLevelIndex = 0;
    window.Voyager.score = 0;
    initLevel(0);
    lastTimestamp = performance.now();
    if (animFrameId) cancelAnimationFrame(animFrameId);
    animFrameId = requestAnimationFrame(gameLoop);
  }

  // Initialize a level
  function initLevel(levelIdx) {
    currentLevelIndex = levelIdx;
    targetStarIndex = 0;
    levelTimeRemaining = LEVEL_TIMES[levelIdx];
    particles = [];

    // Position ship near first star or center bottom
    const firstStar = CONSTELLATIONS[levelIdx].stars[0];
    ship.x = firstStar.x;
    ship.y = Math.min(540, firstStar.y + 80);
    ship.angle = -Math.PI / 2;
    ship.vx = 0;
    ship.vy = 0;
  }

  // 4. Input Handlers
  window.addEventListener('keydown', (e) => {
    // Developer Shortcut: Shift + D skips all levels -> WIN
    if (e.shiftKey && (e.key === 'D' || e.key === 'd')) {
      if (window.Voyager.state === window.Voyager.STATE.PLAYING) {
        console.log('[Voyager] Developer shortcut activated (Shift + D). Skipping to WIN state.');
        window.Voyager.score = Math.max(window.Voyager.score, 5000);
        setState(window.Voyager.STATE.WIN);
        return;
      }
    }

    if (e.key === 'ArrowUp') keys.ArrowUp = true;
    if (e.key === 'ArrowDown') keys.ArrowDown = true;
    if (e.key === 'ArrowLeft') keys.ArrowLeft = true;
    if (e.key === 'ArrowRight') keys.ArrowRight = true;
    if (e.key === 'Shift') keys.Shift = true;
    if (e.key === 'z' || e.key === 'Z') keys.KeyZ = true;
  });

  window.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') keys.ArrowUp = false;
    if (e.key === 'ArrowDown') keys.ArrowDown = false;
    if (e.key === 'ArrowLeft') keys.ArrowLeft = false;
    if (e.key === 'ArrowRight') keys.ArrowRight = false;
    if (e.key === 'Shift') keys.Shift = false;
    if (e.key === 'z' || e.key === 'Z') keys.KeyZ = false;
  });

  // 5. Physics & Mechanics Update
  function update(dt) {
    if (window.Voyager.state !== window.Voyager.STATE.PLAYING) return;

    // Timer Update
    levelTimeRemaining -= dt;
    if (levelTimeRemaining <= 0) {
      levelTimeRemaining = 0;
      setState(window.Voyager.STATE.FAIL);
      return;
    }

    // 8-Way Movement Vector Calculation
    let dx = 0;
    let dy = 0;
    if (keys.ArrowUp) dy -= 1;
    if (keys.ArrowDown) dy += 1;
    if (keys.ArrowLeft) dx -= 1;
    if (keys.ArrowRight) dx += 1;

    // Multiplier: SHIFT (Boost 2x), Z (Brake 0.5x)
    let speedMultiplier = 1.0;
    if (keys.Shift) speedMultiplier *= 2.0;
    if (keys.KeyZ) speedMultiplier *= 0.5;

    const baseSpeed = 2.5; // pixels per frame
    const frameSpeed = baseSpeed * speedMultiplier;

    if (dx !== 0 || dy !== 0) {
      // Normalize vector for diagonal travel
      const length = Math.hypot(dx, dy);
      dx /= length;
      dy /= length;

      ship.vx = dx * frameSpeed;
      ship.vy = dy * frameSpeed;

      // Auto rotate to face direction of travel
      ship.angle = Math.atan2(dy, dx);
    } else {
      ship.vx = 0;
      ship.vy = 0;
    }

    // Update Position
    ship.x += ship.vx;
    ship.y += ship.vy;

    // Keep ship within canvas bounds
    ship.x = Math.max(ship.radius, Math.min(canvas.width - ship.radius, ship.x));
    ship.y = Math.max(ship.radius, Math.min(canvas.height - ship.radius, ship.y));

    // Star Connection Check
    const currentStars = CONSTELLATIONS[currentLevelIndex].stars;
    if (targetStarIndex < currentStars.length) {
      const targetStar = currentStars[targetStarIndex];
      const dist = Math.hypot(ship.x - targetStar.x, ship.y - targetStar.y);

      // Collision threshold to capture star
      if (dist <= 26) {
        // Star Connected!
        spawnStarParticles(targetStar.x, targetStar.y);
        targetStarIndex++;
        window.Voyager.score += 150;

        // Check if full constellation is completed
        if (targetStarIndex >= currentStars.length) {
          // Level Completed! Add remaining time bonus
          const timeBonus = Math.floor(levelTimeRemaining * 100);
          window.Voyager.score += 500 + timeBonus;

          if (currentLevelIndex + 1 < CONSTELLATIONS.length) {
            initLevel(currentLevelIndex + 1);
          } else {
            // All 12 Constellations Completed!
            setState(window.Voyager.STATE.WIN);
            return;
          }
        }
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.life -= dt;
      if (p.life <= 0) {
        particles.splice(i, 1);
      }
    }

    // Update Ambient Stars
    starPulseTimer += dt * 4;
    ambientStars.forEach(star => {
      star.alpha += Math.sin(starPulseTimer * star.speed) * 0.01;
      if (star.alpha < 0.1) star.alpha = 0.1;
      if (star.alpha > 0.9) star.alpha = 0.9;
    });
  }

  function spawnStarParticles(x, y) {
    for (let i = 0; i < 20; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 4 + 1;
      particles.push({
        x: x,
        y: y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 3 + 2,
        life: 0.6,
        color: ['#66fcf1', '#ffe600', '#ff007f', '#ffffff'][Math.floor(Math.random() * 4)]
      });
    }
  }

  // 6. Rendering Engine
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw Ambient Starfield
    ambientStars.forEach(s => {
      ctx.fillStyle = `rgba(255, 255, 255, ${s.alpha})`;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      ctx.fill();
    });

    const constellation = CONSTELLATIONS[currentLevelIndex];
    const stars = constellation.stars;

    // Draw Dotted Guide Lines between all consecutive stars in constellation
    ctx.beginPath();
    ctx.setLineDash([6, 6]);
    ctx.strokeStyle = 'rgba(102, 252, 241, 0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < stars.length - 1; i++) {
      ctx.moveTo(stars[i].x, stars[i].y);
      ctx.lineTo(stars[i + 1].x, stars[i + 1].y);
    }
    ctx.stroke();
    ctx.setLineDash([]); // Reset dash

    // Draw Solid Neon Lines for already connected stars
    if (targetStarIndex > 1) {
      ctx.beginPath();
      ctx.strokeStyle = '#66fcf1';
      ctx.shadowColor = '#66fcf1';
      ctx.shadowBlur = 12;
      ctx.lineWidth = 3;
      for (let i = 0; i < targetStarIndex - 1; i++) {
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[i + 1].x, stars[i + 1].y);
      }
      ctx.stroke();
      ctx.shadowBlur = 0; // Reset shadow
    }

    // Draw Stars
    stars.forEach((star, idx) => {
      if (idx < targetStarIndex) {
        // Connected Star (Glowing Cyan)
        ctx.fillStyle = '#66fcf1';
        ctx.shadowColor = '#66fcf1';
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (idx === targetStarIndex) {
        // Target Star (Pulsating Neon Ring)
        const pulse = Math.sin(performance.now() * 0.008) * 4 + 10;
        ctx.strokeStyle = '#ffe600';
        ctx.shadowColor = '#ffe600';
        ctx.shadowBlur = 20;
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(star.x, star.y, pulse, 0, Math.PI * 2);
        ctx.stroke();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(star.x, star.y, 6, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;

        // Draw Compass Arrow / Beacon pointing from ship to target star
        const angleToTarget = Math.atan2(star.y - ship.y, star.x - ship.x);
        const beaconDist = 32;
        const bx = ship.x + Math.cos(angleToTarget) * beaconDist;
        const by = ship.y + Math.sin(angleToTarget) * beaconDist;

        ctx.save();
        ctx.translate(bx, by);
        ctx.rotate(angleToTarget);
        ctx.fillStyle = '#ffe600';
        ctx.beginPath();
        ctx.moveTo(8, 0);
        ctx.lineTo(-6, -5);
        ctx.lineTo(-3, 0);
        ctx.lineTo(-6, 5);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      } else {
        // Future Unconnected Star (Soft White)
        ctx.fillStyle = 'rgba(197, 198, 199, 0.6)';
        ctx.beginPath();
        ctx.arc(star.x, star.y, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });

    // Draw Particles
    particles.forEach(p => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = Math.max(0, p.life / 0.6);
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    });
    ctx.globalAlpha = 1.0;

    // Draw Spacecraft
    drawShip();

    // Draw HUD (Heads-Up Display)
    renderHUD();
  }

  // Draw Spacecraft Vector Graphic
  function drawShip() {
    ctx.save();
    ctx.translate(ship.x, ship.y);
    ctx.rotate(ship.angle);

    // Thruster Flames if ship moving
    if (ship.vx !== 0 || ship.vy !== 0) {
      const flameLength = keys.Shift ? 24 : 14;
      const flameColor = keys.KeyZ ? '#00ffff' : (keys.Shift ? '#ff007f' : '#ffe600');

      ctx.fillStyle = flameColor;
      ctx.shadowColor = flameColor;
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.moveTo(-10, -5);
      ctx.lineTo(-10 - flameLength - Math.random() * 5, 0);
      ctx.lineTo(-10, 5);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Ship Body (Sleek Retro Fighter)
    ctx.fillStyle = '#1f2833';
    ctx.strokeStyle = '#66fcf1';
    ctx.lineWidth = 2;
    ctx.shadowColor = '#66fcf1';
    ctx.shadowBlur = 8;

    ctx.beginPath();
    ctx.moveTo(16, 0);       // Nose
    ctx.lineTo(-10, -12);    // Left Wing
    ctx.lineTo(-6, 0);       // Engine Notch
    ctx.lineTo(-10, 12);     // Right Wing
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Cockpit Canopy
    ctx.fillStyle = keys.Shift ? '#ff007f' : '#66fcf1';
    ctx.beginPath();
    ctx.arc(2, 0, 4, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // Draw HUD Overlay on Canvas
  function renderHUD() {
    ctx.save();
    ctx.font = '12px "Press Start 2P", monospace';

    // Constellation Title
    ctx.fillStyle = '#66fcf1';
    ctx.fillText(`LVL ${currentLevelIndex + 1}/12: ${CONSTELLATIONS[currentLevelIndex].name}`, 20, 36);

    // Score
    ctx.fillStyle = '#ffe600';
    const scoreStr = String(window.Voyager.score).padStart(5, '0');
    ctx.fillText(`SCORE: ${scoreStr}`, 600, 36);

    // Time Remaining
    const timeFormatted = levelTimeRemaining.toFixed(1);
    ctx.fillStyle = levelTimeRemaining < 5 ? '#ff0055' : '#ffffff';
    if (levelTimeRemaining < 5) {
      ctx.shadowColor = '#ff0055';
      ctx.shadowBlur = 10;
    }
    ctx.fillText(`TIME: ${timeFormatted}s`, 360, 36);
    ctx.shadowBlur = 0;

    // Controls Legend at Bottom
    ctx.font = '10px "Press Start 2P", monospace';
    ctx.fillStyle = 'rgba(197, 198, 199, 0.7)';
    ctx.fillText('[ARROWS]: MOVE   [SHIFT]: BOOST (2x)   [Z]: BRAKE (0.5x)', 140, 580);

    ctx.restore();
  }

  // Main Loop
  function gameLoop(timestamp) {
    const dt = Math.min((timestamp - lastTimestamp) / 1000, 0.1);
    lastTimestamp = timestamp;

    update(dt);
    render();

    if (window.Voyager.state === window.Voyager.STATE.PLAYING) {
      animFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // 7. Event Listeners for UI Buttons
  window.addEventListener('DOMContentLoaded', () => {
    canvas = document.getElementById('game-canvas');
    ctx = canvas.getContext('2d');

    const btnStart = document.getElementById('btn-start');
    const btnRetry = document.getElementById('btn-retry');
    const btnWinContinue = document.getElementById('btn-win-continue');

    if (btnStart) {
      btnStart.addEventListener('click', () => {
        setState(window.Voyager.STATE.PLAYING);
      });
    }

    if (btnRetry) {
      btnRetry.addEventListener('click', () => {
        setState(window.Voyager.STATE.PLAYING);
      });
    }

    // Win Handoff -> Leaderboard
    if (btnWinContinue) {
      btnWinContinue.addEventListener('click', () => {
        if (typeof window.Voyager.showLeaderboard === 'function') {
          window.Voyager.showLeaderboard(window.Voyager.score);
        } else {
          setState(window.Voyager.STATE.LEADERBOARD);
        }
      });
    }

    // #btn-restart-game is owned by leaderboard.js, which restarts via window.Voyager.resetGame()

    // Initial state setup
    setState(window.Voyager.STATE.START);
  });

})();
