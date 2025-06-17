// --- NUEVA ESTRUCTURA DE DATOS Y VARIABLES GLOBALES ---
const languages = {"es": "Español", "en": "English", "fr": "Français", "de": "Deutsch"};
let layoutData = {
    name: 'root',
    buttons: []
};
let currentMockupPath = ['root']; // Rastrea en qué carpeta estamos en el mockup
let currentEditingInfo = null; // Almacena información sobre el botón que se está editando
let currentIconData = null; // Almacena los datos del ícono recién cargado

// --- ELEMENTOS DEL DOM ---
const languageSelect = document.getElementById("language");
const iconUploader = document.getElementById("iconUploader");
const addButtonBtn = document.getElementById("addButtonBtn");
const mockupBackButton = document.getElementById("mockupBackButton");

// --- INICIALIZACIÓN ---
document.addEventListener('DOMContentLoaded', () => {
    Object.keys(languages).forEach(code => {
        let option = document.createElement("option");
        option.value = code;
        option.textContent = languages[code];
        languageSelect.appendChild(option);
    });

    iconUploader.addEventListener('change', function() {
        addButtonBtn.disabled = !this.files[0];
        if (this.files[0]) {
            const reader = new FileReader();
            reader.onload = function(e) {
                currentIconData = e.target.result.split(',')[1];
            };
            reader.readAsDataURL(this.files[0]);
        }
    });

    document.getElementById('buttonModal').addEventListener('click', function(e) {
        if (e.target === this) closeModal();
    });
    
    window.addEventListener("beforeunload", function (event) {
        if (layoutData.buttons.length > 0) {
            event.preventDefault();
            event.returnValue = "Los datos se perderán si sales o refrescas la página.";
        }
    });

    updateMockup();
    renderButtonList();
});


// --- FUNCIONES AUXILIARES ---
// Encuentra la lista de botones en la que estamos actualmente, según el path
function findCurrentList(path) {
    let currentLevel = layoutData;
    for (let i = 1; i < path.length; i++) {
        const folderName = path[i];
        const subfolderButton = currentLevel.buttons.find(b => b.type === 'layout' && b.subfolder.name === folderName);
        if (subfolderButton) {
            currentLevel = subfolderButton.subfolder;
        } else {
            return null; // Path no válido
        }
    }
    return currentLevel.buttons;
}

// --- LÓGICA DE BOTONES Y MODAL ---
function promptAddButton() {
    if (!currentIconData) {
        alert("Por favor, selecciona un icono primero desde 'Choose Icon'.");
        return;
    }
    const buttonName = prompt("Ingresa el nombre del botón:", `Nuevo Botón`);
    if (buttonName) {
        const currentList = findCurrentList(currentMockupPath);
        if (currentList) {
            currentList.push({
                type: 'tag',
                label: buttonName,
                icon: iconUploader.files[0].name,
                data: currentIconData
            });
            renderButtonList();
            updateMockup();
            iconUploader.value = '';
            addButtonBtn.disabled = true;
            currentIconData = null;
        }
    }
}

function editButton(path, index) {
    currentEditingInfo = { path, index };
    const list = findCurrentList(path);
    const button = list[index];
    
    document.getElementById('buttonNameInput').value = button.label;
    document.getElementById('buttonImageInput').value = button.icon;
    showModal();
}

function saveButton() {
    if (!currentEditingInfo) return;
    const { path, index } = currentEditingInfo;
    
    const newName = document.getElementById('buttonNameInput').value.trim();
    if (!newName) {
        alert("Por favor, ingresa un nombre para el botón.");
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

    if (button.type === 'tag') {
        if (confirm(`¿Convertir "${button.label}" en una subcarpeta? Esta acción no se puede deshacer.`)) {
            button.type = 'layout';
            button.subfolder = {
                name: button.label.replace(/\s+/g, '_') + '_layout',
                buttons: []
            };
            alert(`"${button.label}" ahora es una subcarpeta.`);
            renderButtonList();
            updateMockup();
            closeModal();
        }
    } else {
        alert(`"${button.label}" ya es una subcarpeta.`);
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
    document.getElementById('buttonModal').classList.add('show');
}

function closeModal() {
    document.getElementById('buttonModal').classList.remove('show');
    currentEditingInfo = null;
}


// --- LÓGICA DE RENDERIZADO Y UI ---
function renderButtonList() {
    const listElement = document.getElementById("buttonList");
    listElement.innerHTML = "";

    if (layoutData.buttons.length === 0) {
        listElement.innerHTML = '<p style="color: #718096; text-align: center; font-style: italic;">No buttons added yet</p>';
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
            if (btn.type === 'layout') {
                iconHtml = '📁 '; // Icono de carpeta
            }

            div.innerHTML = `
                <div class="button-info">${iconHtml}${btn.label}</div>
                <div class="button-actions">
                    <button class="btn-edit" onclick='editButton(${JSON.stringify(currentPath)}, ${index})'>Edit</button>
                </div>
            `;
            listElement.appendChild(div);

            if (btn.type === 'layout') {
                currentPath.push(btn.subfolder.name);
                renderLevel(btn.subfolder.buttons, currentPath, level + 1);
            }
        });
    };
    
    renderLevel(layoutData.buttons, ['root'], 0);
}

function updateMockup() {
    const grid = document.getElementById('mockButtonGrid');
    grid.innerHTML = '';
    
    const currentList = findCurrentList(currentMockupPath);
    if (!currentList) return;

    // Lógica del botón de Regresar
    mockupBackButton.style.display = currentMockupPath.length > 1 ? 'block' : 'none';

    currentList.forEach((btn, index) => {
        const button = document.createElement('div');
        button.className = 'mock-button has-custom-icon';
        
        const iconDiv = document.createElement('div');
        iconDiv.className = 'icon';
        iconDiv.style.backgroundImage = `url(data:image/png;base64,${btn.data})`;
        
        const label = document.createElement('span');
        label.textContent = btn.label;
        
        button.appendChild(iconDiv);
        button.appendChild(label);
        grid.appendChild(button);

        if (btn.type === 'layout') {
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


// --- LÓGICA DE DESCARGA ---
function generateXML() {
    let layoutsXml = '';
    
    // Función recursiva para generar los layouts anidados
    function buildLayoutXml(layout) {
        let xml = `  <layout name="${layout.name}">\n`;
        // Agrupar botones en filas de 3
        for (let i = 0; i < layout.buttons.length; i += 3) {
            xml += `    <row>\n`;
            for (let j = i; j < i + 3 && j < layout.buttons.length; j++) {
                const btn = layout.buttons[j];
                if (btn.type === 'tag') {
                    xml += `      <button type="tag" label="${btn.label}" icon="${btn.icon}"/>\n`;
                } else if (btn.type === 'layout') {
                    xml += `      <button type="layout" label="${btn.label}" icon="${btn.icon}" layout_name="${btn.subfolder.name}"/>\n`;
                }
            }
            xml += `    </row>\n`;
        }
        xml += `  </layout>\n`;
        
        // Recursivamente añadir los layouts de las subcarpetas
        layout.buttons.forEach(btn => {
            if (btn.type === 'layout') {
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
    return `<?xml version="1.0" encoding="UTF-8"?>\n<metadata>\n <option iso="${lang}" name="${languages[lang] || ''}">${desc}</option>\n <github username="labexp" repo="osmtracker-android-layouts" branch="master" />\n</metadata>`;
}

function generateReadme() {
    const layoutName2 = document.getElementById("layoutName_2").value;
    const desc = document.getElementById("layoutDescription").value;
    return `# ${layoutName2}\n\n${desc}`;
}

function downloadLayout() {
    const layoutName = document.getElementById("layoutName").value;
    if (!layoutName) {
        alert("Por favor, ingresa un nombre para el layout.");
        return;
    }
    
    const zip = new JSZip();
    const layoutFolder = zip.folder(layoutName);
    const iconsFolder = layoutFolder.folder(layoutName + "_icons");
    
    layoutFolder.file(`${document.getElementById("language").value || 'en'}.xml`, generateXML());
    zip.folder("metadata").file(`${layoutName}.xml`, generateMetadata());
    layoutFolder.file("README.md", generateReadme());
    
    // Función recursiva para añadir todos los iconos de todas las carpetas
    function addIcons(buttons) {
        buttons.forEach(btn => {
            iconsFolder.file(btn.icon, btn.data, { base64: true });
            if (btn.type === 'layout') {
                addIcons(btn.subfolder.buttons);
            }
        });
    }
    addIcons(layoutData.buttons);
    
    zip.generateAsync({ type: "blob" }).then(content => {
        const link = document.createElement("a");
        link.href = URL.createObjectURL(content);
        link.download = `${layoutName}.zip`;
        link.click();
    });
}