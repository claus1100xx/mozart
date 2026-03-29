// game.js — Mozart Platformer main engine
// Requires: i18n.js (window.I18N) and audio.js (window.AudioEngine)

(function () {
'use strict';

// ═══════════════════════════════════════════════════════════════════════════
//  CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const CW = 768, CH = 432;          // canvas dimensions
const GRAVITY   = 0.45;
const SPD       = 3.5;             // player run speed (px/frame at 60fps)
const JUMP      = -10.5;           // jump impulse (negative = up)
const SCALE     = 3;               // sprite pixel scale
const SW        = 8  * SCALE;      // sprite width on screen
const SH        = 12 * SCALE;      // sprite height on screen
const TILE      = 32;

// ═══════════════════════════════════════════════════════════════════════════
//  SPRITE PIXEL DATA
// ═══════════════════════════════════════════════════════════════════════════
// Each sprite is 8 wide × 12 tall logical pixels.
// Color keys: _=transparent W=white S=skin K=black R=red G=gold B=brown
//             D=dark-red N=navy-breeches
// Rendered with drawSprite(), each logical pixel → SCALE×SCALE filled rect.

const COL = {
  _: null,
  W: '#F0F0F0', // wig white
  w: '#C8C8C8', // wig shadow
  S: '#F5C8A0', // skin
  K: '#111111', // black
  R: '#CC3333', // red coat
  r: '#8B1A1A', // dark red shadow
  G: '#E8B84B', // gold trim
  N: '#2A3A6A', // navy breeches
  X: '#1A1A2A', // Salieri coat
  x: '#0D0D18', // Salieri coat shadow
  g: '#AAAAAA', // Salieri wig grey
  Y: '#EEEECC', // Salieri pale skin
  P: '#5A3A7A', // purple platform
};

// Mozart IDLE (8×12)
const MOZ_IDLE = [
  [COL._,COL.W,COL.W,COL.W,COL.W,COL.W,COL.W,COL._],
  [COL.W,COL.W,COL.W,COL.W,COL.W,COL.W,COL.W,COL.W],
  [COL.W,COL.w,COL.W,COL.W,COL.W,COL.W,COL.w,COL.W],
  [COL._,COL.S,COL.S,COL.S,COL.S,COL.S,COL.S,COL._],
  [COL._,COL.S,COL.K,COL.S,COL.S,COL.K,COL.S,COL._],
  [COL._,COL.S,COL.S,COL.R,COL.R,COL.S,COL.S,COL._],
  [COL.G,COL.R,COL.R,COL.R,COL.R,COL.R,COL.R,COL.G],
  [COL.R,COL.R,COL.G,COL.R,COL.R,COL.G,COL.R,COL.R],
  [COL.R,COL.r,COL.R,COL.R,COL.R,COL.R,COL.r,COL.R],
  [COL.N,COL.N,COL.N,COL.N,COL.N,COL.N,COL.N,COL.N],
  [COL.N,COL.K,COL.N,COL._,COL._,COL.N,COL.K,COL.N],
  [COL.K,COL.K,COL._,COL._,COL._,COL._,COL.K,COL.K],
];

// Mozart JUMP (arms up)
const MOZ_JUMP = [
  [COL._,COL.W,COL.W,COL.W,COL.W,COL.W,COL.W,COL._],
  [COL.W,COL.W,COL.W,COL.W,COL.W,COL.W,COL.W,COL.W],
  [COL.W,COL.w,COL.W,COL.W,COL.W,COL.W,COL.w,COL.W],
  [COL._,COL.S,COL.S,COL.S,COL.S,COL.S,COL.S,COL._],
  [COL._,COL.S,COL.K,COL.S,COL.S,COL.K,COL.S,COL._],
  [COL._,COL.S,COL.S,COL.R,COL.R,COL.S,COL.S,COL._],
  [COL.G,COL.R,COL.R,COL.R,COL.R,COL.R,COL.R,COL.G],
  [COL.G,COL.R,COL.G,COL.R,COL.R,COL.G,COL.R,COL.G], // arms raised (gold shows)
  [COL.R,COL.r,COL.R,COL.R,COL.R,COL.R,COL.r,COL.R],
  [COL.N,COL.N,COL.N,COL.N,COL.N,COL.N,COL.N,COL.N],
  [COL._,COL.N,COL.N,COL._,COL._,COL.N,COL.N,COL._], // legs together
  [COL._,COL.K,COL.K,COL._,COL._,COL.K,COL.K,COL._],
];

// Mozart RUN frames (4 frames — only bottom 3 rows differ)
function makeMozRun(frame) {
  const legs = [
    // frame 0: stride left
    [[COL.N,COL.K,COL.N,COL.N,COL._,COL._,COL.N,COL._],
     [COL.K,COL.K,COL.N,COL._,COL._,COL.N,COL.N,COL._],
     [COL.K,COL._,COL.N,COL._,COL._,COL.N,COL.K,COL.N]],
    // frame 1: neutral
    [[COL.N,COL.N,COL.N,COL.N,COL.N,COL.N,COL.N,COL.N],
     [COL.N,COL.K,COL.N,COL._,COL._,COL.N,COL.K,COL.N],
     [COL.K,COL.K,COL._,COL._,COL._,COL._,COL.K,COL.K]],
    // frame 2: stride right
    [[COL._,COL.N,COL._,COL._,COL.N,COL.N,COL.K,COL.N],
     [COL._,COL.N,COL.N,COL._,COL._,COL.N,COL.K,COL.K],
     [COL.N,COL.K,COL.N,COL._,COL._,COL.N,COL._,COL.K]],
    // frame 3: neutral (same as 1)
    [[COL.N,COL.N,COL.N,COL.N,COL.N,COL.N,COL.N,COL.N],
     [COL.N,COL.K,COL.N,COL._,COL._,COL.N,COL.K,COL.N],
     [COL.K,COL.K,COL._,COL._,COL._,COL._,COL.K,COL.K]],
  ];
  const top = MOZ_IDLE.slice(0, 9);
  return [...top, ...legs[frame % 4]];
}

// Mozart HIT (flash — white overlay, built dynamically during render)

// Salieri IDLE (8×12, dark)
const SAL_IDLE = [
  [COL._,COL.g,COL.g,COL.g,COL.g,COL.g,COL.g,COL._],
  [COL.g,COL.g,COL.g,COL.g,COL.g,COL.g,COL.g,COL.g],
  [COL.g,COL.g,COL.g,COL.g,COL.g,COL.g,COL.g,COL.g],
  [COL._,COL.Y,COL.Y,COL.Y,COL.Y,COL.Y,COL.Y,COL._],
  [COL._,COL.Y,COL.K,COL.Y,COL.Y,COL.K,COL.Y,COL._],
  [COL._,COL.Y,COL.Y,COL.K,COL.K,COL.Y,COL.Y,COL._], // frown
  [COL.X,COL.X,COL.X,COL.X,COL.X,COL.X,COL.X,COL.X],
  [COL.X,COL.x,COL.X,COL.X,COL.X,COL.X,COL.x,COL.X],
  [COL.x,COL.X,COL.X,COL.X,COL.X,COL.X,COL.X,COL.x],
  [COL.K,COL.K,COL.K,COL.K,COL.K,COL.K,COL.K,COL.K],
  [COL.K,COL.x,COL.K,COL._,COL._,COL.K,COL.x,COL.K],
  [COL.x,COL.x,COL._,COL._,COL._,COL._,COL.x,COL.x],
];

function makeSalRun(frame) {
  const legs = [
    [[COL.K,COL.x,COL.K,COL.K,COL._,COL._,COL.K,COL._],
     [COL.x,COL.x,COL.K,COL._,COL._,COL.K,COL.K,COL._],
     [COL.x,COL._,COL.K,COL._,COL._,COL.K,COL.x,COL.K]],
    [[COL.K,COL.K,COL.K,COL.K,COL.K,COL.K,COL.K,COL.K],
     [COL.K,COL.x,COL.K,COL._,COL._,COL.K,COL.x,COL.K],
     [COL.x,COL.x,COL._,COL._,COL._,COL._,COL.x,COL.x]],
    [[COL._,COL.K,COL._,COL._,COL.K,COL.K,COL.x,COL.K],
     [COL._,COL.K,COL.K,COL._,COL._,COL.K,COL.x,COL.x],
     [COL.K,COL.x,COL.K,COL._,COL._,COL.K,COL._,COL.x]],
    [[COL.K,COL.K,COL.K,COL.K,COL.K,COL.K,COL.K,COL.K],
     [COL.K,COL.x,COL.K,COL._,COL._,COL.K,COL.x,COL.K],
     [COL.x,COL.x,COL._,COL._,COL._,COL._,COL.x,COL.x]],
  ];
  const top = SAL_IDLE.slice(0, 9);
  return [...top, ...legs[frame % 4]];
}

// Salieri BOSS (16×12 — larger version, built from SAL_IDLE doubled)
function drawBossSprite(ctx2d, entity) {
  const bscale = SCALE * 2;
  const frame = Math.floor(entity.animFrame / 8) % 4;
  const sprite = makeSalRun(frame);
  drawSprite(ctx2d, sprite, entity.screenX, entity.y - cameraY, bscale, entity.facingLeft);
}

// ═══════════════════════════════════════════════════════════════════════════
//  LEVEL DATA
// ═══════════════════════════════════════════════════════════════════════════

function makePlatform(x, y, w, h, color, moving, vx, minX, maxX) {
  return { x, y, w, h, color: color || '#8B4513',
           moving: moving||false, vx: vx||0, minX: minX||x, maxX: maxX||x };
}

function makeEnemy(x, y, speed) {
  const sp = speed || 1.2;
  return { x, y, w: SW, h: SH, vx: -sp, vy: 0, speed: sp, onGround: false,
           dead: false, deathTimer: 0, animFrame: 0, facingLeft: true,
           invTimer: 0 };
}

function makeNote(x, y) {
  return { x, y, w: 16, h: 20, collected: false };
}

const LEVELS = [
  // ─── Level 1: Concert Hall ───────────────────────────────────────────
  {
    id: 1,
    song: 'turkish_march',
    width: 3840,
    bgBands: ['#1A1A4E','#2A2A6E','#3A3A8E','#4A4A9E'],
    groundColor: '#8B4513',
    platforms: [
      makePlatform(0,    CH-32,  3840, 32, '#5C3317'),   // ground
      // Section A: Opening staircase
      makePlatform(180,  CH-64,   112, 16, '#8B4513'),
      makePlatform(360,  CH-96,   96,  16, '#8B4513'),
      makePlatform(520,  CH-128,  80,  16, '#A0522D'),
      makePlatform(680,  CH-96,   112, 16, '#8B4513'),
      makePlatform(840,  CH-160,  64,  16, '#C47A2E'),   // high perch
      makePlatform(960,  CH-96,   128, 16, '#8B4513'),
      // Section B: Middle development
      makePlatform(1140, CH-128,  72,  16, '#8B4513'),
      makePlatform(1280, CH-64,   128, 16, '#8B4513'),
      makePlatform(1460, CH-192,  64,  16, '#C47A2E'),   // high leap
      makePlatform(1580, CH-128,  96,  16, '#A0522D'),
      makePlatform(1740, CH-96,   80,  16, '#8B4513'),
      makePlatform(1880, CH-160,  96,  16, '#A0522D', true, 1.2, 1880, 2060),
      makePlatform(2060, CH-96,   112, 16, '#8B4513'),
      makePlatform(2240, CH-128,  64,  16, '#8B4513'),
      makePlatform(2380, CH-64,   96,  16, '#8B4513'),
      makePlatform(2520, CH-160,  64,  16, '#C47A2E'),
      makePlatform(2640, CH-96,   96,  16, '#8B4513'),
      // Section C: Grand finale
      makePlatform(2800, CH-192,  64,  16, '#C47A2E'),
      makePlatform(2920, CH-96,   80,  16, '#8B4513'),
      makePlatform(3060, CH-128,  80,  16, '#A0522D'),
      makePlatform(3200, CH-64,   112, 16, '#8B4513'),
      makePlatform(3360, CH-160,  80,  16, '#A0522D', true, 1.8, 3360, 3540),
      makePlatform(3400, CH-96,   368, 16, '#5C3317'),   // exit platform
    ],
    enemies: [
      makeEnemy(540,  0, 1.4),
      makeEnemy(1300, 0, 1.6),
      makeEnemy(1310, 0, 1.3),   // two enemies close together
      makeEnemy(2080, 0, 2.0),
      makeEnemy(2920, 0, 1.8),
      makeEnemy(3210, 0, 2.0),
      makeEnemy(3230, 0, 1.6),   // final approach pair
    ],
    notes: [
      makeNote(200,  CH-92),
      makeNote(540,  CH-156),
      makeNote(860,  CH-188),    // high perch reward
      makeNote(1160, CH-156),
      makeNote(1480, CH-220),    // hardest note in level
      makeNote(1600, CH-156),
      makeNote(1900, CH-188),    // on moving platform
      makeNote(2260, CH-156),
      makeNote(2540, CH-188),
      makeNote(2820, CH-220),
      makeNote(3080, CH-156),
      makeNote(3220, CH-92),
    ],
    playerStart: { x: 64, y: CH-100 },
    exit: { x: 3760, y: CH-96, w: 40, h: 64 },
  },

  // ─── Level 2: Opera House ─────────────────────────────────────────────
  {
    id: 2,
    song: 'symphony_40',
    width: 4608,
    bgBands: ['#0D1A0D','#1A2E1A','#2A3E2A','#3A4E3A'],
    groundColor: '#4A3A2A',
    platforms: [
      makePlatform(0,    CH-32,  4608, 32, '#3A2A1A'),   // ground
      // Section A: Curtain Rise
      makePlatform(140,  CH-64,   128, 16, '#6A4A2A'),
      makePlatform(330,  CH-96,   96,  16, '#6A4A2A'),
      makePlatform(490,  CH-128,  80,  16, '#8A6A4A'),
      makePlatform(640,  CH-96,   112, 16, '#6A4A2A', true, 1.5, 640, 820),
      makePlatform(860,  CH-160,  64,  16, '#AA8A6A'),   // high balcony
      makePlatform(980,  CH-96,   96,  16, '#6A4A2A'),
      makePlatform(1120, CH-64,   128, 16, '#6A4A2A'),
      makePlatform(1300, CH-128,  80,  16, '#8A6A4A'),
      // Section B: Dramatic Tension
      makePlatform(1460, CH-192,  64,  16, '#AA8A6A'),   // high leap
      makePlatform(1600, CH-96,   96,  16, '#6A4A2A'),
      makePlatform(1780, CH-128,  80,  16, '#8A6A4A'),
      makePlatform(1940, CH-160,  72,  16, '#AA8A6A'),   // descending staircase top
      makePlatform(2080, CH-128,  72,  16, '#8A6A4A'),
      makePlatform(2220, CH-96,   72,  16, '#6A4A2A'),
      makePlatform(2350, CH-64,   112, 16, '#6A4A2A'),   // staircase floor
      makePlatform(2520, CH-224,  56,  16, '#AA8A6A'),   // highest platform in game
      makePlatform(2640, CH-160,  72,  16, '#AA8A6A'),
      makePlatform(2780, CH-96,   96,  16, '#6A4A2A', true, 2.0, 2780, 3000),
      // Section C: Final Act
      makePlatform(3060, CH-128,  80,  16, '#8A6A4A'),
      makePlatform(3220, CH-192,  64,  16, '#AA8A6A'),
      makePlatform(3360, CH-96,   96,  16, '#6A4A2A'),
      makePlatform(3520, CH-160,  80,  16, '#AA8A6A', true, 2.2, 3520, 3720),
      makePlatform(3700, CH-64,   128, 16, '#6A4A2A'),
      makePlatform(3880, CH-128,  80,  16, '#8A6A4A'),
      makePlatform(4040, CH-96,   112, 16, '#6A4A2A'),
      makePlatform(4220, CH-96,   368, 16, '#3A2A1A'),   // exit platform
    ],
    enemies: [
      makeEnemy(500,  0, 2.0),
      makeEnemy(860,  0, 1.8),
      makeEnemy(1480, 0, 2.2),
      makeEnemy(1790, 0, 2.0),
      makeEnemy(2360, 0, 2.5),
      makeEnemy(2380, 0, 2.0),   // tight pair
      makeEnemy(2800, 0, 2.8),
      makeEnemy(3240, 0, 2.3),
      makeEnemy(3720, 0, 2.2),
    ],
    notes: [
      makeNote(160,  CH-92),
      makeNote(350,  CH-124),
      makeNote(510,  CH-156),
      makeNote(660,  CH-124),
      makeNote(880,  CH-188),    // high balcony reward
      makeNote(1000, CH-124),
      makeNote(1140, CH-92),
      makeNote(1320, CH-156),
      makeNote(1480, CH-220),
      makeNote(1800, CH-156),
      makeNote(1960, CH-188),
      makeNote(2240, CH-124),
      makeNote(2370, CH-92),
      makeNote(2540, CH-252),    // hardest note in game (on CH-224 platform)
      makeNote(2660, CH-188),
      makeNote(3080, CH-156),
      makeNote(3240, CH-220),
      makeNote(3900, CH-156),
    ],
    playerStart: { x: 64, y: CH-100 },
    exit: { x: 4520, y: CH-96, w: 40, h: 64 },
  },

  // ─── Level 3: Boss Arena ──────────────────────────────────────────────
  {
    id: 3,
    song: 'magic_flute',
    width: CW,
    bgBands: ['#0A0014','#150028','#200040','#2A0050'],
    groundColor: '#2A0050',
    platforms: [
      makePlatform(0,   CH-32,  CW,  32, '#1A0030'),  // ground
      makePlatform(80,  CH-128, 160, 16, COL.P),
      makePlatform(320, CH-192, 128, 16, COL.P),
      makePlatform(528, CH-128, 160, 16, COL.P),
      makePlatform(240, CH-288, 288, 16, COL.P),       // top center platform
    ],
    enemies: [],   // boss only
    boss: {
      x: 600, y: CH-100, w: SW*2, h: SH*2,
      vx: -2, vy: 0, hp: 3, maxHp: 3,
      onGround: false, facingLeft: true,
      animFrame: 0, invTimer: 0,
      phase: 1, shootTimer: 80, leapTimer: 120,
    },
    notes: [
      makeNote(100, CH-160), makeNote(340, CH-220),
      makeNote(550, CH-160), makeNote(260, CH-320),
    ],
    playerStart: { x: 64, y: CH-100 },
    exit: null,   // win condition: defeat boss
  },
];

// ═══════════════════════════════════════════════════════════════════════════
//  MOZART FACTS & QUIZ DATA
// ═══════════════════════════════════════════════════════════════════════════
const LEVEL_FACTS = {
  1: ['fact_1_1','fact_1_2','fact_1_3','fact_1_4'],
  2: ['fact_2_1','fact_2_2','fact_2_3','fact_2_4'],
  3: ['fact_3_1','fact_3_2','fact_3_3'],
};

// correct: 0-based index into opts array
const QUIZ_QUESTIONS = {
  fact_1_1: { qKey:'quiz_q_1_1', opts:['quiz_q_1_1_a','quiz_q_1_1_b','quiz_q_1_1_c','quiz_q_1_1_d'], correct:1 },
  fact_1_2: { qKey:'quiz_q_1_2', opts:['quiz_q_1_2_a','quiz_q_1_2_b','quiz_q_1_2_c','quiz_q_1_2_d'], correct:2 },
  fact_1_3: { qKey:'quiz_q_1_3', opts:['quiz_q_1_3_a','quiz_q_1_3_b','quiz_q_1_3_c','quiz_q_1_3_d'], correct:2 },
  fact_1_4: { qKey:'quiz_q_1_4', opts:['quiz_q_1_4_a','quiz_q_1_4_b','quiz_q_1_4_c','quiz_q_1_4_d'], correct:3 },
  fact_2_1: { qKey:'quiz_q_2_1', opts:['quiz_q_2_1_a','quiz_q_2_1_b','quiz_q_2_1_c','quiz_q_2_1_d'], correct:1 },
  fact_2_2: { qKey:'quiz_q_2_2', opts:['quiz_q_2_2_a','quiz_q_2_2_b','quiz_q_2_2_c','quiz_q_2_2_d'], correct:2 },
  fact_2_3: { qKey:'quiz_q_2_3', opts:['quiz_q_2_3_a','quiz_q_2_3_b','quiz_q_2_3_c','quiz_q_2_3_d'], correct:2 },
  fact_2_4: { qKey:'quiz_q_2_4', opts:['quiz_q_2_4_a','quiz_q_2_4_b','quiz_q_2_4_c','quiz_q_2_4_d'], correct:2 },
};

// ═══════════════════════════════════════════════════════════════════════════
//  PIANO CHALLENGE CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════
const PIANO_WHITE_KEYS = ['C4','D4','E4','F4','G4','A4','B4','C5'];
const PIANO_BLACK_KEYS = [
  { noteKey:'Cs4', whiteIdx:0 },
  { noteKey:'Ds4', whiteIdx:1 },
  { noteKey:'Fs4', whiteIdx:3 },
  { noteKey:'Gs4', whiteIdx:4 },
  { noteKey:'As4', whiteIdx:5 },
];
const PIANO_WHITE_W  = 50;
const PIANO_WHITE_H  = 120;
const PIANO_BLACK_W  = 32;
const PIANO_BLACK_H  = 74;
const PIANO_KEYS_X   = (CW - PIANO_WHITE_W * 8) / 2;   // 184
const PIANO_KEYS_Y   = CH - PIANO_WHITE_H - 36;
const PIANO_DEMO_SEQ = ['G4','G4','D4','G4','E4','D4']; // Eine Kleine opening (C4-C5 range)
const PIANO_KEY_LETTERS = ['C','D','E','F','G','A','B','C'];

// ═══════════════════════════════════════════════════════════════════════════
//  GAME STATE
// ═══════════════════════════════════════════════════════════════════════════
let canvas, ctx2d;
let gameState = 'MENU';  // MENU | PLAYING | PAUSED | GAMEOVER | WIN | QUIZ | PIANO_CHALLENGE
let currentLevelIdx = 0;
let score = 0;
let lives = 3;
let totalNotes = 0;
let collectedNotes = 0;

let currentLevel = null;
let enemies = [];
let notes = [];
let boss = null;
let projectiles = [];
let cameraX = 0;
let cameraY = 0;  // always 0 (no vertical scroll)

const player = {
  x: 0, y: 0, w: SW, h: SH,
  vx: 0, vy: 0,
  onGround: false, platformRef: null,
  animFrame: 0, facingLeft: false,
  invTimer: 0,   // invincibility frames after hit
  state: 'idle', // idle | run | jump | hit
};

// Input
const keys = {};
let menuAnimFrame = 0;
let frameCount = 0;
let bossIntroTimer = 0;
let tutorialTimer = 0;
let lastTime = 0;
let paused_song = null;

// ── Fact banner ────────────────────────────────────────────────────────────
let factBanner = null;    // { key, timer, maxTimer } or null
let factIndex  = 0;
let factsSeenThisLevel = [];

// ── Quiz state ─────────────────────────────────────────────────────────────
const quizState = {
  questions: [], currentIdx: 0, selectedAnswer: null,
  feedbackTimer: 0, correct: 0, total: 0,
  summaryTimer: 0, pendingLevelIdx: 0,
};

// ── Piano challenge state ──────────────────────────────────────────────────
const pianoState = {
  phase: 'DEMO',         // 'DEMO' | 'INPUT' | 'SUCCESS'
  demoStep: 0,
  demoTimer: 0,          // counts down before playing next demo note
  demoEndTimer: 0,       // pause after last demo note before INPUT phase
  highlightKey: null,    // currently lit key (string or null)
  keyFlashTimer: 0,
  inputSequence: [],
  failCount: 0,
  celebrationTimer: 0,
  failTimer: 0,
  pendingLevelIdx: 0,
};

// Button rects for canvas click detection
const LANG_BTN = { x: 8, y: 8, w: 64, h: 24 };
const MUTE_BTN = { x: 80, y: 8, w: 64, h: 24 };

// ═══════════════════════════════════════════════════════════════════════════
//  UTILITY
// ═══════════════════════════════════════════════════════════════════════════
function clamp(v, lo, hi) { return Math.max(lo, Math.min(hi, v)); }

function rectOverlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x &&
         a.y < b.y + b.h && a.y + a.h > b.y;
}

// ═══════════════════════════════════════════════════════════════════════════
//  SPRITE RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawSprite(ctx2d, pixels, sx, sy, sc, flipX, flash) {
  sc = sc || SCALE;
  const rows = pixels.length;
  const cols = pixels[0].length;
  ctx2d.save();
  if (flipX) {
    ctx2d.translate(sx + cols * sc, sy);
    ctx2d.scale(-1, 1);
    sx = 0; sy = 0;
  }
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const color = flash ? '#FFFFFF' : pixels[r][c];
      if (!color) continue;
      ctx2d.fillStyle = color;
      ctx2d.fillRect(
        (flipX ? 0 : sx) + c * sc,
        (flipX ? 0 : sy) + r * sc,
        sc, sc
      );
    }
  }
  ctx2d.restore();
}

function drawMusicalNote(sx, sy, color) {
  ctx2d.fillStyle = color || '#FFD700';
  // Note head (oval via squashed rect)
  ctx2d.beginPath();
  ctx2d.ellipse(sx + 5, sy + 14, 5, 4, -0.4, 0, Math.PI * 2);
  ctx2d.fill();
  // Stem
  ctx2d.fillRect(sx + 9, sy + 2, 2, 12);
  // Flag
  ctx2d.beginPath();
  ctx2d.moveTo(sx + 11, sy + 2);
  ctx2d.quadraticCurveTo(sx + 18, sy + 6, sx + 11, sy + 9);
  ctx2d.fill();
}

// ═══════════════════════════════════════════════════════════════════════════
//  PHYSICS
// ═══════════════════════════════════════════════════════════════════════════
function resolveCollisionsX(entity) {
  for (const p of currentLevel.platforms) {
    if (rectOverlap(entity, p)) {
      if (entity.vx > 0) entity.x = p.x - entity.w;
      else if (entity.vx < 0) entity.x = p.x + p.w;
      entity.vx = 0;
    }
  }
}

function resolveCollisionsY(entity) {
  entity.onGround = false;
  entity.platformRef = null;
  for (const p of currentLevel.platforms) {
    if (rectOverlap(entity, p)) {
      if (entity.vy >= 0) {
        entity.y = p.y - entity.h;
        entity.vy = 0;
        entity.onGround = true;
        entity.platformRef = p;
      } else {
        entity.y = p.y + p.h;
        entity.vy = 0;
      }
    }
  }
}

function physicsStep(entity, dt) {
  entity.vy += GRAVITY * dt;
  entity.x += entity.vx * dt;
  resolveCollisionsX(entity);
  entity.y += entity.vy * dt;
  resolveCollisionsY(entity);

  // Moving platform rider
  if (entity.onGround && entity.platformRef && entity.platformRef.moving) {
    entity.x += entity.platformRef.vx * dt;
  }

  // World bounds
  entity.x = clamp(entity.x, 0, currentLevel.width - entity.w);
  // Fall off bottom = death/remove
}

// ═══════════════════════════════════════════════════════════════════════════
//  PLAYER
// ═══════════════════════════════════════════════════════════════════════════
function resetPlayer() {
  const start = currentLevel.playerStart;
  player.x = start.x;
  player.y = start.y;
  player.vx = 0;
  player.vy = 0;
  player.onGround = false;
  player.animFrame = 0;
  player.facingLeft = false;
  player.invTimer = 0;
  player.state = 'idle';
}

function updatePlayer(dt) {
  // Horizontal movement
  let moving = false;
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.vx = -SPD * dt;
    player.facingLeft = true;
    moving = true;
  } else if (keys['ArrowRight'] || keys['KeyD']) {
    player.vx = SPD * dt;
    player.facingLeft = false;
    moving = true;
  } else {
    player.vx = 0;
  }

  physicsStep(player, dt);

  // Animation state
  if (!player.onGround) {
    player.state = 'jump';
  } else if (moving) {
    player.state = 'run';
    player.animFrame++;
  } else {
    player.state = 'idle';
    player.animFrame = 0;
  }

  // Invincibility countdown
  if (player.invTimer > 0) player.invTimer -= dt;

  // Fell off bottom
  if (player.y > CH + 64) {
    playerDie();
  }
}

function playerJump() {
  if (player.onGround) {
    player.vy = JUMP;
    player.onGround = false;
    AudioEngine.playSfx('jump');
  }
}

function playerTakeDamage() {
  if (player.invTimer > 0) return;
  lives--;
  player.invTimer = 90;
  player.state = 'hit';
  player.vy = JUMP * 0.5;
  AudioEngine.playSfx('hit');
  if (lives <= 0) {
    setTimeout(() => setGameState('GAMEOVER'), 500);
  }
}

function playerDie() {
  if (player.invTimer > 0) return;
  lives--;
  player.invTimer = 90;
  AudioEngine.playSfx('hit');
  if (lives <= 0) {
    setGameState('GAMEOVER');
  } else {
    resetPlayer();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  ENEMIES
// ═══════════════════════════════════════════════════════════════════════════
function updateEnemies(dt) {
  for (const e of enemies) {
    if (e.dead) {
      e.deathTimer -= dt;
      continue;
    }
    e.animFrame++;

    // Determine direction before physicsStep (vx may be zeroed by wall collision)
    const dir = e.vx >= 0 ? 1 : -1;

    physicsStep(e, dt);

    // Reverse at edges / level bounds
    const onEdge = !isOnPlatformAhead(e);
    const atWall = e.x <= 1 || e.x + e.w >= currentLevel.width - 1;
    // vx might have been zeroed by resolveCollisionsX, use saved dir
    if (onEdge || atWall) {
      e.vx = e.speed * -dir;
    } else {
      e.vx = e.speed * dir;  // restore speed in case physicsStep zeroed it
    }
    e.facingLeft = e.vx < 0;

    // Fell off
    if (e.y > CH + 64) e.dead = true;
  }

  enemies = enemies.filter(e => !e.dead || e.deathTimer > 0);
}

function isOnPlatformAhead(e) {
  // Check a probe point one step ahead at foot level
  const probeX = e.vx > 0 ? e.x + e.w + 2 : e.x - 2;
  const probeY = e.y + e.h + 4;
  for (const p of currentLevel.platforms) {
    if (probeX >= p.x && probeX <= p.x + p.w &&
        probeY >= p.y && probeY <= p.y + p.h + 8) {
      return true;
    }
  }
  return false;
}

function stompEnemy(e) {
  e.dead = true;
  e.deathTimer = 20;
  score += 50;
  AudioEngine.playSfx('stomp');
  showFactBanner(currentLevel.id);
}

function checkEnemyCollisions() {
  if (gameState !== 'PLAYING') return;
  for (const e of enemies) {
    if (e.dead) continue;
    if (!rectOverlap(player, e)) continue;

    const playerFoot = player.y + player.h;
    const enemyMid  = e.y + e.h * 0.4;

    if (player.vy > 0 && playerFoot < e.y + e.h * 0.6) {
      stompEnemy(e);
      player.vy = JUMP * 0.55;
    } else if (player.invTimer <= 0) {
      playerTakeDamage();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  BOSS
// ═══════════════════════════════════════════════════════════════════════════
function updateBoss(dt) {
  if (!boss || boss.hp <= 0) return;
  boss.animFrame++;

  // Apply gravity and Y-axis physics only; handle X manually for reliable bounce
  boss.vy += GRAVITY * dt;
  boss.y += boss.vy * dt;
  resolveCollisionsY(boss);

  // Phase thresholds
  boss.phase = boss.hp >= 3 ? 1 : boss.hp === 2 ? 2 : 3;

  const speed = [0, 1.8, 2.5, 3.2][boss.phase];

  // Walk back and forth — bounce at arena edges
  if (boss.x <= 48)              boss.dir =  1;
  if (boss.x + boss.w >= CW-48) boss.dir = -1;
  if (!boss.dir) boss.dir = -1;
  boss.vx = boss.dir * speed;
  boss.x += boss.vx * dt;
  boss.x = clamp(boss.x, 48, CW - 48 - boss.w);
  boss.facingLeft = boss.dir < 0;

  // Shoot projectiles
  boss.shootTimer -= dt;
  const shootInterval = [0, 90, 60, 40][boss.phase];
  if (boss.shootTimer <= 0) {
    boss.shootTimer = shootInterval;
    spawnBossProjectiles();
  }

  // Leap (phase 3)
  if (boss.phase === 3) {
    boss.leapTimer -= dt;
    if (boss.leapTimer <= 0 && boss.onGround) {
      boss.vy = JUMP * 0.8;
      boss.leapTimer = 120;
    }
  }

  // Invincibility countdown
  if (boss.invTimer > 0) boss.invTimer -= dt;

  // Check player-boss collision
  if (rectOverlap(player, boss)) {
    const playerFoot = player.y + player.h;
    if (player.vy > 0 && playerFoot < boss.y + boss.h * 0.5 && boss.invTimer <= 0) {
      boss.hp--;
      boss.invTimer = 90;
      player.vy = JUMP * 0.6;
      score += 200;
      AudioEngine.playSfx('stomp');
      if (boss.hp <= 0) {
        boss.hp = 0;
        AudioEngine.stopSong();
        AudioEngine.playSfx('win');
        setTimeout(() => setGameState('WIN'), 1500);
      }
    } else if (player.invTimer <= 0 && boss.invTimer <= 0) {
      playerTakeDamage();
    }
  }
}

function spawnBossProjectiles() {
  if (!boss) return;
  const count = [0, 2, 3, 4][boss.phase];
  const dir = boss.facingLeft ? -1 : 1;
  for (let i = 0; i < count; i++) {
    projectiles.push({
      x: boss.x + boss.w / 2 - 6,
      y: boss.y + boss.h * 0.4 + i * 12,
      w: 14, h: 10,
      vx: dir * (4.0 + i * 0.5),
      vy: -0.5 + i * 0.3,
      life: 180,
    });
  }
}

function updateProjectiles(dt) {
  for (const p of projectiles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    p.vy += 0.15 * dt;
    p.life -= dt;

    if (rectOverlap(player, p) && player.invTimer <= 0) {
      playerTakeDamage();
      p.life = 0;
    }
  }
  projectiles = projectiles.filter(p => p.life > 0 && p.x > -50 && p.x < currentLevel.width + 50);
}

// ═══════════════════════════════════════════════════════════════════════════
//  COLLECTIBLES
// ═══════════════════════════════════════════════════════════════════════════
function updateCollectibles() {
  for (const n of notes) {
    if (n.collected) continue;
    if (rectOverlap(player, n)) {
      n.collected = true;
      collectedNotes++;
      score += 10;
      AudioEngine.playSfx('collect');
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  CAMERA
// ═══════════════════════════════════════════════════════════════════════════
function updateCamera() {
  const targetX = player.x - CW / 3;
  cameraX = clamp(targetX, 0, currentLevel.width - CW);
}

// ═══════════════════════════════════════════════════════════════════════════
//  MOVING PLATFORMS
// ═══════════════════════════════════════════════════════════════════════════
function updatePlatforms(dt) {
  for (const p of currentLevel.platforms) {
    if (!p.moving) continue;
    p.x += p.vx * dt;
    if (p.x <= p.minX) { p.x = p.minX; p.vx = Math.abs(p.vx); }
    if (p.x >= p.maxX) { p.x = p.maxX; p.vx = -Math.abs(p.vx); }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  EXIT / LEVEL TRANSITION
// ═══════════════════════════════════════════════════════════════════════════
function checkExit() {
  const exit = currentLevel.exit;
  if (!exit) return;
  if (!rectOverlap(player, exit)) return;

  AudioEngine.playSfx('levelup');
  AudioEngine.stopSong();

  const nextIdx = currentLevelIdx + 1;
  currentLevelIdx = nextIdx;

  if (currentLevel.id === 1) {
    enterQuiz(nextIdx);
  } else if (currentLevel.id === 2) {
    enterPianoChallenge(nextIdx);
  } else {
    if (nextIdx >= LEVELS.length) setGameState('WIN');
    else loadLevel(nextIdx);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  GAME STATE MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════
function setGameState(newState) {
  gameState = newState;
  const tc = document.getElementById('touch-controls');
  if (tc) tc.style.display = (newState === 'PLAYING') ? '' : 'none';
  if (newState === 'PLAYING') {
    // Song already started by loadLevel or resume
  } else if (newState === 'MENU') {
    AudioEngine.stopSong();
    AudioEngine.playSong('eine_kleine');
  } else if (newState === 'GAMEOVER') {
    AudioEngine.stopSong();
  } else if (newState === 'WIN') {
    AudioEngine.stopSong();
    // win sfx already played by updateBoss before the state transition
  } else if (newState === 'QUIZ' || newState === 'PIANO_CHALLENGE') {
    AudioEngine.stopSong();
  }
}

function loadLevel(idx) {
  currentLevel = JSON.parse(JSON.stringify(LEVELS[idx]));  // deep clone
  enemies = currentLevel.enemies || [];
  notes   = currentLevel.notes   || [];
  boss    = currentLevel.boss    || null;
  projectiles = [];
  cameraX = 0;

  // Count total notes for this level
  totalNotes = notes.length;
  collectedNotes = 0;

  // Reset fact/quiz state
  factBanner = null;
  factIndex  = 0;
  factsSeenThisLevel = [];
  quizState.currentIdx = 0;
  quizState.selectedAnswer = null;
  quizState.feedbackTimer = 0;

  // Reset piano state
  pianoState.phase = 'DEMO';
  pianoState.highlightKey = null;
  pianoState.inputSequence = [];
  pianoState.failCount = 0;

  resetPlayer();

  if (currentLevel.id === 3) {
    bossIntroTimer = 120;
  }
  tutorialTimer = idx === 0 ? 180 : 0;

  AudioEngine.stopSong();
  AudioEngine.playSong(currentLevel.song);
  gameState = 'PLAYING';
}

// ═══════════════════════════════════════════════════════════════════════════
//  UPDATE
// ═══════════════════════════════════════════════════════════════════════════
function update(dt) {
  frameCount++;
  if (bossIntroTimer > 0) { bossIntroTimer -= dt; }
  if (tutorialTimer  > 0) { tutorialTimer  -= dt; }

  updatePlatforms(dt);
  updatePlayer(dt);
  updateEnemies(dt);
  if (boss) updateBoss(dt);
  updateProjectiles(dt);
  updateCollectibles();
  checkEnemyCollisions();
  checkExit();
  updateCamera();
  updateFactBanner(dt);
}

// ═══════════════════════════════════════════════════════════════════════════
//  BACKGROUND RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawBackground() {
  const bands = currentLevel.bgBands;
  const bandH = Math.ceil(CH / bands.length);
  for (let i = 0; i < bands.length; i++) {
    ctx2d.fillStyle = bands[i];
    ctx2d.fillRect(0, i * bandH, CW, bandH + 1);
  }

  // Parallax stars (for level 3)
  if (currentLevel.id === 3) {
    ctx2d.fillStyle = '#FFFFFF';
    for (let i = 0; i < 40; i++) {
      const sx = ((i * 137 + frameCount * 0.2) % CW);
      const sy = (i * 97) % (CH - 60);
      ctx2d.fillRect(sx, sy, 1, 1);
    }
  }

  // Level-specific decorations
  if (currentLevel.id === 1) {
    // Curtain pillars
    ctx2d.fillStyle = '#6B1A1A';
    for (let cx = 0; cx < currentLevel.width; cx += 480) {
      const sx = cx - cameraX;
      if (sx > -20 && sx < CW + 20) {
        ctx2d.fillRect(sx, 0, 20, CH - 32);
        ctx2d.fillRect(sx + 460, 0, 20, CH - 32);
      }
    }
  } else if (currentLevel.id === 2) {
    // Opera box arches
    ctx2d.fillStyle = '#3A2A1A';
    for (let cx = 0; cx < currentLevel.width; cx += 400) {
      const sx = cx - cameraX;
      if (sx > -60 && sx < CW + 60) {
        ctx2d.beginPath();
        ctx2d.arc(sx + 200, CH - 32, 120, Math.PI, 0);
        ctx2d.fill();
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PLATFORMS RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawPlatforms() {
  for (const p of currentLevel.platforms) {
    const sx = p.x - cameraX;
    if (sx + p.w < 0 || sx > CW) continue;
    ctx2d.fillStyle = p.color;
    ctx2d.fillRect(sx, p.y, p.w, p.h);
    // Top highlight
    ctx2d.fillStyle = 'rgba(255,255,255,0.15)';
    ctx2d.fillRect(sx, p.y, p.w, 3);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  COLLECTIBLES RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawCollectibles() {
  for (const n of notes) {
    if (n.collected) continue;
    const sx = n.x - cameraX;
    if (sx < -20 || sx > CW + 20) continue;
    // Gentle bob animation
    const bob = Math.sin(frameCount * 0.06 + n.x * 0.01) * 3;
    drawMusicalNote(sx, n.y + bob, '#FFD700');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  PLAYER RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawPlayer() {
  // Flash during invincibility
  if (player.invTimer > 0 && Math.floor(player.invTimer / 5) % 2 === 0) return;

  const sx = player.x - cameraX;
  const flash = player.state === 'hit' && player.invTimer > 75;

  let sprite;
  if (player.state === 'jump') {
    sprite = MOZ_JUMP;
  } else if (player.state === 'run') {
    sprite = makeMozRun(Math.floor(player.animFrame / 6) % 4);
  } else {
    sprite = MOZ_IDLE;
  }

  drawSprite(ctx2d, sprite, sx, player.y, SCALE, player.facingLeft, flash);
}

// ═══════════════════════════════════════════════════════════════════════════
//  ENEMIES RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawEnemies() {
  for (const e of enemies) {
    const sx = e.x - cameraX;
    if (sx + e.w < 0 || sx > CW) continue;
    if (e.dead) {
      // Squish: scale vertically down over death timer
      const scaleY = clamp(e.deathTimer / 20, 0.05, 1);
      ctx2d.save();
      ctx2d.translate(sx, e.y + e.h);
      ctx2d.scale(1, scaleY);
      ctx2d.translate(0, -e.h);
      drawSprite(ctx2d, SAL_IDLE, 0, 0, SCALE, e.facingLeft);
      ctx2d.restore();
      continue;
    }
    const frame = Math.floor(e.animFrame / 8) % 4;
    drawSprite(ctx2d, makeSalRun(frame), sx, e.y, SCALE, e.facingLeft);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  BOSS RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawBoss() {
  if (!boss || boss.hp <= 0) return;
  if (boss.invTimer > 0 && Math.floor(boss.invTimer / 5) % 2 === 0) return;

  const sx = boss.x - cameraX;
  const bscale = SCALE * 2;
  const frame = Math.floor(boss.animFrame / 8) % 4;
  drawSprite(ctx2d, makeSalRun(frame), sx, boss.y, bscale, boss.facingLeft);

  // HP bar above boss
  const bw = boss.w * 2;
  const bx = sx;
  const by = boss.y - 14;
  ctx2d.fillStyle = '#500';
  ctx2d.fillRect(bx, by, bw, 8);
  ctx2d.fillStyle = '#E00';
  ctx2d.fillRect(bx, by, bw * (boss.hp / boss.maxHp), 8);
  ctx2d.strokeStyle = '#FFF';
  ctx2d.lineWidth = 1;
  ctx2d.strokeRect(bx, by, bw, 8);
}

// ═══════════════════════════════════════════════════════════════════════════
//  PROJECTILES RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawProjectiles() {
  ctx2d.fillStyle = '#EEEEAA';
  for (const p of projectiles) {
    const sx = p.x - cameraX;
    ctx2d.fillRect(sx, p.y, p.w, p.h);
    // Music sheet lines
    ctx2d.fillStyle = '#888866';
    for (let i = 0; i < 3; i++) {
      ctx2d.fillRect(sx + 2, p.y + 2 + i * 3, p.w - 4, 1);
    }
    ctx2d.fillStyle = '#EEEEAA';
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  EXIT DOOR RENDERING
// ═══════════════════════════════════════════════════════════════════════════
function drawExit() {
  const exit = currentLevel.exit;
  if (!exit) return;
  const sx = exit.x - cameraX;
  if (sx < -exit.w || sx > CW) return;
  // Door frame
  ctx2d.fillStyle = '#5C3317';
  ctx2d.fillRect(sx, exit.y, exit.w, exit.h);
  ctx2d.fillStyle = '#8B5E3C';
  ctx2d.fillRect(sx + 4, exit.y + 4, exit.w - 8, exit.h - 8);
  // Knob
  ctx2d.fillStyle = '#FFD700';
  ctx2d.beginPath();
  ctx2d.arc(sx + exit.w - 8, exit.y + exit.h * 0.55, 3, 0, Math.PI * 2);
  ctx2d.fill();
  // Star/arrow above door
  ctx2d.fillStyle = '#FFD700';
  ctx2d.font = 'bold 18px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.fillText('★', sx + exit.w / 2, exit.y - 4);
}

// ═══════════════════════════════════════════════════════════════════════════
//  HUD
// ═══════════════════════════════════════════════════════════════════════════
function drawHUD() {
  const T = I18N.t.bind(I18N);

  // Score
  ctx2d.fillStyle = '#FFFFFF';
  ctx2d.font = 'bold 14px monospace';
  ctx2d.textAlign = 'left';
  ctx2d.fillText(`${T('hud_score')}: ${score}`, 10, CH - 12);

  // Level
  ctx2d.textAlign = 'center';
  ctx2d.fillText(`${T('hud_level')} ${currentLevel.id}`, CW / 2, CH - 12);

  // Lives (small head icons + number)
  ctx2d.textAlign = 'right';
  ctx2d.fillText(`${T('hud_lives')}: ${'♪'.repeat(lives)}`, CW - 10, CH - 12);

  // Tutorial overlay
  if (tutorialTimer > 0 && currentLevel.id === 1) {
    const alpha = Math.min(1, tutorialTimer / 40);
    ctx2d.globalAlpha = alpha;
    ctx2d.fillStyle = 'rgba(0,0,0,0.5)';
    ctx2d.fillRect(CW/2 - 180, CH/2 - 50, 360, 80);
    ctx2d.fillStyle = '#FFD700';
    ctx2d.font = '14px monospace';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(T('tutorial_move'),  CW/2, CH/2 - 18);
    ctx2d.fillText(T('tutorial_jump'),  CW/2, CH/2);
    ctx2d.fillText(T('tutorial_stomp'), CW/2, CH/2 + 18);
    ctx2d.globalAlpha = 1;
  }

  // Boss intro banner
  if (bossIntroTimer > 0 && currentLevel.id === 3) {
    const alpha = Math.min(1, bossIntroTimer / 30);
    ctx2d.globalAlpha = alpha;
    ctx2d.fillStyle = 'rgba(80,0,0,0.7)';
    ctx2d.fillRect(CW/2 - 160, CH/2 - 30, 320, 52);
    ctx2d.fillStyle = '#FF4444';
    ctx2d.font = 'bold 24px monospace';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(T('boss_intro'), CW/2, CH/2 + 10);
    ctx2d.globalAlpha = 1;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
//  OVERLAY BUTTONS (language + mute)
// ═══════════════════════════════════════════════════════════════════════════
function drawOverlayButtons() {
  // Language toggle
  ctx2d.fillStyle = 'rgba(0,0,0,0.6)';
  ctx2d.fillRect(LANG_BTN.x, LANG_BTN.y, LANG_BTN.w, LANG_BTN.h);
  ctx2d.fillStyle = '#FFD700';
  ctx2d.font = 'bold 11px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.fillText(I18N.lang === 'en' ? 'EN | de' : 'en | DE',
                 LANG_BTN.x + LANG_BTN.w/2, LANG_BTN.y + 16);

  // Mute toggle
  ctx2d.fillStyle = 'rgba(0,0,0,0.6)';
  ctx2d.fillRect(MUTE_BTN.x, MUTE_BTN.y, MUTE_BTN.w, MUTE_BTN.h);
  ctx2d.fillStyle = AudioEngine.isMuted() ? '#888' : '#FFD700';
  ctx2d.fillText(AudioEngine.isMuted() ? '♪ OFF' : '♪ ON',
                 MUTE_BTN.x + MUTE_BTN.w/2, MUTE_BTN.y + 16);
}

// ═══════════════════════════════════════════════════════════════════════════
//  SCREEN RENDERERS
// ═══════════════════════════════════════════════════════════════════════════
function renderMenu() {
  menuAnimFrame++;
  const T = I18N.t.bind(I18N);

  // Background gradient bands
  const bands = ['#0A0A2A','#0F0F3A','#14144A','#18185A'];
  for (let i = 0; i < bands.length; i++) {
    ctx2d.fillStyle = bands[i];
    ctx2d.fillRect(0, i * CH/4, CW, CH/4 + 1);
  }

  // Floating notes decoration
  for (let i = 0; i < 8; i++) {
    const nx = (i * 97 + menuAnimFrame * 0.3 + i * 30) % (CW + 20) - 10;
    const ny = 60 + Math.sin(menuAnimFrame * 0.04 + i) * 20 + i * 40;
    drawMusicalNote(nx, ny % (CH - 60), 'rgba(255,215,0,0.4)');
  }

  // Title
  ctx2d.textAlign = 'center';
  ctx2d.fillStyle = '#FFD700';
  ctx2d.font = 'bold 28px monospace';
  ctx2d.fillText(T('menu_title'), CW/2, 100);

  ctx2d.fillStyle = '#FFFFFF';
  ctx2d.font = '16px monospace';
  ctx2d.fillText(T('menu_subtitle'), CW/2, 136);

  // Mozart idle sprite centered
  const mx = CW/2 - SW/2;
  const my = 170;
  drawSprite(ctx2d, MOZ_IDLE, mx, my, SCALE, false);

  // Blinking start prompt
  if (Math.floor(menuAnimFrame / 30) % 2 === 0) {
    ctx2d.fillStyle = '#FFD700';
    ctx2d.font = 'bold 16px monospace';
    ctx2d.fillText(T('menu_start'), CW/2, 290);
  }

  // Controls hint
  ctx2d.fillStyle = '#AAAAAA';
  ctx2d.font = '12px monospace';
  ctx2d.fillText('Arrow keys / WASD  |  Space / Up = jump  |  ESC = pause', CW/2, 350);
  ctx2d.fillText('M = music toggle  |  L = language toggle', CW/2, 370);

  drawOverlayButtons();
}

function renderPause() {
  const T = I18N.t.bind(I18N);
  ctx2d.fillStyle = 'rgba(0,0,0,0.55)';
  ctx2d.fillRect(0, 0, CW, CH);

  ctx2d.textAlign = 'center';
  ctx2d.fillStyle = '#FFD700';
  ctx2d.font = 'bold 36px monospace';
  ctx2d.fillText(T('pause_title'), CW/2, CH/2 - 30);

  ctx2d.fillStyle = '#FFFFFF';
  ctx2d.font = '16px monospace';
  ctx2d.fillText(T('pause_resume'), CW/2, CH/2 + 10);
  ctx2d.fillText(T('pause_mute'),   CW/2, CH/2 + 34);

  drawOverlayButtons();
}

function renderGameOver() {
  const T = I18N.t.bind(I18N);

  ctx2d.fillStyle = '#0A0000';
  ctx2d.fillRect(0, 0, CW, CH);

  ctx2d.textAlign = 'center';
  ctx2d.fillStyle = '#CC3333';
  ctx2d.font = 'bold 40px monospace';
  ctx2d.fillText(T('gameover_title'), CW/2, CH/2 - 40);

  ctx2d.fillStyle = '#FFFFFF';
  ctx2d.font = '18px monospace';
  ctx2d.fillText(`${T('hud_score')}: ${score}`, CW/2, CH/2 + 10);

  if (Math.floor(menuAnimFrame / 30) % 2 === 0) {
    ctx2d.fillStyle = '#FFD700';
    ctx2d.font = '16px monospace';
    ctx2d.fillText(T('gameover_sub'), CW/2, CH/2 + 50);
  }
  drawOverlayButtons();
}

function renderWin() {
  const T = I18N.t.bind(I18N);
  menuAnimFrame++;

  // Gold sky
  const bands = ['#2A1A00','#3A2A00','#4A3A00','#5A4A10'];
  for (let i = 0; i < bands.length; i++) {
    ctx2d.fillStyle = bands[i];
    ctx2d.fillRect(0, i * CH/4, CW, CH/4+1);
  }

  // Celebration notes
  for (let i = 0; i < 12; i++) {
    const nx = (i * 61 + menuAnimFrame * 0.8) % (CW + 30) - 15;
    const ny = 20 + Math.abs(Math.sin(menuAnimFrame * 0.07 + i * 0.8)) * (CH - 80);
    drawMusicalNote(nx, ny, `rgba(255,215,0,${0.4 + 0.3 * Math.sin(i)})`);
  }

  ctx2d.textAlign = 'center';
  ctx2d.fillStyle = '#FFD700';
  ctx2d.font = 'bold 36px monospace';
  ctx2d.fillText(T('win_title'), CW/2, 100);

  ctx2d.fillStyle = '#FFFFFF';
  ctx2d.font = '18px monospace';
  ctx2d.fillText(T('win_sub'), CW/2, 140);

  // Mozart victory pose (JUMP sprite)
  drawSprite(ctx2d, MOZ_JUMP, CW/2 - SW/2, 160, SCALE, false);

  // Score + stars
  ctx2d.fillStyle = '#FFD700';
  ctx2d.font = 'bold 18px monospace';
  ctx2d.fillText(`${T('win_score')} ${score}`, CW/2, 270);

  const starRatio = totalNotes > 0 ? collectedNotes / totalNotes : 1;
  const stars = starRatio >= 1 ? 3 : starRatio >= 0.5 ? 2 : 1;
  ctx2d.font = 'bold 30px monospace';
  ctx2d.fillText('★'.repeat(stars) + '☆'.repeat(3-stars), CW/2, 310);

  ctx2d.fillStyle = '#CCCCCC';
  ctx2d.font = '14px monospace';
  const starKey = `stars_${stars}`;
  ctx2d.fillText(T(starKey), CW/2, 340);

  if (Math.floor(menuAnimFrame / 30) % 2 === 0) {
    ctx2d.fillStyle = '#FFFFFF';
    ctx2d.font = '14px monospace';
    ctx2d.fillText('ENTER / click to return to menu', CW/2, 390);
  }

  drawOverlayButtons();
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN RENDER
// ═══════════════════════════════════════════════════════════════════════════
function render() {
  drawBackground();
  drawPlatforms();
  drawCollectibles();
  drawExit();
  drawEnemies();
  if (boss) drawBoss();
  drawProjectiles();
  drawPlayer();
  drawHUD();
  drawFactBanner();
  drawOverlayButtons();
}

// ═══════════════════════════════════════════════════════════════════════════
//  FACT BANNER
// ═══════════════════════════════════════════════════════════════════════════
function showFactBanner(levelId) {
  const pool = LEVEL_FACTS[levelId];
  if (!pool || pool.length === 0) return;
  const key = pool[factIndex % pool.length];
  factIndex++;
  if (!factsSeenThisLevel.includes(key)) factsSeenThisLevel.push(key);
  factBanner = { key, timer: 220, maxTimer: 220 };
}

function updateFactBanner(dt) {
  if (!factBanner) return;
  factBanner.timer -= dt;
  if (factBanner.timer <= 0) factBanner = null;
}

function wrapText(text, maxWidth) {
  // Split text into lines that fit maxWidth at current font setting
  const words = text.split(' ');
  const lines = [];
  let line = '';
  for (const word of words) {
    const test = line ? line + ' ' + word : word;
    if (ctx2d.measureText(test).width > maxWidth && line) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawFactBanner() {
  if (!factBanner) return;
  const { key, timer, maxTimer } = factBanner;
  const fadeFrames = 20;
  const alpha = Math.min(timer / fadeFrames, (maxTimer - timer) / fadeFrames, 1);
  if (alpha <= 0) return;

  const T = I18N.t.bind(I18N);
  const text = T(key);
  const label = T('fact_label');

  ctx2d.save();
  ctx2d.globalAlpha = alpha;

  const bw = 620, bx = (CW - bw) / 2, by = 52, bh = 62;
  ctx2d.fillStyle = 'rgba(0,0,0,0.78)';
  ctx2d.fillRect(bx, by, bw, bh);
  ctx2d.strokeStyle = '#E8B84B';
  ctx2d.lineWidth = 2;
  ctx2d.strokeRect(bx, by, bw, bh);

  // Label
  ctx2d.fillStyle = '#E8B84B';
  ctx2d.font = 'bold 11px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.fillText(label, CW / 2, by + 14);

  // Fact text (word-wrapped)
  ctx2d.fillStyle = '#FFFFFF';
  ctx2d.font = '13px monospace';
  const lines = wrapText(text, bw - 24);
  const lineH = 16;
  const textStartY = by + 30;
  for (let i = 0; i < Math.min(lines.length, 2); i++) {
    ctx2d.fillText(lines[i], CW / 2, textStartY + i * lineH);
  }

  ctx2d.restore();
}

// ═══════════════════════════════════════════════════════════════════════════
//  QUIZ
// ═══════════════════════════════════════════════════════════════════════════
function enterQuiz(nextLevelIdx) {
  // Build question list from facts seen this level
  const seenQs = factsSeenThisLevel
    .filter(k => QUIZ_QUESTIONS[k])
    .map(k => ({ ...QUIZ_QUESTIONS[k], factKey: k }));

  if (seenQs.length === 0) {
    loadLevel(nextLevelIdx);
    return;
  }

  // Cap at 3 questions
  quizState.questions    = seenQs.slice(0, 3);
  quizState.currentIdx   = 0;
  quizState.selectedAnswer = null;
  quizState.feedbackTimer  = 0;
  quizState.correct        = 0;
  quizState.total          = quizState.questions.length;
  quizState.summaryTimer   = 0;
  quizState.pendingLevelIdx = nextLevelIdx;

  setGameState('QUIZ');
}

function answerQuiz(choiceIdx) {
  if (quizState.selectedAnswer !== null || quizState.feedbackTimer > 0) return;
  quizState.selectedAnswer = choiceIdx;
  const q = quizState.questions[quizState.currentIdx];
  if (choiceIdx === q.correct) {
    quizState.correct++;
    score += 100;
    AudioEngine.playSfx('collect');
  } else {
    AudioEngine.playSfx('hit');
  }
  quizState.feedbackTimer = 90;
}

function updateQuiz(dt) {
  if (quizState.summaryTimer > 0) {
    quizState.summaryTimer -= dt;
    if (quizState.summaryTimer <= 0) {
      loadLevel(quizState.pendingLevelIdx);
    }
    return;
  }
  if (quizState.feedbackTimer > 0) {
    quizState.feedbackTimer -= dt;
    if (quizState.feedbackTimer <= 0) {
      quizState.currentIdx++;
      quizState.selectedAnswer = null;
      if (quizState.currentIdx >= quizState.total) {
        quizState.summaryTimer = 180;
      }
    }
  }
}

function getQuizAnswerRects() {
  const bw = 620, bh = 44, bx = (CW - 620) / 2;
  const startY = 196;
  const gap    = 52;
  return [0, 1, 2, 3].map(i => ({ x: bx, y: startY + i * gap, w: bw, h: bh }));
}

function renderQuiz() {
  const T = I18N.t.bind(I18N);
  menuAnimFrame++;

  // Background
  ctx2d.fillStyle = '#080820';
  ctx2d.fillRect(0, 0, CW, CH);

  // Decorative top bar
  ctx2d.fillStyle = '#1A1A50';
  ctx2d.fillRect(0, 0, CW, 48);
  ctx2d.fillStyle = '#E8B84B';
  ctx2d.font = 'bold 18px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.fillText(T('quiz_title'), CW / 2, 30);

  // Summary screen
  if (quizState.summaryTimer > 0) {
    ctx2d.fillStyle = '#E8B84B';
    ctx2d.font = 'bold 28px monospace';
    ctx2d.fillText(T('quiz_summary'), CW / 2, 160);

    ctx2d.fillStyle = '#FFFFFF';
    ctx2d.font = '18px monospace';
    ctx2d.fillText(`${quizState.correct} / ${quizState.total}`, CW / 2, 210);

    ctx2d.fillStyle = '#88FF88';
    ctx2d.font = '16px monospace';
    ctx2d.fillText(`${T('quiz_bonus')} +${quizState.correct * 100}`, CW / 2, 248);

    if (Math.floor(quizState.summaryTimer / 20) % 2 === 0) {
      ctx2d.fillStyle = '#AAAAAA';
      ctx2d.font = '13px monospace';
      ctx2d.fillText(T('quiz_loading'), CW / 2, 310);
    }

    drawOverlayButtons();
    return;
  }

  const q = quizState.questions[quizState.currentIdx];
  if (!q) return;

  // Progress
  ctx2d.fillStyle = '#888888';
  ctx2d.font = '12px monospace';
  ctx2d.textAlign = 'right';
  ctx2d.fillText(
    `${T('quiz_question_label')} ${quizState.currentIdx + 1} ${T('quiz_of')} ${quizState.total}`,
    CW - 16, 44
  );

  // Question text
  ctx2d.fillStyle = '#FFFFFF';
  ctx2d.font = 'bold 15px monospace';
  ctx2d.textAlign = 'center';
  const qLines = wrapText(T(q.qKey), 700);
  const qY = 80;
  for (let i = 0; i < Math.min(qLines.length, 3); i++) {
    ctx2d.fillText(qLines[i], CW / 2, qY + i * 20);
  }

  // Answer boxes
  const labels = ['A', 'B', 'C', 'D'];
  const rects = getQuizAnswerRects();

  for (let i = 0; i < 4; i++) {
    const r = rects[i];
    const isSelected = quizState.selectedAnswer === i;
    const isCorrect  = i === q.correct;
    const answered   = quizState.selectedAnswer !== null;

    // Box fill
    if (answered && isCorrect) {
      ctx2d.fillStyle = '#1A5C1A';
    } else if (answered && isSelected && !isCorrect) {
      ctx2d.fillStyle = '#5C1A1A';
    } else {
      ctx2d.fillStyle = 'rgba(255,255,255,0.07)';
    }
    ctx2d.fillRect(r.x, r.y, r.w, r.h);

    // Box border
    ctx2d.strokeStyle = answered && isCorrect ? '#88FF88'
                      : answered && isSelected ? '#FF6666'
                      : '#445566';
    ctx2d.lineWidth = answered && (isCorrect || isSelected) ? 2 : 1;
    ctx2d.strokeRect(r.x, r.y, r.w, r.h);

    // Label + answer text
    ctx2d.fillStyle = answered && isCorrect ? '#88FF88'
                    : answered && isSelected && !isCorrect ? '#FF8888'
                    : '#FFFFFF';
    ctx2d.font = 'bold 14px monospace';
    ctx2d.textAlign = 'left';
    ctx2d.fillText(`${labels[i]})`, r.x + 10, r.y + r.h / 2 + 5);

    ctx2d.font = '14px monospace';
    ctx2d.fillText(T(q.opts[i]), r.x + 40, r.y + r.h / 2 + 5);
  }

  // Feedback banner
  if (quizState.selectedAnswer !== null) {
    const correct = quizState.selectedAnswer === q.correct;
    ctx2d.fillStyle = correct ? '#88FF88' : '#FF8888';
    ctx2d.font = 'bold 14px monospace';
    ctx2d.textAlign = 'center';
    if (correct) {
      ctx2d.fillText(T('quiz_correct_banner'), CW / 2, CH - 50);
    } else {
      ctx2d.fillText(
        T('quiz_wrong_banner') + ' ' + T(q.opts[q.correct]),
        CW / 2, CH - 50
      );
    }
  }

  // Hint
  ctx2d.fillStyle = '#556677';
  ctx2d.font = '11px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.fillText(T('quiz_hint'), CW / 2, CH - 14);

  drawOverlayButtons();
}

// ═══════════════════════════════════════════════════════════════════════════
//  PIANO CHALLENGE
// ═══════════════════════════════════════════════════════════════════════════
function enterPianoChallenge(nextLevelIdx) {
  pianoState.phase            = 'DEMO';
  pianoState.demoStep         = 0;
  pianoState.demoTimer        = 80;   // initial pause before demo starts
  pianoState.demoEndTimer     = 0;
  pianoState.highlightKey     = null;
  pianoState.keyFlashTimer    = 0;
  pianoState.inputSequence    = [];
  pianoState.failCount        = 0;
  pianoState.celebrationTimer = 0;
  pianoState.failTimer        = 0;
  pianoState.pendingLevelIdx  = nextLevelIdx;
  setGameState('PIANO_CHALLENGE');
}

function updatePianoChallenge(dt) {
  menuAnimFrame++;

  if (pianoState.phase === 'DEMO') {
    // Clear highlight after a few frames
    if (pianoState.keyFlashTimer > 0) {
      pianoState.keyFlashTimer -= dt;
      if (pianoState.keyFlashTimer <= 0) pianoState.highlightKey = null;
    }

    pianoState.demoTimer -= dt;
    if (pianoState.demoTimer > 0) return;

    if (pianoState.demoStep < PIANO_DEMO_SEQ.length) {
      const noteKey = PIANO_DEMO_SEQ[pianoState.demoStep];
      pianoState.highlightKey  = noteKey;
      pianoState.keyFlashTimer = 18;
      pianoState.demoStep++;
      AudioEngine.playPianoNote(noteKey, 0.35);
      pianoState.demoTimer = 46;  // ~0.77s between notes
    } else {
      // All demo notes played — wait then switch to INPUT
      pianoState.demoEndTimer = (pianoState.demoEndTimer || 0) + dt;
      pianoState.highlightKey = null;
      if (pianoState.demoEndTimer >= 50) {
        pianoState.phase        = 'INPUT';
        pianoState.inputSequence = [];
        pianoState.demoEndTimer  = 0;
        pianoState.demoTimer     = 0;
      }
    }
    return;
  }

  if (pianoState.phase === 'INPUT') {
    if (pianoState.failTimer > 0) {
      pianoState.failTimer -= dt;
      if (pianoState.failTimer <= 0) pianoState.highlightKey = null;
    }
    return;
  }

  if (pianoState.phase === 'SUCCESS') {
    pianoState.celebrationTimer -= dt;
    if (pianoState.celebrationTimer <= 0) {
      enterQuiz(pianoState.pendingLevelIdx);
    }
  }
}

function pressPianoKey(noteKey) {
  if (pianoState.phase !== 'INPUT') return;
  if (pianoState.failTimer > 0) return;

  AudioEngine.playPianoNote(noteKey, 0.3);
  pianoState.highlightKey  = noteKey;
  pianoState.keyFlashTimer = 10;
  pianoState.inputSequence.push(noteKey);

  const pos      = pianoState.inputSequence.length - 1;
  const expected = PIANO_DEMO_SEQ[pos];

  if (noteKey !== expected) {
    // Wrong note
    pianoState.failCount++;
    pianoState.failTimer    = 35;
    pianoState.inputSequence = [];
    AudioEngine.playSfx('hit');
    if (pianoState.failCount >= 3) {
      // Replay demo
      pianoState.failCount    = 0;
      pianoState.phase        = 'DEMO';
      pianoState.demoStep     = 0;
      pianoState.demoTimer    = 90;
      pianoState.demoEndTimer = 0;
      pianoState.highlightKey = null;
    }
    return;
  }

  // Correct note
  if (pianoState.inputSequence.length === PIANO_DEMO_SEQ.length) {
    // All correct!
    pianoState.phase            = 'SUCCESS';
    pianoState.celebrationTimer = 130;
    pianoState.highlightKey     = null;
    AudioEngine.playSfx('win');
  }
}

function getPianoKeyAtPoint(cx, cy) {
  // Black keys first (they're visually on top)
  for (const bk of PIANO_BLACK_KEYS) {
    const kx = PIANO_KEYS_X + bk.whiteIdx * PIANO_WHITE_W + PIANO_WHITE_W - PIANO_BLACK_W / 2;
    const ky = PIANO_KEYS_Y;
    if (cx >= kx && cx <= kx + PIANO_BLACK_W && cy >= ky && cy <= ky + PIANO_BLACK_H) {
      return bk.noteKey;
    }
  }
  // Then white keys
  for (let i = 0; i < PIANO_WHITE_KEYS.length; i++) {
    const kx = PIANO_KEYS_X + i * PIANO_WHITE_W;
    const ky = PIANO_KEYS_Y;
    if (cx >= kx && cx <= kx + PIANO_WHITE_W - 2 && cy >= ky && cy <= ky + PIANO_WHITE_H) {
      return PIANO_WHITE_KEYS[i];
    }
  }
  return null;
}

function renderPianoChallenge() {
  const T = I18N.t.bind(I18N);

  // Background — dark maroon/velvet
  ctx2d.fillStyle = '#180A0A';
  ctx2d.fillRect(0, 0, CW, CH);
  ctx2d.fillStyle = '#2A1010';
  ctx2d.fillRect(0, 0, CW, 50);

  // Title
  ctx2d.fillStyle = '#E8B84B';
  ctx2d.font = 'bold 20px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.fillText(T('piano_title'), CW / 2, 32);

  // Phase label
  let phaseLabel;
  if (pianoState.phase === 'DEMO') {
    phaseLabel = pianoState.demoStep === 0 && pianoState.demoTimer > 40
      ? T('piano_ready')
      : T('piano_watch');
  } else if (pianoState.phase === 'INPUT') {
    phaseLabel = pianoState.failTimer > 0 ? T('piano_wrong') : T('piano_repeat');
  } else {
    phaseLabel = T('piano_success');
  }

  const phaseColor = pianoState.phase === 'SUCCESS' ? '#88FF88'
                   : pianoState.failTimer > 0        ? '#FF6666'
                   : '#FFFFFF';
  ctx2d.fillStyle = phaseColor;
  ctx2d.font = 'bold 16px monospace';
  ctx2d.fillText(phaseLabel, CW / 2, 68);

  // Sequence display — 6 small boxes showing the notes
  const seqBoxW = 44, seqBoxH = 32, seqGap = 8;
  const seqTotalW = PIANO_DEMO_SEQ.length * (seqBoxW + seqGap) - seqGap;
  const seqX = (CW - seqTotalW) / 2;
  const seqY = 84;

  for (let i = 0; i < PIANO_DEMO_SEQ.length; i++) {
    const bx = seqX + i * (seqBoxW + seqGap);
    // Colour: played in demo = gold; correct in input = green; current highlight = bright; else grey
    const inInput   = pianoState.phase === 'INPUT';
    const inputDone = inInput && pianoState.inputSequence.length > i;
    const isDemoPlayed = pianoState.phase === 'DEMO' && i < pianoState.demoStep;

    ctx2d.fillStyle = pianoState.phase === 'SUCCESS' ? '#1A5C1A'
                    : inputDone                       ? '#1A4A1A'
                    : isDemoPlayed                     ? '#4A3800'
                    : '#1A1A1A';
    ctx2d.fillRect(bx, seqY, seqBoxW, seqBoxH);

    ctx2d.strokeStyle = pianoState.phase === 'SUCCESS' ? '#88FF88'
                      : inputDone                       ? '#66CC66'
                      : isDemoPlayed                     ? '#E8B84B'
                      : '#444444';
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(bx, seqY, seqBoxW, seqBoxH);

    ctx2d.fillStyle = isDemoPlayed || inputDone ? '#FFFFFF' : '#666666';
    ctx2d.font = '11px monospace';
    ctx2d.textAlign = 'center';
    // Show note name without octave
    ctx2d.fillText(PIANO_DEMO_SEQ[i].replace(/\d/, ''), bx + seqBoxW / 2, seqY + seqBoxH / 2 + 4);
  }

  // ── Piano keyboard ────────────────────────────────────────────────────────
  // White keys
  for (let i = 0; i < PIANO_WHITE_KEYS.length; i++) {
    const kx = PIANO_KEYS_X + i * PIANO_WHITE_W;
    const ky = PIANO_KEYS_Y;
    const noteKey = PIANO_WHITE_KEYS[i];
    const isHighlight = pianoState.highlightKey === noteKey;
    const isWrong     = isHighlight && pianoState.failTimer > 0;

    ctx2d.fillStyle = isWrong     ? '#FF6666'
                    : isHighlight  ? '#FFD700'
                    : '#F5F5F5';
    ctx2d.fillRect(kx, ky, PIANO_WHITE_W - 2, PIANO_WHITE_H);
    ctx2d.strokeStyle = '#333';
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(kx, ky, PIANO_WHITE_W - 2, PIANO_WHITE_H);

    // Key number
    ctx2d.fillStyle = '#666';
    ctx2d.font = '11px monospace';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(PIANO_KEY_LETTERS[i], kx + (PIANO_WHITE_W - 2) / 2, ky + PIANO_WHITE_H - 20);
    // Note name
    ctx2d.fillStyle = '#333';
    ctx2d.font = 'bold 11px monospace';
    ctx2d.fillText(noteKey.replace(/\d/, ''), kx + (PIANO_WHITE_W - 2) / 2, ky + PIANO_WHITE_H - 6);
  }

  // Black keys (drawn on top)
  for (const bk of PIANO_BLACK_KEYS) {
    const kx = PIANO_KEYS_X + bk.whiteIdx * PIANO_WHITE_W + PIANO_WHITE_W - PIANO_BLACK_W / 2;
    const ky = PIANO_KEYS_Y;
    const isHighlight = pianoState.highlightKey === bk.noteKey;
    const isWrong     = isHighlight && pianoState.failTimer > 0;

    ctx2d.fillStyle = isWrong     ? '#CC2222'
                    : isHighlight  ? '#FFD700'
                    : '#1A1A1A';
    ctx2d.fillRect(kx, ky, PIANO_BLACK_W, PIANO_BLACK_H);
    ctx2d.strokeStyle = '#000';
    ctx2d.lineWidth = 1;
    ctx2d.strokeRect(kx, ky, PIANO_BLACK_W, PIANO_BLACK_H);
  }

  // Fail counter
  if (pianoState.failCount > 0) {
    ctx2d.fillStyle = '#FF6666';
    ctx2d.font = '13px monospace';
    ctx2d.textAlign = 'right';
    ctx2d.fillText(`${T('piano_fail_label')} ${'✗'.repeat(pianoState.failCount)}`, CW - 12, 68);
  }

  // Progress in INPUT phase
  if (pianoState.phase === 'INPUT' && pianoState.failTimer <= 0) {
    ctx2d.fillStyle = '#888888';
    ctx2d.font = '12px monospace';
    ctx2d.textAlign = 'left';
    ctx2d.fillText(
      `${T('piano_progress')} ${pianoState.inputSequence.length} / ${PIANO_DEMO_SEQ.length}`,
      12, 68
    );
  }

  // Hint
  ctx2d.fillStyle = '#556677';
  ctx2d.font = '11px monospace';
  ctx2d.textAlign = 'center';
  ctx2d.fillText(T('piano_hint'), CW / 2, CH - 10);

  // Success overlay
  if (pianoState.phase === 'SUCCESS') {
    ctx2d.fillStyle = 'rgba(0,60,0,0.55)';
    ctx2d.fillRect(0, 0, CW, CH);
    ctx2d.fillStyle = '#88FF88';
    ctx2d.font = 'bold 36px monospace';
    ctx2d.textAlign = 'center';
    ctx2d.fillText(T('piano_success'), CW / 2, CH / 2);
  }

  drawOverlayButtons();
}

// ═══════════════════════════════════════════════════════════════════════════
//  GAME LOOP
// ═══════════════════════════════════════════════════════════════════════════
function gameLoop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 16.667, 3);
  lastTime = timestamp;
  menuAnimFrame++;

  ctx2d.clearRect(0, 0, CW, CH);

  switch (gameState) {
    case 'MENU':
      renderMenu();
      break;
    case 'PLAYING':
      update(dt);
      render();
      break;
    case 'PAUSED':
      render();
      renderPause();
      break;
    case 'GAMEOVER':
      renderGameOver();
      break;
    case 'WIN':
      renderWin();
      break;
    case 'QUIZ':
      updateQuiz(dt);
      renderQuiz();
      break;
    case 'PIANO_CHALLENGE':
      updatePianoChallenge(dt);
      renderPianoChallenge();
      break;
  }

  requestAnimationFrame(gameLoop);
}

// ═══════════════════════════════════════════════════════════════════════════
//  INPUT HANDLERS
// ═══════════════════════════════════════════════════════════════════════════
function handleKeyDown(e) {
  keys[e.code] = true;

  if (e.code === 'KeyL') {
    I18N.toggle();
    return;
  }
  if (e.code === 'KeyM') {
    const nowMuted = AudioEngine.toggleMute();
    if (!nowMuted && gameState === 'PLAYING' && currentLevel) {
      AudioEngine.playSong(currentLevel.song);
    }
    return;
  }

  if (gameState === 'MENU') {
    if (e.code === 'Enter' || e.code === 'Space') {
      e.preventDefault();
      startGame();
    }
  } else if (gameState === 'PLAYING') {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
      e.preventDefault();
      playerJump();
    }
    if (e.code === 'Escape') {
      gameState = 'PAUSED';
      AudioEngine.stopSong();
    }
  } else if (gameState === 'PAUSED') {
    if (e.code === 'Escape') {
      gameState = 'PLAYING';
      if (!AudioEngine.isMuted()) AudioEngine.playSong(currentLevel.song);
    }
  } else if (gameState === 'GAMEOVER') {
    if (e.code === 'Enter' || e.code === 'Space') {
      restartGame();
    }
  } else if (gameState === 'WIN') {
    if (e.code === 'Enter' || e.code === 'Space') {
      returnToMenu();
    }
  } else if (gameState === 'QUIZ') {
    if (quizState.feedbackTimer > 0 || quizState.selectedAnswer !== null) return;
    const qmap = { KeyA:0, KeyB:1, KeyC:2, KeyD:3,
                   Digit1:0, Digit2:1, Digit3:2, Digit4:3 };
    const choice = qmap[e.code];
    if (choice !== undefined) answerQuiz(choice);
  } else if (gameState === 'PIANO_CHALLENGE') {
    const wmap = { KeyC:'C4', KeyD:'D4', KeyE:'E4', KeyF:'F4',
                   KeyG:'G4', KeyA:'A4', KeyB:'B4' };
    const noteKey = wmap[e.code];
    if (noteKey) { e.preventDefault(); pressPianoKey(noteKey); }
  }
}

function handleKeyUp(e) {
  keys[e.code] = false;
}

function handleCanvasClick(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = CW / rect.width;
  const scaleY = CH / rect.height;
  const cx = (e.clientX - rect.left) * scaleX;
  const cy = (e.clientY - rect.top)  * scaleY;

  // Language button
  if (cx >= LANG_BTN.x && cx <= LANG_BTN.x + LANG_BTN.w &&
      cy >= LANG_BTN.y && cy <= LANG_BTN.y + LANG_BTN.h) {
    I18N.toggle();
    return;
  }

  // Mute button
  if (cx >= MUTE_BTN.x && cx <= MUTE_BTN.x + MUTE_BTN.w &&
      cy >= MUTE_BTN.y && cy <= MUTE_BTN.y + MUTE_BTN.h) {
    const nowMuted = AudioEngine.toggleMute();
    if (!nowMuted && gameState === 'PLAYING' && currentLevel) {
      AudioEngine.playSong(currentLevel.song);
    }
    return;
  }

  // Quiz answer click
  if (gameState === 'QUIZ' && quizState.feedbackTimer === 0 && quizState.selectedAnswer === null) {
    const rects = getQuizAnswerRects();
    for (let i = 0; i < rects.length; i++) {
      const r = rects[i];
      if (cx >= r.x && cx <= r.x + r.w && cy >= r.y && cy <= r.y + r.h) {
        answerQuiz(i);
        return;
      }
    }
  }

  // Piano key click
  if (gameState === 'PIANO_CHALLENGE') {
    const noteKey = getPianoKeyAtPoint(cx, cy);
    if (noteKey) { pressPianoKey(noteKey); return; }
  }

  // Start / confirm actions
  if (gameState === 'MENU') startGame();
  else if (gameState === 'GAMEOVER') restartGame();
  else if (gameState === 'WIN') returnToMenu();
}

// Touch controls
function setupTouchButtons() {
  const btn = (id, code) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.addEventListener('touchstart', ev => { ev.preventDefault(); keys[code] = true; if (code==='Space') playerJump(); }, {passive:false});
    el.addEventListener('touchend',   ev => { ev.preventDefault(); keys[code] = false; }, {passive:false});
    el.addEventListener('mousedown',  ()  => { keys[code] = true; if (code==='Space') playerJump(); });
    el.addEventListener('mouseup',    ()  => keys[code] = false);
  };
  btn('btn-left',  'ArrowLeft');
  btn('btn-right', 'ArrowRight');
  btn('btn-jump',  'Space');
}

// ═══════════════════════════════════════════════════════════════════════════
//  GAME FLOW
// ═══════════════════════════════════════════════════════════════════════════
function startGame() {
  AudioEngine.init();  // create AudioContext on user gesture
  score = 0;
  lives = 3;
  currentLevelIdx = 0;
  loadLevel(0);
}

function restartGame() {
  score = 0;
  lives = 3;
  currentLevelIdx = 0;
  loadLevel(0);
}

function returnToMenu() {
  gameState = 'MENU';
  menuAnimFrame = 0;
  AudioEngine.stopSong();
  AudioEngine.init();
  AudioEngine.playSong('eine_kleine');
}

// ═══════════════════════════════════════════════════════════════════════════
//  INIT
// ═══════════════════════════════════════════════════════════════════════════
function init() {
  canvas = document.getElementById('gameCanvas');
  ctx2d  = canvas.getContext('2d');
  ctx2d.imageSmoothingEnabled = false;

  document.addEventListener('keydown', handleKeyDown);
  document.addEventListener('keyup',   handleKeyUp);
  canvas.addEventListener('click',    handleCanvasClick);
  canvas.addEventListener('touchend', (e) => { e.preventDefault(); handleCanvasClick(e.changedTouches[0]); }, {passive:false});

  setupTouchButtons();

  // Start menu music after a brief delay (lets page settle)
  // Music is deferred until user gesture for autoplay policy
  gameState = 'MENU';
  requestAnimationFrame(gameLoop);
}

document.addEventListener('DOMContentLoaded', init);

})();
