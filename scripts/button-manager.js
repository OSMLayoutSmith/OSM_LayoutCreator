let currentEditingInfo = null;
let currentIconData = null;

function promptAddButton() {
  if (!currentIconData) {
    showAlert("Please, first select an icon.");
    return;
  }

  showPrompt("New button name", "e.g. button1", function (buttonName) {
    const trimmedName = buttonName.trim();
    if (!trimmedName) {
      showAlert("Please enter a valid button name.");
      return;
    }

    // Get current layout from core system
    const currentLayoutName = getCurrentMockupLayoutName();
    const layout = findLayoutByName(currentLayoutName);

    if (!layout) {
      showAlert("Error: Current layout not found.");
      return;
    }

    // Create button using core Button class
    const iconFileName = iconUploader.files[0].name;
    const activeLayout = folderManager.getActiveLayout();
    const layoutName = activeLayout.metadata.layoutName || currentLayoutName;

    const button = new Button(
      layoutName, // folder
      currentLayoutName, // origin layout
      "tag", // type
      {}, // labels (will be populated)
      iconFileName, // icon
      "#" // targetlayout
    );

    // Add labels for all selected languages
    const selectedLanguages = window.getSelectedLanguages
      ? window.getSelectedLanguages()
      : ["en"];
    selectedLanguages.forEach((lang) => {
      button.addLabel(lang, trimmedName);
    });

    // Store icon data for download
    button.data = currentIconData;

    // Add icon to layout icons collection
    activeLayout.icons[iconFileName] = currentIconData;

    // Add button to layout
    layout.addButton(button);

    renderButtonList();
    updateMockup();

    // Clear icon selection
    iconUploader.value = "";
    document.getElementById("iconPreview").innerHTML = "";
    addButtonBtn.disabled = true;
    currentIconData = null;
  });
}

function editButton(layoutName, buttonIndex) {
  currentEditingInfo = { layoutName, buttonIndex };
  const layout = findLayoutByName(layoutName);

  if (!layout || buttonIndex >= layout.buttons.length) {
    showAlert("Button not found.");
    return;
  }

  const button = layout.buttons[buttonIndex];

  // Prepare the modal with multilingual support
  window.currentEditingButton = button;
  prepareButtonModal(button);

  document.getElementById("buttonNameInput").value = getDisplayLabel(button);
  document.getElementById("buttonImageInput").value = button.icon;
  showModal();
}

function saveButton() {
  if (!currentEditingInfo) return;
  const { layoutName, buttonIndex } = currentEditingInfo;

  const layout = findLayoutByName(layoutName);
  if (!layout || buttonIndex >= layout.buttons.length) {
    showAlert("Button not found.");
    return;
  }

  const button = layout.buttons[buttonIndex];
  const newName = document.getElementById("buttonNameInput").value.trim();

  if (!newName) {
    showAlert("Please insert a name for the button.");
    return;
  }

  // Save multilingual labels
  saveButtonLabels(button);

  renderButtonList();
  updateMockup();
  closeModal();
}

function handleSubfolder() {
  if (!currentEditingInfo) return;
  const { layoutName, buttonIndex } = currentEditingInfo;

  const layout = findLayoutByName(layoutName);
  if (!layout || buttonIndex >= layout.buttons.length) {
    showAlert("Button not found.");
    return;
  }

  const button = layout.buttons[buttonIndex];

  if (button.type === "tag") {
    showConfirm(
      `Convert "${getDisplayLabel(
        button
      )}" to a subfolder? You can't undo this action.`,
      function () {
        // Create new sublayout
        const sublayoutName =
          button.labels.en?.replace(/\s+/g, "_") + "_layout" ||
          getDisplayLabel(button).replace(/\s+/g, "_") + "_layout";

        console.log("punto de debug");
        console.log(button.labels.en);
        console.log(getDisplayLabel(button));
        console.log(sublayoutName);
        console.log("punto de debug: fin");
        // Change button type to page
        button.type = "page";
        button.targetlayout = sublayoutName;

        // Create the new layout in the XML file
        const activeLayout = folderManager.getActiveLayout();
        const newLayout = new Layout(sublayoutName);
        activeLayout.xmlFile.addLayout(newLayout);

        showAlert(`"${getDisplayLabel(button)}" is now a subfolder.`);
        renderButtonList();
        updateMockup();
        closeModal();
      }
    );
  } else {
    showAlert(`"${getDisplayLabel(button)}" is already a subfolder.`);
  }
}

function deleteButton(layoutName, buttonIndex) {
  const layout = findLayoutByName(layoutName);
  if (!layout || buttonIndex >= layout.buttons.length) {
    showAlert("Button not found.");
    return;
  }

  const button = layout.buttons[buttonIndex];
  const buttonLabel = getDisplayLabel(button);

  showConfirm(`Are you sure you want to delete "${buttonLabel}"?`, function () {
    layout.removeButton(buttonIndex);
    renderButtonList();
    updateMockup();
  });
}

function deleteButtonFromModal() {
  if (!currentEditingInfo) return;
  const { layoutName, buttonIndex } = currentEditingInfo;

  const layout = findLayoutByName(layoutName);
  if (!layout || buttonIndex >= layout.buttons.length) {
    showAlert("Button not found.");
    return;
  }

  const button = layout.buttons[buttonIndex];
  const buttonLabel = getDisplayLabel(button);

  showConfirm(`Are you sure you want to delete "${buttonLabel}"?`, function () {
    layout.removeButton(buttonIndex);
    renderButtonList();
    updateMockup();
    closeModal();
  });
}

function showConfirm(message, onConfirm) {
  const confirmModal = document.getElementById("confirmModal");
  if (!confirmModal) {
    alert(message); // fallback
    if (typeof onConfirm === "function") onConfirm();
    return;
  }
  document.getElementById("confirmMessage").textContent = message;
  confirmModal.style.display = "flex";

  const yesBtn = document.getElementById("confirmYesBtn");
  const noBtn = document.getElementById("confirmNoBtn");
  yesBtn.onclick = function () {
    confirmModal.style.display = "none";
    onConfirm();
  };
  noBtn.onclick = function () {
    confirmModal.style.display = "none";
  };
}

// Helper function to get current mockup layout name
function getCurrentMockupLayoutName() {
  if (currentMockupPath && currentMockupPath.length > 0) {
    return currentMockupPath[currentMockupPath.length - 1];
  }
  return "root";
}

// Helper function to navigate to a sublayout
function navigateToSublayout(targetlayoutName) {
  if (!currentMockupPath.includes(targetlayoutName)) {
    currentMockupPath.push(targetlayoutName);
    updateMockup();
  }
}
