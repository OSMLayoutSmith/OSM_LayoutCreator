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

function toggleNavbar() {
  const menu = document.getElementById("navMenu");
  menu.classList.toggle("active");
}