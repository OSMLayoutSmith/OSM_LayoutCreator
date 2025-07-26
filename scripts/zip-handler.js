const zipDropArea = document.getElementById("zipDropArea");
const zipInput = document.getElementById("zipInput");
const zipFileName = document.getElementById("zipFileName");

["dragenter", "dragover"].forEach((event) => {
  zipDropArea.addEventListener(event, (e) => {
    e.preventDefault();
    e.stopPropagation();
    zipDropArea.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((event) => {
  zipDropArea.addEventListener(event, (e) => {
    e.preventDefault();
    e.stopPropagation();
    zipDropArea.classList.remove("dragover");
  });
});

zipInput.addEventListener("change", (e) => {
  if (zipInput.files[0]) {
    zipFileName.textContent = zipInput.files[0].name;
    document.getElementById("processZipBtn").disabled = false;
  } else {
    zipFileName.textContent = "";
    document.getElementById("processZipBtn").disabled = true;
  }
});

zipDropArea.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".zip")) {
    zipInput.files = e.dataTransfer.files;
    zipFileName.textContent = file.name;
    document.getElementById("processZipBtn").disabled = false;
  } else {
    showAlert("Only .zip files are allowed.");
    document.getElementById("processZipBtn").disabled = true;
  }
});

function processZipFile() {
  const file = zipInput.files[0];
  if (!file) {
    showAlert("Please upload a .zip file first.");
    return;
  }

  const formData = new FormData();
  formData.append('file', file);

  fetch('/api/loadFromZip', {
    method: 'POST',
    body: formData
  })
  .then(response => {
    if (!response.ok) {
      console.error(response);
      throw new Error("Failed to process the zip file.");
    }
    return response.json();
  })
  .then(data => {
    if (data.success) {
      layoutData = data.layoutData;
      currentMockupPath = ["root"];
      currentIconData = null;
      renderButtonList();
      updateMockup();
      showAlert("Zip file processed successfully.");
    } else {
      showAlert(data.error || "Zip file validation failed.");
    }
  })
  .catch(error => {
    console.error("Error processing zip file:", error);
    showAlert("Error processing zip file: " + error.message, "Error");
  });
}