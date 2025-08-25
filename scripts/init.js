// Load core modules
const script = document.createElement('script');
script.src = 'scripts/core/button.js';
document.head.appendChild(script);

const script2 = document.createElement('script');
script2.src = 'scripts/core/layout.js';
document.head.appendChild(script2);

const script3 = document.createElement('script');
script3.src = 'scripts/core/xml-file.js';
document.head.appendChild(script3);

const script4 = document.createElement('script');
script4.src = 'scripts/core/metadata.js';
document.head.appendChild(script4);

const script5 = document.createElement('script');
script5.src = 'scripts/core/folder-manager.js';
document.head.appendChild(script5);

const script6 = document.createElement('script');
script6.src = 'scripts/core/zip-builder.js';
document.head.appendChild(script6);

const script7 = document.createElement('script');
script7.src = 'scripts/core/zip-loader.js';
document.head.appendChild(script7);

// Global instance of FolderManager
let folderManager = null;
let currentLayoutName = null;

const languageSelect = document.getElementById("language");
const iconUploader = document.getElementById("iconUploader");
const addButtonBtn = document.getElementById("addButtonBtn");

// Initialize folder manager
function initializeFolderManager() {
  folderManager = new FolderManager();
  window.folderManager = folderManager; // 🔹 aquí sí se guarda la instancia real

  const defaultLayoutName = "default_layout";
  currentLayoutName = defaultLayoutName;

  folderManager.createLayout(defaultLayoutName);
  const activeLayout = folderManager.getActiveLayout();

  const rootLayout = new Layout("root");
  activeLayout.xmlFile.addLayout(rootLayout);
  activeLayout.xmlFile.addLanguage("en");

  activeLayout.metadata = new Metadata(defaultLayoutName, "OSMBot", "osmtracker-android-layouts", "master");
  activeLayout.metadata.addOption("en", "English", "Default English layout");

}


document.addEventListener("DOMContentLoaded", () => {
  // Wait for core scripts to load
  setTimeout(() => {
    initializeFolderManager();

    // Populate language dropdown
    Object.keys(languages).forEach((code) => {
      let option = document.createElement("option");
      option.value = code;
      option.textContent = languages[code];
      option.setAttribute("translate", "no");
      languageSelect.appendChild(option);
    });

    iconUploader.addEventListener("change", function () {
      const preview = document.getElementById("iconPreview");
      addButtonBtn.disabled = !this.files[0];
      preview.innerHTML = "";

      if (this.files[0]) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.src = e.target.result;

          img.onload = function () {
            let { width, height } = img;

            if (width > 350 || height > 350) {
              const canvas = document.createElement("canvas");
              const ctx = canvas.getContext("2d");

              const scale = Math.min(350 / width, 350 / height);
              canvas.width = width * scale;
              canvas.height = height * scale;

              ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

              const resizedDataUrl = canvas.toDataURL("image/png");
              currentIconData = resizedDataUrl.split(",")[1];

              const resizedImg = document.createElement("img");
              resizedImg.src = resizedDataUrl;
              resizedImg.alt = "Icon preview";
              resizedImg.style.width = canvas.width + "px";
              resizedImg.style.height = canvas.height + "px";
              resizedImg.style.borderRadius = "8px";
              resizedImg.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
              preview.innerHTML = "";
              preview.appendChild(resizedImg);

            } else {
              currentIconData = e.target.result.split(",")[1];

              const normalImg = document.createElement("img");
              normalImg.src = e.target.result;
              normalImg.alt = "Icon preview";
              normalImg.style.width = width + "px";
              normalImg.style.height = height + "px";
              normalImg.style.borderRadius = "8px";
              normalImg.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
              preview.innerHTML = "";
              preview.appendChild(normalImg);
            }
          };
        };
        reader.readAsDataURL(this.files[0]);
      }
    });


    // Modal event listeners
    document
      .getElementById("buttonModal")
      .addEventListener("click", function (e) {
        if (e.target === this) closeModal();
      });
    document
      .getElementById("configModal")
      .addEventListener("click", function (e) {
        if (e.target === this) closeModal();
      });

    // Prevent data loss
    window.addEventListener("beforeunload", function (event) {
      const activeLayout = folderManager?.getActiveLayout();
      if (activeLayout && Object.keys(activeLayout.xmlFile.layouts).length > 0) {
        event.preventDefault();
        event.returnValue = "Changes unsaved will be lost.";
      }
    });

    updateMockup();
    renderButtonList();
  }, 500); // Wait for core scripts to load
});

// Helper functions to work with the core system
function getCurrentLayout() {
  const activeLayout = folderManager.getActiveLayout();
  if (!activeLayout) return null;
  return activeLayout.xmlFile.layouts["root"];
}

function findLayoutByName(layoutName) {
  const activeLayout = folderManager.getActiveLayout();
  if (!activeLayout) return null;
  return activeLayout.xmlFile.layouts[layoutName];
}

function addLanguageToSystem(langCode) {
  const activeLayout = folderManager.getActiveLayout();
  if (activeLayout) {
    activeLayout.xmlFile.addLanguage(langCode);

    // Add to metadata if not exists
    const existingOptions = activeLayout.metadata.options.map(opt => opt[0]);
    if (!existingOptions.includes(langCode)) {
      const langName = languages[langCode] || langCode.toUpperCase();
      activeLayout.metadata.addOption(langCode, langName, `${langName} layout`);
    }
  }
}

function setLayoutREADME(readme) {
  const activeLayout = folderManager.getActiveLayout();
  if (activeLayout && readme) {
    activeLayout.readme = readme;
  }
}

function setLayoutDownloadDescription(selection, description) {
  const activeLayout = folderManager.getActiveLayout();
  if (activeLayout && selection && description) {
    activeLayout.metadata.updateOption(selection,description);
  }
}

// Expose global functions
window.folderManager = folderManager;
window.getCurrentLayout = getCurrentLayout;
window.findLayoutByName = findLayoutByName;
window.addLanguageToSystem = addLanguageToSystem;
window.setLayoutDownloadDescription = setLayoutDownloadDescription;
window.setLayoutREADME = setLayoutREADME;

/* === Language grid support === */
(() => {
  let selectedLanguages = ['en'];

  const languageSelect = document.getElementById("language");
  const buttonsGrid = document.getElementById("languageButtonsGrid");

  if (!languageSelect || !buttonsGrid) return;

  const getInitials = (code) => {
    if (!code) return "EN";
    return code.toUpperCase().slice(0, 2);
  };

  const select = document.getElementById("layoutDescLang");
  function renderLanguageGrid() {
    buttonsGrid.innerHTML = "";
    select.innerHTML = "";

    if (selectedLanguages.length === 0) {
      selectedLanguages = ['en'];
    }

    // Update the core system with selected languages
    if (folderManager) {
      selectedLanguages.forEach(lang => addLanguageToSystem(lang));
    }

    for (let i = 0; i < selectedLanguages.length; i += 3) {
      const row = document.createElement("div");
      row.className = "lang-row";

      for (let j = i; j < Math.min(i + 3, selectedLanguages.length); j++) {
        const code = selectedLanguages[j];
        const btn = document.createElement("button");
        btn.className = "lang-btn";
        btn.textContent = getInitials(code);
        btn.dataset.code = code;

        if (code === 'en' && selectedLanguages.length === 1) {
          btn.disabled = true;
          btn.classList.add('center');
        }

        row.appendChild(btn);

        //manage metadatas
        const option = document.createElement("option");
        option.value = code;
        option.textContent = `Language: ${code}`;
        select.appendChild(option);
      }

      buttonsGrid.appendChild(row);
    }
  }

  function addLanguage(code) {
    if (!code || selectedLanguages.includes(code)) {
      return;
    }

    if (selectedLanguages.length < 9) {
      selectedLanguages.push(code);
      addLanguageToSystem(code);
      renderLanguageGrid();
    }
  }

  function removeLanguage(code) {
    if (code === 'en' && selectedLanguages.length === 1) {
      return;
    }

    selectedLanguages = selectedLanguages.filter(lang => lang !== code);

    if (selectedLanguages.length === 0) {
      selectedLanguages = ['en'];
    }

    // Remove from core system
    const activeLayout = folderManager?.getActiveLayout();
    if (activeLayout) {
      activeLayout.xmlFile.removeLanguage(code);
      activeLayout.metadata.removeOption(code);
    }

    renderLanguageGrid();
    descArea.value = getDescriptionByLang(select.value) || ""; 
  }

  select.onchange = () => {
    descArea.value = getDescriptionByLang(select.value) || "";
  };

  const descArea = document.getElementById("layoutDesc");
  languageSelect.addEventListener("change", (e) => {
    const selectedCode = e.target.value;
    if (selectedCode) {
      addLanguage(selectedCode);
      e.target.value = "";
    }
  });

  function getDescriptionByLang(code) {
    const activeLayout = folderManager?.getActiveLayout().metadata.getOptionByCode(code);
    return activeLayout ? activeLayout[2] : "";
  }

  document.addEventListener("DOMContentLoaded", () => {
    const buttonModalSelect = document.getElementById("buttonLanguageSelect");
    const buttonNameInput = document.getElementById("buttonNameInput");

    if (buttonModalSelect && buttonNameInput) {
      buttonModalSelect.addEventListener("change", (e) => {
        const selectedLang = e.target.value;
        if (window.currentEditingButton && selectedLang) {
          const currentLang = buttonModalSelect.dataset.currentLang;
          if (currentLang && buttonNameInput.value.trim()) {
            if (!window.currentEditingButton.labels) {
              window.currentEditingButton.labels = {};
            }
            window.currentEditingButton.labels[currentLang] = buttonNameInput.value.trim();
          }

          const newValue = window.currentEditingButton.labels?.[selectedLang] || window.currentEditingButton.label || "";
          buttonNameInput.value = newValue;
          buttonModalSelect.dataset.currentLang = selectedLang;
        }
      });

      buttonNameInput.addEventListener("input", (e) => {
        const currentLang = buttonModalSelect.dataset.currentLang;
        if (window.currentEditingButton && currentLang) {
          if (!window.currentEditingButton.labels) {
            window.currentEditingButton.labels = {};
          }
          window.currentEditingButton.labels[currentLang] = e.target.value.trim();
        }
      });
    }
  });

  buttonsGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("lang-btn") && !e.target.disabled) {
      const code = e.target.dataset.code;
      if (code) {
        removeLanguage(code);
      }
    }
  });

  document.addEventListener("DOMContentLoaded", () => {
    setTimeout(() => {
      renderLanguageGrid();
    }, 600);
  });

  function updateButtonModalLanguageSelect() {
    const buttonModalSelect = document.getElementById("buttonLanguageSelect");
    if (!buttonModalSelect) return;

    buttonModalSelect.innerHTML = "";

    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select language for this button";
    buttonModalSelect.appendChild(defaultOption);

    selectedLanguages.forEach(code => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = languages[code] || code.toUpperCase();
      option.setAttribute("translate", "no");
      buttonModalSelect.appendChild(option);
    });
  }

  const originalRenderLanguageGrid = renderLanguageGrid;
  renderLanguageGrid = function () {
    originalRenderLanguageGrid();
    updateButtonModalLanguageSelect();
  };

  window.getSelectedLanguages = () => selectedLanguages;
  window.setSelectedLanguages = (languages) => {
    selectedLanguages = languages.length > 0 ? languages : ['en'];
    renderLanguageGrid();
  };
  window.updateButtonModalLanguageSelect = updateButtonModalLanguageSelect;
})();

