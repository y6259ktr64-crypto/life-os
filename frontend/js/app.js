const tg = window.Telegram.WebApp;
if (tg) tg.expand();

const game = new Chess();
let selectedSquare = null;
let playerColor = 'w'; // 'w' или 'b'

// --- ВСТРОЕННЫЕ SVG ФИГУРЫ (КОНТУРНЫЕ) ---
// Мы используем SVG, чтобы черные и белые фигуры имели одинаковую форму (контур).
// Различаются они цветом самого контура (stroke).

const svgPieces = {
    // ЧЕРНЫЕ ФИГУРЫ (Красный/Черный контур для отличия)
    'b': {
        'p': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></g></svg>`,
        'r': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm21-9V14l-6 3V9.5L22.5 12 18 9.5V17l-6-3v13h21z" stroke-linecap="butt"/><path d="M12 14v13M33 14v13M16 14v4h13v-4M16 21v4h13v-4"/><path d="M11.5 14h22" stroke-linecap="butt"/></g></svg>`,
        'n': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M22 10c-1.5 1.5-2 5-2 5s-3-2.5-5.5-2.5c-2.21 0-4 1.79-4 4 0 2.21 2 5 2 5s-2.5 1.5-2.5 4c0 2.5 2.5 4.5 5 4.5 2.21 0 3.5-1 3.5-1s-1 3 .5 5.5c1.5 2.5 5 4.5 5 4.5s4-2 5.5-4.5c1.5-2.5.5-5.5.5-5.5s1.29 1 3.5 1c2.5 0 5-2 5-4.5 0-2.5-2.5-4-2.5-4s2-2.79 2-5c0-2.21-1.79-4-4-4-2.5 0-5.5 2.5-5.5 2.5s-.5-3.5-2-5" stroke-linecap="butt"/><path d="M16 23c-1 0-2 .5-2 1.5M28 23c1 0 2 .5 2 1.5"/></g></svg>`,
        'b': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.43-13.5 2-3.39-2.43-10.11-1.03-13.5-2-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2zM15 31c2 1 10 1 12 0 0 0 2-1 2-5 0 0 0-4-3-5-1 .42-2.57 1-4 1-1.43 0-3-.58-4-1-3 1-3 5-3 5 0 4 2 5 2 5z"/><path d="M22.5 10.5c-3 3-8 8-8 8s-2 2-2 6c0 0 0 4 3 5 2 1 10 1 12 0 3-1 3-5 3-5 0-4-2-6-2-6s-5-5-8-8z"/><path d="M17.5 18s3 4 5 4 5-4 5-4" stroke-linecap="butt"/></g></svg>`,
        'q': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 12c2.19 1.94 4.58 3.3 7 4l2-6 2 6c2.47-.72 4.88-2.07 7-4 2.12 1.93 4.53 3.28 7 4l2-6 2 6c2.42-.7 4.81-2.06 7-4-1.93 2.12-3.28 4.53-4 7l6 2-6 2c.72 2.47 2.07 4.88 4 7-2.12-1.93-4.53-3.28-4-7l-2-6-2 6c-2.42.7-4.81 2.06-7 4 1.93-2.12 3.28-4.53 4-7l6-2-6-2c-.7-2.42-2.06-4.81-4-7z"/><circle cx="22.5" cy="22.5" r="2.5"/><path d="M14 17c0 8.5-1.5 12.5-3 15h23c-1.5-2.5-3-6.5-3-15" stroke-linecap="butt"/><path d="M22.5 32c-6 0-10-3-10-6.5h20c0 3.5-4 6.5-10 6.5z"/></g></svg>`,
        'k': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#000" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M22.5 11.5V6M20 8h5" stroke-linecap="butt"/><path d="M22.5 31c-6.23 0-11.23-5-11.23-11.23S16.27 8.54 22.5 8.54s11.23 5 11.23 11.23S28.73 31 22.5 31z"/><path d="M17.5 15.5c3 1 7 1 10 0M17.5 19.5c3 1 7 1 10 0M17.5 23.5c3 1 7 1 10 0" stroke-linecap="butt"/><path d="M12 20.27c0-5 3.5-9 3.5-9h14s3.5 4 3.5 9-3.5 10-3.5 10H15.5s-3.5-5-3.5-10z"/><path d="M11 36c4.27-1.12 11.73.56 15-1.12 3.27 1.68 10.73 0 15 1.12 0 0 2 .68 4 2.52-1 .92-2 .96-4 1.04-4.27-1.12-11.73.56-15 1.12-3.27-1.68-10.73 0-15-1.12-2-.08-3-.12-4-1.04 2-1.84 4-2.52 4-2.52z"/><path d="M16 32c2.61 1.04 10.39 1.04 13 0M22.5 16.5L20 19l2.5 2.5L25 19l-2.5-2.5z" fill="#000"/></g></svg>`
    },
    // БЕЛЫЕ ФИГУРЫ (Светло-серый контур)
    'w': {
        'P': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M22 9c-2.21 0-4 1.79-4 4 0 .89.29 1.71.78 2.38-1.95 1.12-3.28 3.21-3.28 5.62 0 2.03.94 3.84 2.41 5.03-3 1.06-7.41 5.55-7.41 13.47h23c0-7.92-4.41-12.41-7.41-13.47 1.47-1.19 2.41-3 2.41-5.03 0-2.41-1.33-4.5-3.28-5.62.49-.67.78-1.49.78-2.38 0-2.21-1.79-4-4-4z"/></g></svg>`,
        'R': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M9 39h27v-3H9v3zm3-3v-4h21v4H12zm21-9V14l-6 3V9.5L22.5 12 18 9.5V17l-6-3v13h21z" stroke-linecap="butt"/><path d="M12 14v13M33 14v13M16 14v4h13v-4M16 21v4h13v-4"/><path d="M11.5 14h22" stroke-linecap="butt"/></g></svg>`,
        'N': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M22 10c-1.5 1.5-2 5-2 5s-3-2.5-5.5-2.5c-2.21 0-4 1.79-4 4 0 2.21 2 5 2 5s-2.5 1.5-2.5 4c0 2.5 2.5 4.5 5 4.5 2.21 0 3.5-1 3.5-1s-1 3 .5 5.5c1.5 2.5 5 4.5 5 4.5s4-2 5.5-4.5c1.5-2.5.5-5.5.5-5.5s1.29 1 3.5 1c2.5 0 5-2 5-4.5 0-2.5-2.5-4-2.5-4s2-2.79 2-5c0-2.21-1.79-4-4-4-2.5 0-5.5 2.5-5.5 2.5s-.5-3.5-2-5" stroke-linecap="butt"/><path d="M16 23c-1 0-2 .5-2 1.5M28 23c1 0 2 .5 2 1.5"/></g></svg>`,
        'B': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M9 36c3.39-.97 10.11.43 13.5-2 3.39 2.43 10.11 1.03 13.5 2 0 0 1.65.54 3 2-.68.97-1.65.99-3 .5-3.39-.97-10.11.43-13.5 2-3.39-2.43-10.11-1.03-13.5-2-1.35.49-2.32.47-3-.5 1.35-1.46 3-2 3-2zM15 31c2 1 10 1 12 0 0 0 2-1 2-5 0 0 0-4-3-5-1 .42-2.57 1-4 1-1.43 0-3-.58-4-1-3 1-3 5-3 5 0 4 2 5 2 5z"/><path d="M22.5 10.5c-3 3-8 8-8 8s-2 2-2 6c0 0 0 4 3 5 2 1 10 1 12 0 3-1 3-5 3-5 0-4-2-6-2-6s-5-5-8-8z"/><path d="M17.5 18s3 4 5 4 5-4 5-4" stroke-linecap="butt"/></g></svg>`,
        'Q': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M8 12c2.19 1.94 4.58 3.3 7 4l2-6 2 6c2.47-.72 4.88-2.07 7-4 2.12 1.93 4.53 3.28 7 4l2-6 2 6c2.42-.7 4.81-2.06 7-4-1.93 2.12-3.28 4.53-4 7l6 2-6 2c.72 2.47 2.07 4.88 4 7-2.12-1.93-4.53-3.28-4-7l-2-6-2 6c-2.42.7-4.81 2.06-7 4 1.93-2.12 3.28-4.53 4-7l6-2-6-2c-.7-2.42-2.06-4.81-4-7z"/><circle cx="22.5" cy="22.5" r="2.5"/><path d="M14 17c0 8.5-1.5 12.5-3 15h23c-1.5-2.5-3-6.5-3-15" stroke-linecap="butt"/><path d="M22.5 32c-6 0-10-3-10-6.5h20c0 3.5-4 6.5-10 6.5z"/></g></svg>`,
        'K': `<svg viewBox="0 0 45 45"><g fill="none" fill-rule="evenodd" stroke="#666" stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"><path d="M22.5 11.5V6M20 8h5" stroke-linecap="butt"/><path d="M22.5 31c-6.23 0-11.23-5-11.23-11.23S16.27 8.54 22.5 8.54s11.23 5 11.23 11.23S28.73 31 22.5 31z"/><path d="M17.5 15.5c3 1 7 1 10 0M17.5 19.5c3 1 7 1 10 0M17.5 23.5c3 1 7 1 10 0" stroke-linecap="butt"/><path d="M12 20.27c0-5 3.5-9 3.5-9h14s3.5 4 3.5 9-3.5 10-3.5 10H15.5s-3.5-5-3.5-10z"/><path d="M11 36c4.27-1.12 11.73.56 15-1.12 3.27 1.68 10.73 0 15 1.12 0 0 2 .68 4 2.52-1 .92-2 .96-4 1.04-4.27-1.12-11.73.56-15 1.12-3.27-1.68-10.73 0-15-1.12-2-.08-3-.12-4-1.04 2-1.84 4-2.52 4-2.52z"/><path d="M16 32c2.61 1.04 10.39 1.04 13 0M22.5 16.5L20 19l2.5 2.5L25 19l-2.5-2.5z" fill="#fff"/></g></svg>`
    }
};

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
                // ПОЛУЧАЕМ SVG КОД ДЛЯ ФИГУРЫ
                const color = piece.color; // 'w' или 'b'
                const type = piece.type;   // 'p', 'r', etc.

                // Для белых используем ключ в верхнем регистре, как в словаре svgPieces.w
                const typeKey = color === 'w' ? type.toUpperCase() : type;

                if (svgPieces[color] && svgPieces[color][typeKey]) {
                    squareEl.innerHTML = svgPieces[color][typeKey];
                }
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