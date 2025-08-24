function toggleConfigMode() {
  const mode = document.getElementById("configMode").value;
  document.getElementById("downloadSettings").style.display =
    mode === "download" ? "block" : "none";
  document.getElementById("uploadSettings").style.display =
    mode === "upload" ? "block" : "none";
  document.getElementById("zipSettings").style.display =
    mode === "zip" ? "block" : "none";
}

async function processDownloadLayout() {
  const layoutName = document.getElementById("layoutRepoName").value;
  const repo = document.getElementById("repoName").value;
  const owner = document.getElementById("repoOwner").value;
  const branch = document.getElementById("repoBranch").value;

  if (!layoutName || !repo || !owner || !branch) {
    showAlert("Please fill in all download fields (Layout, Repo, Owner, Branch).");
    return;
  }

  try {
    const body = {
      mode: "custom",
      name: layoutName,
      repo: repo,
      owner: owner,
      branch: branch
    };

    const response = await fetch("https://osmbackend-production.up.railway.app/api/download", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`);
    }

    // 👉 Recibir como ArrayBuffer
    const buffer = await response.arrayBuffer();

    // 👉 Reutilizar la lógica de carga del ZIP en memoria
    const importedLayoutName = await window.folderManager.importFromZipBuffer(buffer);

    layoutData = folderManager.getLayout(importedLayoutName).xmlFile; 
    currentMockupPath = ["root"];
    currentIconData = null;

    renderInfoPanel();
    renderButtonList();
    updateMockup();

    showAlert(`Layout "${importedLayoutName}" loaded successfully from GitHub.`);
    console.log("📂 Estructura cargada:", window.folderManager.toString());

  } catch (error) {
    console.error("Error downloading layout:", error);
    showAlert("Error downloading layout: " + error.message);
  }
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
