let layoutData = {
  name: "root",
  buttons: [],
};
const mockupBackButton = document.getElementById("mockupBackButton");
let currentMockupPath = ["root"];

// Variable global para el botón que se está editando
window.currentEditingButton = null;

function renderButtonList() {
  const listElement = document.getElementById("buttonList");
  listElement.innerHTML = "";

  if (layoutData.buttons.length === 0) {
    listElement.innerHTML =
      '<p style="color: #718096; text-align: center; font-style: italic;">No buttons added yet</p>';
    return;
  }

  const renderLevel = (buttons, parentPath, level) => {
    buttons.forEach((btn, index) => {
      const currentPath = [...parentPath];
      const div = document.createElement("div");
      div.className = "button-item";
      div.style.marginLeft = `${level * 20}px`;

      let iconHtml = `<img src="data:image/png;base64,${btn.data}" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 10px;">`;
      if (btn.type === "layout") {
        iconHtml = "📁 "; 
      }

      // Obtener el label apropiado (usar el primer idioma disponible o el label original)
      const displayLabel = getDisplayLabel(btn);

      div.innerHTML = `
                <div class="button-info">${iconHtml}${displayLabel}</div>
                <div class="button-actions">
                    <button class="btn-edit" onclick='editButton(${JSON.stringify(
                      currentPath
                    )}, ${index})'>Edit</button>
                </div>
            `;
      listElement.appendChild(div);

      if (btn.type === "layout") {
        currentPath.push(btn.subfolder.name);
        renderLevel(btn.subfolder.buttons, currentPath, level + 1);
      }
    });
  };

  renderLevel(layoutData.buttons, ["root"], 0);
}

function updateMockup() {
  const grid = document.getElementById("mockButtonGrid");
  grid.innerHTML = "";

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

  const currentList = findCurrentList(currentMockupPath);
  if (!currentList) return;

  mockupBackButton.style.display =
    currentMockupPath.length > 1 ? "block" : "none";

  currentList.forEach((btn, index) => {
    const button = document.createElement("div");
    button.className = "mock-button has-custom-icon";

    const iconDiv = document.createElement("div");
    iconDiv.className = "icon";
    iconDiv.style.backgroundImage = `url(data:image/png;base64,${btn.data})`;

    const label = document.createElement("span");
    // En el mockup, mostrar el label del primer idioma disponible o el original
    label.textContent = getDisplayLabel(btn);

    button.appendChild(iconDiv);
    button.appendChild(label);
    grid.appendChild(button);

    if (btn.type === "layout") {
      button.onclick = () => {
        currentMockupPath.push(btn.subfolder.name);
        updateMockup();
      };
    } else {
      button.onclick = () => editButton(currentMockupPath, index);
    }
  });
}

function goBackMockup() {
  if (currentMockupPath.length > 1) {
    currentMockupPath.pop();
    updateMockup();
  }
}

// Nueva función para obtener el label apropiado para mostrar
function getDisplayLabel(btn) {
  // Si tiene labels multiidioma, usar el primero disponible
  if (btn.labels && Object.keys(btn.labels).length > 0) {
    const selectedLanguages = window.getSelectedLanguages ? window.getSelectedLanguages() : ['en'];
    
    // Intentar encontrar un label en los idiomas seleccionados
    for (const lang of selectedLanguages) {
      if (btn.labels[lang]) {
        return btn.labels[lang];
      }
    }
    
    // Si no encuentra, usar el primer label disponible
    const firstLabel = Object.values(btn.labels)[0];
    if (firstLabel) return firstLabel;
  }
  
  // Fallback al label original
  return btn.label || "Unnamed Button";
}

// Función para inicializar los labels multiidioma de un botón
function initializeButtonLabels(btn, initialLabel) {
  if (!btn.labels) {
    btn.labels = {};
  }
  
  // Si no tiene ningún label, usar el inicial para todos los idiomas
  const selectedLanguages = window.getSelectedLanguages ? window.getSelectedLanguages() : ['en'];
  
  selectedLanguages.forEach(lang => {
    if (!btn.labels[lang]) {
      btn.labels[lang] = initialLabel || btn.label || "Unnamed Button";
    }
  });
}

// Función para preparar el modal de edición
function prepareButtonModal(btn) {
  window.currentEditingButton = btn;
  
  // Inicializar labels si no existen
  if (btn.label && !btn.labels) {
    initializeButtonLabels(btn, btn.label);
  }
  
  // Actualizar el selector de idiomas del modal
  if (window.updateButtonModalLanguageSelect) {
    window.updateButtonModalLanguageSelect();
  }
  
  // Seleccionar el primer idioma disponible y cargar su valor
  const buttonModalSelect = document.getElementById("buttonLanguageSelect");
  const buttonNameInput = document.getElementById("buttonNameInput");
  
  if (buttonModalSelect && buttonNameInput) {
    const selectedLanguages = window.getSelectedLanguages ? window.getSelectedLanguages() : ['en'];
    const firstLang = selectedLanguages[0];
    
    if (firstLang) {
      buttonModalSelect.value = firstLang;
      buttonModalSelect.dataset.currentLang = firstLang;
      
      const labelValue = btn.labels?.[firstLang] || btn.label || "";
      buttonNameInput.value = labelValue;
    }
  }
}

// Función para guardar los cambios del modal
function saveButtonLabels(btn) {
  const buttonModalSelect = document.getElementById("buttonLanguageSelect");
  const buttonNameInput = document.getElementById("buttonNameInput");
  
  if (buttonModalSelect && buttonNameInput) {
    const currentLang = buttonModalSelect.dataset.currentLang;
    if (currentLang && buttonNameInput.value.trim()) {
      if (!btn.labels) {
        btn.labels = {};
      }
      btn.labels[currentLang] = buttonNameInput.value.trim();
    }
  }
  
  // Actualizar el label principal con el primer idioma disponible
  if (btn.labels && Object.keys(btn.labels).length > 0) {
    btn.label = getDisplayLabel(btn);
  }
}

// Exponer funciones globalmente
window.prepareButtonModal = prepareButtonModal;
window.saveButtonLabels = saveButtonLabels;
window.getDisplayLabel = getDisplayLabel;
window.initializeButtonLabels = initializeButtonLabels;