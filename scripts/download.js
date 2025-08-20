async function downloadLayout() {
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
    // Use the core ZipBuilder class
    const zipBuilder = new ZipBuilder(activeLayout);
    const zipData = await zipBuilder.generate(layoutName);
    
    // Create download link
    const blob = new Blob([zipData], { type: 'application/zip' });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${layoutName}.zip`;
    link.click();
    
    // Clean up
    URL.revokeObjectURL(link.href);
    
  } catch (error) {
    console.error("Error generating layout:", error);
    showAlert("Error generating layout: " + error.message);
  }
}

// Alternative download function for backward compatibility
function downloadLayoutLegacy() {
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

  const zip = new JSZip();
  const layoutFolder = zip.folder(layoutName);
  const iconsFolder = layoutFolder.folder(layoutName + "_icons");

  // Generate XML for all languages
  const languages = activeLayout.xmlFile.getLanguages();
  languages.forEach(lang => {
    const xmlContent = activeLayout.xmlFile.toString(lang);
    if (xmlContent && xmlContent !== "Nullable") {
      layoutFolder.file(`${lang}.xml`, xmlContent);
    }
  });

  // Add metadata
  zip.folder("metadata").file(`${layoutName}.xml`, generateMetadata());
  
  // Add README
  layoutFolder.file("README.md", generateReadme());

  // Add icons
  Object.entries(activeLayout.icons || {}).forEach(([fileName, base64Data]) => {
    iconsFolder.file(fileName, base64Data, { base64: true });
  });

  // Generate and download
  zip.generateAsync({ type: "blob" }).then((content) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${layoutName}.zip`;
    link.click();
  }).catch(error => {
    console.error("Error generating ZIP:", error);
    showAlert("Error generating ZIP file: " + error.message);
  });
}