const tg = window.Telegram.WebApp;
tg.expand();

const game = new Chess();
let selectedSquare = null;

// Символы фигур
const piecesUnicode = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

// Ценность фигур для ИИ
const pieceValues = { 'p': 10, 'r': 50, 'n': 30, 'b': 30, 'q': 90, 'k': 1000 };

function renderBoard() {
    const boardEl = document.getElementById('chessboard');
    boardEl.innerHTML = '';
    const board = game.board();

    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
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

            // Подсветка возможных ходов
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
    if (game.game_over() || game.turn() === 'b') return;

    if (selectedSquare === null) {
        const piece = game.get(square);
        if (piece && piece.color === 'w') {
            selectedSquare = square;
            if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('light');
        }
    } else {
        const move = game.move({
            from: selectedSquare,
            to: square,
            promotion: 'q'
        });

        if (move) {
            if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('medium');
            selectedSquare = null;
            renderBoard();

            // Ход ИИ через небольшую паузу
            if (!game.game_over()) {
                setStatus('ИИ ДУМАЕТ...');
                setTimeout(makeAIMove, 400);
            }
        } else {
            const piece = game.get(square);
            selectedSquare = (piece && piece.color === 'w') ? square : null;
        }
    }
    renderBoard();
}

// Простой и быстрый ИИ (Оценка позиции + выбор лучшего хода)
function makeAIMove() {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return;

    let bestMove = null;
    let bestValue = -9999;

    // Сортируем и находим лучший ход для черных
    for (let move of moves) {
        game.move(move);
        let boardValue = evaluateBoard(game.board());
        game.undo();

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }

    // Если нет явно лучшего хода — случайный выбор
    if (!bestMove) {
        bestMove = moves[Math.floor(Math.random() * moves.length)];
    }

    game.move(bestMove);
    if (tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('warning');
    renderBoard();
}

function evaluateBoard(board) {
    let totalEvaluation = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const val = pieceValues[piece.type];
                totalEvaluation += (piece.color === 'b' ? val : -val);
            }
        }
    }
    return totalEvaluation;
}

function setStatus(text) {
    document.getElementById('status').innerText = text;
}

function updateStatus() {
    if (game.in_checkmate()) {
        setStatus(game.turn() === 'w' ? 'МАТ! ИИ ПОБЕДИЛ' : 'МАТ! ТЫ ПОБЕДИЛ 🎉');
    } else if (game.in_draw()) {
        setStatus('НИЧЬЯ!');
    } else if (game.in_check()) {
        setStatus(game.turn() === 'w' ? 'ШАХ ТЕБЕ!' : 'ШАХ ИИ!');
    } else {
        setStatus(game.turn() === 'w' ? 'ТВОЙ ХОД' : 'ХОД ИИ...');
    }
}

function resetGame() {
    game.reset();
    selectedSquare = null;
    if (tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
    renderBoard();
}

// Первый запуск
renderBoard();