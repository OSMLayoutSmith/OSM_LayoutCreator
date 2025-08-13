const languageSelect = document.getElementById("language");
const iconUploader = document.getElementById("iconUploader");
const addButtonBtn = document.getElementById("addButtonBtn");

document.addEventListener("DOMContentLoaded", () => {
  Object.keys(languages).forEach((code) => {
    let option = document.createElement("option");
    option.value = code;
    option.textContent = languages[code];
    //no translatable by the translate api
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
        currentIconData = e.target.result.split(",")[1];
        const img = document.createElement("img");
        img.src = e.target.result;
        img.alt = "Icon preview";
        img.style.width = "250px";
        img.style.height = "250px";
        img.style.borderRadius = "8px";
        img.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
        preview.innerHTML = "";
        preview.appendChild(img);
      };
      reader.readAsDataURL(this.files[0]);
    }
  });

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

  window.addEventListener("beforeunload", function (event) {
    if (layoutData.buttons.length > 0) {
      event.preventDefault();
      event.returnValue = "Changes unsaved will be lost.";
    }
  });

  updateMockup();
  renderButtonList();
});

/* === FIXED: Language grid support === */
(() => {
  // Array para mantener los idiomas seleccionados
  let selectedLanguages = ['en']; // Inglés por defecto

  const languageSelect = document.getElementById("language");
  const buttonsGrid = document.getElementById("languageButtonsGrid");

  if (!languageSelect || !buttonsGrid) return;

  // Función para obtener las iniciales del código de idioma
  const getInitials = (code) => {
    if (!code) return "EN";
    return code.toUpperCase().slice(0, 2);
  };

  // Función para renderizar el grid de idiomas seleccionados
  function renderLanguageGrid() {
    buttonsGrid.innerHTML = "";

    if (selectedLanguages.length === 0) {
      // Si no hay idiomas, mostrar solo inglés por defecto
      selectedLanguages = ['en'];
    }

    // Crear filas de máximo 3 columnas
    for (let i = 0; i < selectedLanguages.length; i += 3) {
      const row = document.createElement("div");
      row.className = "lang-row";

      // Agregar hasta 3 botones por fila
      for (let j = i; j < Math.min(i + 3, selectedLanguages.length); j++) {
        const code = selectedLanguages[j];
        const btn = document.createElement("button");
        btn.className = "lang-btn";
        btn.textContent = getInitials(code);
        btn.dataset.code = code;
        
        // Si es inglés y es el único idioma, deshabilitarlo
        if (code === 'en' && selectedLanguages.length === 1) {
          btn.disabled = true;
          btn.classList.add('center'); // Estilo especial para el botón deshabilitado
        }
        
        row.appendChild(btn);
      }

      buttonsGrid.appendChild(row);
    }
  }

  // Función para agregar un idioma a la selección
  function addLanguage(code) {
    if (!code || selectedLanguages.includes(code)) {
      return; // No agregar si ya existe o es vacío
    }
    
    if (selectedLanguages.length < 9) { // Máximo 9 idiomas (3x3)
      selectedLanguages.push(code);
      renderLanguageGrid();
    }
  }

  // Función para remover un idioma de la selección
  function removeLanguage(code) {
    if (code === 'en' && selectedLanguages.length === 1) {
      return; // No permitir eliminar inglés si es el único
    }

    selectedLanguages = selectedLanguages.filter(lang => lang !== code);
    
    if (selectedLanguages.length === 0) {
      selectedLanguages = ['en']; // Asegurar que siempre haya al menos inglés
    }
    
    renderLanguageGrid();
  }

  // Event listener para cuando se selecciona un idioma del dropdown
  languageSelect.addEventListener("change", (e) => {
    const selectedCode = e.target.value;
    if (selectedCode) {
      addLanguage(selectedCode);
      // Resetear el select al valor por defecto
      e.target.value = "";
    }
  });

  // Event listener para el selector del buttonModal
  document.addEventListener("DOMContentLoaded", () => {
    const buttonModalSelect = document.getElementById("buttonLanguageSelect");
    const buttonNameInput = document.getElementById("buttonNameInput");
    
    if (buttonModalSelect && buttonNameInput) {
      buttonModalSelect.addEventListener("change", (e) => {
        const selectedLang = e.target.value;
        if (window.currentEditingButton && selectedLang) {
          // Guardar el valor actual antes de cambiar
          const currentLang = buttonModalSelect.dataset.currentLang;
          if (currentLang && buttonNameInput.value.trim()) {
            if (!window.currentEditingButton.labels) {
              window.currentEditingButton.labels = {};
            }
            window.currentEditingButton.labels[currentLang] = buttonNameInput.value.trim();
          }
          
          // Cargar el nuevo valor
          const newValue = window.currentEditingButton.labels?.[selectedLang] || window.currentEditingButton.label || "";
          buttonNameInput.value = newValue;
          buttonModalSelect.dataset.currentLang = selectedLang;
        }
      });

      // Guardar cuando se escribe en el input
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

  // Event listener para clicks en los botones del grid
  buttonsGrid.addEventListener("click", (e) => {
    if (e.target.classList.contains("lang-btn") && !e.target.disabled) {
      const code = e.target.dataset.code;
      if (code) {
        removeLanguage(code);
      }
    }
  });

  // Renderizar el grid inicial al cargar la página
  document.addEventListener("DOMContentLoaded", () => {
    renderLanguageGrid();
  });

  // Función para actualizar el selector del buttonModal
  function updateButtonModalLanguageSelect() {
    const buttonModalSelect = document.getElementById("buttonLanguageSelect");
    if (!buttonModalSelect) return;

    // Limpiar opciones existentes
    buttonModalSelect.innerHTML = "";

    // Agregar opción por defecto
    const defaultOption = document.createElement("option");
    defaultOption.value = "";
    defaultOption.textContent = "Select language for this button";
    buttonModalSelect.appendChild(defaultOption);

    // Agregar los idiomas seleccionados
    selectedLanguages.forEach(code => {
      const option = document.createElement("option");
      option.value = code;
      option.textContent = languages[code] || code.toUpperCase();
      option.setAttribute("translate", "no");
      buttonModalSelect.appendChild(option);
    });
  }

  // Modificar renderLanguageGrid para actualizar también el modal
  const originalRenderLanguageGrid = renderLanguageGrid;
  renderLanguageGrid = function() {
    originalRenderLanguageGrid();
    updateButtonModalLanguageSelect();
  };

  // Exponer funciones globalmente si es necesario
  window.getSelectedLanguages = () => selectedLanguages;
  window.setSelectedLanguages = (languages) => {
    selectedLanguages = languages.length > 0 ? languages : ['en'];
    renderLanguageGrid();
  };
  window.updateButtonModalLanguageSelect = updateButtonModalLanguageSelect;
})();