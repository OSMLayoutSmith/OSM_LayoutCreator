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
