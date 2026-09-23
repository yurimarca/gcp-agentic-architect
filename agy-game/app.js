/**
 * Hello, World(s)! Solar System Explorer
 * Interactive 3D Canvas Planet Visualizer & Audio Synthesizer
 */

// --- Planets Data Model ---
const PLANETS = [
    {
        id: 'sun',
        name: 'Sun',
        emoji: '☀️',
        greeting: 'Hello, Sun! ☀️',
        tag: 'CENTER OF OUR SYSTEM',
        nickname: 'Yellow Dwarf Star',
        category: 'G-Type Star',
        description: 'The Sun is the yellow dwarf star at the center of our solar system. Its gravity holds everything together, from the largest planets to tiny particles of debris.',
        distance: '0.00 AU (0 km)',
        moons: '8 Planets',
        dayLength: '27 Earth Days',
        temp: '5,500°C (Surface)',
        fact: 'The Sun contains 99.86% of all the mass in the entire solar system!',
        themeColor: '#ffaa00',
        glowColor: 'rgba(255, 170, 0, 0.6)',
        hasRings: false,
        textureType: 'sun'
    },
    {
        id: 'mercury',
        name: 'Mercury',
        emoji: '🪐',
        greeting: 'Hello, Mercury! 🪨',
        tag: 'THE SCORCHED MESSENGER',
        nickname: 'The Swift Planet',
        category: 'Terrestrial Planet',
        description: 'Mercury is the smallest planet in our solar system and closest to the Sun. It experiences extreme temperature swings from blistering heat to freezing cold night.',
        distance: '0.39 AU (57.9M km)',
        moons: '0 Moons',
        dayLength: '59 Earth Days',
        temp: '-180°C to 430°C',
        fact: 'Despite being closest to the Sun, Mercury is not the hottest planet — Venus holds that title!',
        themeColor: '#a1a8b8',
        glowColor: 'rgba(161, 168, 184, 0.5)',
        hasRings: false,
        textureType: 'cratered'
    },
    {
        id: 'venus',
        name: 'Venus',
        emoji: '🟡',
        greeting: 'Hello, Venus! ✨',
        tag: 'EARTH\'S TOXIC TWIN',
        nickname: 'The Morning Star',
        category: 'Terrestrial Planet',
        description: 'Venus is wrapped in thick, toxic clouds of sulfuric acid that trap heat in a runaway greenhouse effect, making it the hottest planet in our solar system.',
        distance: '0.72 AU (108.2M km)',
        moons: '0 Moons',
        dayLength: '243 Earth Days',
        temp: '465°C (Surface)',
        fact: 'Venus spins backwards relative to most other planets, so the Sun rises in the west and sets in the east.',
        themeColor: '#e3bb76',
        glowColor: 'rgba(227, 187, 118, 0.5)',
        hasRings: false,
        textureType: 'venus'
    },
    {
        id: 'earth',
        name: 'Earth',
        emoji: '🌍',
        greeting: 'Hello, Earth! 🌍',
        tag: 'OUR HOME WORLD',
        nickname: 'The Blue Marble',
        category: 'Terrestrial Planet',
        description: 'Our home world is the third planet from the Sun and the only known place in the universe inhabited by living things. Over 70% of its surface is covered by liquid oceans.',
        distance: '1.00 AU (149.6M km)',
        moons: '1 Moon (Luna)',
        dayLength: '24 Hours',
        temp: '15°C (Average)',
        fact: 'Earth is the only planet in the Solar System not named after a Greek or Roman deity.',
        themeColor: '#00f2fe',
        glowColor: 'rgba(0, 242, 254, 0.6)',
        hasRings: false,
        textureType: 'earth'
    },
    {
        id: 'mars',
        name: 'Mars',
        emoji: '🔴',
        greeting: 'Hello, Mars! 🔴',
        tag: 'THE RED PLANET',
        nickname: 'The Rusty World',
        category: 'Terrestrial Planet',
        description: 'Mars is a dusty, cold, desert world with a very thin atmosphere. Iron oxide (rust) on its surface gives the planet its iconic reddish appearance.',
        distance: '1.52 AU (227.9M km)',
        moons: '2 (Phobos & Deimos)',
        dayLength: '24h 37m',
        temp: '-60°C (Average)',
        fact: 'Mars is home to Olympus Mons, the largest volcano in the solar system — three times taller than Mt. Everest!',
        themeColor: '#ff4d4d',
        glowColor: 'rgba(255, 77, 77, 0.6)',
        hasRings: false,
        textureType: 'mars'
    },
    {
        id: 'jupiter',
        name: 'Jupiter',
        emoji: '🟠',
        greeting: 'Hello, Jupiter! 🪐',
        tag: 'KING OF THE PLANETS',
        nickname: 'The Gas Giant',
        category: 'Gas Giant',
        description: 'Jupiter is more than twice as massive as all the other planets combined. Its iconic Great Red Spot is a giant storm that has raged for hundreds of years.',
        distance: '5.20 AU (778.5M km)',
        moons: '95 Moons',
        dayLength: '9h 55m',
        temp: '-110°C (Cloudtop)',
        fact: 'Jupiter has the shortest day of all solar system planets, rotating once every 10 hours despite its giant size.',
        themeColor: '#ffaa66',
        glowColor: 'rgba(255, 170, 102, 0.5)',
        hasRings: false,
        textureType: 'jupiter'
    },
    {
        id: 'saturn',
        name: 'Saturn',
        emoji: '🪐',
        greeting: 'Hello, Saturn! 💍',
        tag: 'JEWEL OF THE SOLAR SYSTEM',
        nickname: 'The Ringed World',
        category: 'Gas Giant',
        description: 'Adorned with thousands of beautiful ringlets made of ice and rock, Saturn is unique among the planets. It is so light it could float in water!',
        distance: '9.58 AU (1.43B km)',
        moons: '146 Moons',
        dayLength: '10h 33m',
        temp: '-140°C (Cloudtop)',
        fact: 'Saturn\'s magnificent rings span up to 282,000 km across, but are remarkably thin — often less than 10 meters thick!',
        themeColor: '#f6d365',
        glowColor: 'rgba(246, 211, 101, 0.6)',
        hasRings: true,
        textureType: 'saturn'
    },
    {
        id: 'uranus',
        name: 'Uranus',
        emoji: '🔷',
        greeting: 'Hello, Uranus! ❄️',
        tag: 'THE TILTED ICE GIANT',
        nickname: 'The Sideways Planet',
        category: 'Ice Giant',
        description: 'Uranus is an ice giant with a unique 98-degree tilt, effectively orbiting the Sun on its side. It has a pale cyan atmosphere rich in methane ice.',
        distance: '19.22 AU (2.87B km)',
        moons: '28 Moons',
        dayLength: '17h 14m',
        temp: '-195°C (Average)',
        fact: 'Because Uranus rotates on its side, each pole gets 42 years of continuous sunlight followed by 42 years of darkness.',
        themeColor: '#4facfe',
        glowColor: 'rgba(79, 172, 254, 0.6)',
        hasRings: true,
        textureType: 'uranus'
    },
    {
        id: 'neptune',
        name: 'Neptune',
        emoji: '🔵',
        greeting: 'Hello, Neptune! 🌊',
        tag: 'THE WINDSWEPT WORLD',
        nickname: 'The Blue Ice Giant',
        category: 'Ice Giant',
        description: 'Dark, cold, and whipped by supersonic winds, Neptune is the most distant major planet in our solar system. It is over 30 times as far from the Sun as Earth.',
        distance: '30.05 AU (4.50B km)',
        moons: '16 Moons',
        dayLength: '16h 06m',
        temp: '-200°C (Average)',
        fact: 'Neptune experiences the fastest winds in the solar system, reaching speeds up to 2,100 km/h (1,300 mph)!',
        themeColor: '#0072ff',
        glowColor: 'rgba(0, 114, 255, 0.6)',
        hasRings: false,
        textureType: 'neptune'
    },
    {
        id: 'pluto',
        name: 'Pluto',
        emoji: '❄️',
        greeting: 'Hello, Pluto! 💖',
        tag: 'THE BELOVED DWARF PLANET',
        nickname: 'The Kuiper Belt World',
        category: 'Dwarf Planet',
        description: 'Pluto is a dwarf planet in the Kuiper Belt, a region of icy bodies beyond Neptune. It features mountain ranges made of water ice and a heart-shaped nitrogen glacier.',
        distance: '39.48 AU (5.91B km)',
        moons: '5 Moons (Charon)',
        dayLength: '6.4 Earth Days',
        temp: '-230°C (Surface)',
        fact: 'Pluto has a heart-shaped glacier named Tombaugh Regio, which is roughly the size of Texas and Oklahoma combined!',
        themeColor: '#d8b4fe',
        glowColor: 'rgba(216, 180, 254, 0.5)',
        hasRings: false,
        textureType: 'pluto'
    }
];

// --- State Management ---
let currentPlanetIndex = 3; // Default to Earth
let isAudioFXEnabled = false;
let isVoiceEnabled = true;
let isAutoTourRunning = false;
let autoTourInterval = null;
let warpSpeedActive = false;

// Mouse & Touch Drag State for 3D Camera Orbit
let isDragging = false;
let previousMousePosition = { x: 0, y: 0 };
let planetRotation = { x: 0.2, y: 0 }; // Radians
let cameraZoom = 1.0;

// --- Canvas & Starfield Engine ---
const canvas = document.getElementById('space-canvas');
const ctx = canvas.getContext('2d');

let stars = [];
const NUM_STARS = 350;

function initStarfield() {
    stars = [];
    for (let i = 0; i < NUM_STARS; i++) {
        stars.push({
            x: Math.random() * canvas.width - canvas.width / 2,
            y: Math.random() * canvas.height - canvas.height / 2,
            z: Math.random() * 1000,
            size: Math.random() * 1.5 + 0.5,
            color: `rgba(255, 255, 255, ${Math.random() * 0.8 + 0.2})`
        });
    }
}

function resizeCanvas() {
    const stage = document.getElementById('planet-stage');
    canvas.width = stage.clientWidth;
    canvas.height = stage.clientHeight;
    initStarfield();
}

window.addEventListener('resize', resizeCanvas);

// Procedural Off-screen Planet Texture Generator
const textureCache = {};

function getPlanetTexture(planet) {
    if (textureCache[planet.id]) {
        return textureCache[planet.id];
    }

    const texCanvas = document.createElement('canvas');
    texCanvas.width = 512;
    texCanvas.height = 256;
    const tctx = texCanvas.getContext('2d');

    const w = texCanvas.width;
    const h = texCanvas.height;

    switch (planet.textureType) {
        case 'sun': {
            // Sun procedural solar flare texture
            const grad = tctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#ffcc00');
            grad.addColorStop(0.5, '#ff5500');
            grad.addColorStop(1, '#ff8800');
            tctx.fillStyle = grad;
            tctx.fillRect(0, 0, w, h);

            // Sunspot splotches
            tctx.fillStyle = 'rgba(120, 20, 0, 0.4)';
            for (let i = 0; i < 30; i++) {
                const rx = Math.random() * w;
                const ry = Math.random() * h;
                const r = Math.random() * 15 + 5;
                tctx.beginPath();
                tctx.arc(rx, ry, r, 0, Math.PI * 2);
                tctx.fill();
            }
            break;
        }
        case 'cratered': {
            // Mercury grey rocky craters
            tctx.fillStyle = '#7a828e';
            tctx.fillRect(0, 0, w, h);
            tctx.fillStyle = 'rgba(40, 45, 55, 0.35)';
            for (let i = 0; i < 80; i++) {
                const rx = Math.random() * w;
                const ry = Math.random() * h;
                const r = Math.random() * 12 + 2;
                tctx.beginPath();
                tctx.arc(rx, ry, r, 0, Math.PI * 2);
                tctx.fill();
            }
            break;
        }
        case 'venus': {
            // Venus sulfur clouds
            const grad = tctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#e8cd8b');
            grad.addColorStop(0.3, '#d4a853');
            grad.addColorStop(0.7, '#f0d89e');
            grad.addColorStop(1, '#b88d3b');
            tctx.fillStyle = grad;
            tctx.fillRect(0, 0, w, h);

            tctx.fillStyle = 'rgba(255, 255, 255, 0.2)';
            for (let i = 0; i < 15; i++) {
                tctx.fillRect(0, Math.random() * h, w, Math.random() * 12 + 4);
            }
            break;
        }
        case 'earth': {
            // Earth: Deep Blue Oceans + Green/Brown Continents + White Clouds
            tctx.fillStyle = '#114488';
            tctx.fillRect(0, 0, w, h);

            // Continents landmasses
            tctx.fillStyle = '#2e7d32';
            const landSpots = [
                { x: 120, y: 80, r: 50 },
                { x: 150, y: 140, r: 40 },
                { x: 280, y: 70, r: 60 },
                { x: 320, y: 150, r: 45 },
                { x: 420, y: 120, r: 35 },
                { x: 50, y: 160, r: 30 }
            ];
            landSpots.forEach(s => {
                tctx.beginPath();
                tctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
                tctx.fill();
            });

            // Swirling white cloud noise
            tctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
            for (let i = 0; i < 25; i++) {
                tctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 60 + 20, Math.random() * 8 + 3);
            }
            break;
        }
        case 'mars': {
            // Mars rust red + polar ice caps
            tctx.fillStyle = '#c04020';
            tctx.fillRect(0, 0, w, h);

            // Dark basaltic patches
            tctx.fillStyle = 'rgba(80, 20, 10, 0.4)';
            for (let i = 0; i < 30; i++) {
                tctx.fillRect(Math.random() * w, Math.random() * h, Math.random() * 70 + 20, Math.random() * 25 + 5);
            }

            // White Ice caps
            tctx.fillStyle = '#ffffff';
            tctx.fillRect(0, 0, w, 18);
            tctx.fillRect(0, h - 18, w, 18);
            break;
        }
        case 'jupiter': {
            // Jupiter horizontal bands & Great Red Spot
            const bands = ['#d4a373', '#faedcd', '#ccd5ae', '#bb9457', '#6b705c', '#d4a373'];
            const bandH = h / bands.length;
            bands.forEach((col, idx) => {
                tctx.fillStyle = col;
                tctx.fillRect(0, idx * bandH, w, bandH);
            });

            // Great Red Spot
            tctx.fillStyle = '#b33951';
            tctx.beginPath();
            tctx.ellipse(w * 0.65, h * 0.65, 30, 18, 0, 0, Math.PI * 2);
            tctx.fill();
            break;
        }
        case 'saturn': {
            // Saturn golden bands
            const bands = ['#e6ccb2', '#ddb892', '#b08968', '#ede0d4', '#7f5539'];
            const bandH = h / bands.length;
            bands.forEach((col, idx) => {
                tctx.fillStyle = col;
                tctx.fillRect(0, idx * bandH, w, bandH);
            });
            break;
        }
        case 'uranus': {
            // Uranus smooth cyan ice
            const grad = tctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#70d6ff');
            grad.addColorStop(0.5, '#48cae4');
            grad.addColorStop(1, '#0077b6');
            tctx.fillStyle = grad;
            tctx.fillRect(0, 0, w, h);
            break;
        }
        case 'neptune': {
            // Neptune azure blue + dark spot
            const grad = tctx.createLinearGradient(0, 0, 0, h);
            grad.addColorStop(0, '#0077b6');
            grad.addColorStop(0.5, '#023e8a');
            grad.addColorStop(1, '#03045e');
            tctx.fillStyle = grad;
            tctx.fillRect(0, 0, w, h);

            // Subtle dark spot storm
            tctx.fillStyle = 'rgba(0, 10, 40, 0.5)';
            tctx.beginPath();
            tctx.ellipse(w * 0.4, h * 0.55, 25, 14, 0, 0, Math.PI * 2);
            tctx.fill();
            break;
        }
        case 'pluto': {
            // Pluto icy brown + heart glacier
            tctx.fillStyle = '#8d7966';
            tctx.fillRect(0, 0, w, h);

            // Heart glacier (Tombaugh Regio)
            tctx.fillStyle = '#eddcd2';
            tctx.beginPath();
            tctx.arc(w * 0.5, h * 0.5, 35, 0, Math.PI * 2);
            tctx.fill();
            break;
        }
        default: {
            tctx.fillStyle = planet.themeColor;
            tctx.fillRect(0, 0, w, h);
        }
    }

    textureCache[planet.id] = texCanvas;
    return texCanvas;
}

// Render Loop
function renderFrame() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const currentPlanet = PLANETS[currentPlanetIndex];

    // --- 1. Draw Starfield & Warp Effect ---
    const starSpeed = warpSpeedActive ? 30 : 0.4;
    ctx.fillStyle = '#ffffff';

    for (let star of stars) {
        star.z -= starSpeed;
        if (star.z <= 0) {
            star.z = 1000;
            star.x = Math.random() * canvas.width - canvas.width / 2;
            star.y = Math.random() * canvas.height - canvas.height / 2;
        }

        const k = 400 / star.z;
        const px = star.x * k + centerX;
        const py = star.y * k + centerY;

        if (px >= 0 && px <= canvas.width && py >= 0 && py <= canvas.height) {
            const size = Math.max(0.5, (1 - star.z / 1000) * 2.5);
            if (warpSpeedActive) {
                // Draw warp speed star lines
                ctx.strokeStyle = 'rgba(0, 242, 254, 0.8)';
                ctx.lineWidth = size * 1.5;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + (star.x * 0.05), py + (star.y * 0.05));
                ctx.stroke();
            } else {
                ctx.fillStyle = star.color;
                ctx.beginPath();
                ctx.arc(px, py, size, 0, Math.PI * 2);
                ctx.fill();
            }
        }
    }

    // --- 2. Auto Rotation & Dynamic Planet Calculations ---
    if (!isDragging) {
        planetRotation.y += 0.006;
    }

    const baseRadius = Math.min(canvas.width, canvas.height) * 0.22;
    const radius = baseRadius * cameraZoom;

    // --- 3. Atmosphere Glow Aura ---
    const glowGrad = ctx.createRadialGradient(
        centerX, centerY, radius * 0.85,
        centerX, centerY, radius * 1.45
    );
    glowGrad.addColorStop(0, currentPlanet.glowColor);
    glowGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius * 1.45, 0, Math.PI * 2);
    ctx.fill();

    // --- 4. Render Saturn / Uranus Back Ring (behind planet) ---
    if (currentPlanet.hasRings) {
        drawRings(ctx, centerX, centerY, radius, currentPlanet.themeColor, true);
    }

    // --- 5. Render 3D Planet Sphere with Surface Mapping ---
    ctx.save();
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.clip();

    // Draw Texture Projection
    const tex = getPlanetTexture(currentPlanet);
    const offsetX = ((planetRotation.y % (Math.PI * 2)) / (Math.PI * 2)) * tex.width;

    ctx.drawImage(tex, -offsetX, 0, tex.width, tex.height, centerX - radius, centerY - radius, radius * 2, radius * 2);
    ctx.drawImage(tex, tex.width - offsetX, 0, tex.width, tex.height, centerX - radius, centerY - radius, radius * 2, radius * 2);

    // 3D Spherical Shading & Specular Sun Highlight
    const shadingGrad = ctx.createRadialGradient(
        centerX - radius * 0.35, centerY - radius * 0.35, radius * 0.1,
        centerX + radius * 0.2, centerY + radius * 0.2, radius * 1.1
    );
    shadingGrad.addColorStop(0, 'rgba(255, 255, 255, 0.3)');
    shadingGrad.addColorStop(0.45, 'rgba(0, 0, 0, 0)');
    shadingGrad.addColorStop(0.85, 'rgba(0, 0, 0, 0.65)');
    shadingGrad.addColorStop(1, 'rgba(0, 0, 0, 0.95)');

    ctx.fillStyle = shadingGrad;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore(); // Remove clipping

    // --- 6. Render Saturn / Uranus Front Ring (in front of planet) ---
    if (currentPlanet.hasRings) {
        drawRings(ctx, centerX, centerY, radius, currentPlanet.themeColor, false);
    }

    requestAnimationFrame(renderFrame);
}

// Helper to draw Saturn / Uranus rings disk
function drawRings(ctx, cx, cy, radius, colorHex, isBack) {
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(0.35); // Ring inclination angle

    const innerR = radius * 1.35;
    const outerR = radius * 2.1;
    const scaleY = 0.32; // Perspective oval compression

    ctx.beginPath();
    ctx.ellipse(0, 0, outerR, outerR * scaleY, 0, isBack ? Math.PI : 0, isBack ? Math.PI * 2 : Math.PI);
    ctx.ellipse(0, 0, innerR, innerR * scaleY, 0, isBack ? Math.PI * 2 : Math.PI, isBack ? Math.PI : 0, true);

    const ringGrad = ctx.createRadialGradient(0, 0, innerR, 0, 0, outerR);
    ringGrad.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    ringGrad.addColorStop(0.4, colorHex);
    ringGrad.addColorStop(0.75, 'rgba(200, 200, 200, 0.5)');
    ringGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    ctx.fillStyle = ringGrad;
    ctx.fill();

    ctx.restore();
}

// --- Audio FX Engine (Web Audio API) ---
let audioCtx = null;

function playWarpSound() {
    if (!isAudioFXEnabled) return;

    try {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }

        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(150, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.35);

        gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);

        osc.connect(gain);
        gain.connect(audioCtx.destination);

        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
    } catch (e) {
        console.warn('Audio FX error:', e);
    }
}

// Speech Synthesizer Voice Greeting
function speakGreeting(text) {
    if (!isVoiceEnabled || !('speechSynthesis' in window)) return;

    window.speechSynthesis.cancel(); // Stop current speech
    const cleanText = text.replace(/[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = 0.95;
    utterance.pitch = 1.0;
    window.speechSynthesis.speak(utterance);
}

// --- UI Controls & Navigation ---
function updateUI(planetIndex, triggerWarp = true) {
    currentPlanetIndex = planetIndex;
    const planet = PLANETS[planetIndex];

    // Trigger Hyperdrive Warp effect animation
    if (triggerWarp) {
        warpSpeedActive = true;
        const warpIndicator = document.getElementById('warp-indicator');
        warpIndicator.classList.add('active');
        playWarpSound();

        setTimeout(() => {
            warpSpeedActive = false;
            warpIndicator.classList.remove('active');
        }, 400);
    }

    // Update Text Content
    document.getElementById('planet-tag').textContent = planet.tag;
    document.getElementById('greeting-text').textContent = planet.greeting;
    document.getElementById('greeting-text').style.color = planet.themeColor;
    document.getElementById('planet-nickname').textContent = `"${planet.nickname}"`;
    document.getElementById('planet-description').textContent = planet.description;

    document.getElementById('stat-distance').textContent = planet.distance;
    document.getElementById('stat-moons').textContent = planet.moons;
    document.getElementById('stat-day').textContent = planet.dayLength;
    document.getElementById('stat-temp').textContent = planet.temp;

    document.getElementById('planet-fact').textContent = planet.fact;

    document.getElementById('badge-number').textContent = `${planetIndex + 1} / ${PLANETS.length}`;
    document.getElementById('badge-category').textContent = planet.category;

    // Speak planet greeting
    speakGreeting(planet.greeting);

    // Sync Bottom Carousel Active state
    const buttons = document.querySelectorAll('.planet-btn');
    buttons.forEach((btn, idx) => {
        if (idx === planetIndex) {
            btn.classList.add('active');
            btn.style.setProperty('--planet-glow-color', planet.glowColor);
            btn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
            btn.classList.remove('active');
        }
    });
}

function createPlanetSelectorButtons() {
    const track = document.getElementById('planet-selector-track');
    track.innerHTML = '';

    PLANETS.forEach((planet, index) => {
        const btn = document.createElement('button');
        btn.className = `planet-btn ${index === currentPlanetIndex ? 'active' : ''}`;
        btn.setAttribute('aria-label', `Visit ${planet.name}`);

        btn.innerHTML = `
            <div class="planet-btn-icon" style="background: ${planet.themeColor}33; border: 1px solid ${planet.themeColor};">
                ${planet.emoji}
            </div>
            <span class="planet-btn-name">${planet.name}</span>
        `;

        btn.addEventListener('click', () => {
            if (isAutoTourRunning) toggleAutoTour();
            updateUI(index);
        });

        track.appendChild(btn);
    });
}

// Navigation Actions
function nextPlanet() {
    const nextIdx = (currentPlanetIndex + 1) % PLANETS.length;
    updateUI(nextIdx);
}

function prevPlanet() {
    const prevIdx = (currentPlanetIndex - 1 + PLANETS.length) % PLANETS.length;
    updateUI(prevIdx);
}

function randomPlanet() {
    let randIdx;
    do {
        randIdx = Math.floor(Math.random() * PLANETS.length);
    } while (randIdx === currentPlanetIndex);
    updateUI(randIdx);
}

function toggleAutoTour() {
    isAutoTourRunning = !isAutoTourRunning;
    const tourBtn = document.getElementById('btn-tour');

    if (isAutoTourRunning) {
        tourBtn.classList.add('active');
        tourBtn.querySelector('.label').textContent = 'Stop Tour';
        autoTourInterval = setInterval(() => {
            nextPlanet();
        }, 5000);
    } else {
        tourBtn.classList.remove('active');
        tourBtn.querySelector('.label').textContent = 'Auto-Tour';
        clearInterval(autoTourInterval);
    }
}

// Mouse Drag & Scroll Zoom Handling
function setupCameraInteractions() {
    canvas.addEventListener('mousedown', (e) => {
        isDragging = true;
        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    window.addEventListener('mouseup', () => {
        isDragging = false;
    });

    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging) return;

        const deltaX = e.clientX - previousMousePosition.x;
        const deltaY = e.clientY - previousMousePosition.y;

        planetRotation.y += deltaX * 0.008;
        planetRotation.x += deltaY * 0.008;

        previousMousePosition = { x: e.clientX, y: e.clientY };
    });

    canvas.addEventListener('wheel', (e) => {
        e.preventDefault();
        cameraZoom += e.deltaY * -0.001;
        cameraZoom = Math.min(Math.max(0.5, cameraZoom), 2.2);
    }, { passive: false });
}

// Event Listeners Setup
function initEventListeners() {
    document.getElementById('btn-next').addEventListener('click', () => {
        if (isAutoTourRunning) toggleAutoTour();
        nextPlanet();
    });

    document.getElementById('btn-prev').addEventListener('click', () => {
        if (isAutoTourRunning) toggleAutoTour();
        prevPlanet();
    });

    document.getElementById('btn-random').addEventListener('click', () => {
        if (isAutoTourRunning) toggleAutoTour();
        randomPlanet();
    });

    document.getElementById('btn-tour').addEventListener('click', toggleAutoTour);

    document.getElementById('btn-sound').addEventListener('click', () => {
        isAudioFXEnabled = !isAudioFXEnabled;
        const btn = document.getElementById('btn-sound');
        btn.classList.toggle('active', isAudioFXEnabled);
        if (isAudioFXEnabled) playWarpSound();
    });

    document.getElementById('btn-speak').addEventListener('click', () => {
        speakGreeting(PLANETS[currentPlanetIndex].greeting);
    });

    // Keyboard Shortcuts
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ') {
            nextPlanet();
        } else if (e.key === 'ArrowLeft') {
            prevPlanet();
        }
    });
}

// Initialization Entrypoint
window.addEventListener('load', () => {
    resizeCanvas();
    createPlanetSelectorButtons();
    setupCameraInteractions();
    initEventListeners();
    updateUI(currentPlanetIndex, false); // Initialize Earth without warp
    requestAnimationFrame(renderFrame);
});
