const path = require("path");
require("./core-globals.js");
const { ZipLoader } = require("../core/zip-loader"); // importa tu clase (ajusta el nombre del archivo)

(async () => {
  try {
    const loader = new ZipLoader();

    // Ruta al zip
    const zipPath = "C:\\Users\\ksala\\OneDrive\\Desktop\\OSM_LayoutCreator\\scripts\\test\\Hydranten.zip";
    

    // Cargar el layout
    const result = await loader.loadFromFile(zipPath);

    console.log("=== Resultado de carga ===");
    console.log("Nombre del layout:", result.name);
    console.log("Metadata:", result.metadata);
    console.log("README:", result.readme ? result.readme.substring(0, 100) + "..." : "No existe");
    console.log("Idiomas:", Object.keys(result.xmlFile.languages || {}));
    console.log("Cantidad de íconos:", Object.keys(result.icons).length);

    // Probar si existe método toString en xmlFile
    if (result.xmlFile && typeof result.xmlFile.toString === "function") {
      console.log("XML serializado:");
      console.log(result.xmlFile.toString());
    } else {
      console.log("⚠️ xmlFile.toString no existe o devuelve null");
      console.log("Contenido de xmlFile:", result.xmlFile);
    }

  } catch (err) {
    console.error("❌ Error al cargar el ZIP:", err);
  }
})();
