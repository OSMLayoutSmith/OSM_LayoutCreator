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

    const reader = new FileReader();
    reader.onload = async function (e) {
        try {
            const buffer = e.target.result;
            
            const layoutName = await window.folderManager.importFromZipBuffer(buffer);
            layoutData = folderManager.getLayout(layoutName).xmlFile; 
            currentMockupPath = ["root"];
            currentIconData = null;

            renderInfoPanel();
            renderButtonList();
            updateMockup();
            showAlert(`Layout "${layoutName}" loaded successfully from ZIP.`);
        } catch (err) {
            console.error("Error processing zip file:", err);
            showAlert("Error processing zip file: " + err.message, "Error");
        }
    };

    reader.readAsArrayBuffer(file);
}


function updateUIFromLoadedLayout(layoutData) {
  // Update form fields
  if (layoutData.metadata) {
    document.getElementById("layoutName").value = layoutData.metadata.layoutName || layoutData.name;
    
    // Set description from first option
    if (layoutData.metadata.options.length > 0) {
      document.getElementById("layoutREADME").value = layoutData.metadata.options[0][2] || "";
    }
    
    // Update languages
    const languages = layoutData.metadata.options.map(opt => opt[0]);
    if (languages.length > 0 && window.setSelectedLanguages) {
      window.setSelectedLanguages(languages);
    }
  }
  
  // Parse title from README if available
  if (layoutData.readme) {
    const titleMatch = layoutData.readme.match(/^#\s*(.+)$/m);
    if (titleMatch) {
      document.getElementById("layoutDesc").value = titleMatch[1].trim();
    }
  }
}
