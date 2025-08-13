function generateXML() {
  let layoutsXml = "";

  // Función recursiva para generar los layouts anidados
  function buildLayoutXml(layout) {
    let xml = `  <layout name="${layout.name}">\n`;
    const layoutName = document.getElementById("layoutName").value;
    // Agrupar botones en filas de 3
    for (let i = 0; i < layout.buttons.length; i += 3) {
      xml += `    <row>\n`;
      for (let j = i; j < i + 3 && j < layout.buttons.length; j++) {
        const btn = layout.buttons[j];
        if (btn.type === "tag") {
          xml += `      <button type="tag" label="${btn.label}" icon="${layoutName}_icons/${btn.icon}"/>\n`;
        } else if (btn.type === "layout") {
          xml += `      <button type="page" label="${btn.label}" icon="${layoutName}_icons/${btn.icon}" targetLayout="${btn.subfolder.name}"/>\n`;
        }
      }
      xml += `    </row>\n`;
    }
    xml += `  </layout>\n`;
    

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
  }">${desc}</option>\n <github username="OSMBot" repo="osmtracker-android-layouts" branch="master" />\n</metadata>`;
}

function generateReadme() {
  const layoutName2 = document.getElementById("layoutName_2").value;
  const desc = document.getElementById("layoutDescription").value;
  return `# ${layoutName2}\n\n${desc}`;
}