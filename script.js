const languages = {
  en: "English",
  es: "Español",
  fr: "Français",
  de: "Deutsch",
  ja: "日本語",
  pt: "Português",
  it: "Italiano",
  "zh-CN": "中文 (简体)",
  "zh-TW": "中文 (繁體)",
  ar: "العربية",
  ru: "Русский",
  ko: "한국어",
  hi: "हिन्दी",
  id: "Bahasa Indonesia",
  pl: "Polski",
  nl: "Nederlands",
  sv: "Svenska",
  th: "ภาษาไทย",
  iw: "עברית",
  vi: "Tiếng Việt",
  cs: "Čeština",
  uk: "Українська",
  ro: "Română",
  el: "Ελληνικά",
  tr: "Türkçe",
};
let layoutData = {
  name: "root",
  buttons: [],
};
let currentMockupPath = ["root"];
let currentEditingInfo = null;
let currentIconData = null;
let promptCallback = null;

const languageSelect = document.getElementById("language");
const iconUploader = document.getElementById("iconUploader");
const addButtonBtn = document.getElementById("addButtonBtn");
const mockupBackButton = document.getElementById("mockupBackButton");

document.addEventListener("DOMContentLoaded", () => {
  Object.keys(languages).forEach((code) => {
    let option = document.createElement("option");
    option.value = code;
    option.textContent = languages[code];
    //add translate="no"
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
      if (e.target === this) closeConfigModal();
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

function findCurrentList(path) {
  let currentLevel = layoutData;
  for (let i = 1; i < path.length; i++) {
    const folderName = path[i];
    const subfolderButton = currentLevel.buttons.find(
      (b) => b.type === "layout" && b.subfolder.name === folderName
    );
    if (subfolderButton) {
      currentLevel = subfolderButton.subfolder;
    } else {
      return null;
    }
  }
  return currentLevel.buttons;
}

function promptAddButton() {
  if (!currentIconData) {
    showAlert("Please, first select an icon from 'Choose Icon'.");
    return;
  }

  showPrompt("New button name", "e.g. button1", function (buttonName) {
    if (buttonName) {
      const currentList = findCurrentList(currentMockupPath);
      if (currentList) {
        currentList.push({
          type: "tag",
          label: buttonName,
          icon: iconUploader.files[0].name,
          data: currentIconData,
        });
        renderButtonList();
        updateMockup();
        iconUploader.value = "";
        addButtonBtn.disabled = true;
        currentIconData = null;
      }
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
  if (confirm(`¿Estás seguro de que quieres eliminar "${button.label}"?`)) {
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

function showModal() {
  document.getElementById("buttonModal").classList.add("show");
}

function closeModal() {
  document.getElementById("buttonModal").classList.remove("show");
  currentEditingInfo = null;
}

function renderButtonList() {
  const listElement = document.getElementById("buttonList");
  listElement.innerHTML = "";

  if (layoutData.buttons.length === 0) {
    listElement.innerHTML =
      '<p style="color: #718096; text-align: center; font-style: italic;">No buttons added yet</p>';
    return;
  }

  // Función recursiva para renderizar la lista con anidación
  const renderLevel = (buttons, parentPath, level) => {
    buttons.forEach((btn, index) => {
      const currentPath = [...parentPath];
      const div = document.createElement("div");
      div.className = "button-item";
      div.style.marginLeft = `${level * 20}px`;

      let iconHtml = `<img src="data:image/png;base64,${btn.data}" style="width: 24px; height: 24px; vertical-align: middle; margin-right: 10px;">`;
      if (btn.type === "layout") {
        iconHtml = "📁 "; // Icono de carpeta
      }

      div.innerHTML = `
                <div class="button-info">${iconHtml}${btn.label}</div>
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
    { icon: "📝", label: "Text note" },
    { icon: "🔴", label: "Voice record" },
    { icon: "📷", label: "Take photo" },
    { icon: "📝", label: "Text note" },
    { icon: "🔴", label: "Voice record" },
    { icon: "📷", label: "Take photo" },
    { icon: "📝", label: "Text note" },
    { icon: "🔴", label: "Voice record" },
    { icon: "📷", label: "Take photo" },
    { icon: "📝", label: "Text note" },
    { icon: "🔴", label: "Voice record" },
    { icon: "📷", label: "Take photo" },
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
    label.textContent = btn.label;

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

function generateXML() {
  let layoutsXml = "";

  // Función recursiva para generar los layouts anidados
  function buildLayoutXml(layout) {
    let xml = `  <layout name="${layout.name}">\n`;
    // Agrupar botones en filas de 3
    for (let i = 0; i < layout.buttons.length; i += 3) {
      xml += `    <row>\n`;
      for (let j = i; j < i + 3 && j < layout.buttons.length; j++) {
        const btn = layout.buttons[j];
        if (btn.type === "tag") {
          xml += `      <button type="tag" label="${btn.label}" icon="${btn.icon}"/>\n`;
        } else if (btn.type === "layout") {
          xml += `      <button type="layout" label="${btn.label}" icon="${btn.icon}" layout_name="${btn.subfolder.name}"/>\n`;
        }
      }
      xml += `    </row>\n`;
    }
    xml += `  </layout>\n`;

    // Recursivamente añadir los layouts de las subcarpetas
    layout.buttons.forEach((btn) => {
      if (btn.type === "layout") {
        xml += buildLayoutXml(btn.subfolder);
      }
    });

    return xml;
  }

  layoutsXml = buildLayoutXml(layoutData);

  return `<?xml version="1.0" encoding="UTF-8"?>\n<layouts>\n${layoutsXml}</layouts>`;
}

function generateMetadata() {
  const lang = document.getElementById("language").value;
  const desc = document.getElementById("layoutDescription").value;
  return `<?xml version="1.0" encoding="UTF-8"?>\n<metadata>\n <option iso="${lang}" name="${
    languages[lang] || ""
  }">${desc}</option>\n <github username="labexp" repo="osmtracker-android-layouts" branch="master" />\n</metadata>`;
}

function generateReadme() {
  const layoutName2 = document.getElementById("layoutName_2").value;
  const desc = document.getElementById("layoutDescription").value;
  return `# ${layoutName2}\n\n${desc}`;
}

function downloadLayout() {
  const layoutName = document.getElementById("layoutName").value;
  if (!layoutName) {
    showAlert("Por favor, ingresa un nombre para el layout.");
    return;
  }

  const zip = new JSZip();
  const layoutFolder = zip.folder(layoutName);
  const iconsFolder = layoutFolder.folder(layoutName + "_icons");

  layoutFolder.file(
    `${document.getElementById("language").value || "en"}.xml`,
    generateXML()
  );
  zip.folder("metadata").file(`${layoutName}.xml`, generateMetadata());
  layoutFolder.file("README.md", generateReadme());

  // Función recursiva para añadir todos los iconos de todas las carpetas
  function addIcons(buttons) {
    buttons.forEach((btn) => {
      iconsFolder.file(btn.icon, btn.data, { base64: true });
      if (btn.type === "layout") {
        addIcons(btn.subfolder.buttons);
      }
    });
  }
  addIcons(layoutData.buttons);

  zip.generateAsync({ type: "blob" }).then((content) => {
    const link = document.createElement("a");
    link.href = URL.createObjectURL(content);
    link.download = `${layoutName}.zip`;
    link.click();
  });
}

function toggleNavbar() {
  const menu = document.getElementById("navMenu");
  menu.classList.toggle("active");
}

// Language auto-translation logic for Google Translate
const sourceLang = "en"; // Page default language
const browserLang = navigator.language ? navigator.language.slice(0, 2) : "en";

const targetLang = browserLang !== sourceLang ? browserLang : null;

if (targetLang) {
  document.cookie = `googtrans=/${sourceLang}/${targetLang}; path=/;`;
}

function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: sourceLang,
      includedLanguages:
        "en,es,fr,de,ja,pt,it,zh-CN,zh-TW,ar,ru,ko,hi,id,pl,nl,sv,th,iw,vi,cs,uk,ro,el,tr",
      autoDisplay: false,
    },
    "google_translate_element"
  );
}

function openConfigModal() {
  document.getElementById("configModal").classList.add("show");
}

function closeConfigModal() {
  document.getElementById("configModal").classList.remove("show");
}

function toggleConfigMode() {
  const mode = document.getElementById("configMode").value;
  document.getElementById("downloadSettings").style.display =
    mode === "download" ? "block" : "none";
  document.getElementById("uploadSettings").style.display =
    mode === "upload" ? "block" : "none";
  document.getElementById("zipSettings").style.display =
    mode === "zip" ? "block" : "none";
}

const zipDropArea = document.getElementById("zipDropArea");
const zipInput = document.getElementById("zipInput");
const zipFileName = document.getElementById("zipFileName");

// Eventos drag & drop
["dragenter", "dragover"].forEach((event) => {
  zipDropArea.addEventListener(event, (e) => {
    e.preventDefault();
    e.stopPropagation();
    zipDropArea.classList.add("dragover");
  });
});

["dragleave", "drop"].forEach((event) => {
  zipDropArea.addEventListener(event, (e) => {
    e.preventDefault();
    e.stopPropagation();
    zipDropArea.classList.remove("dragover");
  });
});

zipInput.addEventListener("change", (e) => {
  if (zipInput.files[0]) {
    zipFileName.textContent = zipInput.files[0].name;
    document.getElementById("processZipBtn").disabled = false;
  } else {
    zipFileName.textContent = "";
    document.getElementById("processZipBtn").disabled = true;
  }
});

zipDropArea.addEventListener("drop", (e) => {
  const file = e.dataTransfer.files[0];
  if (file && file.name.endsWith(".zip")) {
    zipInput.files = e.dataTransfer.files;
    zipFileName.textContent = file.name;
    document.getElementById("processZipBtn").disabled = false;
  } else {
    showAlert("Only .zip files are allowed.");
    document.getElementById("processZipBtn").disabled = true;
  }
});

function processZipFile() {
  const file = zipInput.files[0];
  if (!file) {
    showAlert("Please upload a .zip file first.");
    return;
  }

  showAlert(`Processing: ${file.name}`);
}

function processDownloadLayout() {
  showAlert("Download process initiated.");
}

function processUploadToGithub() {
  showAlert("Upload process initiated.");
}

function showAlert(message, title = "Alert") {
  const modal = document.getElementById("alertModal");
  document.getElementById("alertTitle").innerText = title;
  document.getElementById("alertMessage").innerText = message;
  modal.classList.add("show");
}

function closeAlertModal() {
  document.getElementById("alertModal").classList.remove("show");
}

function showPrompt(title = "Enter Value", placeholder = "", callback) {
  document.getElementById("promptTitle").innerText = title;
  const input = document.getElementById("promptInput");
  input.placeholder = placeholder;
  input.value = "";
  promptCallback = callback;
  document.getElementById("promptModal").classList.add("show");
  input.focus();
}

function confirmPrompt() {
  const value = document.getElementById("promptInput").value;
  closePromptModal();
  if (promptCallback) promptCallback(value);
}

function closePromptModal() {
  document.getElementById("promptModal").classList.remove("show");
  promptCallback = null;
}
