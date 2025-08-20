// Legacy function - now uses core system
function findCurrentList(path) {
  console.warn("findCurrentList is deprecated. Use findLayoutByName instead.");
  
  const currentLayoutName = path && path.length > 0 ? path[path.length - 1] : "root";
  const layout = findLayoutByName(currentLayoutName);
  return layout ? layout.buttons : [];
}

function toggleNavbar() {
  const menu = document.getElementById("navMenu");
  menu.classList.toggle("active");
}

// Helper function to get a layout by name from the core system
function getLayoutByName(layoutName) {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return null;
  
  return activeLayout.xmlFile.layouts[layoutName];
}

// Helper function to create a new layout in the core system
function createNewLayout(layoutName) {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return null;
  
  const newLayout = new Layout(layoutName);
  activeLayout.xmlFile.addLayout(newLayout);
  return newLayout;
}

// Helper function to remove a layout from the core system
function removeLayout(layoutName) {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return false;
  
  activeLayout.xmlFile.removeLayout(layoutName);
  return true;
}

// Helper function to move a button between layouts
function moveButtonBetweenLayouts(fromLayoutName, buttonIndex, toLayoutName) {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return false;
  
  activeLayout.xmlFile.moveButton(fromLayoutName, buttonIndex, toLayoutName);
  return true;
}

// Helper function to get all available layouts
function getAllLayouts() {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return {};
  
  return activeLayout.xmlFile.layouts;
}

// Helper function to get all button icons
function getAllIcons() {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return {};
  
  return activeLayout.icons || {};
}

// Helper function to add an icon to the system
function addIconToSystem(fileName, base64Data) {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return false;
  
  if (!activeLayout.icons) {
    activeLayout.icons = {};
  }
  
  activeLayout.icons[fileName] = base64Data;
  return true;
}

// Helper function to remove an icon from the system
function removeIconFromSystem(fileName) {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout || !activeLayout.icons) return false;
  
  delete activeLayout.icons[fileName];
  return true;
}

// Helper function to validate layout structure
function validateLayoutStructure() {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) {
    return { valid: false, errors: ["No active layout"] };
  }
  
  const errors = [];
  
  // Check if root layout exists
  if (!activeLayout.xmlFile.layouts["root"]) {
    errors.push("Root layout is missing");
  }
  
  // Check if at least one language exists
  if (activeLayout.xmlFile.getLanguages().length === 0) {
    errors.push("No languages defined");
  }
  
  // Check metadata
  if (!activeLayout.metadata || !activeLayout.metadata.layoutName) {
    errors.push("Layout name is missing in metadata");
  }
  
  return {
    valid: errors.length === 0,
    errors: errors
  };
}

// Helper function to export layout structure for debugging
function exportLayoutStructure() {
  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) return null;
  
  return {
    layoutName: activeLayout.metadata?.layoutName,
    languages: activeLayout.xmlFile.getLanguages(),
    layouts: Object.keys(activeLayout.xmlFile.layouts),
    icons: Object.keys(activeLayout.icons || {}),
    metadata: {
      options: activeLayout.metadata?.options || [],
      github: {
        username: activeLayout.metadata?.username,
        repo: activeLayout.metadata?.repo,
        branch: activeLayout.metadata?.branch
      }
    }
  };
}

// Helper function to reset the system
function resetLayoutSystem() {
  if (folderManager) {
    const layouts = folderManager.listLayouts();
    layouts.forEach(layoutName => {
      folderManager.deleteLayout(layoutName);
    });
  }
  
  // Reinitialize
  initializeFolderManager();
  currentMockupPath = ["root"];
  currentIconData = null;
  
  // Clear UI
  document.getElementById("layoutName").value = "";
  document.getElementById("layoutDesc").value = "";
  document.getElementById("layoutREADME").value = "";
  document.getElementById("iconPreview").innerHTML = "";
  document.getElementById("addButtonBtn").disabled = true;
  
  // Reset language selection
  if (window.setSelectedLanguages) {
    window.setSelectedLanguages(['en']);
  }
  
  renderButtonList();
  updateMockup();
}