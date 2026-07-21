const tg = window.Telegram.WebApp;
if (tg) tg.expand();

const game = new Chess();
let selectedSquare = null;
let playerColor = 'w'; // 'w' или 'b'

const piecesUnicode = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
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

    // Ориентация доски в зависимости от цвета игрока
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
                const symbolKey = piece.color === 'w' ? piece.type.toUpperCase() : piece.type;
                squareEl.innerText = piecesUnicode[symbolKey];
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

// Запрос хода у Гроссмейстерского ИИ Stockfish (API)
async function triggerAIMove() {
    setStatus('ИИ ДУМАЕТ (STOCKFISH)...');

    try {
        const fen = encodeURIComponent(game.fen());
        // Запрос к Stockfish API (глубина 10 = суперсильный ход)
        const response = await fetch(`https://stockfish.online/api/s/v2.php?fen=${fen}&depth=10`);
        const data = await response.json();

        if (data && data.success && data.bestmove) {
            // Формат ответа: "bestmove e2e4"
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

    // Если игрок выбрал Черные, ИИ за Белых делает первый ход
    if (playerColor === 'b') {
        triggerAIMove();
    }
}

// Запуск
renderBoard();