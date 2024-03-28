// Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { 
    getFirestore,
    updateDoc,
    setDoc,
    doc, 
    query,
    onSnapshot,
    collection,
    orderBy
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import { 
    getAuth,
    onAuthStateChanged,
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    updateProfile,
    signOut,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

const firebaseConfig = {
    apiKey: "AIzaSyBteswGacdbfZNqdN3SlkJ0RpYs5ujVYbg",
    authDomain: "number-guess-beb25.firebaseapp.com",
    projectId: "number-guess-beb25",
    storageBucket: "number-guess-beb25.appspot.com",
    messagingSenderId: "1072983291051",
    appId: "1:1072983291051:web:2b0bb34048d5d1a6b8f3ee"
  };

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


// interface selectors
const bodyElement = document.querySelector("body");
const gameTopElement = document.querySelector(".game-top");
const timerElement = document.querySelector('#timer');
const highscoreTimerElement = document.querySelector('#highscore-timer');
const gameMessageElement = document.querySelector('.game-message');
const guessFromElement = document.querySelector('.guess-form');
const numberContainerElement = document.querySelector('.number-container');
const chancesElement = document.querySelector('#chances');
const attemptsElement = document.querySelector('#attempts');
const signUpContainerElement = document.querySelector('.signup-container');
const loginContainerElement = document.querySelector('.login-container');
const ranksElement = document.querySelector('.ranks');
const displayNameElement = document.querySelector('.display-name');
const difficultyModeElement = document.querySelector('.difficulty-mode');
const rankListElement = document.querySelector('.rank-list');

// select/buttons selectors
const difficultySelectElement = document.querySelector("#difficultySelect");
const sortSelectElement = document.querySelector(".sort-select"); 
const playButtonElement = document.querySelector(".play-btn");
const stopButtonElement = document.querySelector(".stop-btn");
const guessInputElement = document.querySelector('.guess-input');
const switchToLoginElement = document.querySelector('.switch-to-login');
const switchToSignUpElement = document.querySelector('.switch-to-sign-up');
const signUpFormElement = document.querySelector('#signup-form');
const loginFormElement = document.querySelector('#login-form');
const signOutButtonElement = document.querySelector('.signout-btn');

// authentication selectors
const signUpDisplayNameElement = document.querySelector('.signup-display-name');
const signUpEmailElement = document.querySelector('.signup-email');
const signUpPasswordElement = document.querySelector('.signup-password');
const loginEmailElement = document.querySelector('.login-email');
const loginPasswordElement = document.querySelector('.login-password');


// states
let currentUser = null;
let isPlaying = false;
let numberToGuess;
let milliseconds = 0;
let HighScoreForEasy = 0;
let HighScoreForMedium = 0;
let HighScoreForHard = 0;
let difficulty = difficultySelectElement.value;
let timerInterval;
let numberOfGuesses = 0;
let chancesOfAttempts = 10;
let ranks = [];


// eventListeners
difficultySelectElement.addEventListener("change", selectDifficulty);
sortSelectElement.addEventListener("change", fetchInRealTimeRanks);
playButtonElement.addEventListener("click", playGame);
stopButtonElement.addEventListener("click", stopPlaying);
guessFromElement.addEventListener("submit", guess);
switchToLoginElement.addEventListener("click", showLogin);
switchToSignUpElement.addEventListener("click", showSignUp);
signUpFormElement.addEventListener("submit", signUp);
loginFormElement.addEventListener("submit", login);
signOutButtonElement.addEventListener("click", () => signOut(auth));

// Authentication
function showSignUp() {
    loginContainerElement.classList.add("hidden");
    signUpContainerElement.classList.remove("hidden");
}

function showLogin() {
    loginContainerElement.classList.remove("hidden");
    signUpContainerElement.classList.add("hidden");
}

function signUp(e) {
    e.preventDefault();
    const displayName = signUpDisplayNameElement.value;
    const email = signUpEmailElement.value;
    const password = signUpPasswordElement.value;
    createUserWithEmailAndPassword(auth, email, password)
        .then(async (userCredential) => {
            const user = userCredential.user;
            updateProfile(user, {
                displayName: displayName
            }).then(() => {
                console.log("profile updated");
            }).catch((error) => {
                console.log(error);
            });
            await setDoc(doc(db, "users", user.uid), {
                displayName: displayName,
                email: email,
                highScoreForEasy: 0,
                highScoreForMedium: 0,
                highScoreForHard: 0,
            })
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
}

function login(e) {
    e.preventDefault();
    const email = loginEmailElement.value;
    const password = loginPasswordElement.value;
    signInWithEmailAndPassword(auth, email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            console.log(user);
        })
        .catch((error) => {
            const errorMessage = error.message;
            alert(errorMessage);
        });
}

// onAuthStateChanged
onAuthStateChanged(auth, (user) => {
    if (user) {
        !signUpContainerElement.classList.contains("hidden") ? signUpContainerElement.classList.add("hidden") : null;
        !loginContainerElement.classList.contains("hidden") ? loginContainerElement.classList.add("hidden") : null;
        ranksElement.classList.remove("hidden");
        currentUser = user;
        fetchInRealTimeScore();
        fetchInRealTimeRanks();
        displayNameElement.textContent = 'Hi ' + currentUser.displayName + '!';
    } else {
        ranksElement.classList.add("hidden");
        signUpContainerElement.classList.remove("hidden");
        HighScoreForEasy = 0;
        HighScoreForMedium = 0;
        HighScoreForHard = 0;
        currentUser = null;
    }
})

// Realtime Database
function fetchInRealTimeScore() {
    onSnapshot(doc(db, 'users', currentUser.uid), (doc) => {
        HighScoreForEasy = doc.data().highScoreForEasy;
        HighScoreForMedium = doc.data().highScoreForMedium;
        HighScoreForHard = doc.data().highScoreForHard;
        if (difficulty == "easy") {
            highscoreTimerElement.textContent = formatTime(HighScoreForEasy);
        } else if (difficulty == "medium") {
            highscoreTimerElement.textContent = formatTime(HighScoreForMedium);
        } else if (difficulty == "hard") {
            highscoreTimerElement.textContent = formatTime(HighScoreForHard);
        }
    })
}

function fetchInRealTimeRanks() {
    const modeRef = collection(db, difficulty);
    let q;
    if (sortSelectElement.value == "speed") {
        q = query(modeRef, orderBy('highScoreFor' + difficulty.charAt(0).toUpperCase() + difficulty.slice(1), 'asc'));
    } else if (sortSelectElement.value == "accuracy") {
        q = query(modeRef, orderBy('numberOfGuesses', 'asc'));
    }
    onSnapshot(q, (querySnapshot) => {
        ranks = [];
        querySnapshot.forEach((doc) => {
            ranks.push(doc.data());
        });
        renderRanks();
    });
}

function renderRanks() {
    rankListElement.innerHTML = "";
    ranks.forEach((rank, index) => (
        rankListElement.innerHTML += `
            <li class="rank">
                <span class="rank-number">${index + 1}</span>
                <span class="rank-name">${rank.displayName}</span>
                <span class="rank-time">${formatTime(rank['highScoreFor' + difficulty.charAt(0).toUpperCase() + difficulty.slice(1)])}</span>
                <span class="rank-guesses">${rank.numberOfGuesses}</span>
            </li>
        `
    ))
}


//functions
function selectDifficulty(){
    difficulty = difficultySelectElement.value;
    if (difficulty == "easy") {
        highscoreTimerElement.textContent = formatTime(HighScoreForEasy);
        gameMessageElement.textContent = "Guess a number between 1 and 50";
        if (gameTopElement.classList.contains("medium") && numberContainerElement.classList.contains("medium")) {
            gameTopElement.classList.remove("medium");
            numberContainerElement.classList.remove("medium");
            bodyElement.classList.remove("medium");
        } else if (gameTopElement.classList.contains("hard") && numberContainerElement.classList.contains("hard")) {
            gameTopElement.classList.remove("hard");
            numberContainerElement.classList.remove("hard");
            bodyElement.classList.remove("hard");
        }
        gameTopElement.classList.add("easy");
        numberContainerElement.classList.add("easy");
        bodyElement.classList.add("easy");
        timerElement.textContent = "00:00:000";
        numberContainerElement.textContent = "?";
        chancesOfAttempts = 10;
        difficultyModeElement.textContent = "Easy Mode";
        chancesElement.textContent = "10" ;
        milliseconds = 0;
    } else if (difficulty == "medium") {
        highscoreTimerElement.textContent = formatTime(HighScoreForMedium);
        gameMessageElement.textContent = "Guess a number between 1 and 75";
        if (gameTopElement.classList.contains("easy") && numberContainerElement.classList.contains("easy")) {
            gameTopElement.classList.remove("easy");
            numberContainerElement.classList.remove("easy");
            bodyElement.classList.remove("easy");
        } else if (gameTopElement.classList.contains("hard") && numberContainerElement.classList.contains("hard")) {
            gameTopElement.classList.remove("hard");
            numberContainerElement.classList.remove("hard");
            bodyElement.classList.remove("hard");
        }
        gameTopElement.classList.add("medium");
        numberContainerElement.classList.add("medium");
        bodyElement.classList.add("medium");
        timerElement.textContent = "00:00:000";
        numberContainerElement.textContent = "?";
        chancesOfAttempts = 15;
        difficultyModeElement.textContent = "Medium Mode";
        chancesElement.textContent = "15";
        milliseconds = 0;
    } else if (difficulty == "hard") {
        highscoreTimerElement.textContent = formatTime(HighScoreForHard);
        gameMessageElement.textContent = "Guess a number between 1 and 100";
        if (gameTopElement.classList.contains("easy") && numberContainerElement.classList.contains("easy")) {
            gameTopElement.classList.remove("easy");
            numberContainerElement.classList.remove("easy");
            bodyElement.classList.remove("easy");
        } else if (gameTopElement.classList.contains("medium") && numberContainerElement.classList.contains("medium")) {
            gameTopElement.classList.remove("medium");
            numberContainerElement.classList.remove("medium");
            bodyElement.classList.remove("medium");
        }
        gameTopElement.classList.add("hard");
        numberContainerElement.classList.add("hard");
        bodyElement.classList.add("hard");
        timerElement.textContent = "00:00:000";
        numberContainerElement.textContent = "?";
        chancesOfAttempts = 20;
        chancesElement.textContent = "20";
        difficultyModeElement.textContent = "Hard Mode";
        milliseconds = 0;
    }
    numberOfGuesses = 0;
    attemptsElement.textContent = "0";
    fetchInRealTimeRanks()
}

function disableSelectors() {
    if (isPlaying) {
        difficultySelectElement.disabled = true;
        sortSelectElement.disabled = true;
        signOutButtonElement.disabled = true;
    } else {
        difficultySelectElement.disabled = false;
        sortSelectElement.disabled = false;
        signOutButtonElement.disabled = false;
    }
}

function playGame() {
    isPlaying = true;
    disableSelectors()
    clearInterval(timerInterval);
    stopButtonElement.classList.remove("hidden");
    guessInputElement.focus();
    guessInputElement.value = "";
    numberContainerElement.textContent = "?";
    gameMessageElement.textContent = "Guess the number!";
    guessFromElement.classList.remove("hidden");
    playButtonElement.classList.add("hidden");
    numberToGuess = generateRandomNumber(difficulty);
    numberOfGuesses = 0;
    attemptsElement.textContent = "0";
    runTimer();
    console.log(numberToGuess)
}


function runTimer() {
    function updateTimer() {
      timerElement.textContent = formatTime(milliseconds);
      milliseconds+=10;
    }

    timerInterval = setInterval(updateTimer, 10);
  }

  function formatTime(milliseconds) {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const remainingSeconds = totalSeconds % 60;
    const remainingMilliseconds = milliseconds % 1000;
  
    const formattedMinutes = minutes < 10 ? `0${minutes}` : minutes;
    const formattedSeconds = remainingSeconds < 10 ? `0${remainingSeconds}` : remainingSeconds;
    const formattedMilliseconds = remainingMilliseconds.toString().padStart(3, '0');
  
    return `${formattedMinutes}:${formattedSeconds}:${formattedMilliseconds}`;
}

function generateRandomNumber(difficulty) {
    switch (difficulty) {
        case "easy":
            return Math.floor(Math.random() * 50) + 1;
        case "medium":
            return Math.floor(Math.random() * 75) + 1;
        case "hard":
            return Math.floor(Math.random() * 100) + 1;
    }
}

function stopPlaying() {
    clearInterval(timerInterval);
    isPlaying = false;
    disableSelectors()
    numberContainerElement.textContent = numberToGuess;
    gameMessageElement.textContent = "Nah! You gave up! Try again!";
    playButtonElement.classList.remove("hidden");
    playButtonElement.textContent = "Play Again";
    guessFromElement.classList.add("hidden");
    milliseconds = 0;
    timerElement.textContent = "00:00:000";
    numberOfGuesses = 0;
    guessInputElement.value = "";
    attemptsElement.textContent = "0";
    stopButtonElement.classList.add("hidden");
}


function guess (e) {    
    e.preventDefault();
    const guessValue = parseInt(guessInputElement.value);
    
    if (numberOfGuesses === chancesOfAttempts) {
        clearInterval(timerInterval);
        isPlaying = false;
        numberContainerElement.textContent = numberToGuess;
        gameMessageElement.textContent = "You ran out of chances! Try again!";
        playButtonElement.classList.remove("hidden");
        playButtonElement.textContent = "Play Again";
        guessFromElement.classList.add("hidden");
        milliseconds = 0;
        numberOfGuesses = 0;
        return;
    }
    const difference = Math.abs(guessValue - numberToGuess);
    let hints;
    
    if (guessValue == numberToGuess) {
        clearInterval(timerInterval);
        isPlaying = false;
        disableSelectors()
        stopButtonElement.classList.add("hidden");
        numberContainerElement.textContent = numberToGuess;
        if (milliseconds > 600000) {
            hints = ["Took you long enough hehe", "Bingo! But you can do better!", "Weak! Try again!"];
        } else {
            hints = ["You guessed correctly! Amazing!", "Bingo! You're a mind reader!", "Spot on! You're a guessing pro!"];
        }
        playButtonElement.classList.remove("hidden");
        playButtonElement.textContent = "Play Again";
        guessFromElement.classList.add("hidden");

        if (difficulty == "easy") {
            if (HighScoreForEasy == 0 || milliseconds < HighScoreForEasy) {
                HighScoreForEasy = milliseconds;
                highscoreTimerElement.textContent = formatTime(HighScoreForEasy);
                updateDoc(doc(db, 'users', currentUser.uid), {
                    highScoreForEasy: HighScoreForEasy,
                })
                setDoc(doc(db, 'easy', currentUser.uid), {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    numberOfGuesses: numberOfGuesses + 1,
                    highScoreForEasy: HighScoreForEasy,
                })
            } 
        } else if (difficulty == "medium") {
            if (HighScoreForMedium == 0 || milliseconds < HighScoreForMedium) {
                HighScoreForMedium = milliseconds;
                highscoreTimerElement.textContent = formatTime(HighScoreForMedium);
                updateDoc(doc(db, 'users', currentUser.uid), {
                    highScoreForMedium: HighScoreForMedium,
                })
                setDoc(doc(db, 'medium', currentUser.uid), {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    numberOfGuesses: numberOfGuesses + 1,
                    highScoreForMedium: HighScoreForMedium,
                })
            } 
            numberOfGuesses = 0;
        } else if (difficulty == "hard") {
            if (HighScoreForHard == 0 || milliseconds < HighScoreForHard) {
                HighScoreForHard = milliseconds;
                highscoreTimerElement.textContent = formatTime(HighScoreForHard);
                updateDoc(doc(db, 'users', currentUser.uid), {
                    highScoreForHard: HighScoreForHard,
                })
                setDoc(doc(db, 'hard', currentUser.uid), {
                    uid: currentUser.uid,
                    displayName: currentUser.displayName,
                    numberOfGuesses: numberOfGuesses + 1,
                    highScoreForHard: HighScoreForHard,
                })
            } 
        }
        milliseconds = 0;
    } else if (guessValue > numberToGuess) {
        if (difference < 6) {
            hints = ["Almost there! Your guess is high, but very close.", "You're getting warmer! High, but close.", "Just a bit high! Almost nailed it."];
        } else {
            hints = ["Your guess is too high.", "A bit too much! Aim lower.", "Too high! Try a lower number."];
        }
    } else if (guessValue < numberToGuess) {
        if (difference < 6) {
            hints = ["Almost there! Your guess is low, but very close.", "You're getting warmer! Low, but close.", "Just a bit low! Almost there."];
        } else {
            hints = ["Your guess is too low.", "A bit too less! Aim higher.", "Too low! Try a higher number."];
        }
    }
    
    const randomHint = hints[Math.floor(Math.random() * hints.length)];
    gameMessageElement.textContent = randomHint;

    numberOfGuesses++;
    attemptsElement.textContent = numberOfGuesses;
    guessInputElement.value = "";
    guessInputElement.focus();
}



