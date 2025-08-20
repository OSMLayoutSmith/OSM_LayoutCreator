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
  console.log("processDownloadLayout called - handled by DownloadLayout component");
}

function processUploadToGithub() {
  console.log("processUploadToGithub called - handled by UploadToGithub component");
}