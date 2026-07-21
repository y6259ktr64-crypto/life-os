const tg = window.Telegram.WebApp;
if (tg) tg.expand();

const game = new Chess();
let selectedSquare = null;

// Символы фигур
const piecesUnicode = {
    'p': '♟', 'r': '♜', 'n': '♞', 'b': '♝', 'q': '♛', 'k': '♚',
    'P': '♙', 'R': '♖', 'N': '♘', 'B': '♗', 'Q': '♕', 'K': '♔'
};

// --- ПОЗИЦИОННЫЕ ТАБЛИЦЫ ДЛЯ ИИ ---
const pawnPST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [50, 50, 50, 50, 50, 50, 50, 50],
    [10, 10, 20, 30, 30, 20, 10, 10],
    [ 5,  5, 10, 25, 25, 10,  5,  5],
    [ 0,  0,  0, 20, 20,  0,  0,  0],
    [ 5, -5,-10,  0,  0,-10, -5,  5],
    [ 5, 10, 10,-20,-20, 10, 10,  5],
    [0,  0,  0,  0,  0,  0,  0,  0]
];

const knightPST = [
    [-50,-40,-30,-30,-30,-30,-40,-50],
    [-40,-20,  0,  0,  0,  0,-20,-40],
    [-30,  0, 10, 15, 15, 10,  0,-30],
    [-30,  5, 15, 20, 20, 15,  5,-30],
    [-30,  0, 15, 20, 20, 15,  0,-30],
    [-30,  5, 10, 15, 15, 10,  5,-30],
    [-40,-20,  0,  5,  5,  0,-20,-40],
    [-50,-40,-30,-30,-30,-30,-40,-50]
];

const bishopPST = [
    [-20,-10,-10,-10,-10,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5, 10, 10,  5,  0,-10],
    [-10,  5,  5, 10, 10,  5,  5,-10],
    [-10,  0, 10, 10, 10, 10,  0,-10],
    [-10, 10, 10, 10, 10, 10, 10,-10],
    [-10,  5,  0,  0,  0,  0,  5,-10],
    [-20,-10,-10,-10,-10,-10,-10,-20]
];

const rookPST = [
    [0,  0,  0,  0,  0,  0,  0,  0],
    [5, 10, 10, 10, 10, 10, 10,  5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [-5,  0,  0,  0,  0,  0,  0, -5],
    [0,  0,  0,  5,  5,  0,  0,  0]
];

const queenPST = [
    [-20,-10,-10, -5, -5,-10,-10,-20],
    [-10,  0,  0,  0,  0,  0,  0,-10],
    [-10,  0,  5,  5,  5,  5,  0,-10],
    [ -5,  0,  5,  5,  5,  5,  0, -5],
    [  0,  0,  5,  5,  5,  5,  0, -5],
    [-10,  5,  5,  5,  5,  5,  0,-10],
    [-10,  0,  5,  0,  0,  0,  0,-10],
    [-20,-10,-10, -5, -5,-10,-10,-20]
];

const kingPST = [
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-30,-40,-40,-50,-50,-40,-40,-30],
    [-20,-30,-30,-40,-40,-30,-30,-20],
    [-10,-20,-20,-20,-20,-20,-20,-10],
    [20, 20,  0,  0,  0,  0, 20, 20],
    [20, 30, 10,  0,  0, 10, 30, 20]
];

const pieceValues = {
    'p': 100, 'n': 320, 'b': 330, 'r': 500, 'q': 900, 'k': 20000
};

// Оценка позиции для ИИ (Черные)
function evaluateBoard(board) {
    let totalEval = 0;
    for (let r = 0; r < 8; r++) {
        for (let c = 0; c < 8; c++) {
            const piece = board[r][c];
            if (piece) {
                const type = piece.type;
                let val = pieceValues[type];
                let pstVal = 0;

                if (type === 'p') pstVal = pawnPST[r][c];
                else if (type === 'n') pstVal = knightPST[r][c];
                else if (type === 'b') pstVal = bishopPST[r][c];
                else if (type === 'r') pstVal = rookPST[r][c];
                else if (type === 'q') pstVal = queenPST[r][c];
                else if (type === 'k') pstVal = kingPST[r][c];

                if (piece.color === 'b') {
                    totalEval += (val + pstVal);
                } else {
                    // Для белых используем зеркальную сетку
                    let whitePstVal = 0;
                    if (type === 'p') whitePstVal = pawnPST[7-r][c];
                    else if (type === 'n') whitePstVal = knightPST[7-r][c];
                    else if (type === 'b') whitePstVal = bishopPST[7-r][c];
                    else if (type === 'r') whitePstVal = rookPST[7-r][c];
                    else if (type === 'q') whitePstVal = queenPST[7-r][c];
                    else if (type === 'k') whitePstVal = kingPST[7-r][c];

                    totalEval -= (val + whitePstVal);
                }
            }
        }
    }
    return totalEval;
}

// --- АЛГОРИТМ MINIMAX С ALPHA-BETA ОТСЕЧЕНИЕМ ---
function minimax(depth, alpha, beta, isMaximizing) {
    if (depth === 0 || game.game_over()) {
        return evaluateBoard(game.board());
    }

    const moves = game.moves();

    if (isMaximizing) { // ИИ (Черные) стремится увеличить счет
        let maxEval = -Infinity;
        for (let move of moves) {
            game.move(move);
            let evaluation = minimax(depth - 1, alpha, beta, false);
            game.undo();
            maxEval = Math.max(maxEval, evaluation);
            alpha = Math.max(alpha, evaluation);
            if (beta <= alpha) break; // Альфа-бета отсечение
        }
        return maxEval;
    } else { // Игрок (Белые) стремится уменьшить счет
        let minEval = Infinity;
        for (let move of moves) {
            game.move(move);
            let evaluation = minimax(depth - 1, alpha, beta, true);
            game.undo();
            minEval = Math.min(minEval, evaluation);
            beta = Math.min(beta, evaluation);
            if (beta <= alpha) break; // Альфа-бета отсечение
        }
        return minEval;
    }
}

function getBestAIMove(depth) {
    const moves = game.moves({ verbose: true });
    if (moves.length === 0) return null;

    // Сортировка ходов: сперва взятия (ускоряет поиск)
    moves.sort((a, b) => (b.captured ? 1 : 0) - (a.captured ? 1 : 0));

    let bestMove = null;
    let bestValue = -Infinity;

    for (let move of moves) {
        game.move(move);
        let boardValue = minimax(depth - 1, -Infinity, Infinity, false);
        game.undo();

        if (boardValue > bestValue) {
            bestValue = boardValue;
            bestMove = move;
        }
    }
    return bestMove;
}

// --- ОТРЕНДЕРИТЬ ДОСКУ ---
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
                setStatus('ИИ ДУМАЕТ...');
                // Небольшая задержка, чтобы UI успел обновиться
                setTimeout(() => {
                    makeAIMove();
                }, 100);
            }
        } else {
            const piece = game.get(square);
            selectedSquare = (piece && piece.color === 'w') ? square : null;
        }
    }
    renderBoard();
}

function makeAIMove() {
    // Глубина расчета = 3 ходов вперед (очень оптимально по скорости и уму)
    const bestMove = getBestAIMove(3);

    if (bestMove) {
        game.move(bestMove);
        if (tg && tg.HapticFeedback) tg.HapticFeedback.notificationOccurred('warning');
    }
    renderBoard();
}

function setStatus(text) {
    document.getElementById('status').innerText = text;
}

function updateStatus() {
    if (game.in_checkmate()) {
        setStatus(game.turn() === 'w' ? 'МАТ! ИИ ПОБЕДИЛ 🤖' : 'МАТ! ТЫ ПОБЕДИЛ 🎉');
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
    if (tg && tg.HapticFeedback) tg.HapticFeedback.impactOccurred('heavy');
    renderBoard();
}

// Запуск при загрузке
renderBoard();