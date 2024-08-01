import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://lzompqhjraehtoldmshf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b21wcWhqcmFlaHRvbGRtc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyNTY3MDYsImV4cCI6MjAzNzgzMjcwNn0.8u0HsP9LoMZn01afEB6P0pxHVhrSBSJ8Py1Sam5B74k";
const supabase = createClient(supabaseUrl, supabaseKey);

// Body
const body = document.body;

// Events
const LoadMainPage = new CustomEvent("LoadMainPage");

const LoadResultPage = new CustomEvent("LoadResultPage");

const GameEnd = new CustomEvent("GameEnd");

// main page
function getMainPage() {
  return `
  <div class="container">
      <div class="flex">
        <div class="player-container" id="player1-container">
          <img
            src="Images/player2.jpeg"
            alt="a player img"
            class="player-img"
            width="30px"
            height="30px"
          />
          <div class="pen-name">
            <p class="player-name">Player1</p>
          </div>
        </div>
        <img
          src="Images/memory.jpg"
          alt="a memory icon img"
          class="memory-img-main"
          width="30px"
          height="30px"
        />
        <div class="player-container" id="player2-container">
          <img
            src="Images/player2.jpeg"
            alt="a player img"
            class="player-img"
            width="30px"
            height="30px"
          />
          <div class="pen-name">
            <p class="player-name">Player2</p>
          </div>
        </div>
      </div>
      <div class="time-startgame-container">
        <p id="player1-score">Player1 score: 0</p>
        <div class="startbutton-timer">
          <button id="startgame-button">Start Game</button>
          <div id="time"></div>
        </div>
        <p id="player2-score">Player2 score: 0</p>
      </div>
      <div class="grid-container" id="grid-container"></div>
    </div>
`;
}

// result page
function getResultPage() {
  return `
  <div class="res-container">
      <div class="result">
        <img
          src="Images/memory.jpg"
          alt="a memory icon img"
          class="memory-img-result"
          width="30"
          height="30"
        />
        <p class="winner"></p>
        <p class="score"></p>

        <div class="history-table">
          <p>History</p>
          <div class="table"></div>
        </div>
      </div>
    </div>
`;
}

// event functions
function showMainPage() {
  body.innerHTML = getMainPage();

  document.dispatchEvent(LoadMainPage);
}

document.addEventListener("DOMContentLoaded", () => {
  showMainPage();
});

document.addEventListener("GameEnd", () => {
  setTimeout(() => {
    body.innerHTML = getResultPage();

    document.dispatchEvent(LoadResultPage);
  }, 500);
});

// mainPage js--------------------------------------------------------------------------------------------------------
document.addEventListener("LoadMainPage", () => {
  const timeValue = document.getElementById("time");
  const startGameButton = document.getElementById("startgame-button");
  const gridContainer = document.getElementById("grid-container");
  const player1ScoreElement = document.getElementById("player1-score");
  const player2ScoreElement = document.getElementById("player2-score");

  let actions = []; // array to store the actions as strings ... like this (Player2|Opens cards 7 and 8|False)

  // Initial values of the game
  let gameIsStarted = 0;
  let x = Math.floor(Math.random() * 2) + 1; // Randomly choose player (random number 1 or 2)
  let currentPlayer = x; // (1 => player1) or (2 => player2)

  let player1Score = 0;
  let player2Score = 0;

  let numbers = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9]; // array contain the numbers (in pairs)
  let firstCard = null;
  let secondCard = null;
  let isChecking = false; // to prevent the player from flip cards while checking if the two cards are matched

  function selectRandomNumber() {
    // choose random number from the array above to assign it to the card
    let randomIndex = Math.floor(Math.random() * numbers.length);
    let randomNumber = numbers.splice(randomIndex, 1)[0];
    return randomNumber;
  }

  // Create the grid items
  for (let i = 0; i < 18; i++) {
    const gridItem = document.createElement("div");
    gridItem.classList.add("grid-item");
    gridItem.dataset.number = selectRandomNumber();
    gridItem.innerHTML = `
          <div class="grid-item-inner">
              <div class="grid-item-front"></div>
              <div class="grid-item-back">${gridItem.dataset.number}</div>
          </div>
      `;
    gridContainer.appendChild(gridItem);
  }

  gridContainer.addEventListener("click", showNumber);

  // timer (10 seconds)
  let timerInterval;
  let seconds = 10;

  const timer = () => {
    if (seconds >= 0) {
      let secondsValue = seconds < 10 ? `0${seconds}` : seconds; // check if the number is 1 digit (9,5,..) ==> add 0 ==> 09,05,..
      timeValue.innerHTML = `<span>Time:</span>00:${secondsValue}`;
      seconds--;
    } else {
      togglePlayer(); // when the timer ends ==> change the players turn
    }
  };

  const startOrEndGame = () => {
    // start or end the game
    if (gameIsStarted === 0) {
      gameIsStarted = 1;
      seconds = 10;
      timerInterval = setInterval(timer, 1000); // call timer every 1 seconds ... (timerInterval is the id returned)
      startGameButton.innerText = "End Game";
      // give the turn to the player which randomly selected
      if (currentPlayer === 1) {
        // if player 1
        document.getElementById("player1-container").classList.add("active");
      } else {
        // if player 2
        document.getElementById("player2-container").classList.add("active");
      }
    } else {
      gameIsStarted = 0;
      clearInterval(timerInterval); // stops the timerInterval from being called repeatedly
      timeValue.innerHTML = "";
      startGameButton.innerText = "Start Game";

      const gridItems = document.querySelectorAll(".grid-item");
      gridItems.forEach((item) => {
        item.classList.remove("flipped");
      });
      gridContainer.removeEventListener("click", showNumber); // Remove it when the game ends
      resetGame();
    }
  };

  startGameButton.addEventListener("click", startOrEndGame);

  // change the player turn (Switch turn)
  function togglePlayer() {
    if (gameIsStarted === 1) {
      seconds = 10;
      if (currentPlayer === 1) {
        // if player 1 ==> player 2
        document.getElementById("player1-container").classList.remove("active");
        document.getElementById("player2-container").classList.add("active");
        currentPlayer = 2; // player2
      } else {
        // if player 2 ==> player 1
        document.getElementById("player1-container").classList.add("active");
        document.getElementById("player2-container").classList.remove("active");
        currentPlayer = 1; // player1
      }
    }
  }

  // show the number ... flip the card
  function showNumber(event) {
    //console.log(event);
    const target = event.target.closest(".grid-item");
    if (
      target &&
      gameIsStarted === 1 &&
      !isChecking &&
      !target.classList.contains("flipped")
    ) {
      target.classList.add("flipped"); // The flipped class is added to the card that was clicked
      if (!firstCard) {
        firstCard = target; // this refers to the card that triggered the event
      } else if (!secondCard) {
        secondCard = target;
        isChecking = true;
        setTimeout(checkMatch, 1000);
      }
    }
  }

  // Function to store the action in the action array this format ==> (Player1|Opens cards 8 and 2|False)
  function storeAction(player, card1, card2, isMatch) {
    const matchStatus = isMatch ? "True" : "False";
    const action = `${player}|Opens cards ${card1} and ${card2}|${matchStatus}`;
    actions.push(action);
  }

  // check if the two cards matched
  function checkMatch() {
    const firstCardNumber = firstCard.dataset.number;
    const secondCardNumber = secondCard.dataset.number;

    // store the action for the current player's attempt
    storeAction(
      `Player${currentPlayer}`,
      firstCardNumber,
      secondCardNumber,
      firstCardNumber === secondCardNumber
    );

    if (firstCardNumber === secondCardNumber) {
      // if matched
      if (currentPlayer === 1) {
        player1Score++;
        player1ScoreElement.innerText = `Player1 score: ${player1Score}`;
      } else {
        player2Score++;
        player2ScoreElement.innerText = `Player2 score: ${player2Score}`;
      }
      seconds = 10;
      checkGameEnd();
    } else {
      // if not matched
      firstCard.classList.remove("flipped");
      secondCard.classList.remove("flipped");
      togglePlayer();
    }
    // clear the cards after choosing
    firstCard = null;
    secondCard = null;
    isChecking = false;
  }

  function checkGameEnd() {
    const gridItems = document.querySelectorAll(".grid-item");
    // select the items that don't have the class 'flipped' ... not flipped
    const unmatchedItems = Array.from(gridItems).filter(
      (item) => !item.classList.contains("flipped")
    );

    // if the length of the unmatched items is 0 ... then all are flipped ==> end game
    if (unmatchedItems.length === 0) {
      gameIsStarted = 0;
      clearInterval(timerInterval);
      timeValue.innerHTML = "Game Over!";
      startGameButton.innerText = "Start Game";

      // Determine the winner
      let winner;
      if (player1Score > player2Score) {
        winner = "Player 1";
      } else if (player2Score > player1Score) {
        winner = "Player 2";
      }

      // Save the results to the database
      saveResultsToDatabase(winner, player1Score, player2Score, actions);

      // Go to the result page ... to show the result
      document.dispatchEvent(GameEnd);
    }
  }

  // reset the game with the initial values
  function resetGame() {
    const gridItems = document.querySelectorAll(".grid-item");
    gridItems.forEach((item) => {
      item.classList.remove("flipped");
    });

    x = Math.floor(Math.random() * 2) + 1; // Randomly choose player (random number 1 or 2)
    currentPlayer = x; // 1=>player1 or 2=>player2

    document.getElementById("player1-container").classList.remove("active");
    document.getElementById("player2-container").classList.remove("active");
    player1Score = 0;
    player2Score = 0;
    player1ScoreElement.innerText = "Player1 score: 0";
    player2ScoreElement.innerText = "Player2 score: 0";
    numbers = [1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9]; // Reset numbers array
    gridContainer.innerHTML = "";

    for (let i = 0; i < 18; i++) {
      const gridItem = document.createElement("div");
      gridItem.classList.add("grid-item");
      gridItem.dataset.number = selectRandomNumber();
      gridItem.innerHTML = `
            <div class="grid-item-inner">
                <div class="grid-item-front"></div>
                <div class="grid-item-back">${gridItem.dataset.number}</div>
            </div>
        `;
      gridContainer.appendChild(gridItem);
    }

    actions = []; // Clear the actions array

    gridContainer.addEventListener("click", showNumber);
  }

  // Save results to the database
  async function saveResultsToDatabase(
    winner,
    player1Score,
    player2Score,
    actions
  ) {
    console.log("Saving results to database...");

    // Insert into the game table
    const { data: gameData, error: gameError } = await supabase
      .from("game")
      .insert([
        {
          winner: winner,
          player1_score: player1Score,
          player2_score: player2Score,
        },
      ])
      .select();

    if (gameError) {
      console.error("Error saving game data to database:", gameError);
      return;
    }

    console.log("Game data saved to database:", gameData);
    const gameId = gameData[0].id;

    const actionsData = actions.map((action) => {
      const [player_name, cards_number, success] = action.split("|");
      return {
        game_id: gameId,
        player_name: player_name,
        cards_number: cards_number,
        success: success === "True",
      };
    });

    // Insert into the actions table
    const { data: actionsDataResponse, error: actionsError } = await supabase
      .from("actions")
      .insert(actionsData);

    if (actionsError) {
      console.error("Error saving actions data to database:", actionsError);
    } else {
      console.log("Actions data saved to database:", actionsDataResponse);
      sessionStorage.setItem("gameId", gameId);
    }
  }
});

// ResultPage js--------------------------------------------------------------------------------------------------
document.addEventListener("LoadResultPage", async () => {
  const gameId = sessionStorage.getItem("gameId");
  console.log("Retrieved gameId:", gameId);

  if (!gameId) {
    console.error("No game ID has found.");
    return;
  }

  // Fetch the game data (Table game)
  const { data: gameData, error: gameError } = await supabase
    .from("game")
    .select("*")
    .eq("id", gameId)
    .single();

  if (gameError) {
    console.error("Error fetching game data:", gameError);
    return;
  }

  const { winner, player1_score, player2_score } = gameData;

  // Fetch the actions (Table actions)
  const { data: actionsData, error: actionsError } = await supabase
    .from("actions")
    .select("*")
    .eq("game_id", gameId);

  if (actionsError) {
    console.error("Error fetching actions data:", actionsError);
    return;
  }

  const winnerElement = document.querySelector(".winner");
  const scoreElement = document.querySelector(".score");
  const tableElement = document.querySelector(".history-table .table");

  // Winner and scores
  winnerElement.textContent = `Winner is ${winner}`;
  scoreElement.textContent = `Player 1: (${player1_score} points) , Player 2: (${player2_score} points)`;

  // Actions table
  const table = `
      <table>
        <thead>
          <tr>
            <th>Player Name</th>
            <th class="middle-th">Cards Number</th>
            <th>Success</th>
          </tr>
        </thead>
        <tbody>
          ${actionsData
            .map(
              (action) => `
            <tr>
              <td>${action.player_name}</td>
              <td>${action.cards_number}</td>
              <td>${action.success ? "True" : "False"}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  tableElement.innerHTML = table;
});
