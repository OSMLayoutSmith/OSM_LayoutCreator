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

async function processUploadToGithub(){
  const layoutName = document.getElementById("layoutName").value;
  if (!layoutName) {
    showAlert("Insert a name for the layout.");
    return;
  }

  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) {
    showAlert("No layout loaded.");
    return;
  }

  // Update layout information from form
  updateLayoutFromForm();

  try {
    // Generar el ZIP en memoria
    const zipBuilder = new ZipBuilder(activeLayout);
    const zipData = await zipBuilder.generate(layoutName); // devuelve ArrayBuffer/Uint8Array

    // Convertirlo a Blob
    const blob = new Blob([zipData], { type: "application/zip" });

    // Armar el FormData
    const formData = new FormData();
    formData.append("zipfile", blob, `${layoutName}.zip`);

    // Hacer el POST
    const response = await fetch("https://osmbackend-production.up.railway.app/api/upload-zip", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
    }

    const result = await response.json();
    console.log("✅ Upload result:", result);

    // Mostrar feedback en la UI
    showAlert(`Layout "${layoutName}" uploaded successfully!`);

    return result;
  } catch (error) {
    console.error("Error uploading layout:", error);
    showAlert("Error uploading layout: " + error.message);
  }
}
