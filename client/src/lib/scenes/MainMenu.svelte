<script lang="ts">
</script>

<div class="center">
  <header>
    <h1 class="title">SSNAKE</h1>
  </header>

  <main>
    <form>
      <label for="input-username">Name:</label><br />
      <input type="text" id="input-username" name="username" /><br />

      <label for="input-lobby">Lobby:</label><br />
      <input
        type="text"
        id="input-lobby"
        name="Lobby"
        value="main"
        placeholder="main"
      /><br />

      <input type="button" id="input-join" value="Join game" /><br />
    </form>
  </main>

  <br />
  <footer></footer>
</div>

<style>
  .center {
    width: 1024px;
    height: 768px;

    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: column;
  }

  .title {
    font-size: 72px;
  }
</style>
