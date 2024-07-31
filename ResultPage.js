import { createClient } from "https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm";

const supabaseUrl = "https://lzompqhjraehtoldmshf.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imx6b21wcWhqcmFlaHRvbGRtc2hmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MjIyNTY3MDYsImV4cCI6MjAzNzgzMjcwNn0.8u0HsP9LoMZn01afEB6P0pxHVhrSBSJ8Py1Sam5B74k";
const supabase = createClient(supabaseUrl, supabaseKey);

document.addEventListener("DOMContentLoaded", async () => {
  const gameId = sessionStorage.getItem("gameId");

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
