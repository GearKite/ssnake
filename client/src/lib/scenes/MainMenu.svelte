<script lang="ts">
  import "./main.css";

  export let joinGame: Function;

  let serverURI: string;
  let playerName: string;

  if (window.localStorage.getItem("server") === null) {
    let defaultURI = window.location.host;

    // GitHub pages won't have the server
    if (defaultURI.endsWith("github.io")) {
      defaultURI = "ssnake.em.id.lv";
    }
    serverURI = defaultURI;
    window.localStorage.setItem("server", serverURI);
  } else {
    serverURI = window.localStorage.getItem("server")!;
  }

  if (window.localStorage.getItem("playerName") === null) {
    playerName = "player";
    window.localStorage.setItem("playerName", playerName);
  } else {
    playerName = window.localStorage.getItem("playerName")!;
  }
</script>

<div class="center">
  <header>
    <h1 class="large-text">SSNAKE</h1>
  </header>

  <main>
    <form>
      <label for="input-username">Name:</label><br />
      <input
        type="text"
        id="input-username"
        name="username"
        minlength="1"
        maxlength="16"
        bind:value={playerName}
        on:change={() => {
          window.localStorage.setItem("playerName", playerName);
        }}
      /><br />

      <label for="input-server">Server:</label><br />
      <input
        type="text"
        id="input-server"
        name="Server"
        placeholder={window.location.host}
        bind:value={serverURI}
        on:change={() => {
          window.localStorage.setItem("server", serverURI);
        }}
      /><br />

      <input
        type="button"
        id="input-join"
        value="Join game"
        on:click={() => {
          joinGame(serverURI, playerName);
        }}
      /><br />
    </form>
  </main>

  <br />
  <footer></footer>
</div>
