const WebSocket = require('ws');

const PORT = process.env.PORT || 3000;

// Initialize WebSocket server
const wss = new WebSocket.Server({ port: PORT });

// Initialize game state
let players = [];
let board = Array(9).fill('');
let currentPlayer = 'X';

// Function to check for winning condition
const checkWinner = () => {
    const winConditions = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
        [0, 4, 8], [2, 4, 6]              // Diagonals
    ];

    for (let condition of winConditions) {
        const [a, b, c] = condition;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return true;
        }
    }
    return false;
};

// Function to check for draw condition
const checkDraw = () => {
    return board.every(cell => cell !== '');
};

// Function to restart the game
const restartGame = () => {
    board = Array(9).fill('');
    currentPlayer = 'X';
};

// Function to handle player moves
const handleMove = (index) => {
    if (board[index] === '' && players.length === 2 && currentPlayer === players[0]) {
        board[index] = currentPlayer;
        if (checkWinner()) {
            return `${currentPlayer} wins!`;
        } else if (checkDraw()) {
            return 'It\'s a draw!';
        } else {
            currentPlayer = currentPlayer === 'X' ? 'O' : 'X';
            return `${currentPlayer}'s turn`;
        }
    } else {
        return 'Invalid move';
    }
};

// WebSocket event listeners
wss.on('connection', (ws) => {
    console.log('Client connected');

    // Assign player X or O
    if (players.length < 2) {
        players.push('X');
        ws.send(JSON.stringify({ type: 'player', value: 'X' }));
    } else {
        players.push('O');
        ws.send(JSON.stringify({ type: 'player', value: 'O' }));
    }

    // Send initial game state
    ws.send(JSON.stringify({ type: 'updateBoard', board }));
    ws.send(JSON.stringify({ type: 'updateStatus', status: `${currentPlayer}'s turn` }));

    // Handle incoming messages from clients
    ws.on('message', (message) => {
        const data = JSON.parse(message);
        if (data.type === 'move') {
            const status = handleMove(data.index);
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'updateBoard', board }));
                    client.send(JSON.stringify({ type: 'updateStatus', status }));
                }
            });
        } else if (data.type === 'restart') {
            restartGame();
            wss.clients.forEach(client => {
                if (client.readyState === WebSocket.OPEN) {
                    client.send(JSON.stringify({ type: 'updateBoard', board }));
                    client.send(JSON.stringify({ type: 'updateStatus', status: `${currentPlayer}'s turn` }));
                }
            });
        }
    });

    // Handle client disconnections
    ws.on('close', () => {
        console.log('Client disconnected');
        players = players.filter(player => player !== 'X' && player !== 'O');
    });
});

console.log(`Server started on port ${PORT}`);
