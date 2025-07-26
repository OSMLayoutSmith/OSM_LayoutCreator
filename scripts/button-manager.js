let currentEditingInfo = null;
let currentIconData = null;

function promptAddButton() {
  if (!currentIconData) {
    showAlert("Please, first select an icon.");
    return;
  }

  showPrompt("New button name", "e.g. button1", function (buttonName) {

    const currentList = findCurrentList(currentMockupPath);
    if (currentList) {
      currentList.push({
        type: "tag",
        label: buttonName.trim(),
        icon: iconUploader.files[0].name,
        data: currentIconData,
      });

      renderButtonList();
      updateMockup();

      // Limpiar
      iconUploader.value = "";
      document.getElementById("iconPreview").innerHTML = "";
      addButtonBtn.disabled = true;
      currentIconData = null;
    }
  });
}

function editButton(path, index) {
  currentEditingInfo = { path, index };
  const list = findCurrentList(path);
  const button = list[index];

  document.getElementById("buttonNameInput").value = button.label;
  document.getElementById("buttonImageInput").value = button.icon;
  showModal();
}

function saveButton() {
  if (!currentEditingInfo) return;
  const { path, index } = currentEditingInfo;

  const newName = document.getElementById("buttonNameInput").value.trim();
  if (!newName) {
    showAlert("Please insert a name for the button.");
    return;
  }

  const list = findCurrentList(path);
  list[index].label = newName;

  renderButtonList();
  updateMockup();
  closeModal();
}

function handleSubfolder() {
  if (!currentEditingInfo) return;
  const { path, index } = currentEditingInfo;
  const list = findCurrentList(path);
  const button = list[index];

  if (button.type === "tag") {
    if (
      confirm(
        `Convert "${button.label}" to a subfolder? You can´t undone this action.`
      )
    ) {
      button.type = "layout";
      button.subfolder = {
        name: button.label.replace(/\s+/g, "_") + "_layout",
        buttons: [],
      };
      showAlert(`"${button.label}" now is a subfolder.`);
      renderButtonList();
      updateMockup();
      closeModal();
    }
  } else {
    showAlert(`"${button.label}" is already a subfolder.`);
  }
}

function deleteButton(path, index) {
  const list = findCurrentList(path);
  const button = list[index];
  if (confirm(`Are you sure you want to delete "${button.label}"?`)) {
    list.splice(index, 1);
    renderButtonList();
    updateMockup();
  }
}

function deleteButtonFromModal() {
  if (!currentEditingInfo) return;
  const { path, index } = currentEditingInfo;
  const list = findCurrentList(path);
  list.splice(index, 1);
  renderButtonList();
  updateMockup();
  closeModal();
}