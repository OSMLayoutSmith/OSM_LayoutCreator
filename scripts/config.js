function toggleConfigMode() {
  const mode = document.getElementById("configMode").value;
  document.getElementById("downloadSettings").style.display =
    mode === "download" ? "block" : "none";
  document.getElementById("uploadSettings").style.display =
    mode === "upload" ? "block" : "none";
  document.getElementById("zipSettings").style.display =
    mode === "zip" ? "block" : "none";
}

function processDownloadLayout() {
  showAlert("Download process initiated.");
}

function processUploadToGithub() {
  showAlert("Upload process initiated.");
}