function generateXML() {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) {
    showAlert("No layout loaded.");
    return "";
  }

  const selectedLanguage = document.getElementById("language").value || "en";
  
  // Use the core XMLFile class to generate XML
  return activeLayout.xmlFile.toString(selectedLanguage);
}

function generateMetadata() {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) {
    showAlert("No layout loaded.");
    return "";
  }

  const layoutName = document.getElementById("layoutName").value || activeLayout.metadata.layoutName;
  const description = document.getElementById("layoutREADME").value;
  const selectedLanguage = document.getElementById("language").value || "en";

  // Update metadata with current form values
  if (layoutName) {
    activeLayout.metadata.layoutName = layoutName;
  }
  
  // Update description for the selected language
  if (description) {
    const existingOption = activeLayout.metadata.options.find(opt => opt[0] === selectedLanguage);
    if (existingOption) {
      existingOption[2] = description;
    } else {
      const langName = languages[selectedLanguage] || selectedLanguage.toUpperCase();
      activeLayout.metadata.addOption(selectedLanguage, langName, description);
    }
  }

  // Use the core Metadata class to generate metadata XML
  return activeLayout.metadata.toString();
}

function generateReadme() {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) { return "# Layout\n\nNo description available."; }
  
  let readme = document.getElementById("layoutREADME").value || "";

  // Update the layout's readme
  activeLayout.readme = readme || "# Layout\n\nNo description available.";
  return activeLayout.readme;
}

// Helper function to get all unique languages from the system
function getAllSystemLanguages() {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return ['en'];
  
  return activeLayout.xmlFile.getLanguages();
}

// Helper function to update layout information from form
function updateLayoutFromForm() {
  const layoutTitle = document.getElementById("layoutDesc").value;
  const selection = document.getElementById("layoutDescLang").value;
  const description = document.getElementById("layoutREADME").value;
  
  if (layoutTitle) {
    setLayoutDownloadDescription(selection,layoutTitle);
  }
  
  if (description) {
    setLayoutREADME(description);
  }
}