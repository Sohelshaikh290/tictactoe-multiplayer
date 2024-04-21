document.addEventListener('DOMContentLoaded', () => {
    const socket = new WebSocket('ws://localhost:3000');

    // Function to create game board cells
    const createBoard = () => {
        const gameBoard = document.getElementById('game-board');
        for (let i = 0; i < 9; i++) {
            const cell = document.createElement('div');
            cell.classList.add('cell');
            cell.setAttribute('data-index', i);
            cell.addEventListener('click', handleCellClick);
            gameBoard.appendChild(cell);
        }
    };

    // Function to handle cell click
    const handleCellClick = (event) => {
        const cellIndex = event.target.getAttribute('data-index');
        socket.send(JSON.stringify({ type: 'move', index: cellIndex }));
    };

    // Function to handle game restart
    const handleRestart = () => {
        socket.send(JSON.stringify({ type: 'restart' }));
    };

    // WebSocket event listeners
    socket.onopen = () => {
        console.log('Connected to server');
    };

    socket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'player') {
            // Handle player assignment if needed
        } else if (data.type === 'updateBoard') {
            updateBoard(data.board);
        } else if (data.type === 'updateStatus') {
            updateStatus(data.status);
        }
    };

    // Function to update game board based on server data
    const updateBoard = (board) => {
        const cells = document.querySelectorAll('.cell');
        cells.forEach((cell, index) => {
            cell.textContent = board[index];
        });
    };

    // Function to update game status based on server data
    const updateStatus = (status) => {
        const statusMessage = document.getElementById('status-message');
        statusMessage.textContent = status;
    };

    // Event listener for restart button
    const restartBtn = document.getElementById('restart-btn');
    restartBtn.addEventListener('click', handleRestart);

    // Create game board when DOM content is loaded
    createBoard();
});
