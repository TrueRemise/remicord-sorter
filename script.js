
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
  "Aithne_N.png",
  "Akashi_N.png",
  "Ari.png",
  "Arla_N.png",
  "Ayaka_N.png",
  "Beliana.png",
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
  "Minako_N.png",
  "Mochi.png",
  "Nano_N.png",
  "Nayu.png",
  "Niya_N.png",
  "Oig_N.png",
  "Pummy.png",
  "Rei.png",
  "Ryne.png",
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
  "Tema.png",
  "Toko.png",
  "Tsukino.png",
  "Vivi.png",
  "Vyndi.png",
  "Watta.png",
  "Yume_N.png",
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
  let tiers = [];          // [ [img, img], [img], ... ]
  let pending = [];        // images not placed yet
  let currentItem = null;
  
  let low = 0;
  let high = 0;
  let mid = 0;
  let stateStack = [];
  let displayLeft = null;
  let displayRight = null;
  
  let history = [];
  
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
      .filter(file => {
        if (!excludeAlt) return true;
        return !file.includes("_N");
      })
      .map(file => ({
        src: `images/${file}`,
        name: file
        .replace(/_N(?=\.)/, "")   // remove _N only if before extension
        .replace(/\.[^/.]+$/, "")

      }));
      
    shuffleArray(images);

    countText.textContent =
      `${images.length} images loaded`;
  }
  
  
  loadImages();
  
  // =========================
  // START
  // =========================
    startBtn.onclick = () => {
        loadImages();   // 👈 RELOAD WITH FILTER STATE
        stateStack = [];
        history = [];
        tiers = [];
        pending = [...images];
      
        tiers.push([pending.shift()]);
        
        updateProgress(); // 👈 ADD
        startScreen.style.display = "none";
        container.style.display = "flex";
        controls.style.display = "block";
        // preload first item
        if (images.length >= 2) {
          preloadImage(images[0].src);
          preloadImage(images[1].src);
        }
        
        nextInsert();
      };
      
  function nextInsert() {
    if (pending.length === 0) {
      finish();
      return;
    }
  
    currentItem = pending.shift();
    low = 0;
    high = tiers.length - 1;
  
    askComparison();
  }
  function saveState() {
    stateStack.push({
      tiers: structuredClone(tiers),
      pending: structuredClone(pending),
      history: structuredClone(history),
      currentItem,
      low,
      high,
      mid
    });
  }
  
  function askComparison() {
    if (low > high) {
        tiers.splice(low, 0, [currentItem]);
        updateProgress(); // 👈 ADD
        nextInsert();
        return;
      }
  
      
      mid = Math.floor((low + high) / 2);
      const opponent = tiers[mid][0];
    
      // 🔹 PRELOAD current comparison
      preloadImage(currentItem.src);
      preloadImage(opponent.src);
    
      // 🔹 PRELOAD next possible comparisons (prediction)
      const nextLow = Math.floor((mid + 1 + high) / 2);
      const nextHigh = Math.floor((low + mid - 1) / 2);
    
      if (tiers[nextLow]?.[0]) {
        preloadImage(tiers[nextLow][0].src);
      }
      if (tiers[nextHigh]?.[0]) {
        preloadImage(tiers[nextHigh][0].src);
      }
    
      showComparison(currentItem, opponent);
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
    const total = images.length;
    const placed = total - pending.length;
    const percent = Math.floor((placed / total) * 100);
    progress.textContent = `Comparing: ${percent}% done.`;
  }
  
  
  // =========================
  // ACTIONS
  // =========================
  function chooseLeft() {
    saveState();
  
    history.push({ type: "cmp", mid, low, high });
    high = mid - 1;
    askComparison();
  }
  function chooseRight() {
    saveState();
  
    history.push({ type: "cmp", mid, low, high });
    low = mid + 1;
    askComparison();
  }
  function tie() {
    saveState();
  
    history.push({ type: "tie", mid });
    tiers[mid].push(currentItem);
    updateProgress(); // 👈 ADD
    nextInsert();
  }
  function undo() {
    if (stateStack.length === 0) return;
  
    const prev = stateStack.pop();
  
    tiers = prev.tiers;
    pending = prev.pending;
    history = prev.history;
    currentItem = prev.currentItem;
    low = prev.low;
    high = prev.high;
    mid = prev.mid;
  
    container.style.display = "flex";
    controls.style.display = "block";
  
    showComparison(currentItem, tiers[mid][0]);
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
  
    const sorted = [];
        let rank = 1;

        for (const tier of tiers) {
        for (const img of tier) {
            sorted.push({ ...img, rank });
        }
        rank += tier.length;
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
    }
  
    h1 {
      text-align: center;
      margin-bottom: 30px;
    }
  
    /* =========================
       TOP SECTION
    ========================= */
  
    .top10 {
      display: flex;
      justify-content: center;
      gap: 20px;
      margin-bottom: 40px;
    }
  
    .top10-column {
      display: flex;
      flex-direction: row;
      gap: 20px;
    }
  
    .cell {
      background: #ffffff;
      border: 3px solid #7aa6d8;
      width: 200px;
      text-align: center;
      padding: 10px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.08);
    }
    .cell img {
        width: 100%;
        height: auto;
        display: block;
        margin-bottom: 8px;
      
        position: relative;
        left: -3px;   /* 👈 tweak this value */
      }
  
    .name {
      font-weight: bold;
      font-size: 20px;
      color: #2c3e50;
    }
  
    /* =========================
        REST SECTION
    ========================= */
    
    .rest {
        --border: 3px;
      
        width: 1700px;
      
        display: grid;
        grid-auto-flow: column;                 /* fill DOWN first */
        grid-template-rows: repeat(8, auto);    /* 5 rows per column */
        grid-auto-columns: calc(1000px / var(--cols));
      
        gap: 0;
        justify-content: start;
      
        margin: 0;                              /* 👈 STICK LEFT */
      }
      
    
    .rest .cell {
    box-sizing: border-box;
    padding: 12px 22px;
    
    text-align: center;                     /* 👈 CENTER TEXT */
    font-weight: 550;
    font-size: 20px;
    
    border: var(--border) solid #44d37d;
    border-bottom-color: #7ad88d;
    
    /* prevent double borders */
    margin-left: calc(-1 * var(--border));
    margin-top: calc(-1 * var(--border));
    }
    
    `;
  
    document.head.appendChild(style);
  
    const title = document.createElement("h1");
    title.textContent = "Results";
    document.body.appendChild(title);
  
    /* =========================
       TOP 10 BUILD
    ========================= */
  
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
  
    /* =========================
       REST BUILD
    ========================= */
  
    const restWrap = document.createElement("div");
    restWrap.className = "rest";
  
    rest.forEach((img, i) => {
      const cell = document.createElement("div");
      cell.className = "cell";
      cell.textContent = `${img.rank}.${img.name}`;
      restWrap.appendChild(cell);
    });
  
    document.body.appendChild(restWrap);
  }
  
  