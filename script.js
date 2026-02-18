// =========================
// PRESET IMAGE LIST
// =========================
// Add/remove filenames here ONLY
const IMAGE_FILES = [
  "Nemu.png",
  "Yolla.png",
  "Reika.png",
  "Flan.png",
  "Kuro.png",
  "Neko_N.png",
  "Iskra.png",
  "Aloy.png",
  "Alice.png",
  "Aithne_N.png",
  "Akashi_N.png",
  "Auriel_N.png",
  "Ari.png",
  "Arla_N.png",
  "Ayaka_N.png",
  "Beliana.png",
  "Bailey.png",
  "Anny.png",
  "Bell (Myuf).png",
  "Bell (Sari)_N.png",
  "Bunni.png",
  "Buwad.png",
  "Caelith.png",
  "Chen.png",
  "Chii_N.png",
  "Core.png",
  "Daima.png",
  "Hako.png",
  "Hanako.png",
  "Haru_N.png",
  "Haru's Sis_N.png",
  "Hazel_N.png",
  "Hisame.png",
  "Hiyori.png",
  "Iog.png",
  "Kahi.png",
  "Karo.png",
  "Kay_N.png",
  "Kumiko_N.png",
  "Kuroha_N.png",
  "Lea_N.png",
  "Lin_N.png",
  "Lin's Mom_N.png",
  "Luna.png",
  "Lunarethic.png",
  "Mela_N.png",
  "Meliach.png",
  "Memu_N.png",
  "Moff.png",
  "Minako_N.png",
  "Mochi.png",
  "Nano_N.png",
  "Nayu.png",
  "Niya_N.png",
  "Oig_N.png",
  "Owlie.png",
  "Pummy.png",
  "Rei.png",
  "Ryne.png",
  "Rossa.png",
  "Remi.png",
  "Renia.png",
  "Renna_N.png",
  "Sanco.png",
  "Sari.png",
  "Shinkiro.png",
  "Silv.png",
  "Snowie.png",
  "Suko.png",
  "Synesis.png",
  "Synn.png",
  "Tema.png",
  "Toko.png",
  "Tsukino.png",
  "Vivi.png",
  "Vyndi.png",
  "Watta.png",
  "Yume_N.png",
  "Yukiho.png",
  "Yuzuki.png",
  "Zeksi.png",
  "Zena_N.png",
  "Zeni.png",
  "Tato.png"
];

// =========================
// STATE
// =========================
let images = [];
let runs = []; // current merge level: [ [group, group], ... ]
let nextRuns = []; // merged runs for next level

let mergeLeft = null;
let mergeRight = null;
let leftIndex = 0;
let rightIndex = 0;
let mergedRun = [];

let stateStack = [];
let completedComparisons = 0;

// =========================
// DOM
// =========================
const preloadCache = new Set();

function preloadImage(src) {
  if (!src || preloadCache.has(src)) return;
  const img = new Image();
  img.src = src;
  preloadCache.add(src);
}

const filterAltCheckbox = document.getElementById("filterAlt");

const startBtn = document.getElementById("startBtn");
const countText = document.getElementById("count");
const startScreen = document.getElementById("start");

const leftImg = document.getElementById("left");
const rightImg = document.getElementById("right");
const leftName = document.getElementById("leftName");
const rightName = document.getElementById("rightName");

const progress = document.getElementById("progress");
const tieBtn = document.getElementById("tie");
const undoBtn = document.getElementById("undo");
const container = document.querySelector(".container");
const controls = document.getElementById("controls");

// =========================
// AUTO LOAD IMAGES
// =========================
function loadImages() {
  const excludeAlt = filterAltCheckbox?.checked;

  images = IMAGE_FILES
    .filter(file => !excludeAlt || !file.includes("_N"))
    .map(file => ({
      src: `images/${file}`,
      name: file
        .replace(/_N(?=\.)/, "")
        .replace(/\.[^/.]+$/, "")
    }));

  shuffleArray(images);
  images.forEach(img => preloadImage(img.src));

  countText.textContent = `${images.length} images loaded`;
}

loadImages();

// =========================
// START
// =========================
startBtn.onclick = () => {
  loadImages();
  stateStack = [];

  runs = images.map(img => [[img]]);
  nextRuns = [];

  mergeLeft = null;
  mergeRight = null;
  leftIndex = 0;
  rightIndex = 0;
  mergedRun = [];

  completedComparisons = 0;

  updateProgress();
  startScreen.style.display = "none";
  container.style.display = "flex";
  controls.style.display = "block";

  selectNextMerge();
};

function selectNextMerge() {
  if (runs.length === 1 && nextRuns.length === 0 && mergeLeft === null) {
    finish();
    return;
  }

  if (mergeLeft !== null) {
    askComparison();
    return;
  }

  if (runs.length >= 2) {
    mergeLeft = runs.shift();
    mergeRight = runs.shift();
    leftIndex = 0;
    rightIndex = 0;
    mergedRun = [];
    askComparison();
    return;
  }

  if (runs.length === 1) {
    nextRuns.push(runs.shift());
  }

  runs = nextRuns;
  nextRuns = [];
  selectNextMerge();
}

function completeCurrentMerge() {
  while (leftIndex < mergeLeft.length) {
    mergedRun.push(mergeLeft[leftIndex]);
    leftIndex += 1;
  }
  while (rightIndex < mergeRight.length) {
    mergedRun.push(mergeRight[rightIndex]);
    rightIndex += 1;
  }

  nextRuns.push(mergedRun);

  mergeLeft = null;
  mergeRight = null;
  mergedRun = [];
  leftIndex = 0;
  rightIndex = 0;

  selectNextMerge();
}

function saveState() {
  stateStack.push({
    runs: structuredClone(runs),
    nextRuns: structuredClone(nextRuns),
    mergeLeft: structuredClone(mergeLeft),
    mergeRight: structuredClone(mergeRight),
    leftIndex,
    rightIndex,
    mergedRun: structuredClone(mergedRun),
    completedComparisons
  });
}

function askComparison() {
  if (!mergeLeft || !mergeRight) {
    selectNextMerge();
    return;
  }

  if (leftIndex >= mergeLeft.length || rightIndex >= mergeRight.length) {
    completeCurrentMerge();
    return;
  }

  const leftGroup = mergeLeft[leftIndex];
  const rightGroup = mergeRight[rightIndex];
  const left = leftGroup[0];
  const right = rightGroup[0];

  preloadImage(left.src);
  preloadImage(right.src);
  showComparison(left, right);
}

// =========================
// UI
// =========================
function shuffleArray(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
}

function showComparison(left, right) {
  leftImg.src = left.src;
  rightImg.src = right.src;
  leftName.textContent = left.name;
  rightName.textContent = right.name;
}

function updateProgress() {
  const remainingComparisons = estimateRemainingComparisons();
  const totalComparisons = completedComparisons + remainingComparisons;
  const percent = totalComparisons === 0
    ? 100
    : Math.min(100, Math.floor((completedComparisons / totalComparisons) * 100));
  progress.textContent = `Comparing: ${percent}% done.`;
}

function estimateRemainingComparisons() {
  let remaining = 0;

  let simRuns = runs.map(run => run.length);
  let simNextRuns = nextRuns.map(run => run.length);

  // Active merge still in progress.
  if (mergeLeft && mergeRight) {
    const leftRemaining = mergeLeft.length - leftIndex;
    const rightRemaining = mergeRight.length - rightIndex;

    if (leftRemaining > 0 && rightRemaining > 0) {
      remaining += leftRemaining + rightRemaining - 1;
    }

    // Length of the run after current merge is completed.
    simNextRuns.push(mergedRun.length + leftRemaining + rightRemaining);
  }

  // Finish the remainder of the current pass.
  while (simRuns.length >= 2) {
    const leftLen = simRuns.shift();
    const rightLen = simRuns.shift();
    remaining += leftLen + rightLen - 1;
    simNextRuns.push(leftLen + rightLen);
  }

  if (simRuns.length === 1) {
    simNextRuns.push(simRuns.shift());
  }

  // Continue with following passes until one run remains.
  simRuns = simNextRuns;

  while (simRuns.length > 1) {
    const nextPass = [];

    while (simRuns.length >= 2) {
      const leftLen = simRuns.shift();
      const rightLen = simRuns.shift();
      remaining += leftLen + rightLen - 1;
      nextPass.push(leftLen + rightLen);
    }

    if (simRuns.length === 1) {
      nextPass.push(simRuns.shift());
    }

    simRuns = nextPass;
  }

  return remaining;
}

// =========================
// ACTIONS
// =========================
function chooseLeft() {
  if (!mergeLeft || !mergeRight) return;
  saveState();

  mergedRun.push(mergeLeft[leftIndex]);
  leftIndex += 1;
  completedComparisons += 1;
  updateProgress();
  askComparison();
}

function chooseRight() {
  if (!mergeLeft || !mergeRight) return;
  saveState();

  mergedRun.push(mergeRight[rightIndex]);
  rightIndex += 1;
  completedComparisons += 1;
  updateProgress();
  askComparison();
}

function tie() {
  if (!mergeLeft || !mergeRight) return;
  saveState();

  const tiedGroup = [...mergeLeft[leftIndex], ...mergeRight[rightIndex]];
  mergedRun.push(tiedGroup);

  leftIndex += 1;
  rightIndex += 1;
  completedComparisons += 1;
  updateProgress();
  askComparison();
}

function undo() {
  if (stateStack.length === 0) return;

  const prev = stateStack.pop();
  runs = prev.runs;
  nextRuns = prev.nextRuns;
  mergeLeft = prev.mergeLeft;
  mergeRight = prev.mergeRight;
  leftIndex = prev.leftIndex;
  rightIndex = prev.rightIndex;
  mergedRun = prev.mergedRun;
  completedComparisons = prev.completedComparisons;

  container.style.display = "flex";
  controls.style.display = "block";

  updateProgress();
  askComparison();
}

// =========================
// EVENTS
// =========================
leftImg.onclick = chooseLeft;
rightImg.onclick = chooseRight;
tieBtn.onclick = tie;
undoBtn.onclick = undo;

// =========================
// RESULTS — TIERS
// =========================
function finish() {
  document.body.innerHTML = "";

  const finalRun = runs[0] || [];
  const sorted = [];
  let rank = 1;

  for (const group of finalRun) {
    for (const img of group) {
      sorted.push({ ...img, rank });
    }
    rank += group.length;
  }

  const topCount = 7;
  const top = sorted.slice(0, topCount);
  const rest = sorted.slice(topCount);

  const style = document.createElement("style");
  style.textContent = `
    body {
      margin: 0;
      padding: 20px;
      background: #dce3e8;
      font-family: Arial, sans-serif;
      overflow-x: hidden;
    }

    h1 {
      text-align: center;
      margin-bottom: 20px;
    }

    .top10 {
      display: flex;
      justify-content: center;
      gap: 10px;
      margin: 0 auto 20px;
      max-width: 100%;
      flex-wrap: wrap;
    }

    .top10-column {
      display: flex;
      flex-direction: row;
      gap: 20px;
      flex-wrap: wrap;
      justify-content: center;
    }

    .cell {
      background: #ffffff;
      border: 3px solid #7aa6d8;
      width: 148px;
      text-align: center;
      padding: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
      box-sizing: border-box;
    }

    .cell img {
      width: 100%;
      height: auto;
      display: block;
      margin-bottom: 8px;
<<<<<<< HEAD
=======
      position: relative;
      left: -3px;
>>>>>>> 5c4562e (Update sorter)
    }

    .name {
      font-weight: bold;
      font-size: 20px;
      color: #2c3e50;
      word-break: break-word;
    }

    .rest {
      --border: 3px;
<<<<<<< HEAD
      width: min(1700px, 100%);
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: repeat(8, auto);
      grid-auto-columns: minmax(170px, 1fr);
      gap: 0;
      justify-content: center;
      margin: 0 auto;
    }

    .rest .cell {
      box-sizing: border-box;
      padding: 9px 12px;
      text-align: center;
      font-weight: 520;
      font-size: 18px;
      border: var(--border) solid #44d37d;
      border-bottom-color: #7ad88d;
      margin-left: calc(-1 * var(--border));
      margin-top: calc(-1 * var(--border));
      min-width: 170px;
    }

    @media (max-width: 640px) {
      body {
        padding: 12px;
      }

      .top10 {
        flex-direction: column;
        align-items: center;
      }

      .top10-column {
        gap: 12px;
      }

      .cell {
        width: min(44vw, 180px);
      }

      .name {
        font-size: 16px;
      }

      .rest {
        width: 100%;
        grid-template-rows: none;
        grid-auto-flow: row;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        overflow-x: visible;
      }

      .rest .cell {
        margin-left: 0;
        font-size: 15px;
        min-width: 0;
      }
    }

    @media (max-width: 640px) {
      body {
        padding: 12px;
        overflow-x: hidden;
      }

      .top10 {
        flex-direction: column;
        align-items: center;
        margin-left: auto;
        margin-right: auto;
      }

      .top10-column {
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .cell {
        width: min(44vw, 180px);
        box-sizing: border-box;
      }

      .name {
        font-size: 16px;
        word-break: break-word;
      }

      .rest {
        width: 100%;
        grid-template-rows: none;
        grid-auto-flow: row;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        justify-content: stretch;
      }

      .rest .cell {
        margin-left: 0;
        font-size: 15px;
        padding: 9px 10px;
      }
    }

    @media (max-width: 640px) {
      body {
        padding: 12px;
        overflow-x: hidden;
      }

      .top10 {
        flex-direction: column;
        align-items: center;
        margin-left: auto;
        margin-right: auto;
      }

      .top10-column {
        gap: 12px;
        justify-content: center;
        flex-wrap: wrap;
      }

      .cell {
        width: min(44vw, 180px);
        box-sizing: border-box;
      }

      .name {
        font-size: 16px;
        word-break: break-word;
      }

      .rest {
        width: 100%;
        grid-template-rows: none;
        grid-auto-flow: row;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        justify-content: stretch;
      }

      .rest .cell {
        margin-left: 0;
        font-size: 15px;
        padding: 9px 10px;
      }
    }
  `;
=======
      width: 1200px;
      display: grid;
      grid-auto-flow: column;
      grid-template-rows: repeat(8, auto);
      grid-auto-columns: calc(900px / var(--cols));
      gap: 0;
      justify-content: start;
      margin: 0;
    }
>>>>>>> 5c4562e (Update sorter)

    .rest .cell {
      box-sizing: border-box;
      padding: 9px 15px;
      text-align: center;
      font-weight: 530;
      font-size: 17px;
      border: var(--border) solid #44d37d;
      border-bottom-color: #7ad88d;
      margin-left: calc(-1 * var(--border));
      margin-top: calc(-1 * var(--border));
    }
  `;

  document.head.appendChild(style);

  const title = document.createElement("h1");
  title.textContent = "Results";
  document.body.appendChild(title);

  const topWrap = document.createElement("div");
  topWrap.className = "top10";

  const leftCol = document.createElement("div");
  leftCol.className = "top10-column";

  const rightCol = document.createElement("div");
  rightCol.className = "top10-column";

  top.forEach((img, i) => {
    const cell = document.createElement("div");
    cell.className = "cell";

    const image = document.createElement("img");
    image.src = img.src;

    const name = document.createElement("div");
    name.className = "name";
    name.textContent = `${img.rank}.${img.name}`;

    cell.appendChild(image);
    cell.appendChild(name);

    (i < topCount / 2 ? leftCol : rightCol).appendChild(cell);
  });

  topWrap.appendChild(leftCol);
  topWrap.appendChild(rightCol);
  document.body.appendChild(topWrap);

  const restWrap = document.createElement("div");
  restWrap.className = "rest";

  rest.forEach(img => {
    const cell = document.createElement("div");
    cell.className = "cell";
    cell.textContent = `${img.rank}.${img.name}`;
    restWrap.appendChild(cell);
  });

  document.body.appendChild(restWrap);
<<<<<<< HEAD
}
=======
}
>>>>>>> 5c4562e (Update sorter)
