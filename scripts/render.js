let currentMockupPath = ["root"];

// Variable global para el botón que se está editando
window.currentEditingButton = null;

function renderInfoPanel() {
  const nameElement = document.getElementById("layoutName");
  const descElement = document.getElementById("layoutDesc");
  const readmeElement = document.getElementById("layoutREADME");
  const activeLayout = folderManager?.getActiveLayout();

  const languages = document.getElementById("languageButtonsGrid");
  languages.innerHTML = "";

  if (activeLayout) {
    nameElement.value = activeLayout.metadata?.layoutName || activeLayout.name;
    descElement.value = activeLayout.metadata?.getOptions()[0][2] || "No description available.";
    readmeElement.value = activeLayout.readme || "";

    // Render language buttons
    const availableLangs = activeLayout.xmlFile?.getLanguages?.() || [];

    if (availableLangs.length > 0) {
      // Sincronizar con el sistema central
      if (window.setSelectedLanguages) {
        window.setSelectedLanguages(availableLangs);
      }

      // Actualizar la UI relacionada
      updateUIFromLoadedLayout(activeLayout.xmlFile);
      renderButtonList();
      updateMockup();
    } else {
      languages.innerHTML = `
    <p style="color: #718096; text-align: center; font-style: italic;">
      No languages available
    </p>
  `;
    }
  } else {
    nameElement.value = "No layout loaded";
    descElement.value = "";
    readmeElement.value = "";
  }
}

function renderButtonList() {
  const listElement = document.getElementById("buttonList");
  listElement.innerHTML = "";

  const activeLayout = folderManager?.getActiveLayout();
  if (!activeLayout) {
    listElement.innerHTML = '<p style="color: #718096; text-align: center; font-style: italic;">No layout loaded</p>';
    return;
  }
  const layouts = activeLayout.xmlFile.layouts;
  const rootLayout = layouts["root"];

  if (!rootLayout || rootLayout.buttons.length === 0) {
    listElement.innerHTML = '<p style="color: #718096; text-align: center; font-style: italic;">No buttons added yet</p>';
    return;
  }

  const renderLevel = (layout, level = 0) => {
    if (!layout || !layout.buttons) return;

    layout.buttons.forEach((button, index) => {
      const div = document.createElement("div");
      div.className = "button-item";
      div.style.marginLeft = `${level * 20}px`;

      let iconHtml = "";
      if (button.data) {
        iconHtml = `<img src="data:image/png;base64,${button.data}" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 10px;">`;
      } else if (button.type === "page") {
        iconHtml = "📁 ";
      } else if (button.type === "textnote") {
        iconHtml = "📝 ";
      } else if (button.type === "voicerec") {
        iconHtml = "🔴 ";
      } else if (button.type === "picture") {
        iconHtml = "📷 ";
      } else {
        iconHtml = "🔘 ";
      }

      const displayLabel = getDisplayLabel(button);

      div.innerHTML = `
        <div class="button-info">${iconHtml}${displayLabel}</div>
        <div class="button-actions">
          <button class="btn-edit" onclick='editButton("${layout.name}", ${index})'>Edit</button>
        </div>
      `;
      listElement.appendChild(div);

      // If it's a page button, render its sublayout
      if (button.type === "page" && button.targetLayout) {
        const sublayout = layouts[button.targetLayout];
        if (sublayout) {
          renderLevel(sublayout, level + 1);
        }
      }
    });
  };

  renderLevel(rootLayout, 0);
}

function updateMockup() {
  const grid = document.getElementById("mockButtonGrid");
  grid.innerHTML = "";

  // Fixed buttons (always present)
  const fixedButtons = [
    { icon: "🔴", label: "Voice record" },
    { icon: "📷", label: "Take photo" },
    { icon: "📝", label: "Text note" }
  ];

  fixedButtons.forEach((fixed) => {
    const btn = document.createElement("div");
    btn.className = "mock-button fixed-button";

    const iconDiv = document.createElement("div");
    iconDiv.className = "icon";
    iconDiv.textContent = fixed.icon;

    const label = document.createElement("span");
    label.textContent = fixed.label;

    btn.appendChild(iconDiv);
    btn.appendChild(label);
    grid.appendChild(btn);
  });

  // Get current layout
  const currentLayoutName = getCurrentMockupLayoutName();
  const currentLayout = findLayoutByName(currentLayoutName);

  if (!currentLayout) {
    return;
  }

  // Add custom buttons
  currentLayout.buttons.forEach((button, index) => {
    const btnElement = document.createElement("div");
    btnElement.className = "mock-button has-custom-icon";

    const iconDiv = document.createElement("div");
    iconDiv.className = "icon";

    if (button.data) {
      iconDiv.style.backgroundImage = `url(data:image/png;base64,${button.data})`;
    } else {
      iconDiv.textContent = button.type === "page" ? "📁" : button.type === "textnote" ? "📝" : button.type === "voicerec" ? "🔴" : button.type === "picture" ? "📷" : "🔘";
    }

    const label = document.createElement("span");
    label.textContent = getDisplayLabel(button);

    btnElement.appendChild(iconDiv);
    btnElement.appendChild(label);
    grid.appendChild(btnElement);

    // Handle click events
    if (button.type === "page") {
      btnElement.onclick = () => {
        if (button.targetLayout) {
          currentMockupPath.push(button.targetLayout);
          updateMockup();
        }
      };
    } else {
      btnElement.onclick = () => editButton(currentLayout.name, index);
    }
  });

}

function goBackMockup() {
  if (currentMockupPath.length > 1) {
    currentMockupPath.pop();
    updateMockup();
  }
}

// Function to get current mockup layout name
function getCurrentMockupLayoutName() {
  if (currentMockupPath && currentMockupPath.length > 0) {
    return currentMockupPath[currentMockupPath.length - 1];
  }
  return "root";
}

// Function to get appropriate label for display
function getDisplayLabel(button) {
  if (!button) return "Unnamed Button";

  // If button has multilingual labels, use them
  if (button.labels && Object.keys(button.labels).length > 0) {
    const selectedLanguages = window.getSelectedLanguages ? window.getSelectedLanguages() : ['en'];

    // Try to find a label in the selected languages
    for (const lang of selectedLanguages) {
      if (button.labels[lang]) {
        return button.labels[lang];
      }
    }

    // If not found, use the first available label
    const firstLabel = Object.values(button.labels)[0];
    if (firstLabel) return firstLabel;
  }

  // Fallback to original label or default
  return button.label || "Unnamed Button";
}

// Function to initialize button labels for multilingual support
function initializeButtonLabels(button, initialLabel) {
  if (!button.labels) {
    button.labels = {};
  }

  const selectedLanguages = window.getSelectedLanguages ? window.getSelectedLanguages() : ['en'];

  selectedLanguages.forEach(lang => {
    if (!button.labels[lang]) {
      button.labels[lang] = initialLabel || button.label || "Unnamed Button";
    }
  });
}

// Function to prepare the button modal for editing
function prepareButtonModal(button) {
  window.currentEditingButton = button;

  // Initialize labels if they don't exist
  if (!button.labels && button.label) {
    initializeButtonLabels(button, button.label);
  }

  // Update the language selector in the modal
  if (window.updateButtonModalLanguageSelect) {
    window.updateButtonModalLanguageSelect();
  }

  // Set up the first language and its value
  const buttonModalSelect = document.getElementById("buttonLanguageSelect");
  const buttonNameInput = document.getElementById("buttonNameInput");

  if (buttonModalSelect && buttonNameInput) {
    const selectedLanguages = window.getSelectedLanguages ? window.getSelectedLanguages() : ['en'];
    const firstLang = selectedLanguages[0];

    if (firstLang) {
      buttonModalSelect.value = firstLang;
      buttonModalSelect.dataset.currentLang = firstLang;

      const labelValue = button.labels?.[firstLang] || button.label || "";
      buttonNameInput.value = labelValue;
    }
  }
}

// Function to save button labels from the modal
function saveButtonLabels(button) {
  const buttonModalSelect = document.getElementById("buttonLanguageSelect");
  const buttonNameInput = document.getElementById("buttonNameInput");

  if (buttonModalSelect && buttonNameInput) {
    const currentLang = buttonModalSelect.dataset.currentLang;
    if (currentLang && buttonNameInput.value.trim()) {
      if (!button.labels) {
        button.labels = {};
      }
      // Use the core Button class method
      button.addLabel(currentLang, buttonNameInput.value.trim());
    }
  }

  // Update the main label with the display label
  if (button.labels && Object.keys(button.labels).length > 0) {
    button.label = getDisplayLabel(button);
  }
}

// Expose functions globally
window.prepareButtonModal = prepareButtonModal;
window.saveButtonLabels = saveButtonLabels;
window.getDisplayLabel = getDisplayLabel;
window.initializeButtonLabels = initializeButtonLabels;
window.getCurrentMockupLayoutName = getCurrentMockupLayoutName;