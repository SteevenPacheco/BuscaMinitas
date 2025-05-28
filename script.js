const board = document.getElementById("board");
const status = document.getElementById("status");
const timerSpan = document.getElementById("timer");
const minesLeftSpan = document.getElementById("mines-left");

const size = 8;
const minesCount = 10;
let cells = [];
let minePositions = [];
let flagsPlaced = 0;
let gameOver = false;
let startTime = null;
let timerInterval = null;

function init() {
    clearInterval(timerInterval);
    timerSpan.textContent = "0";
    minesLeftSpan.textContent = minesCount;
    status.textContent = "";
    board.innerHTML = "";
    cells = [];
    flagsPlaced = 0;
    gameOver = false;
    minePositions = generateMines();

    for (let i = 0; i < size * size; i++) {
        const cell = document.createElement("div");
        cell.classList.add("cell");
        cell.dataset.index = i;
        if (minePositions.includes(i)) {
            cell.dataset.mine = "true";
        }
        cell.addEventListener("click", () => {
            if (!startTime) startTimer();
            reveal(i);
        });
        cell.addEventListener("contextmenu", (e) => {
            e.preventDefault();
            toggleFlag(i);
        });
        board.appendChild(cell);
        cells.push(cell);
    }
}

function generateMines() {
    const positions = new Set();
    while (positions.size < minesCount) {
        positions.add(Math.floor(Math.random() * size * size));
    }
    return Array.from(positions);
}

function toggleFlag(index) {
    const cell = cells[index];
    if (cell.classList.contains("revealed") || gameOver) return;

    if (cell.classList.contains("flagged")) {
        cell.classList.remove("flagged");
        cell.textContent = "";
        flagsPlaced--;
    } else if (flagsPlaced < minesCount) {
        cell.classList.add("flagged");
        cell.textContent = "🚩";
        flagsPlaced++;
    }
    minesLeftSpan.textContent = minesCount - flagsPlaced;
}

function reveal(index) {
    const cell = cells[index];
    if (cell.classList.contains("revealed") || cell.classList.contains("flagged") || gameOver) return;

    cell.classList.add("revealed");

    if (cell.dataset.mine === "true") {
        cell.textContent = "💣";
        cell.classList.add("mine");
        gameOver = true;
        status.textContent = "💥 ¡Perdiste!";
        revealAllMines();
        clearInterval(timerInterval);
        return;
    }

    const neighbors = getNeighbors(index);
    const mineCount = neighbors.filter(i => cells[i].dataset.mine === "true").length;

    if (mineCount > 0) {
        cell.textContent = mineCount;
        cell.dataset.num = mineCount;
    } else {
        neighbors.forEach(reveal);
    }

    checkWin();
}

function getNeighbors(index) {
    const row = Math.floor(index / size);
    const col = index % size;
    const neighbors = [];

    for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
            if (dr === 0 && dc === 0) continue;
            const r = row + dr;
            const c = col + dc;
            if (r >= 0 && r < size && c >= 0 && c < size) {
                neighbors.push(r * size + c);
            }
        }
    }
    return neighbors;
}

function revealAllMines() {
    cells.forEach(cell => {
        if (cell.dataset.mine === "true") {
            cell.textContent = "💣";
            cell.classList.add("mine", "revealed");
        }
    });
}

function checkWin() {
    const unrevealed = cells.filter(c => !c.classList.contains("revealed"));
    if (unrevealed.length === minesCount && !gameOver) {
        status.textContent = "🎉 ¡Ganaste!";
        gameOver = true;
        clearInterval(timerInterval);
    }
}

function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const seconds = Math.floor((Date.now() - startTime) / 1000);
        timerSpan.textContent = seconds;
    }, 1000);
}

init();
