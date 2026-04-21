document.getElementById("start-online-game")?.addEventListener("click", async () => {
  logger.debug("Online Game button clicked");

  const container = document.getElementById("modal-container");
  const response = await fetch("/html/components/lobbyDialog.html");
  const html = await response.text();
  container.innerHTML = html;

  const modal = document.getElementById("lobbyDialog");
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