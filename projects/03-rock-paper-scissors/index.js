const PREFIX_KEY = 'rock-paper-scissor';
const scores = JSON.parse(localStorage.getItem(PREFIX_KEY + 'scores'));
const circlePlayer = document.querySelector('.circle-player');
const circleComputer = document.querySelector('.circle-computer');
const rock = document.querySelector('#rock');
const paper = document.querySelector('#paper');
const scissor = document.querySelector('#scissor');
const resultHTML = document.querySelector('.result');
const playButton = document.querySelector('.play-btn');
const restartButton = document.querySelector('.restart-btn');
const autoPlayButton = document.querySelector('.auto-play');
const stopAutoPlayButton = document.querySelector('.stop-auto');
let playerScoreElement = document.querySelector('.player-score');
let computerScoreElement = document.querySelector('.computer-score');
let intervalId;
let playerMove = '';
let playerScore = scores ? scores.user : 0;
let computerScore = scores ? scores.computer : 0;
playerScoreElement.textContent = playerScore;
computerScoreElement.textContent = computerScore;

rock.addEventListener('click', () => pickMove('rock'));
paper.addEventListener('click', () => pickMove('paper'));
scissor.addEventListener('click', () => pickMove('scissor'));
restartButton.addEventListener('click', () => {
    localStorage.removeItem('scores');
    playerScore = 0;
    computerScore = 0;
    circlePlayer.innerHTML = '?'
    circleComputer.innerHTML = '?'
    resultHTML.innerHTML = '';
    updateScores();
});
circlePlayer.addEventListener('click', () => {
    circlePlayer.innerHTML = '?'
    circleComputer.innerHTML = '?'
    resultHTML.innerHTML = '';
    playerMove = '';
});
playButton.addEventListener('click', handlePlayRound);
playButton.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
        handlePlayRound();
    }
});
autoPlayButton.addEventListener('click', () => {
    clearInterval(intervalId);
    stopAutoPlayButton.classList.remove('hidden');
    autoPlayButton.classList.add('hidden');
    intervalId = setInterval(autoPlay, 1000);
});
stopAutoPlayButton.addEventListener('click', () => {
    clearInterval(intervalId)
    stopAutoPlayButton.classList.add('hidden');
    autoPlayButton.classList.remove('hidden');
});


function pickMove(move) {
    circlePlayer.classList.remove('animate');
    circlePlayer.classList.add('animate');
    circlePlayer.innerHTML = `<img class="move" src="./assets/${move}.png" alt="${move}">`;
    playerMove = move;
    resultHTML.innerHTML = '';
    circleComputer.innerHTML = '?';
}

function computerPlay() {
    let moves = ['rock', 'paper', 'scissor'];
    let random = Math.floor(Math.random() * moves.length);
    return moves[random];
}

function playRound(playerSelection, computerSelection) {
    if (!playerSelection) return alert('Player has no move!');
    let result = '';
    let htmlForComputer = '';
    let htmlForResult = '';

    if (playerSelection === computerSelection) {
        result = 'It\'s a Draw!';
        playerScore++;
        computerScore++;
    } else if (
        (playerSelection === 'rock' && computerSelection === 'scissor') ||
        (playerSelection === 'paper' && computerSelection === 'rock') ||
        (playerSelection === 'scissor' && computerSelection === 'paper')
    ) {
        result = 'Player Wins!';
        playerScore++;
    } else {
        result = 'Computer Wins!';
        computerScore++;
    }

    htmlForResult = `
        <span>Computer picks ${computerSelection}. Player picks ${playerSelection}</span>
        <span ${result.includes('Player') ? 'class="green"' : ''}
        ${result.includes('Computer') ? 'class="red"' : ''}>${result}</span>
    `;

    htmlForComputer = `
        <img class="move" src="./assets/${computerSelection}.png" alt="${computerSelection}">
    `;

    resultHTML.innerHTML = htmlForResult;
    circleComputer.innerHTML = htmlForComputer;

    updateScores();
}


function updateScores() {
    playerScoreElement.textContent = playerScore;
    computerScoreElement.textContent = computerScore;
}

function handlePlayRound() {
    playerMove = playerMove;
    computerMove = computerPlay();
    playRound(playerMove, computerMove);
    localStorage.setItem(PREFIX_KEY +  'scores', JSON.stringify({ user: playerScore, computer: computerScore }));
}

function autoPlay() {
    pickMove(computerPlay());
    handlePlayRound();
}

