const tg = window.Telegram.WebApp;
if (tg) tg.expand();

const game = new Chess();
let selectedSquare = null;
let playerColor = 'w'; // 'w' или 'b'

// Векторные пути фигур (100% одинаковые формы для черных и белых)
const piecePaths = {
    'p': '<path d="M 22,9 C 19.79,9 18,10.79 18,13 C 18,13.89 18.29,14.71 18.78,15.38 C 16.83,16.5 15.5,18.59 15.5,21 C 15.5,23.03 16.44,24.84 17.91,26.03 C 14.91,27.09 10.5,31.58 10.5,39.5 L 33.5,39.5 C 33.5,31.58 29.09,27.09 26.09,26.03 C 27.56,24.84 28.5,23.03 28.5,21 C 28.5,18.59 27.17,16.5 25.22,15.38 C 25.71,14.71 26,13.89 26,13 C 26,10.79 24.21,9 22,9 z"/>',
    'r': '<g><path d="M 9,39 L 36,39 L 36,36 L 9,36 z"/><path d="M 12,36 L 12,32 L 33,32 L 33,36 z"/><path d="M 11,14 L 11,9 L 15,9 L 15,11 L 20,11 L 20,9 L 25,9 L 25,11 L 30,11 L 30,9 L 34,9 L 34,14 z"/><path d="M 12,14 L 33,14 L 31,32 L 14,32 z"/></g>',
    'n': '<g><path d="M 22,10 C 32.5,11 38.5,18 38,39 L 15,39 C 15,30 25,32.5 23,18"/><path d="M 24,18 C 24.38,20.91 18.45,25.37 16,27 C 13,29 13.18,31.34 11,31 C 9.958,30.06 12.41,27.96 11,28 C 10,28 11.19,29.23 10,30 C 9,30 5.997,31 6,26 C 6,24 12,14 12,14 C 12,14 13.89,12.1 14,10.5 C 13.27,9.506 13.5,8.5 13.5,8.5 C 14.5,8 16.5,8 16.5,8 C 17,9.5 16,10 16.5,11 C 17,12 18,11.5 18,10.5 C 18,9.5 21,8.5 22,10 z"/></g>',
    'b': '<g><path d="M 9,36 C 12.39,35.03 19.11,36.43 22.5,34 C 25.89,36.43 32.61,35.03 36,36 C 36,36 37.65,36.54 39,38 C 38.32,38.97 37.35,38.99 36,38.5 C 32.61,37.53 25.89,38.93 22.5,36.5 C 19.11,38.93 12.39,37.53 9,38.5 C 7.65,38.99 6.68,38.97 6,38 C 7.35,36.54 9,36 9,36 z"/><path d="M 15,32 C 17.5,34.5 27.5,34.5 30,32 C 30.5,30.5 30,22 30,22 C 30,22 25.5,14 22.5,10.5 C 19.5,14 15,22 15,22 C 15,22 14.5,30.5 15,32 z"/><circle cx="22.5" cy="8.5" r="1.5"/><path d="M 17.5,26 L 27.5,26"/><path d="M 22.5,21 L 22.5,31"/></g>',
    'q': '<g><path d="M 9,26 C 17.5,24.5 30,24.5 36,26 L 38,14 L 31,25 L 22.5,11 L 14,25 L 7,14 z"/><path d="M 9,26 C 9,28 10.5,28 11.5,30 C 12.5,32 12.5,34.5 12,36 L 33,36 C 32.5,34.5 32.5,32 33.5,30 C 34.5,28 36,28 36,26"/><circle cx="6" cy="12" r="2"/><circle cx="14" cy="9" r="2"/><circle cx="22.5" cy="6" r="2"/><circle cx="31" cy="9" r="2"/><circle cx="39" cy="12" r="2"/><path d="M 11,39 L 34,39 L 34,36 L 11,36 z"/></g>',
    'k': '<g><path d="M 22.5,11.5 L 22.5,6"/><path d="M 20,8 L 25,8"/><path d="M 11.5,37 C 17,35.5 28,35.5 33.5,37 L 33.5,35 C 28,33.5 17,33.5 11.5,35 z"/><path d="M 11.5,30 C 17,28.5 28,28.5 33.5,30 L 33.5,28 C 28,26.5 17,26.5 11.5,28 z"/><path d="M 11.5,30 L 11.5,35"/><path d="M 33.5,30 L 33.5,35"/><path d="M 20,11 C 15,11 10.5,14 10.5,20 C 10.5,25 14,28 15.5,28 C 17,28 28,28 29.5,28 C 31,28 34.5,25 34.5,20 C 34.5,14 30,11 25,11 z"/></g>'
};

function getPieceSVG(color, type) {
    const path = piecePaths[type.toLowerCase()];
    if (!path) return '';

    const isWhite = color === 'w';
    const fill = isWhite ? '#ffffff' : '#111113';
    const stroke = '#111113';

    return `<svg viewBox="0 0 45 45" xmlns="http://www.w3.org/2000/svg">
        <g fill="${fill}" stroke="${stroke}" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
            ${path}
        </g>
    </svg>`;
}

function selectColor(color) {
    document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));

    if (color === 'random') {
        playerColor = Math.random() > 0.5 ? 'w' : 'b';
        document.getElementById('btn-random').classList.add('active');
    } else {
        playerColor = color;
        document.getElementById(`btn-${color}`).classList.add('active');
    }

    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
    resetGame();
}

function renderBoard() {
    const boardEl = document.getElementById('chessboard');
    boardEl.innerHTML = '';
    const board = game.board();

    const rows = playerColor === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];
    const cols = playerColor === 'w' ? [0,1,2,3,4,5,6,7] : [7,6,5,4,3,2,1,0];

    for (let r of rows) {
        for (let c of cols) {
            const squareEl = document.createElement('div');
            const squareName = String.fromCharCode(97 + c) + (8 - r);
            const isLight = (r + c) % 2 === 0;

            squareEl.className = `square ${isLight ? 'light' : 'dark'}`;
            squareEl.dataset.square = squareName;

            const piece = board[r][c];
            if (piece) {
                squareEl.innerHTML = getPieceSVG(piece.color, piece.type);
            }

            if (selectedSquare === squareName) {
                squareEl.classList.add('selected');
            }

            if (selectedSquare) {
                const moves = game.moves({ square: selectedSquare, verbose: true });
                if (moves.some(m => m.to === squareName)) {
                    squareEl.classList.add('possible');
                }
            }

            squareEl.onclick = () => handleSquareClick(squareName);
            boardEl.appendChild(squareEl);
        }
    }
    updateStatus();
}

function handleSquareClick(square) {
    if (game.game_over() || game.turn() !== playerColor) return;

    if (selectedSquare === null) {
        const piece = game.get(square);
        if (piece && piece.color === playerColor) {
            selectedSquare = square;
            if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
        }
    } else {
        const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
        });

        if (move) {
            if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
            selectedSquare = null;
            renderBoard();

            if (!game.game_over()) {
                triggerAIMove();
            }
        } else {
            const piece = game.get(square);
            selectedSquare = (piece && piece.color === playerColor) ? square : null;
        }
    }
    renderBoard();
}

async function triggerAIMove() {
    setStatus('ИИ ДУМАЕТ (STOCKFISH)...');

    try {
        const fen = encodeURIComponent(game.fen());
        const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=10`);
        const data = await response.json();

        if (data && data.success && data.bestmove) {
            const moveStr = data.bestmove.split(' ')[1];
            const from = moveStr.substring(0, 2);
            const to = moveStr.substring(2, 4);
            const promo = moveStr.length > 4 ? moveStr[4] : 'q';

            game.move({ from, to, promotion: promo });
            if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('warning');
        }
    } catch (e) {
        console.error("Ошибка ИИ API, делаем случайный ход:", e);
        const moves = game.moves();
        if (moves.length > 0) game.move(moves[Math.floor(Math.random() * moves.length)]);
    }

    renderBoard();
}

function setStatus(text) {
    document.getElementById('status').innerText = text;
}

function updateStatus() {
    if (game.in_checkmate()) {
        const winner = game.turn() === playerColor ? 'ИИ ПОБЕДИЛ 🤖' : 'ТЫ ПОБЕДИЛ 🎉';
        setStatus(`МАТ! ${winner}`);
    } else if (game.in_draw()) {
        setStatus('НИЧЬЯ!');
    } else if (game.in_check()) {
        setStatus(game.turn() === playerColor ? 'ШАХ ТЕБЕ!' : 'ШАХ ИИ!');
    } else {
        setStatus(game.turn() === playerColor ? 'ТВОЙ ХОД' : 'ХОД ИИ...');
    }
}

function resetGame() {
    game.reset();
    selectedSquare = null;
    renderBoard();

    if (playerColor === 'b') {
        triggerAIMove();
    }
}

// Запуск
renderBoard();