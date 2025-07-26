let layoutData = {
  name: "root",
  buttons: [],
};
const mockupBackButton = document.getElementById("mockupBackButton");
let currentMockupPath = ["root"];

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