document.getElementById("start-online-game")?.addEventListener("click", async () => {
  logger.debug("Online Game button clicked");

  const container = document.getElementById("lobbyContainer");
  const response = await fetch("/html/components/lobby-dialog.html");
  const html = await response.text();
  container.innerHTML = html;

  const modal = document.getElementById("lobby-dialog");
  const overlay = modal?.querySelector(".overlay");
  const closeBtn = document.getElementById("closeBtn");

  modal.classList.remove("hidden");

  const close = () => {
    modal.classList.add("hidden");
    container.innerHTML = "";
  };

  closeBtn?.addEventListener("click", close);
  overlay?.addEventListener("click", close);
});