const { use } = require("react");

function toggleConfigMode() {
  const mode = document.getElementById("configMode").value;
  document.getElementById("downloadSettings").style.display =
    mode === "download" ? "block" : "none";
  document.getElementById("uploadSettings").style.display =
    mode === "upload" ? "block" : "none";
  document.getElementById("zipSettings").style.display =
    mode === "zip" ? "block" : "none";
}

function toggleDefaultConfig() {
  const useDefault = document.getElementById("useDefault");
  const fields = ["repoName", "repoOwner", "repoBranch", "gh_token"];
  fields.forEach(id => {
    document.getElementById(id).disabled = useDefault.checked;
  });
  if (useDefault.checked) {
    document.getElementById("repoName").value = "osmtracker-android-layouts";
    document.getElementById("repoOwner").value = "OSMLayoutSmith";
    document.getElementById("repoBranch").value = "master";
    document.getElementById("gh_token").placeholder = "gh_abc123...";
    document.getElementById("gh_token").style.display = "none";
    document.getElementById("tokenLabel").style.display = "none";
  }
  else {
    document.getElementById("gh_token").style.display = "block";
    document.getElementById("tokenLabel").style.display = "block";
  }
}

function toggleDefaultConfigUpload() {
  const useDefault = document.getElementById("useDefaultUpload");
  const fields = ["upstreamRepo", "upstreamOwner", "baseBranch"];
  fields.forEach(id => {
    document.getElementById(id).disabled = useDefault.checked;
  });
  if (useDefault.checked) {
    document.getElementById("upstreamRepo").value = "osmtracker-custom-layouts";
    document.getElementById("upstreamOwner").value = "OSMLayoutSmith";
    document.getElementById("baseBranch").value = "master";
    document.getElementById("gh_token_upload").placeholder = "gh_abc123...";
    document.getElementById("gh_token_upload").style.display = "none";
    document.getElementById("tokenLabel_upload").style.display = "none";
  }
  else {
    document.getElementById("gh_token_upload").style.display = "block";
    document.getElementById("tokenLabel_upload").style.display = "block";
  }
}
async function processDownloadLayout() {
  const layoutName = document.getElementById("layoutRepoName").value;
  const repo = document.getElementById("repoName").value;
  const owner = document.getElementById("repoOwner").value;
  const branch = document.getElementById("repoBranch").value;
  const token = document.getElementById("gh_token").value;
  const useDefault = document.getElementById("useDefault").checked;
  if (!useDefault && (!layoutName || !repo || !owner || !branch)) {
    showAlert("Please fill in all download fields (Layout, Repo, Owner, Branch).");
    return;
  }
  if (useDefault && !layoutName) {
    showAlert("Please provide a layout name.");
    return;
  }

  try {
    const body = {};
    if (useDefault) {
      body.mode = "default";
      body.name = layoutName;
    } else {
      body.mode = "custom";
      body.name = layoutName;
      body.repo = repo;
      body.owner = owner;
      body.branch = branch;
      if (token) {
        body.token = token;
      }
    }

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

    const buffer = await response.arrayBuffer();

    const importedLayoutName = await window.folderManager.importFromZipBuffer(buffer);

    layoutData = folderManager.getLayout(importedLayoutName).xmlFile;
    currentMockupPath = ["root"];
    currentIconData = null;

    renderInfoPanel();
    renderButtonList();
    updateMockup();

    showAlert(`Layout "${importedLayoutName}" loaded successfully from GitHub.`);
  } catch (error) {
    showAlert("Error downloading layout: " + error.message);
  }
}

async function processUploadToGithub() {
  const layoutName = document.getElementById("layoutName").value;
  if (!layoutName) {
    showAlert("Please provide a layout name.");
    return;
  }

  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) {
    showAlert("No layout available for uploading!");
    return;
  }

  // Update layout information from form
  updateLayoutFromForm();

  const useDefault = document.getElementById("useDefaultUpload").checked;
  const owner = document.getElementById("upstreamOwner").value;
  const repo = document.getElementById("upstreamRepo").value;
  const branch = document.getElementById("baseBranch").value;
  const token = document.getElementById("gh_token_upload").value;
  const mode = useDefault ? "default" : "custom";

  if (!useDefault && (!owner || !repo || !branch)) {
    showAlert("Please fill in all upload fields (Upstream Owner, Upstream Repo, Base Branch).");
    return;
  }

  try {
    const zipBuilder = new ZipBuilder(activeLayout);
    const zipData = await zipBuilder.generate(layoutName);

    const blob = new Blob([zipData], { type: "application/zip" });

    const formData = new FormData();
    formData.append("zipfile", blob, `${layoutName}.zip`);

    formData.append("mode", mode);           
    if (mode === "custom") {
      formData.append("owner", owner);
      formData.append("repo", repo);
      formData.append("baseBranch", branch); 
      if (token) formData.append("token", token);
    }
    
    const response = await fetch("https://osmbackend-production.up.railway.app/api/upload-zip", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      const errText = await response.text().catch(() => "");
      throw new Error(`Upload failed: ${response.status} ${response.statusText} ${errText}`);
    }

    const result = await response.json();

    showAlert(`Layout "${layoutName}" uploaded successfully!<br><a href="${result.url}" target="_blank">${result.url}</a>`);

    return result;
  } catch (error) {
    console.error("Error uploading layout:", error);
    showAlert("Error uploading layout: " + error.message);
  }

}
