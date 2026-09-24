document.addEventListener('DOMContentLoaded', function() {
    // Screens
    const mainScreen = document.getElementById('main-screen');
    const imposterScreen = document.getElementById('imposter-screen');
    const revealScreen = document.getElementById('reveal-screen');
    const discussionScreen = document.getElementById('discussion-screen');

    // Controls & Settings
    const imposterIcon = document.getElementById('imposter-icon');
    const backBtn = document.getElementById('back-btn');
    const playerInput = document.getElementById('player-input');
    const addPlayerBtn = document.getElementById('add-player-btn');
    const playerList = document.getElementById('player-list');
    const startGameBtn = document.getElementById('start-game-btn');
    const kidsModeToggle = document.getElementById('kids-mode-toggle');
    const imposterCountRange = document.getElementById('imposter-count-range');
    const imposterCountLabel = document.getElementById('imposter-count-label');
    const totalRoundsInput = document.getElementById('total-rounds-input');

    // Badges & Labels
    const revealRoundBadge = document.getElementById('reveal-round-badge');
    const discussionRoundBadge = document.getElementById('discussion-round-badge');

    // Reveal elements
    const currentPlayerName = document.getElementById('current-player-name');
    const showWordBtn = document.getElementById('show-word-btn');
    const secretArea = document.getElementById('secret-area');
    const secretWordDisplay = document.getElementById('secret-word-display');
    const nextPlayerBtn = document.getElementById('next-player-btn');

    // Discussion & Points elements
    const resolveBtn = document.getElementById('resolve-btn');
    const resultArea = document.getElementById('result-area');
    const imposterRevealName = document.getElementById('imposter-reveal-name');
    const secretRevealWord = document.getElementById('secret-reveal-word');
    const winCrewBtn = document.getElementById('win-crew-btn');
    const winImposterBtn = document.getElementById('win-imposter-btn');
    const leaderboardList = document.getElementById('leaderboard-list');
    const restartBtn = document.getElementById('restart-btn');
    const changeSetupBtn = document.getElementById('change-setup-btn');

    // Modal
    const customModal = document.getElementById('custom-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalText = document.getElementById('modal-text');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // Spiel-Variablen
    let players = [];
    let scores = {};
    let currentTurnIndex = 0;
    let imposterIndices = [];
    let currentSecretWord = "";
    
    let currentRound = 1;
    let totalRounds = 5;

    const kidsWordList = [
        "Hund", "Katze", "Maus", "Pferd", "Kuh", "Schaf", "Fisch", "Vogel", "Elefant", "Löwe",
        "Panda", "Affe", "Enten", "Frosch", "Schnecke", "Biene", "Schmetterling", "Hasen", "Pinguin", "Bär",
        "Apfel", "Banane", "Pizza", "Eis", "Schokolade", "Kuchen", "Pommes", "Brot", "Milch", "Saft",
        "Auto", "Bus", "Zug", "Flugzeug", "Fahrrad", "Schiff", "Bagger", "Feuerwehr", "Polizei", "Rakete",
        "Ball", "Puppe", "Rutsche", "Schaukel", "Lego", "Teddibär", "Sonne", "Mond", "Stern", "Regenbogen"
    ];

    const wordList = [
        "Apfel", "Pizza", "Döner", "Hamburger", "Spaghetti", "Sushi", "Lasagne", "Waffel", "Schokolade", "Eiscreme",
        "Pommes", "Popcorn", "Kuchen", "Donut", "Brot", "Käse", "Wurst", "Ei", "Suppe", "Salat",
        "Hund", "Katze", "Maus", "Hamster", "Schlange", "Frosch", "Fisch", "Hai", "Wal", "Delfin",
        "Löwe", "Tiger", "Wolf", "Fuchs", "Elefant", "Giraffe", "Zebra", "Pferd", "Kuh", "Schaf",
        "Arzt", "Zahnarzt", "Polizist", "Feuerwehrmann", "Pilot", "Bäcker", "Koch", "Friseur", "Gärtner", "Lehrer",
        "Schule", "Krankenhaus", "Polizeistation", "Supermarkt", "Restaurant", "Kino", "Museum", "Zoo", "Park", "Flughafen",
        "Stuhl", "Tisch", "Sofa", "Bett", "Schrank", "Spiegel", "Lampe", "Uhr", "Smartphone", "Computer",
        "Auto", "LKW", "Bus", "Motorrad", "Fahrrad", "Traktor", "Zug", "Flugzeug", "Hubschrauber", "Schiff",
        "Berg", "Tal", "Wüste", "Wald", "See", "Fluss", "Ozean", "Insel", "Sonne", "Mond"
    ];

    function showScreen(screenToShow) {
        [mainScreen, imposterScreen, revealScreen, discussionScreen].forEach(s => s.classList.remove('active'));
        screenToShow.classList.add('active');
    }

    function showAlert(title, message) {
        modalTitle.textContent = title;
        modalText.innerHTML = message;
        customModal.classList.add('active');
    }

    modalCloseBtn.addEventListener('click', () => customModal.classList.remove('active'));

    imposterIcon.addEventListener('click', () => showScreen(imposterScreen));
    backBtn.addEventListener('click', () => showScreen(mainScreen));

    imposterCountRange.addEventListener('input', () => {
        imposterCountLabel.textContent = imposterCountRange.value;
    });

    // Spieler hinzufügen (mit Prüfung auf doppelte Namen)
    function addPlayer() {
        const name = playerInput.value.trim();
        if (name === "") return;

        // Prüft, ob der Name bereits existiert (Groß-/Kleinschreibung egal)
        const isDuplicate = players.some(p => p.toLowerCase() === name.toLowerCase());

        if (isDuplicate) {
            showAlert("Achtung", "Dieser Name wurde bereits vergeben! Bitte wähle einen anderen Namen.");
            return;
        }

        players.push(name);
        scores[name] = scores[name] || 0;
        playerInput.value = "";
        renderPlayerList();
    }

    addPlayerBtn.addEventListener('click', addPlayer);
    playerInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') addPlayer(); });

    function renderPlayerList() {
        playerList.innerHTML = "";
        players.forEach((player, index) => {
            const li = document.createElement('li');
            li.className = 'player-item';
            li.innerHTML = `<span>${player}</span> <button class="remove-btn" onclick="removePlayer(${index})">✕</button>`;
            playerList.appendChild(li);
        });
    }

    window.removePlayer = function(index) {
        const removed = players.splice(index, 1)[0];
        delete scores[removed];
        renderPlayerList();
    };

    function renderLeaderboard() {
        leaderboardList.innerHTML = "";
        const sortedPlayers = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));

        sortedPlayers.forEach((player) => {
            const li = document.createElement('li');
            li.className = 'player-item';
            li.innerHTML = `<span>${player}</span> <span>${scores[player] || 0} Pkt</span>`;
            leaderboardList.appendChild(li);
        });
    }

    // SPIEL INITIALISIERE & STARTEN
    startGameBtn.addEventListener('click', function() {
        const requestedImposters = parseInt(imposterCountRange.value, 10);

        if (players.length < requestedImposters + 2) {
            showAlert("Achtung", `Für ${requestedImposters} Imposter benötigst du **mindestens ${requestedImposters + 2} Spieler**!`);
            return;
        }

        totalRounds = parseInt(totalRoundsInput.value, 10) || 1;
        if (totalRounds < 1) totalRounds = 1;

        currentRound = 1;
        
        // Punkte bei komplettem Neustart auf 0 setzen
        players.forEach(p => scores[p] = 0);

        startNewRound();
    });

    // RUNDE STARTEN
    function startNewRound() {
        const requestedImposters = parseInt(imposterCountRange.value, 10);
        const isKidsMode = kidsModeToggle.checked;
        const activeWordList = isKidsMode ? kidsWordList : wordList;

        currentSecretWord = activeWordList[Math.floor(Math.random() * activeWordList.length)];
        
        imposterIndices = [];
        while (imposterIndices.length < requestedImposters) {
            const randIdx = Math.floor(Math.random() * players.length);
            if (!imposterIndices.includes(randIdx)) {
                imposterIndices.push(randIdx);
            }
        }

        currentTurnIndex = 0;

        // Badges aktualisieren
        revealRoundBadge.textContent = `Runde ${currentRound} / ${totalRounds}`;
        discussionRoundBadge.textContent = `Runde ${currentRound} / ${totalRounds}`;

        prepareTurn();
        showScreen(revealScreen);
    }

    function prepareTurn() {
        showWordBtn.style.display = "block";
        secretArea.style.display = "none";
        currentPlayerName.textContent = players[currentTurnIndex];
    }

    showWordBtn.addEventListener('click', function() {
        showWordBtn.style.display = "none";
        secretArea.style.display = "block";

        if (imposterIndices.includes(currentTurnIndex)) {
            secretWordDisplay.textContent = "Du bist der IMPOSTER!";
            secretWordDisplay.className = "secret-box imposter-text";
        } else {
            secretWordDisplay.textContent = currentSecretWord;
            secretWordDisplay.className = "secret-box word-text";
        }
    });

    nextPlayerBtn.addEventListener('click', function() {
        currentTurnIndex++;
        if (currentTurnIndex < players.length) {
            prepareTurn();
        } else {
            resultArea.style.display = "none";
            resolveBtn.style.display = "block";
            winCrewBtn.disabled = false;
            winImposterBtn.disabled = false;
            renderLeaderboard();

            // Button-Text anpassen, je nachdem ob das Spiel zu Ende ist
            if (currentRound >= totalRounds) {
                restartBtn.textContent = "🏆 Spiel beenden & Sieger anzeigen";
            } else {
                restartBtn.textContent = `Nächste Runde (${currentRound + 1}/${totalRounds})`;
            }

            showScreen(discussionScreen);
        }
    });

    resolveBtn.addEventListener('click', function() {
        const imposterNames = imposterIndices.map(idx => players[idx]).join(", ");
        imposterRevealName.textContent = imposterNames;
        secretRevealWord.textContent = currentSecretWord;
        resultArea.style.display = "block";
        resolveBtn.style.display = "none";
    });

    // Punkte-Vergabe
    winCrewBtn.addEventListener('click', function() {
        players.forEach((p, idx) => {
            if (!imposterIndices.includes(idx)) {
                scores[p] = (scores[p] || 0) + 100;
            }
        });
        renderLeaderboard();
        winCrewBtn.disabled = true;
        winImposterBtn.disabled = true;
        showAlert("Sieg der Crew!", "Alle guten Spieler erhalten +100 Punkte!");
    });

    winImposterBtn.addEventListener('click', function() {
        imposterIndices.forEach(idx => {
            const imposterName = players[idx];
            scores[imposterName] = (scores[imposterName] || 0) + 200;
        });
        renderLeaderboard();
        winCrewBtn.disabled = true;
        winImposterBtn.disabled = true;
        showAlert("Sieg der Imposter!", "Alle Imposter erhalten +200 Punkte!");
    });

    // Nächste Runde ODER Spielende
    restartBtn.addEventListener('click', function() {
        if (currentRound < totalRounds) {
            currentRound++;
            startNewRound();
        } else {
            // Gesamtsieger ermitteln
            const sortedPlayers = [...players].sort((a, b) => (scores[b] || 0) - (scores[a] || 0));
            const winner = sortedPlayers[0];
            const maxPoints = scores[winner] || 0;

            showAlert("🎉 Spiel Beendet!", `Das Spiel ist vorbei!<br><strong>${winner}</strong> gewinnt das Match mit <strong>${maxPoints} Punkten</strong>!`);
            showScreen(imposterScreen);
        }
    });

    changeSetupBtn.addEventListener('click', function() {
        showScreen(imposterScreen);
    });
});