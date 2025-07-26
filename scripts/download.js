function downloadLayout() {
  const layoutName = document.getElementById("layoutName").value;
  if (!layoutName) {
    showAlert("Insert a name for the layout.");
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