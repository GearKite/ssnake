<script lang="ts">
  import "./main.css";

  export let score: number = 0;

  export let playAgain: Function;
  export let mainMenu: Function;

  export let diedBy: string = "";
</script>

<div class="center">
  <br />
  <h1 class="large-text">Game over!</h1>
  <h2 class="medium-text">Score: {score}</h2>
  <h2 class="small-text">Killed by: {diedBy}</h2>
  <br />

  <button
    on:click={() => {
      playAgain();
    }}>Play again</button
  >
  <button
    on:click={() => {
      mainMenu();
    }}>Return to main menu</button
  >
  <br />
  <footer></footer>
  <br />
</div>
