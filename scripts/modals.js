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
  
  //display none for all other modals class modal-content
  let modals = document.getElementsByClassName("modal");
  for (let i = 0; i < modals.length; i++) {
    modals[i].classList.remove("show");
  }

  document.getElementById("alertTitle").innerText = title;
  
  if (message.includes('<') || message.includes('>')) {
    document.getElementById("alertMessage").innerHTML = message.replace(/\n/g, '<br>');
  } else {
    document.getElementById("alertMessage").innerText = message;
  }
  
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