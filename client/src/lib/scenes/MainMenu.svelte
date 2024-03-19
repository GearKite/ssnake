<script lang="ts">
  import "./main.css";

  export let joinGame: Function;
  export let serverURI: string =
    window.localStorage.getItem("server") || window.location.host;
</script>

<div class="center">
  <header>
    <h1 class="large-text">SSNAKE</h1>
  </header>

  <main>
    <form>
      <label for="input-username">Name:</label><br />
      <input type="text" id="input-username" name="username" /><br />

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
          joinGame(serverURI);
        }}
      /><br />
    </form>
  </main>

  <br />
  <footer></footer>
</div>
