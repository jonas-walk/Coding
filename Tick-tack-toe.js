let istSpielerX = true;
let spielAktiv = false;
let gegenKI = false; // true = VS AI, false = VS FRIEND
let aiDifficulty = 3; // 1 = Easy, 2 = Medium, 3 = Hard

const gewinnKombinationen = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6]
];

const urspruenglicheTexte = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i'];

document.addEventListener('DOMContentLoaded', () => {
  const felder = document.querySelectorAll('#Spielfeld td');
  const startOverlay = document.getElementById('start-overlay');
  const winOverlay = document.getElementById('win-overlay');
  
  const vsFriendBtn = document.getElementById('vs-friend-btn');
  const vsAiBtn = document.getElementById('vs-ai-btn');
  const startBtn = document.getElementById('start-btn');
  const restartBtn = document.getElementById('restart-btn');
  const menuBtn = document.getElementById('menu-btn');

  const diffContainer = document.getElementById('ai-difficulty-container');
  const diffSlider = document.getElementById('difficulty-slider');
  const diffText = document.getElementById('difficulty-text');

  const diffLabels = { 1: 'EASY', 2: 'MEDIUM', 3: 'HARD' };

  // Modus "VS FRIEND" auswählen
  vsFriendBtn.addEventListener('click', () => {
    gegenKI = false;
    vsFriendBtn.classList.add('active');
    vsAiBtn.classList.remove('active');
    diffContainer.classList.remove('show');
  });

  // Modus "VS AI" auswählen
  vsAiBtn.addEventListener('click', () => {
    gegenKI = true;
    vsAiBtn.classList.add('active');
    vsFriendBtn.classList.remove('active');
    diffContainer.classList.add('show');
  });

  // NEU: Slider-Event zum Anpassen der Schwierigkeit
  diffSlider.addEventListener('input', (e) => {
    aiDifficulty = parseInt(e.target.value);
    diffText.textContent = diffLabels[aiDifficulty];
  });

  // Spiel starten
  startBtn.addEventListener('click', () => {
    startOverlay.classList.remove('show');
    spielZuruecksetzen();
  });

  // "PLAY AGAIN" Button
  restartBtn.addEventListener('click', () => {
    winOverlay.classList.remove('show');
    spielZuruecksetzen();
  });

  // "MAIN MENU" Button
  menuBtn.addEventListener('click', () => {
    winOverlay.classList.remove('show');
    startOverlay.classList.add('show');
    spielAktiv = false;
  });

  felder.forEach(feld => {
    feld.addEventListener('click', eventListenerFeldKlick);
  });
});

function eventListenerFeldKlick(event) {
  const feld = event.target;

  if (!spielAktiv || feld.classList.contains('x-mark') || feld.classList.contains('o-mark')) {
    return;
  }

  // Zug ausführen
  macheZug(feld, istSpielerX ? 'X' : 'O');

  if (pruefeSpielende()) {
    return;
  }

  istSpielerX = !istSpielerX;

  // Wenn KI aktiv und an der Reihe ist
  if (gegenKI && !istSpielerX) {
    spielAktiv = false; // Klicks während des KI-Zugs sperren
    setTimeout(kiZug, 400);
  }
}

function macheZug(feld, symbol) {
  feld.textContent = symbol;
  if (symbol === 'X') {
    feld.classList.add('x-mark');
  } else {
    feld.classList.add('o-mark');
  }
}

function pruefeSpielende() {
  if (pruefeGewinn()) {
    spielAktiv = false;
    const gewinnerName = gegenKI && !istSpielerX ? 'AI (O)' : (istSpielerX ? 'PLAYER X' : 'PLAYER O');
    zeigeGewinnerMeldung(`${gewinnerName} WON!`, 'MISSION COMPLETED');
    return true;
  }

  if (pruefeUnentschieden()) {
    spielAktiv = false;
    zeigeGewinnerMeldung("IT'S A DRAW!", 'MISSION FAILED');
    return true;
  }

  return false;
}

// NEU: KI-Zug abhängig von der gewählten Schwierigkeitsstufe
function kiZug() {
  const felder = Array.from(document.querySelectorAll('#Spielfeld td'));
  const freieFelder = felder.map((f, index) => (!f.classList.contains('x-mark') && !f.classList.contains('o-mark') ? index : null)).filter(val => val !== null);

  let besterZug = -1;

  if (aiDifficulty === 1) {
    // EASY: Rein zufälliger Zug
    besterZug = freieFelder[Math.floor(Math.random() * freieFelder.length)];
  } else if (aiDifficulty === 2) {
    // MEDIUM: 50% Minimax (schlau), 50% Zufall
    if (Math.random() > 0.5) {
      besterZug = berechneMinimaxZug(felder);
    } else {
      besterZug = freieFelder[Math.floor(Math.random() * freieFelder.length)];
    }
  } else {
    // HARD: 100% Minimax (Unschlagbar)
    besterZug = berechneMinimaxZug(felder);
  }

  if (besterZug !== -1 && besterZug !== undefined) {
    macheZug(felder[besterZug], 'O');
  }

  spielAktiv = true;

  if (!pruefeSpielende()) {
    istSpielerX = true;
  }
}

// Hilfsfunktion zur Ermittlung des optimalen KI-Zugs
function berechneMinimaxZug(felder) {
  let besterScore = -Infinity;
  let besterZug = -1;

  felder.forEach((feld, index) => {
    if (!feld.classList.contains('x-mark') && !feld.classList.contains('o-mark')) {
      feld.classList.add('o-mark');
      let score = minimax(felder, 0, false);
      feld.classList.remove('o-mark');
      if (score > besterScore) {
        besterScore = score;
        besterZug = index;
      }
    }
  });

  return besterZug;
}

// Minimax Algorithmus
function minimax(board, tiefe, isMaximizing) {
  if (checkWinForSymbol(board, 'o-mark')) return 10 - tiefe;
  if (checkWinForSymbol(board, 'x-mark')) return tiefe - 10;
  if (board.every(f => f.classList.contains('x-mark') || f.classList.contains('o-mark'))) return 0;

  if (isMaximizing) {
    let bestScore = -Infinity;
    board.forEach(feld => {
      if (!feld.classList.contains('x-mark') && !feld.classList.contains('o-mark')) {
        feld.classList.add('o-mark');
        let score = minimax(board, tiefe + 1, false);
        feld.classList.remove('o-mark');
        bestScore = Math.max(score, bestScore);
      }
    });
    return bestScore;
  } else {
    let bestScore = Infinity;
    board.forEach(feld => {
      if (!feld.classList.contains('x-mark') && !feld.classList.contains('o-mark')) {
        feld.classList.add('x-mark');
        let score = minimax(board, tiefe + 1, true);
        feld.classList.remove('x-mark');
        bestScore = Math.min(score, bestScore);
      }
    });
    return bestScore;
  }
}

function checkWinForSymbol(board, symbolClass) {
  return gewinnKombinationen.some(kombination => {
    return kombination.every(index => board[index].classList.contains(symbolClass));
  });
}

function pruefeGewinn() {
  const felder = document.querySelectorAll('#Spielfeld td');
  const aktuellesSymbol = istSpielerX ? 'x-mark' : 'o-mark';
  return checkWinForSymbol(Array.from(felder), aktuellesSymbol);
}

function pruefeUnentschieden() {
  const felder = document.querySelectorAll('#Spielfeld td');
  return Array.from(felder).every(feld => {
    return feld.classList.contains('x-mark') || feld.classList.contains('o-mark');
  });
}

function zeigeGewinnerMeldung(titelText, subText) {
  const winOverlay = document.getElementById('win-overlay');
  const title = document.getElementById('win-title');
  const subtitle = document.getElementById('win-subtitle');

  title.textContent = titelText;
  subtitle.textContent = subText;

  if (istSpielerX) {
    title.style.color = '#00ffff';
    title.style.textShadow = '0 0 20px #00ffff, 0 0 40px #00ffff';
  } else {
    title.style.color = '#ff00ff';
    title.style.textShadow = '0 0 20px #ff00ff, 0 0 40px #ff00ff';
  }

  winOverlay.classList.add('show');
}

function spielZuruecksetzen() {
  const felder = document.querySelectorAll('#Spielfeld td');

  felder.forEach((feld, index) => {
    feld.classList.remove('x-mark', 'o-mark');
    feld.textContent = urspruenglicheTexte[index];
  });

  istSpielerX = true;
  spielAktiv = true;
}