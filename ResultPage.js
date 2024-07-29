document.addEventListener("DOMContentLoaded", () => {
  // Get the data from the session storage... by sessionStorage.getItem
  const winner = sessionStorage.getItem("winner");
  const player1Score = sessionStorage.getItem("player1Score");
  const player2Score = sessionStorage.getItem("player2Score");
  const actions = JSON.parse(sessionStorage.getItem("actions") || "[]");

  const winnerElement = document.querySelector(".winner");
  const scoreElement = document.querySelector(".score");
  const tableElement = document.querySelector(".history-table .table");

  // Display the winner and scores
  winnerElement.textContent = `"Winner is ${winner}"`;
  scoreElement.textContent = `Player 1: (${player1Score} points) , Player 2: (${player2Score} points)`;

  // the table that's contains the history
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
          ${actions
            .map(
              (action) => `
            <tr>
              <td>${action.split("|")[0]}</td>
              <td>${action.split("|")[1]}</td>
              <td>${action.split("|")[2]}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    `;
  tableElement.innerHTML = table;
});
