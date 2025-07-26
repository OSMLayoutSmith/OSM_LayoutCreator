let promptCallback = null;

function showModal() {
  document.getElementById("buttonModal").classList.add("show");
}

function closeModal() {
  document.getElementById("buttonModal").classList.remove("show");
  currentEditingInfo = null;
}

function openConfigModal() {
  document.getElementById("configModal").classList.add("show");
}

function closeConfigModal() {
  document.getElementById("configModal").classList.remove("show");
}

function showAlert(message, title = "Information") {
  const modal = document.getElementById("alertModal");
  document.getElementById("alertTitle").innerText = title;
  document.getElementById("alertMessage").innerText = message;
  modal.classList.add("show");
}

function closeAlertModal() {
  document.getElementById("alertModal").classList.remove("show");
}

function showPrompt(title = "Enter Value", placeholder = "", callback) {
  document.getElementById("promptTitle").innerText = title;
  const input = document.getElementById("promptInput");
  input.placeholder = placeholder;
  input.value = "";

  window.promptCallback = callback; 

  document.getElementById("promptModal").classList.add("show");
  input.focus();
}

function confirmPrompt() {
  const value = document.getElementById("promptInput").value.trim();
  window.promptCallback(value);
  closePromptModal();
}

function closePromptModal() {
  document.getElementById("promptModal").classList.remove("show");
  window.promptCallback = null;
}