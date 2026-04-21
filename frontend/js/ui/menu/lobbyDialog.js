const modal = document.getElementById("lobbyDialog");

document.getElementById("openBtn").onclick = () => {
  modal.classList.remove("hidden");
};

document.getElementById("closeBtn").onclick = () => {
  modal.classList.add("hidden");
};